const responseMiddleware = (_, res, next) => {
    // Nếu thành công!
    res.success = (data, status = 200, passProps = {}) => {
        res.status(status).json({
            status: "success",
            data,
            ...passProps,
        });
    };

    // Phân trang
    res.paginate = ({ rows, pagination }) => {
        res.success(rows, 200, {
            pagination,
        });
    };

    // Nếu lỗi
    res.error = (error, status = 500) => {
        res.status(status).json({
            status: "error",
            error,
        });
    };

    next();
};

module.exports = responseMiddleware;
