const db = require('../db');

// 1. Lấy thông tin hồ sơ (Dùng cho trang profile.html)
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id; 

        // Query kết hợp bảng members và roles để lấy tên quyền (Admin/User)
        const sql = `
            SELECT m.id, m.code, m.name, m.email, m.phone, r.name as role_name 
            FROM members m
            LEFT JOIN roles r ON m.role_id = r.id
            WHERE m.id = ?
        `;
        
        const [rows] = await db.query(sql, [userId]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy thông tin bạn đọc!' });
        }

        // Trả về dữ liệu (đổi tên 'name' thành 'full_name' để khớp với Frontend đã viết)
        const user = rows[0];
        res.json({
            id: user.id,
            code: user.code,
            full_name: user.name, // Alias để Frontend không phải sửa
            email: user.email,
            phone: user.phone,
            role: user.role_name
        });
    } catch (error) {
        console.error('Lỗi lấy profile:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};

// 2. Cập nhật hồ sơ (Dùng cho Form sửa)
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id; 
        const { full_name, phone } = req.body; // Lấy dữ liệu từ body

        // SQL chuẩn theo bảng members của bạn (Cột là 'name', không phải 'full_name')
        // Lưu ý: SQL của bạn không có cột 'address' nên mình đã bỏ ra để tránh lỗi
        const sql = `UPDATE members SET name = ?, phone = ? WHERE id = ?`;
        
        await db.query(sql, [full_name, phone, userId]);
        
        res.json({ message: 'Cập nhật hồ sơ thành công!' });
    } catch (error) {
        console.error('Lỗi cập nhật hồ sơ:', error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật hồ sơ' });
    }
};