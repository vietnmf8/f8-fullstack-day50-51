const authConfig = require("@/config/auth.config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

class AuthService {
    /**
     * TOKEN
     * ----------------------------------------------------------------------
     */
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

    /**
     * PASSWORD
     * ----------------------------------------------------------------------
     */
    /* Mã hóa mật khẩu người dùng */
    async hashPassword(password) {
        return await bcrypt.hash(password, authConfig.saltRounds);
    }

    /* Kiểm tra mật khẩu người dùng nhập vào */
    async comparePassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }
}

module.exports = new AuthService();
