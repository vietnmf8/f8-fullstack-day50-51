const crypto = require("crypto");

/* Base 64 an toàn */
function base64Encode(string) {
    return btoa(string)
        .replace(/\+/g, "-") // Replace '+' with '-'
        .replace(/\//g, "_") // Replace '/' with '_'
        .replace(/=+$/, ""); // Remove trailing '=' padding
}

/**
 * Ký Token mới
 */
const jwt = {
    sign(payload, secret) {
        /* 
    - btoa(): Encoded - Mã hoá Base64
    - atob(): Decoded - Giải mã Base 64
    */
        // todo: Tự Ký token thủ công
        // Header --> base64 Encoded
        const header = base64Encode(
            JSON.stringify({
                alg: "HS256",
                typ: "JWT",
            }),
        );

        // Payload --> base64 Encoded
        const encodedPayload = base64Encode(JSON.stringify(payload));

        // Signature - Thuật toán HMAC256
        const hmac = crypto.createHmac("sha256", secret);
        hmac.update(`${header}.${encodedPayload}`); // tham số: chuỗi base 64 của header nối với encodedPayload
        const signature = hmac.digest("base64url"); // Đây chính là chữ ký được chuyển đổi sang base64 an toàn

        const token = `${header}.${encodedPayload}.${signature}`;
        return token;
    },
};

module.exports = jwt;
