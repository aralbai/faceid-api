import DigestFetch from "digest-fetch";
import Employee from "../model/Empleyee.js";

export const getAllEmployee = async (req, res) => {
  try {
    const employee = await Employee.find();

    return res.status(200).json(employee);
  } catch (error) {
    return res.status(500).json("server error");
  }
};

export const createEmployee = async (req, res) => {
  try {
    const { employeeNo, name } = req.body;

    if (!employeeNo || !name) {
      return res.status(400).json({ message: "employeeNo va name majburiy" });
    }

    const username = process.env.CAMERA_USERNAME; // admin
    const password = process.env.CAMERA_PASSWORD; // camera password
    const cameraIp = process.env.IP; // 192.168.1.64

    const client = new DigestFetch(username, password);

    const hikvisionUrl = `http://192.168.88.143/ISAPI/AccessControl/UserInfo/Record?format=json`;

    console.log(hikvisionUrl);

    // Hikvision PERSON payload
    const payload = {
      UserInfo: {
        employeeNo: employeeNo,
        name: name,
        userType: "normal",
        Valid: {
          enable: true,
          beginTime: "2024-01-01T00:00:00",
          endTime: "2030-12-31T23:59:59",
        },
        doorRight: "1",
        RightPlan: [
          {
            doorNo: 1,
            planTemplateNo: "1",
          },
        ],
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

    if (result.statusCode !== 1) {
      return res.status(400).json({
        message: "Hikvision person qo‘shilmadi",
        hikvision: result,
      });
    }

    return res.status(201).json({ message: "Person muvaffaqiyatli yaratildi" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
