const constants = {
    httpCodes: {
        success: 200,
        created: 201,
        unauthorized: 401,
        forbidden: 403,
        conflict: 409,
        notFound: 404,
        tooManyRequests: 429,
        serverError: 500,
    },
    errorCodes: {
        conflict: "ER_DUP_ENTRY",
    },
};

module.exports = constants;
