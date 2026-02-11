const conversationModel = require("@/models/conversation.model");
const messageModel = require("@/models/message.model");
const userModel = require("@/models/user.model");
const {
    ConversationTypeError,
    TargetUserExistConversation,
    UserPermission,
    AuthError,
    NoContent,
} = require("@/utils/errors");

class ConversationService {
    /* Tạo cuộc hội thoại mới */
    async createConversation(data, creatorId) {
        const { name, type, participant_ids } = data;

        // Validate type
        if (!["group", "direct"].includes(type)) {
            throw new ConversationTypeError("Invalid conversation type");
            // Xử lý status 400 trong errorHandler
        }

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
        // Kiểm tra conversation type
        const conversation = await conversationModel.findById(conversationId);
        if (!conversation) {
            throw new ConversationTypeError("Conversation not found");
        }
        if (conversation.type !== "group") {
            throw new ConversationTypeError(
                "Can only add participants to group conversations",
            );
            // Status 400
        }

        // Kiểm tra xem user hiện tại có trong nhóm không?
        // Nếu có thì mới cho phép thêm
        const isMember = await conversationModel.isParticipant(
            conversationId,
            currentUserId,
        );
        if (!isMember) throw new UserPermission();

        // Kiểm tra user tồn tại
        const targetUser = await userModel.findOne(targetUserId);
        if (!targetUser) {
            throw new AuthError("User not found");
        }

        const isAlreadyMember = await conversationModel.isParticipant(
            conversationId,
            targetUserId,
        );
        if (isAlreadyMember) {
            throw new TargetUserExistConversation();
        }

        await conversationModel.addParticipant(conversationId, targetUserId);
    }

    /* Gửi tin nhắn */
    async sendMessage(conversationId, senderId, content) {
        if (!content || content.trim() === "") {
            throw new NoContent();
        }
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
