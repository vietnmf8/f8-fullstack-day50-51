const { errorCodes, httpCodes } = require("@/config/constants");
const {
    EmailExistError,
    AuthError,
    ValidateError,
    ConversationTypeError,
    TargetUserExistConversation,
    UserPermission,
    NoContent,
} = require("@/utils/errors");
const isProduction = require("@/utils/isProduction");
const { JsonWebTokenError } = require("jsonwebtoken");
const errorHandler = (err, _, res, next) => {
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

    // Hứng lỗi xác thực chung
    if (err instanceof AuthError) {
        err = err.message || "Unauthorized";
        status = err.statusCode || httpCodes.unauthorized;
    }

    // Hứng lỗi verify email
    if (err instanceof EmailExistError) {
        err = err.message || "Bad Request";
        status = err.statusCode || httpCodes.badRequest;
    }

    // Hứng lỗi verify email
    if (err instanceof ValidateError) {
        err = err.message || "Invalid email or password";
        status = err.statusCode || httpCodes.unauthorized;
    }

    // Hứng lỗi Type sai
    if (err instanceof ConversationTypeError) {
        err = err.message || "Invalid conversation type";
        status = err.statusCode || httpCodes.badRequest;
    }

    // Hứng lỗi Đã có Target User trong Conversation
    if (err instanceof TargetUserExistConversation) {
        err = err.message || "User already in conversation";
        status = err.statusCode || httpCodes.conflict;
    }

    // Hứng lỗi User không có quyền thêm user vào conversation
    if (err instanceof UserPermission) {
        err = err.message || "No permission";
        status = err.statusCode || httpCodes.forbidden;
    }

    // Hứng lỗi User không có quyền thêm user vào conversation
    if (err instanceof NoContent) {
        err = err.message || "Content cannot be empty";
        status = err.statusCode || httpCodes.badRequest;
    }

    // Hứng lỗi Conflict
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
