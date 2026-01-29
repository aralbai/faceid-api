import DigestFetch from "digest-fetch";
import Employee from "../model/Empleyee.js";

const client = new DigestFetch("admin", "Abc112233");
const CAMERA_HOST = "192.168.88.143";

export const getAllEmployee = async (req, res) => {
  try {
    const employee = await Employee.find();

    return res.status(200).json(employee);
  } catch (error) {
    return res.status(500).json("server error");
  }
};

export const createEmployee = async (req, res) => {
  const { employeeNo, name } = req.body;

  // 1️⃣ Hikvision'ga user qo‘shamiz
  const hikRes = await client.fetch(
    `http://${CAMERA_HOST}/ISAPI/AccessControl/UserInfo/Record?format=json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        UserInfo: [
          {
            employeeNo,
            name,
            userType: "normal",
            Valid: {
              enable: true,
              beginTime: "2025-01-01T00:00:00",
              endTime: "2035-01-01T23:59:59",
            },
          },
        ],
      }),
    },
  );

  if (!hikRes.ok) {
    console.log(hikRes);
    return res.status(400).json({ error: "Hikvision user create failed" });
  }

  // 2️⃣ MongoDB ga saqlaymiz
  const user = await Employee.create({
    employeeNo,
    name,
    faceRegistered: false,
  });

  res.json(user);
};

export const uploadFace = async (req, res) => {
  const { id } = req.params;
  const employee = await Employee.findById(id);
  if (!employee) return res.status(404).json({ error: "employee not found" });

  const image = req.file.buffer;

  const hikRes = await client.fetch(
    `http://${CAMERA_HOST}/ISAPI/Intelligent/FDLib/FaceDataRecord?format=json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        employeeNo: employee.employeeNo,
      },
      body: image,
    },
  );

  if (!hikRes.ok) {
    return res.status(400).json({ error: "Face upload failed" });
  }

  employee.faceRegistered = true;
  await employee.save();

  res.json({ success: true });
};
