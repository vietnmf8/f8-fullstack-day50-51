const { httpCodes } = require("@/config/constants");
const conversationModel = require("@/models/conversation.model");
const messageModel = require("@/models/message.model");

/* Tạo cuộc hội thoại mới */
const create = async (req, res) => {
    const { name, type, participant_ids } = req.body;
    const currentUserId = req.user.id;

    // 1. Tạo bản ghi conversation
    const conversationId = await conversationModel.create(
        name || null,
        type,
        currentUserId,
    );

    // 2. Thêm người tạo vào danh sách thành viên
    await conversationModel.addParticipant(conversationId, currentUserId);

    // 3. Thêm các thành viên khác (Nếu có)
    if (Array.isArray(participant_ids)) {
        for (const userId of participant_ids) {
            if (userId !== currentUserId) {
                await conversationModel.addParticipant(conversationId, userId);
            }
        }
    }

    res.success({ id: conversationId, name, type }, httpCodes.created);
};

/* Lấy danh sách conversation của user hiện tại */
const getAll = async (req, res) => {
    const conversations = await conversationModel.findByUserId(req.user.id);
    res.success(conversations);
};

/* Thêm thành viên mới vào nhóm */
const addParticipant = async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.body;

    // Kiểm tra xem user hiện tại có trong nhóm không?
    // Nếu có thì mới cho phép thêm
    const isMember = await conversationModel.isParticipant(id, req.user.id);
    if (!isMember)
        return res.error(
            "Bạn không có quyền thực hiện hành động này",
            httpCodes.forbidden,
        );

    await conversationModel.addParticipant(id, user_id);
    res.success({ message: "Đã thêm thành viên thành công!" });
};

/* Gửi tin nhắn */
const sendMessage = async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const senderId = req.user.id;

    // Bảo mật: Phải là thành viên mới được gửi tin nhắn
    const isMember = await conversationModel.isParticipant(id, senderId);
    if (!isMember)
        return res.error(
            "Bạn không thuộc cuộc hội thoại này",
            httpCodes.forbidden,
        );

    const messageId = await messageModel.create(id, senderId, content);
    res.success(
        { id: messageId, content, sender_id: senderId },
        httpCodes.created,
    );
};

/* Lấy lịch sử tin nhắn */
const getMessages = async (req, res) => {
    const { id } = req.params;

    // Bảo mật
    const isMember = await conversationModel.isParticipant(id, req.user.id);
    if (!isMember)
        return res.error(
            "Bạn không có quyền xem tin nhắn này",
            httpCodes.forbidden,
        );

    const messages = await messageModel.findByConversationId(id);
    res.success(messages);
};

module.exports = { create, getAll, addParticipant, sendMessage, getMessages };
