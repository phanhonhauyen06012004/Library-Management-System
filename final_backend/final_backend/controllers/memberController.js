// final_backend/controllers/memberController.js
const db = require('../db');
const bcrypt = require('bcrypt');

// 1. Lấy danh sách tất cả bạn đọc
exports.getAllMembers = async (req, res) => {
    try {
        const query = 'SELECT * FROM members WHERE role_id != 1 OR role_id IS NULL ORDER BY id DESC';
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error("Lỗi lấy danh sách bạn đọc:", error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// 2. Lấy thông tin 1 bạn đọc (Dùng khi bấm nút Sửa)
exports.getMemberById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM members WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy bạn đọc' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// 3. Thêm bạn đọc mới
exports.createMember = async (req, res) => {
    const { code, name, email, phone, status, password } = req.body;
    try {
        // Nếu bạn gõ pass trên màn hình thì lấy pass đó, nếu lỡ để trống thì mới lấy 123456
        const rawPassword = password || '123456';
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(rawPassword, salt);

        const query = `INSERT INTO members (code, name, email, phone, status, password_hash, role_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        
        await db.query(query, [code, name, email, phone, status || 'Hoạt động', hashedPassword, 2]);
        
        res.status(201).json({ message: 'Thêm bạn đọc thành công!' });
    } catch (error) {
        console.error("Lỗi thêm bạn đọc:", error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Mã bạn đọc hoặc Email đã tồn tại!' });
        }
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// 4. Cập nhật thông tin bạn đọc
exports.updateMember = async (req, res) => {
    const { code, name, email, phone, status } = req.body;
    try {
        const query = `UPDATE members SET code=?, name=?, email=?, phone=?, status=? WHERE id=?`;
        await db.query(query, [code, name, email, phone, status, req.params.id]);
        res.json({ message: 'Cập nhật thành công' });
    } catch (error) {
        console.error("Lỗi cập nhật:", error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// 5. Xóa bạn đọc
exports.deleteMember = async (req, res) => {
    try {
        await db.query('DELETE FROM members WHERE id = ?', [req.params.id]);
        res.json({ message: 'Xóa thành công' });
    } catch (error) {
        console.error("Lỗi xóa bạn đọc:", error);
        res.status(500).json({ message: 'Lỗi server (Có thể bạn đọc này đang mượn sách)' });
    }
};