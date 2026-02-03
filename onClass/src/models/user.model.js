const pool = require("@/config/database");

class User {
    async findAll(limit, offset) {
        const [rows] = await pool.query(
            `select * from users limit  ${limit} offset  ${offset};`,
        );
        return rows;
    }

    async count() {
        const [rows] = await pool.query(`SELECT count(*) as count FROM users`);
        return rows[0].count;
    }

    async findOne(id) {
        const [rows] = await pool.query(
            `SELECT id, email, first_name, last_name, created_at FROM users WHERE id = ${id}`,
        );

        return rows[0];
    }

    async findByEmail(email) {
        const query = `SELECT id, email, first_name, last_name, password FROM users WHERE email = ?`;
        const [rows] = await pool.query(query, [email]);
        return rows[0];
    }

    async create(email, password) {
        const query = `INSERT INTO users (email, password) values (?, ?)`;
        const [{ insertId }] = await pool.query(query, [email, password]);
        // Khi Insert thành công thì cần trả về InsertId mới
        return insertId;
    }

    async updateRefreshToken(id, token, ttl) {
        const query = `UPDATE users SET refresh_token = ?, refresh_expires_at = ? WHERE id = ?`;
        const [{ affectedRows }] = await pool.query(query, [token, ttl, id]);
        // Trả về số bản ghi bị ảnh hưởng
        return affectedRows;
    }

    // Tìm bản ghi có refresh_token và thời gian còn hạn
    async findByRefreshToken(token) {
        const query = `SELECT * FROM users WHERE refresh_token = ? AND refresh_expires_at >= now();`;
        const [rows] = await pool.query(query, [token]);
        return rows[0];
    }

    async createRevokeToken(token, expiresIn) {
        const query = `INSERT INTO revoked_tokens (token, expires_at) VALUE (?, ?)`;
        const [{ insertId }] = await pool.query(query, [
            token,
            new Date(expiresIn * 1000),
        ]);
        return insertId;
    }

    async countTokenInBlacklist(token) {
        const query = `SELECT count(*) AS count FROM revoked_tokens WHERE token = ?`;
        const [[{ count }]] = await pool.query(query, [token]);
        return count;
    }
}

module.exports = new User();
