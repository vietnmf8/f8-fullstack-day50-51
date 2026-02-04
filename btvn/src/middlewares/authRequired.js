const userModel = require("@/models/user.model");
const { httpCodes } = require("@/config/constants");
const authService = require("@/services/auth.service");
const getClientToken = require("@/utils/getClientToken");

const authRequired = async (req, res, next) => {
    // Kiểm tra accessToken
    const accessToken = getClientToken(req.headers);
    if (!accessToken) {
        return res.error("Unauthorized", httpCodes.unauthorized);
    }

    // Verify Token
    const payload = await authService.verifyAccessToken(accessToken);

    // Kiểm tra Blacklist
    const countRevokedToken = await userModel.countRevokedToken(accessToken);
    if (countRevokedToken > 0)
        return res.error("Unauthorized", httpCodes.unauthorized);

    // Kiểm tra user
    const currentUser = await userModel.findOne(payload.sub);
    if (!currentUser) {
        return res.error("Unauthorized", httpCodes.unauthorized);
    }

    // Gán vào req để cho res trả về cho client
    req.user = currentUser;
    req.accessToken = accessToken;
    req.tokenPayload = payload;
    next();
};

module.exports = authRequired;
