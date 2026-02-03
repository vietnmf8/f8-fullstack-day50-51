const crypto = require("crypto");
const { secret } = require("@/config/jwt");
const userModel = require("@/models/user.model");
const base64 = require("@/utils/base64");
const JsonWebTokenError = require("@/classes/errors/JsonWebTokenError");

const authRequiredMiddleware = async (req, res, next) => {
    // Lấy accessToken từ Header Request
    const accessToken = req.headers.authorization
        ?.replace("Bearer", "")
        ?.trim();

    //todo: Verify thủ công!
    const [encodedHeader, encodedPayload, clientSignature] =
        accessToken?.split(".") ?? [];
    /* 
     Token Client:
        - Header: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
        - Payload: eyJzdWIiOjEwLCJleHAiOjE3Njk1OTg3NzY1ODF9
        - Signature: ZuM-fypXAYwt4mOlpF3T23FRwR-lvI8-R7eC_2fScJI
    */

    /* Server thực hiện ký lại */
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(`${encodedHeader}.${encodedPayload}`);
    const signature = hmac.digest("base64url");

    if (clientSignature !== signature) {
        // return res.error("Unauthorized", 401);
        throw new JsonWebTokenError("Invalid Token!!!!");
    }

    const payload = JSON.parse(base64.decode(encodedPayload, true));

    // Kiểm tra exp
    if (payload.exp < Date.now() / 1000) {
        return res.error("Unauthorized", 401);
    }

    // Kiểm tra user
    const currentUser = await userModel.findOne(payload.sub);

    // TH: Token còn hạn, nhưng xoá người dùng rồi
    if (!currentUser) {
        return res.error("Unauthorized", 401);
    }

    // Gán vào req để cho res trả về cho client
    req.user = currentUser;

    next();
};

module.exports = authRequiredMiddleware;
