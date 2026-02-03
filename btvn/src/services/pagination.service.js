// Tách Nghiệp vụ Phân trang thành Service riêng

class PaginationService {
    apply(service) {
        if (!service.model) {
            throw new Error("Model is required for pagination");
        }

        service.pagination = async (page, limit = 10, condition) => {
            const offset = (page - 1) * limit;
            const count = await service.model.count();
            const rows = await service.model.findAll(limit, offset, condition);
            const pagination = {
                current_page: page,
                total: count,
                per_page: limit, // Số bản ghi trên 1 trang
            };
            if (rows.length) {
                pagination.from = offset + 1; // VD: Từ bản ghi thứ 11 (page 2)
                pagination.to = offset + rows.length; // đến bản  ghi thứ 20
            }
            return {
                rows,
                pagination,
            };
        };
    }
}

module.exports = new PaginationService();
