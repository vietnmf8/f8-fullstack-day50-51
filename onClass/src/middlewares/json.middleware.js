const jsonMiddleware = (req, _, next) => {
    let body = "";
    req.on("data", (chunk) => {
        body += chunk.toString();
    });
    req.on("end", () => {
        if (body) {
            req.body = JSON.parse(body);
        }
        next();
    });
};

module.exports = jsonMiddleware;
