const pool = require("@/config/database.config");

class User {
    /* Tìm tất cả bản ghi */
    async findAll(limit, offset) {
        const query = `select * from users limit ? offset ?;`;
        const [rows] = await pool.query(query, [limit, offset]);
        return rows;
    }

    /* Đếm bản ghi */
    async count() {
        const query = `SELECT count(*) as count FROM users`;
        const [rows] = await pool.query(query);
        return rows[0].count;
    }

    /* Tìm một bản ghi */
    async findOne(id) {
        const query = `SELECT id, email, created_at FROM users WHERE id = ?`;
        const [rows] = await pool.query(query, [id]);
        return rows[0];
    }

    /* Tìm bản ghi có email = ... */
    async findByEmail(email) {
        const query = `SELECT id, email, password FROM users WHERE email = ?`;
        const [rows] = await pool.query(query, [email]);
        return rows[0];
    }

    /* Tạo bản ghi */
    async create(email, password) {
        const query = `INSERT INTO users (email, password) values (?, ?)`;
        const [{ insertId }] = await pool.query(query, [email, password]);
        return insertId;
    }

    /* Cập nhật field refresh_token */
    async updateRefreshToken(id, token, ttl) {
        const query = `UPDATE users SET refresh_token = ?, refresh_expires_at = ? WHERE id = ?`;
        const [{ affectedRows }] = await pool.query(query, [token, ttl, id]);
        return affectedRows;
    }

    /* Tìm bản ghi có refresh_token và thời gian còn hạn */
    async findByRefreshToken(token) {
        const query = `SELECT * FROM users WHERE refresh_token = ? AND refresh_expires_at >= now();`;
        const [rows] = await pool.query(query, [token]);
        return rows[0];
    }

    /* Tìm kiếm user theo email để thêm vào conversation */
    async searchByEmail(queryStr) {
        const query = `SELECT id, email FROM users WHERE email LIKE ? LIMIT 10`;
        const [rows] = await pool.query(query, [`%${queryStr}%`]);
        return rows;
    }

    /* Thêm Access Token vào Blacklist */
    async addRevokeToken(token, expiresIn) {
        const query = `INSERT INTO revoked_tokens (token, expires_at) VALUE (?, ?)`;
        const [{ insertId }] = await pool.query(query, [
            token,
            new Date(expiresIn * 1000),
        ]);
        return insertId;
    }

    /* Đếm bản ghi có token trong Blacklist */
    async countRevokedToken(token) {
        const query = `SELECT count(*) as count FROM revoked_tokens WHERE token = ?`;
        const [[{ count }]] = await pool.query(query, [token]);
        return count;
    }
}

module.exports = new User();
