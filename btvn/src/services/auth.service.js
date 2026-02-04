const authConfig = require("@/config/auth.config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userModel = require("@/models/user.model");
const randomString = require("@/utils/randomString");
const AuthError = require("@/utils/AuthError");
const refreshTokenModel = require("@/models/refreshToken.model");
const revokedTokenModel = require("@/models/revokedToken.model");

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

    /* Tạo Refresh Token */
    async createRefreshToken(user, userAgent) {
        // Check trùng Refresh Token trong DB
        let refreshToken,
            isExists = false;
        do {
            refreshToken = randomString();
            const count =
                await refreshTokenModel.countRefreshToken(refreshToken);
            isExists = count > 0;
        } while (isExists);

        // Thời gian sống của Refresh Token
        const expiresDate = new Date();
        expiresDate.setDate(expiresDate.getDate() + authConfig.refreshTokenTTL);

        // Thêm vào DB
        await refreshTokenModel.addRefreshToken(
            user.id,
            refreshToken,
            userAgent,
            expiresDate,
        );
        return refreshToken;
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
    async responseWithTokens(user, userAgent) {
        const accessToken = await this.signAccessToken(user);
        /*  Cách cũ: 
        const refreshToken = strings.generateRandomString(32); 
        const refreshTtl = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await userModel.updateRefreshToken(user.id, refreshToken, refreshTtl); */

        // Cách dùng built-in
        const refreshToken = await this.createRefreshToken(user, userAgent);

        const tokens = {
            access_token: accessToken,
            access_token_ttl: authConfig.accessTokenTTL,
            refresh_token: refreshToken,
            refresh_token_ttl: authConfig.refreshTokenTTL,
        };

        return tokens;
    }

    /* Đăng ký */
    async register(email, password, userAgent) {
        const hash = await this.hashPassword(password);
        const insertId = await userModel.create(email, hash);
        const newUser = {
            id: insertId,
            email,
        };
        const tokens = await this.responseWithTokens(newUser, userAgent);
        return { newUser, tokens };
    }

    /* Đăng nhập */
    async login(email, password, userAgent) {
        const user = await userModel.findByEmail(email);

        if (!user) {
            throw new AuthError();
        }
        const isValid = await this.comparePassword(password, user.password);
        if (!isValid) {
            throw new AuthError();
        }
        const tokens = await this.responseWithTokens(user, userAgent);
        return { user, tokens };
    }

    /* Refresh */
    async refresh(refreshToken, userAgent) {
        const refreshTokenDB =
            await refreshTokenModel.findByRefreshToken(refreshToken);
        if (!refreshTokenDB) {
            throw new AuthError();
        }

        const user = {
            id: refreshTokenDB.user_id,
        };
        const tokens = await this.responseWithTokens(user, userAgent);
        await refreshTokenModel.updateRefreshToken(refreshTokenDB.id);
        return tokens;
    }

    /* Revoke Token */
    async addRevokedToken(accessToken, tokenPayload) {
        await revokedTokenModel.addRevokeToken(accessToken, tokenPayload.exp);
    }
}

module.exports = new AuthService();
