const db = require('../db');

// 1. Lấy toàn bộ danh sách sách
exports.getAllBooks = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT b.*, c.name AS category_name 
            FROM books b 
            LEFT JOIN categories c ON b.category_id = c.id
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Lấy chi tiết 1 cuốn sách (Dùng cho trang Sửa/Chi tiết)
exports.getBookById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy sách' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 1. HÀM THÊM SÁCH MỚI (Có nhận thêm link ảnh)
// 1. HÀM THÊM SÁCH MỚI
exports.createBook = async (req, res) => {
    try {
        const { code, title, author, category_id, publish_year, quantity, pdf_url, image } = req.body;

        // Bổ sung category_id và pdf_url vào câu lệnh SQL (tổng cộng 8 dấu ?)
        const sql = `INSERT INTO books (code, title, author, category_id, publish_year, quantity, pdf_url, image) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        
        // Truyền các biến theo đúng thứ tự
        await db.query(sql, [code, title, author, category_id, publish_year, quantity, pdf_url, image]);
        
        res.status(201).json({ message: 'Thêm sách thành công!' });
    } catch (error) {
        console.error('Lỗi khi thêm sách:', error);
        res.status(500).json({ message: 'Lỗi server khi thêm sách', error: error.message });
    }
};

// 2. HÀM CẬP NHẬT SÁCH (Có cập nhật link ảnh)
exports.updateBook = async (req, res) => {
    try {
        const bookId = req.params.id;
        // Bổ sung lấy thêm category_id, pdf_url và image từ Frontend gửi lên
        const { code, title, author, category_id, publish_year, quantity, pdf_url, image } = req.body;

        // Câu lệnh SQL UPDATE đầy đủ 8 trường dữ liệu
        const sql = `UPDATE books 
                     SET code = ?, title = ?, author = ?, category_id = ?, publish_year = ?, quantity = ?, pdf_url = ?, image = ? 
                     WHERE id = ?`;
        
        // Truyền các biến theo đúng thứ tự dấu chấm hỏi (?)
        await db.query(sql, [code, title, author, category_id, publish_year, quantity, pdf_url, image, bookId]);
        
        res.json({ message: 'Cập nhật sách thành công!' });
    } catch (error) {
        console.error('Lỗi khi cập nhật sách:', error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật sách' });
    }
};

// 5. Xóa sách
exports.deleteBook = async (req, res) => {
    try {
        // Kiểm tra xem sách có đang bị mượn không (Ràng buộc khóa ngoại)
        const [borrowing] = await db.query('SELECT * FROM borrowings WHERE book_id = ? AND return_date IS NULL', [req.params.id]);
        if (borrowing.length > 0) {
            return res.status(400).json({ message: 'Không thể xóa sách đang có người mượn chưa trả!' });
        }

        await db.query('DELETE FROM books WHERE id = ?', [req.params.id]);
        res.json({ message: 'Xóa sách thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi Database: Có thể sách này đang dính tới dữ liệu phiếu mượn cũ.' });
    }
};