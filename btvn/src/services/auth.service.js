const authConfig = require("@/config/auth.config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const strings = require("@/utils/strings");
const userModel = require("@/models/user.model");

class AuthService {
    /* Ký Token */
    async signAccessToken(user) {
        const payload = {
            sub: user.id,
        };
        const accessToken = jwt.sign(payload, authConfig.secret, {
            expiresIn: authConfig.accessTokenTTL,
        });

        return accessToken;
    }

    /* Verify */
    async verifyAccessToken(accessToken) {
        const payload = jwt.verify(accessToken, authConfig.secret);
        return payload;
    }

    /* Mã hóa mật khẩu người dùng */
    async hashPassword(password) {
        return await bcrypt.hash(password, authConfig.saltRounds);
    }

    /* Kiểm tra mật khẩu người dùng nhập vào */
    async comparePassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }

    /* Ký token mới (Access & Refresh Token) */
    async responseWithTokens(user) {
        const accessToken = await this.signAccessToken(user);
        const refreshToken = strings.generateRandomString(32);
        const refreshTtl = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await userModel.updateRefreshToken(user.id, refreshToken, refreshTtl);

        const tokens = {
            access_token: accessToken,
            access_token_ttl: authConfig.accessTokenTTL,
            refresh_token: refreshToken,
            refresh_token_ttl: 60 * 60 * 24 * 30,
        };

        return tokens;
    }

    /* Đăng ký */
    async register(email, password) {
        const hash = await this.hashPassword(password);
        const insertId = await userModel.create(email, hash);
        const newUser = {
            id: insertId,
            email,
        };
        const tokens = await this.responseWithTokens(newUser);
        return { newUser, tokens };
    }

    /* Đăng nhập */
    async login(email, password) {
        const user = await userModel.findByEmail(email);

        if (!user) {
            return res.error("Unauthorized", httpCodes.unauthorized);
        }
        const isValid = await this.comparePassword(password, user.password);
        if (!isValid) {
            return res.error("Unauthorized", httpCodes.unauthorized);
        }
        const tokens = await this.responseWithTokens(user);
        return { user, tokens };
    }

    /* Refresh */
    async refresh(refreshToken) {
        const user = await userModel.findByRefreshToken(refreshToken);

        if (!user) {
            return res.error("Unauthorized", httpCodes.unauthorized);
        }

        const tokens = await this.responseWithTokens(user);
        return tokens;
    }

    /* Revoke Token */
    async addRevokedToken(accessToken, tokenPayload) {
        await userModel.addRevokeToken(accessToken, tokenPayload.exp);
    }
}

module.exports = new AuthService();
