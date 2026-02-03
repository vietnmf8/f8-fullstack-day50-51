/**
 * Hàm xử lý thời gian sống của Token (TTL) một cách an toàn
 * @returns {number|string} Trả về số giây hoặc chuỗi định dạng thời gian (1h, 7d...)
 */
const ttlFormat = () => {
    // 1. Lấy giá trị và gán mặc định nếu rỗng (Hằng số rõ ràng theo BACKEND_COMMENT.md)
    const DEFAULT_TTL = 3600; // Mặc định 1 giờ (tính bằng giây)
    const rawValue = process.env.JWT_ACCESS_TOKEN_TTL?.trim();

    // 2. Xử lý trường hợp không có giá trị hoặc chỉ có khoảng trắng
    if (!rawValue) {
        return DEFAULT_TTL;
    }

    // 3. Kiểm tra nếu là SỐ THUẦN TÚY (Ví dụ: "3600", "7200")
    // Regex: ^\d+$ nghĩa là từ đầu đến cuối chỉ chứa các chữ số
    if (/^\d+$/.test(rawValue)) {
        return Number(rawValue);
    }

    // 4. Kiểm tra nếu là CHUỖI ĐỊNH DẠNG (Ví dụ: "1h", "2d", "30m")
    // Regex: Số đi kèm với s, m, h hoặc d (không phân biệt hoa thường)
    const isValidTimeFormat = /^\d+[smhd]$/i.test(rawValue);
    if (isValidTimeFormat) {
        return rawValue;
    }

    // 5. Nếu nhập bừa (Ví dụ: "abc", " "), trả về mặc định để tránh lỗi hệ thống
    return DEFAULT_TTL;
};

module.exports = ttlFormat;
