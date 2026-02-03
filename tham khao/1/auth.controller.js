const { httpCodes } = require("@/config/constants");
const userModel = require("@/models/user.model");
const authService = require("@/services/auth.service");
const strings = require("@/utils/strings");

/* Ký token mới */
const responseWithTokens = async (user) => {
    const accessToken = await authService.signAccessToken(user);
    const refreshToken = strings.generateRandomString(32);
    const refreshTtl = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await userModel.updateRefreshToken(user.id, refreshToken, refreshTtl);

    const tokens = {
        access_token: accessToken,
        access_token_ttl: 10,
        refresh_token: refreshToken,
        refresh_token_ttl: 60 * 60 * 24 * 30,
    };

    return tokens;
};

/* Đăng ký */
const register = async (req, res) => {
    const { email, password } = req.body;
    const hash = await authService.hashPassword(password);
    const insertId = await userModel.create(email, hash);
    const newUser = {
        id: insertId,
        email,
    };
    const tokens = await responseWithTokens(newUser);
    res.success(newUser, httpCodes.created, tokens);
};

/* Đăng nhập */
const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await userModel.findByEmail(email);

    if (!user) {
        return res.error("Unauthorized", httpCodes.unauthorized);
    }
    const isValid = await authService.comparePassword(password, user.password);
    if (!isValid) {
        return res.error("Unauthorized", httpCodes.unauthorized);
    }
    const tokens = await responseWithTokens(user);
    res.success(user, httpCodes.success, tokens);
};

/* Lấy ra người dùng hiện tại */
const getCurrentUser = async (req, res) => {
    res.success(req.user);
};

/* Lấy ra refresh_token từ phía Client */
const refreshToken = async (req, res) => {
    const refreshToken = req.body.refresh_token;
    const user = await userModel.findByRefreshToken(refreshToken);

    if (!user) {
        return res.error("Unauthorized", httpCodes.unauthorized);
    }

    const tokens = await responseWithTokens(user);
    res.success(tokens);
};

module.exports = { register, login, getCurrentUser, refreshToken };
