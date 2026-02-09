import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// __dirname o‘rnini bosadi
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const employeesPath = path.join(__dirname, "xodimlar.json");
const imagesDir = path.join(__dirname, "images");

// JSONni o‘qiymiz
const employees = JSON.parse(fs.readFileSync(employeesPath, "utf-8"));

// images papkadagi barcha fayllar
const imageFiles = fs.readdirSync(imagesDir);

const updatedEmployees = employees.map((emp) => {
  if (!emp.employeeNo) return emp;

  // A123456 → A-123456
  const imagePrefix =
    emp.employeeNo.slice(0, 1) + "-" + emp.employeeNo.slice(1);

  // mos rasmni qidiramiz
  const imageFile = imageFiles.find((file) => file.startsWith(imagePrefix));

  return {
    ...emp,
    imageUrl: imageFile ?? null,
  };
});

// JSONni qayta yozamiz
fs.writeFileSync(
  employeesPath,
  JSON.stringify(updatedEmployees, null, 2),
  "utf-8",
);

console.log("✅ xodimlar.json imageUrl bilan yangilandi");
