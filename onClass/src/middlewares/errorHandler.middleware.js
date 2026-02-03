// const { JsonWebTokenError } = require("jsonwebtoken");
const JsonWebTokenError = require("@/classes/errors/JsonWebTokenError");

const errorHandlerMiddleware = (err, req, res, next) => {
    let status;
    if (err instanceof JsonWebTokenError) {
        // Để bảo mật thì không để lỗi cụ thể -> để lỗi chung
        err = err.message || "Unauthorized";
        status = 401;
    }
    res.error(
        {
            message: String(err),
        },
        status,
    );
};

module.exports = errorHandlerMiddleware;
