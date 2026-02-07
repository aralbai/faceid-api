import Employee from "../models/Employee.js";
import DigestFetch from "digest-fetch";
import fs from "fs";
import path from "path";
import sharp from "sharp"; // Rasmlarni JPEG qilish uchun
import FormData from "form-data";
import axios from "axios";
import { exec } from "child_process";

// GET ALL EMPLOYEES FROM DB
export const getAllEmployee = async (req, res) => {
  try {
    const employee = await Employee.find();

    return res.status(200).json(employee);
  } catch (error) {
    return res.status(500).json("server error");
  }
};

export const getEmployeeByBolimId = async (req, res) => {
  const { bolimId } = req.params;

  try {
    const employees = await Employee.find({ bolim: bolimId });

    return res.status(200).json(employees);
  } catch (error) {
    return res.status(500).json("server error");
  }
};

// GET ALL EMPLOYEES FROM TERMINAL
export const getAllEmployeesFromTerminal = async (req, res) => {
  try {
    const client = new DigestFetch(
      process.env.CAMERA_USERNAME,
      process.env.CAMERA_PASSWORD,
    );

    const hikvisionUrl =
      "http://192.168.88.143/ISAPI/AccessControl/UserInfo/Search?format=json";

    let allUsers = [];
    let position = 0;
    const maxResults = 50;
    let hasMore = true;

    while (hasMore) {
      const payload = {
        UserInfoSearchCond: {
          searchID: "1",
          searchResultPosition: position,
          maxResults: maxResults,
        },
      };

      const response = await client.fetch(hikvisionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      const users = result?.UserInfoSearch?.UserInfo || [];
      const totalMatches = result?.UserInfoSearch?.totalMatches || 0;

      allUsers.push(...users);

      position += users.length;

      if (position >= totalMatches || users.length === 0) {
        hasMore = false;
      }
    }

    return res.status(200).json({
      message: "Terminaldagi barcha employee lar olindi",
      total: allUsers.length,
      employees: allUsers.map((u) => ({
        employeeNo: u.employeeNo,
        name: u.name,
        userType: u.userType,
      })),
    });
  } catch (error) {
    console.error("getAllEmployeesFromTerminal error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ENTER ALL EMPLOYEES TO TERMINAL FROM DB
export const syncAllEmployeesToTerminal = async (req, res) => {
  try {
    const username = process.env.CAMERA_USERNAME;
    const password = process.env.CAMERA_PASSWORD;
    const client = new DigestFetch(username, password);

    const deleteUrl = `http://192.168.88.234/ISAPI/AccessControl/UserInfo/Delete?format=json`;
    const recordUrl = `http://192.168.88.125/ISAPI/AccessControl/UserInfo/Record?format=json`;
    console.log("here");

    const dbEmployees = await Employee.find({});
    if (dbEmployees.length === 0)
      return res.status(200).json({ message: "Baza bo'sh" });

    let successCount = 0;
    const CHUNK_SIZE = 10; // Bir vaqtning o'zida 10 ta parallel so'rov

    for (let i = 0; i < dbEmployees.length; i += CHUNK_SIZE) {
      const chunk = dbEmployees.slice(i, i + CHUNK_SIZE);

      // Har bir xodim uchun alohida so'rov tayyorlaymiz
      const promises = chunk.map(async (emp) => {
        const payload = {
          UserInfo: {
            employeeNo: emp.employeeNo,
            name: emp.name.substring(0, 32),
            userType: "normal",
            Valid: {
              enable: true,
              beginTime: "2024-01-01T00:00:00",
              endTime: "2030-12-31T23:59:59",
            },
            doorRight: "1",
            RightPlan: [{ doorNo: 1, planTemplateNo: "1" }],
          },
        };

        try {
          const resp = await client.fetch(recordUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const resJson = await resp.json();
          return resJson.statusCode === 1;
        } catch (e) {
          return false;
        }
      });

      // Paketni parallel bajaramiz
      const results = await Promise.all(promises);
      successCount += results.filter((r) => r === true).length;

      console.log(`Jarayon: ${i + chunk.length} / ${dbEmployees.length}`);
    }

    return res.status(200).json({
      message: "Sinxronizatsiya yakunlandi",
      stats: {
        totalInDb: dbEmployees.length,
        syncedToTerminal: successCount,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Xatolik", error: error.message });
  }
};

// SYNC ALL FACE TO TERMINAL
export const syncAllFacesToTerminal = async (req, res) => {
  const IMAGES_DIR = path.resolve("images");
  const extensions = [".jpg", ".jpeg", ".png"];

  const HIKVISION_URL =
    "http://198.162.88.125/ISAPI/Intelligent/FDLib/FaceDataRecord?format=json";

  try {
    const employees = await Employee.find();
    const results = [];

    for (const emp of employees) {
      const employeeNo = emp.employeeNo; // A123456
      const imageBaseName = employeeNo.replace(/^([A-Z])/, "$1-"); // A-123456

      let imagePath = null;

      for (const ext of extensions) {
        const fullPath = path.join(IMAGES_DIR, imageBaseName + ext);
        if (fs.existsSync(fullPath)) {
          imagePath = fullPath;
          break;
        }
      }

      if (!imagePath) {
        results.push({
          employeeNo,
          status: "SKIPPED",
          reason: "Image topilmadi",
        });
        continue;
      }

      // curl command — 1:1 siz bergan buyruq
      const curlCmd = `
curl --digest --user admin:Abc112233 \
-F 'FaceDataRecord={"faceLibType":"blackFD","FDID":"1","FPID":"${employeeNo}"};type=application/json' \
-F 'FaceImage=@${imagePath};type=image/jpeg' \
'${HIKVISION_URL}'
`;

      try {
        const output = await new Promise((resolve, reject) => {
          exec(curlCmd, (error, stdout, stderr) => {
            if (error) return reject(stderr || error.message);
            resolve(stdout);
          });

          console.log(curlCmd);
        });

        results.push({
          employeeNo,
          status: "SUCCESS",
          response: output.trim(),
        });
      } catch (err) {
        results.push({
          employeeNo,
          status: "FAILED",
          error: err.toString(),
        });
      }

      // await new Promise((r) => setTimeout(r, 1500));
    }

    return res.status(200).json({
      message: "syncAllFace yakunlandi",
      total: employees.length,
      results,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// DELETE ALL USERS FROM TERMINAL
export const deleteAllEmployeesFromTerminal = async (req, res) => {
  try {
    const username = process.env.CAMERA_USERNAME;
    const password = process.env.CAMERA_PASSWORD;
    const client = new DigestFetch(username, password);

    const hikvisionUrl = `http://192.168.88.143/ISAPI/AccessControl/UserInfo/Delete?format=json`;

    // Ko'pgina terminallar kutayotgan aniq struktura:
    const payload = {
      UserInfoDelCond: {
        EmployeeNoList: [], // Bo'sh massiv yuborish ba'zi modellarda hammani o'chirishni anglatadi
      },
    };

    // Agar yuqoridagi ishlamasa, barcha EmployeeNo'larni DB dan olib yuborish kerak bo'ladi
    // Lekin birinchi ushbu "Keng qamrovli" formatni sinab ko'ring:

    const response = await client.fetch(hikvisionUrl, {
      method: "PUT", // O'chirish uchun PUT ishlatiladi
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    return res.status(200).json({
      message: "Terminalga o'chirish so'rovi yuborildi",
      hikvisionResponse: result,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
