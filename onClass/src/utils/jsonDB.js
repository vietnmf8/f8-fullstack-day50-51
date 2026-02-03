const fs = require("node:fs");
const filePath = "./db.json";

/* Đọc file */
function read() {
    try {
        const result = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(result);
    } catch (error) {
        if (error.code === "ENOENT") {
            // todo: Ghi file: {}
            // Nếu file db.json thì chúng ta tạo file đó.
            // Nội dung trong file db.json mặc định là {} rỗng.
            const defaultDB = {};
            save(defaultDB); // Mặc định
            return defaultDB;
        }
    }
}

/* Ghi file */
function save(db) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(db, null, 4), "utf-8");
    } catch (error) {
        // Lỗi liên quan đến hệ thống
        console.log(error);
    }
}

/* Export */
module.exports = { read, save };
