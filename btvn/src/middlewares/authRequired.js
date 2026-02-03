const userModel = require("@/models/user.model");
const { httpCodes } = require("@/config/constants");
const authService = require("@/services/auth.service");

const authRequired = async (req, res, next) => {
    const accessToken = req.headers?.authorization
        ?.replace("Bearer", "")
        ?.trim();
    const payload = await authService.verifyAccessToken(accessToken);

    // Kiểm tra user
    const currentUser = await userModel.findOne(payload.sub);
    if (!currentUser) {
        return res.error("Unauthorized", httpCodes.unauthorized);
    }

    // Gán vào req để cho res trả về cho client
    req.user = currentUser;
    console.log(req.user);
    next();
};

module.exports = authRequired;
