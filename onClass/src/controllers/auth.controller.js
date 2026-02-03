const bcrypt = require("bcrypt");
const { secret } = require("@/config/jwt");
const userModel = require("@/models/user.model");
const jwt = require("@/utils/jwt");
const strings = require("@/utils/strings");

/**
 * Mã hóa mật khẩu người dùng
 * @param {string} password - Mật khẩu thuần
 * @returns {Promise<string>} - Chuỗi mật khẩu đã được hash
 */
const hashPassword = async (password) => {
    // Cost factor = 10 (mức độ cân bằng giữa bảo mật và hiệu năng)
    const saltRounds = 10;

    // Tự động tạo Salt và thực hiện Hash
    return await bcrypt.hash(password, saltRounds);
};

/**
 * Kiểm tra mật khẩu người dùng nhập vào
 * @param {string} password - Mật khẩu thuần từ Client
 * @param {string} hashedPassword - Chuỗi hash đã lưu trong DB
 * @returns {Promise<boolean>} - Trả về true nếu khớp
 */
const comparePassword = async (password, hashedPassword) => {
    // Bcrypt tự tách Salt từ hashedPassword để so sánh, mình không cần lo
    return await bcrypt.compare(password, hashedPassword);
};

/* Response trả về kèm Token */
const responseWithTokens = async (user) => {
    // Ký token mới
    const payload = {
        sub: user.id,
        exp: parseInt(Date.now() / 1000 + 60 * 60),
    };
    const accessToken = jwt.sign(payload, secret);
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
    // Chỉ lấy những trường chúng ta cần từ request
    const { email, password } = req.body;

    // Tạo chuỗi hash bằng Bcrypt
    const hash = await hashPassword(password);

    const insertId = await userModel.create(email, hash);
    const newUser = {
        id: insertId,
        email,
    };
    res.success(newUser, 201);
};

/* Đăng nhập */
const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await userModel.findByEmail(email);

    if (!user) {
        return res.error("Unauthorized", 401);
    }

    // Kiểm tra mật khẩu hợp lệ
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
        return res.error("Unauthorized", 401);
    }

    // Ký access, refresh_token
    const tokens = await responseWithTokens(user);

    // response thành công
    res.success(user, 200, tokens);
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
        return res.error("Unauthorized", 401);
    }

    // Ký access, refresh_token
    const tokens = await responseWithTokens(user);

    // response thành công
    res.success(tokens);
};

/* Đăng xuất */
const logout = async (req, res) => {
    const { accessToken, tokenPayload } = req;
    await userModel.createRevokeToken(accessToken, tokenPayload.exp);
    res.success(null, 204);
};

module.exports = { register, login, getCurrentUser, refreshToken, logout };
