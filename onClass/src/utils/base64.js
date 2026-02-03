const { Buffer } = require("node:buffer");

/* Mã hoá base64 an toàn với đường dẫn */
const encode = (str, safeUrl = false) => {
    return Buffer.from(str).toString(safeUrl ? "base64url" : "base64");
};

/* Giải mã base 64 an toàn với đường dẫn */
const decode = (base64Str, safeUrl = false) => {
    return Buffer.from(base64Str, safeUrl ? "base64url" : "base64").toString(
        "utf-8",
    );
};

module.exports = { encode, decode };
