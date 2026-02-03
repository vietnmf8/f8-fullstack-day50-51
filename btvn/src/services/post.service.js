// Vai trò của service:
//  - Chỉ tập trung nhận tham số xử lý logic
//  - Nó cũng có thể tương tác với model
// * Giải quyết: Controller không phải tương tác với Model nữa

const postModel = require("@/models/post.model");
const paginationService = require("./pagination.service");

class PostService {
    model = postModel;
    constructor() {
        // Thêm phương thức mới vào instance riêng biệt
        paginationService.apply(this);
    }
    // Thêm vào prototype...
}

// Khởi tạo object và export object đó ra
module.exports = new PostService();
