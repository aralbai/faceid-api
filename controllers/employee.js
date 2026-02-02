import Employee from "../models/Employee.js";
import DigestFetch from "digest-fetch";
import fs from "fs";
import path from "path";
import sharp from "sharp"; // Rasmlarni JPEG qilish uchun
import FormData from "form-data";
import axios from "axios";

// GET ALL EMPLOYEES FROM DB
export const getAllEmployee = async (req, res) => {
  try {
    const employee = await Employee.find();

    return res.status(200).json(employee);
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

    const deleteUrl = `http://192.168.88.143/ISAPI/AccessControl/UserInfo/Delete?format=json`;
    const recordUrl = `http://192.168.88.143/ISAPI/AccessControl/UserInfo/Record?format=json`;

    // 1. Terminalni tozalash (Bu sizda ishlagan usul)
    await client.fetch(deleteUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ UserInfoDelCond: { EmployeeNoList: [] } }),
    });

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
export const syncFacesToTerminal = async (req, res) => {
  try {
    const employees = await Employee.find({});
    const imagesDir = path.join(process.cwd(), "images");

    const username = process.env.CAMERA_USERNAME;
    const password = process.env.CAMERA_PASSWORD;
    const client = new DigestFetch(username, password);
    const faceUrl = `http://192.168.88.143/ISAPI/Intelligent/FDLib/FaceDataRecord?format=json`;

    let successCount = 0;
    let errorCount = 0;
    let missingCount = 0;

    const allFiles = fs.readdirSync(imagesDir);

    for (const emp of employees) {
      const searchPattern = emp.employeeNo.includes("-")
        ? emp.employeeNo
        : `${emp.employeeNo.slice(0, 1)}-${emp.employeeNo.slice(1)}`;

      const fileName = allFiles.find(
        (f) => f.startsWith(searchPattern) && /\.(jpg|jpeg|png|bmp)$/i.test(f),
      );

      if (!fileName) {
        missingCount++;
        continue;
      }

      try {
        const filePath = path.join(imagesDir, fileName);

        const imageBuffer = await sharp(filePath)
          .resize(600, 600, { fit: "inside" })
          .jpeg({ quality: 60, chromaSubsampling: "4:2:0" })
          .toBuffer();

        const base64Image = imageBuffer.toString("base64");

        // MUHIM: Ba'zi terminallar aynan mana shu strukturani kutadi
        const payload = {
          faceLibType: "blackFD",
          FDID: "1",
          FPID: emp.employeeNo,
          faceData: base64Image,
          faceURL: "", // Ba'zi modellar buni bo'sh bo'lsa ham talab qiladi
          faceId: "", // Bo'sh string sifatida qo'shib ko'ramiz
        };

        // DIQQAT: Agar bu ham ishlamasa, payloadni FaceDataRecord ob'ektisiz yuboramiz
        // Chunki "MessageParametersLack" ko'pincha ob'ekt ichidagi maydon yetishmasligini bildiradi

        const response = await client.fetch(faceUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (result.statusCode === 1 || result.statusString === "OK") {
          successCount++;
          console.log(`✅ OK: ${emp.employeeNo}`);
        } else {
          console.error(
            `❌ Xato [${emp.employeeNo}]: ${result.subStatusCode || result.statusString}`,
          );
          errorCount++;
        }
      } catch (sharpError) {
        errorCount++;
      }
      await new Promise((r) => setTimeout(r, 250));
    }

    return res.status(200).json({
      message: "Sinxronizatsiya yakunlandi",
      stats: {
        total: employees.length,
        success: successCount,
        failed: errorCount,
        missing: missingCount,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

//test single
export const testSingleFace = async (req, res) => {
  try {
    const employeeNo = "A071361";
    const IP = "192.168.88.143";
    const PORT = 80;
    const USERNAME = "admin";
    const PASSWORD = "Abc112233";

    const imagePath = path.join(process.cwd(), "images", `${employeeNo}.jpg`);
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ message: "Rasm topilmadi" });
    }

    const client = new DigestFetch(USERNAME, PASSWORD);
    const form = new FormData();
    form.setBoundary("MIME_boundary");

    const faceData = JSON.stringify({
      faceLibType: "blackFD",
      FDID: "1",
      FPID: employeeNo,
    });

    form.append("FaceDataRecord", faceData, {
      contentType: "application/json",
    });

    // 3. Rasmni Buffer sifatida qo'shish
    form.append("FaceImage", fs.createReadStream(imagePath), {
      filename: "image.jpg",
      contentType: "image/jpeg",
    });
    console.log(form);

    const url = `http://${IP}/ISAPI/Intelligent/FDLib/FaceDataRecord?format=json`;

    // 4. So'rovni yuborish
    await client
      .fetch(url, {
        method: "POST",
        body: form,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => res.json())
      .then((data) => {
        return res.status(200).json(data);
      })
      .catch((err) => {
        return res.status(500).json(err);
      });
  } catch (error) {
    console.error("Xatolik:", error);
    return res.status(500).json({
      message: "Server xatosi",
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
