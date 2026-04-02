// final_backend/controllers/reportController.js
const db = require('../db');

exports.getStats = async (req, res) => {
    try {
        // 1. Tổng số sách
        const [books] = await db.query('SELECT COUNT(*) as total FROM books');
        
        // 2. Tổng số bạn đọc (Sửa users thành members)
        const [members] = await db.query('SELECT COUNT(*) as total FROM members');
        
        // 3. Tổng số phiếu mượn
        const [borrowings] = await db.query('SELECT COUNT(*) as total FROM borrowings');
        
        // 4. Số sách đang mượn (chưa trả)
        const [pending] = await db.query('SELECT COUNT(*) as total FROM borrowings WHERE return_date IS NULL');    
        
        // 5. Số sách quá hạn
        const [overdue] = await db.query('SELECT COUNT(*) as total FROM borrowings WHERE return_date IS NULL AND due_date < CURDATE()');

        res.json({
            totalBooks: books[0].total,
            totalMembers: members[0].total,
            totalBorrowings: borrowings[0].total,
            pending: pending[0].total,
            overdue: overdue[0].total
        });
    } catch (error) {
        console.error('Lỗi API Thống kê:', error);
        res.status(500).json({ message: error.message });
    }
};