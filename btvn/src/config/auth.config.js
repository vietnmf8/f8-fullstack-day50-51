const ttlFormat = require("@/utils/ttlFormat");

const authConfig = {
    secret: process.env.JWT_SECRET,
    accessTokenTTL: ttlFormat(),
    refreshTokenTTL: +process.env.REFRESH_TOKEN_TTL || 7,
    saltRounds: +process.env.SALT_ROUNDS || 10,
};

module.exports = authConfig;
