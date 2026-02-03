const postModel = require("@/models/post.model");
const userModel = require("@/models/user.model");
const userService = require("@/services/user.service");

/* Lấy toàn bộ danh sách user */
const getAll = async (req, res) => {
    // Lấy ra page hiện tại
    const page = +req.query.page || 1;
    const result = await userService.pagination(page);
    res.paginate(result);
};

/* Lấy toàn bộ danh sách posts của 1 user cụ thể */
const getUserPosts = async (req, res) => {
    const userPosts = await postModel.findUserPosts(req.params.id);
    res.success(userPosts);
};

/* Lấy chi tiết 1 user */
const getOne = async (req, res) => {
    const user = await userModel.findOne(req.params.id);

    if (!user) {
        return res.error(
            {
                message: `Tài nguyên không tồn tại ID: ${req.params.id}`,
            },
            404,
        );
    }

    res.success(user);
};

/* Tạo user mới */
const create = (req, res) => {};

module.exports = { getAll, getOne, create, getUserPosts };
