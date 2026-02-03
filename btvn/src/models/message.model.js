const pool = require("@/config/database.config");

class MessageModel {
    /* Lưu tin nhắn mới */
    async create(conversationId, senderId, content) {
        const query = `INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)`;
        const [{ insertId }] = await pool.query(query, [
            conversationId,
            senderId,
            content,
        ]);
        return insertId;
    }

    /* Lấy toàn bộ tin nhắn trong 1 cuộc hội thoại, kèm thông tin người gửi */
    async findByConversationId(conversationId) {
        // Lấy email người gửi (dựa vào sender_id của messages)
        const senderEmailSubquery = `
            SELECT u.email
            FROM users u
            WHERE u.id = m.sender_id
        `;

        const query = `
            SELECT m.*, (${senderEmailSubquery}) AS sender_email
            FROM messages m
            WHERE m.conversation_id = ?
            ORDER BY m.created_at ASC
        `;

        const [rows] = await pool.query(query, [conversationId]);
        return rows;
    }
}

module.exports = new MessageModel();
