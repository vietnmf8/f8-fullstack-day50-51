const { httpCodes } = require("@/config/constants");
const conversationModel = require("@/models/conversation.model");
const conversationService = require("@/services/conversation.service");

/* Tạo cuộc hội thoại mới */
const create = async (req, res) => {
    const currentUserId = req.user.id;
    const result = await conversationService.createConversation(
        req.body,
        currentUserId,
    );
    res.success(result, httpCodes.created);
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
    const currentUserId = req.user.id;
    await conversationService.addParticipant(id, user_id, currentUserId);
    res.success({ message: "Đã thêm thành viên thành công!" });
};

/* Gửi tin nhắn */
const sendMessage = async (req, res) => {
    const { id } = req.params;
    const senderId = req.user.id;
    const { content } = req.body;
    const result = await conversationService.sendMessage(id, senderId, content);
    res.success(result, httpCodes.created);
};

/* Lấy lịch sử tin nhắn */
const getMessages = async (req, res) => {
    const { id } = req.params;
    const currentUserId = req.user.id;
    const result = await conversationService.getMessages(id, currentUserId);
    res.success(result);
};

module.exports = { create, getAll, addParticipant, sendMessage, getMessages };
