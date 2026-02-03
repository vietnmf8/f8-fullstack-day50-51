const ttlFormat = require("@/utils/ttlFormat");

const authConfig = {
    secret: process.env.JWT_SECRET,
    accessTokenTTL: ttlFormat(),
    saltRounds: +process.env.SALT_ROUNDS || 10,
};

module.exports = authConfig;
