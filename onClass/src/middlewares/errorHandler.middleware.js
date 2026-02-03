const { JsonWebTokenError } = require("jsonwebtoken");

const errorHandlerMiddleware = (err, req, res, next) => {
    let status;
    if (err instanceof JsonWebTokenError) {
        // Để bảo mật thì không để lỗi cụ thể -> để lỗi chung
        err = "Unauthorized";
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
