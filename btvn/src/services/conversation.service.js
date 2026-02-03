const conversationModel = require("@/models/conversation.model");
const messageModel = require("@/models/message.model");

class ConversationService {
    /* Tạo cuộc hội thoại mới */
    async createConversation(data, creatorId) {
        const { name, type, participant_ids } = data;

        // 1. Tạo bản ghi conversation
        const conversationId = await conversationModel.create(
            name || null,
            type,
            creatorId,
        );

        // 2. Thêm người tạo vào danh sách thành viên
        await conversationModel.addParticipant(conversationId, creatorId);

        // 3. Thêm các thành viên khác (Nếu có)
        if (Array.isArray(participant_ids)) {
            for (const userId of participant_ids) {
                if (userId !== creatorId) {
                    await conversationModel.addParticipant(
                        conversationId,
                        userId,
                    );
                }
            }
        }

        return { id: conversationId, name, type };
    }

    /* Thêm thành viên mới */
    async addParticipant(conversationId, targetUserId, currentUserId) {
        // Kiểm tra xem user hiện tại có trong nhóm không?
        // Nếu có thì mới cho phép thêm
        const isMember = await conversationModel.isParticipant(
            conversationId,
            currentUserId,
        );
        if (!isMember)
            return res.error(
                "Bạn không có quyền thực hiện hành động này",
                httpCodes.forbidden,
            );

        await conversationModel.addParticipant(conversationId, targetUserId);
    }

    /* Gửi tin nhắn */
    async sendMessage(conversationId, senderId, content) {
        // Bảo mật: Phải là thành viên mới được gửi tin nhắn
        const isMember = await conversationModel.isParticipant(
            conversationId,
            senderId,
        );
        if (!isMember)
            return res.error(
                "Bạn không thuộc cuộc hội thoại này",
                httpCodes.forbidden,
            );

        const messageId = await messageModel.create(
            conversationId,
            senderId,
            content,
        );

        return { id: messageId, content, sender_id: senderId };
    }

    /* Lấy lịch sử tin nhắn */
    async getMessages(conversationId, currentUserId) {
        // Bảo mật
        const isMember = await conversationModel.isParticipant(
            conversationId,
            currentUserId,
        );
        if (!isMember)
            return res.error(
                "Bạn không có quyền xem tin nhắn này",
                httpCodes.forbidden,
            );

        const messages =
            await messageModel.findByConversationId(conversationId);

        return messages;
    }
}

module.exports = new ConversationService();
