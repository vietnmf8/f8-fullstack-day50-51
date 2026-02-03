const { httpCodes } = require("@/config/constants");
const userModel = require("@/models/user.model");
const authService = require("@/services/auth.service");
const getClientToken = require("@/utils/getClientToken");

/* Đăng ký */
const register = async (req, res) => {
    const { email, password } = req.body;
    const { newUser, tokens } = await authService.register(email, password);
    res.success(newUser, httpCodes.created, tokens);
};

/* Đăng nhập */
const login = async (req, res) => {
    const { email, password } = req.body;
    const { user, tokens } = await authService.login(email, password);
    res.success(user, httpCodes.success, tokens);
};

/* Lấy ra người dùng hiện tại */
const getCurrentUser = async (req, res) => {
    res.success(req.user);
};

/* Lấy ra refresh_token từ phía Client */
const refreshToken = async (req, res) => {
    const refreshToken = req.body.refresh_token;
    const tokens = await authService.refresh(refreshToken);
    res.success(tokens);
};

/* Đăng xuất */
const logout = async (req, res) => {
    const { accessToken, tokenPayload } = req;
    await authService.addRevokedToken(accessToken, tokenPayload);
    res.success(null, 204);
};

module.exports = { register, login, getCurrentUser, refreshToken, logout };
