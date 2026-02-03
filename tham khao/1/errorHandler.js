const { errorCodes, httpCodes } = require("@/config/constants");
const isProduction = require("@/utils/isProduction");
const { JsonWebTokenError } = require("jsonwebtoken");
const errorHandler = (err, req, res, next) => {
    if (res.headerSent) return next(err);

    let status;
    // JWT error
    if (err instanceof JsonWebTokenError) {
        if (err.name === "TokenExpiredError") {
            err = "Token expired";
            status = httpCodes.unauthorized;
        } else if (err.name === "JsonWebTokenError") {
            err = "Invalid token";
            status = httpCodes.unauthorized;
        } else {
            err = "Unauthorized";
            status = httpCodes.unauthorized;
        }
    }

    // Conflict
    if (err?.code === errorCodes.conflict) {
        err = "Conflict";
        status = httpCodes.conflict;
    }

    // Exception: Lỗi không xác định
    res.error(
        {
            err: !isProduction() ? err : "Server error.",
            message: !isProduction() ? String(err) : "Server error.",
        },
        status,
    );
};

module.exports = errorHandler;
