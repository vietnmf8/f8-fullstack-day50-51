const notFoundMiddleware = (req, res) => {
    res.error(
        {
            message: `Cannot ${req.method} ${req.url}`,
        },
        404,
    );
};

module.exports = notFoundMiddleware;
