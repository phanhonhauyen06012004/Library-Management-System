const db = require('../db');

const SQL_LIST = `
  SELECT br.*, m.name AS member_name, m.code AS member_code, b.title AS book_title
  FROM borrowings br
  JOIN members m ON br.member_id = m.id
  JOIN books b ON br.book_id = b.id
`;

exports.getAllBorrowings = async (req, res) => {
  try {
    const [rows] = await db.query(SQL_LIST);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi khi lấy dữ liệu mượn trả' });
  }
};

exports.getBorrowingsByUserId = async (req, res) => {
  try {
    const [rows] = await db.query(`${SQL_LIST} WHERE br.member_id = ?`, [req.params.userId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi khi lấy phiếu mượn' });
  }
};

exports.createBorrowing = async (req, res) => {
    const { member_id, book_id, borrow_date, due_date } = req.body;

    try {
        // 1. KIỂM TRA GIỚI HẠN: Tối đa 3 cuốn đang mượn
        const [activeBorrows] = await db.query(
            "SELECT COUNT(*) as count FROM borrowings WHERE member_id = ? AND status = 'Đang mượn'",
            [member_id]
        );
        if (activeBorrows[0].count >= 3) {
            return res.status(400).json({ message: 'Bạn đã đạt giới hạn mượn 3 cuốn sách cùng lúc!' });
        }

        // 2. KIỂM TRA TRÙNG LẶP: Mỗi sách chỉ mượn 1 lần duy nhất
        const [existing] = await db.query(
            "SELECT id FROM borrowings WHERE member_id = ? AND book_id = ?",
            [member_id, book_id]
        );
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Bạn đã từng mượn cuốn sách này rồi, mỗi cuốn chỉ được mượn 1 lần duy nhất!' });
        }

        // 3. KIỂM TRA TỒN KHO
        const [book] = await db.query("SELECT quantity FROM books WHERE id = ?", [book_id]);
        if (!book[0] || book[0].quantity <= 0) {
            return res.status(400).json({ message: 'Sách này hiện đã hết trong kho!' });
        }

        // 4. TẠO PHIẾU VÀ TỰ ĐỘNG DUYỆT (Trạng thái: Đang mượn)
        // TẠO PHIẾU VÀ TỰ ĐỘNG DUYỆT (Trạng thái: Đang mượn)
        const otpCode = Math.random().toString(36).substring(2, 8).toUpperCase(); 
        await db.query(
            "INSERT INTO borrowings (member_id, book_id, borrow_date, due_date, status, verification_code) VALUES (?, ?, ?, ?, 'Đang mượn', ?)",
            [member_id, book_id, borrow_date, due_date, otpCode]
        );

        // 5. TRỪ SỐ LƯỢNG SÁCH TRONG KHO NGAY LẬP TỨC
        await db.query("UPDATE books SET quantity = quantity - 1 WHERE id = ?", [book_id]);

        res.status(201).json({ message: 'Mượn sách thành công!', otp: otpCode });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi kết nối Server' });
    }
};

exports.updateBorrowing = async (req, res) => {
  try {
    const { member_id, book_id, borrow_date, due_date, return_date } = req.body;
    await db.query(
      `UPDATE borrowings SET member_id = ?, book_id = ?, borrow_date = ?, due_date = ?, return_date = ? WHERE id = ?`,
      [member_id, book_id, borrow_date, due_date, return_date || null, req.params.id]
    );
    res.json({ message: 'Cập nhật thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// 1. HÀM DUYỆT MƯỢN (Chờ duyệt -> Đang mượn)
exports.approveBorrowing = async (req, res) => {
    const borrowingId = req.params.id;
    try {
        // Lấy thông tin phiếu mượn từ DB để biết chắc chắn đang mượn sách nào
        const [borrowings] = await db.query('SELECT book_id, status FROM borrowings WHERE id = ?', [borrowingId]);
        
        if (borrowings.length === 0) return res.status(404).json({ message: 'Không tìm thấy phiếu mượn!' });
        
        const borrowing = borrowings[0];
        const bookId = borrowing.book_id; // Lấy book_id từ chính Database

        if (borrowing.status !== 'Chờ duyệt') {
            return res.status(400).json({ message: 'Phiếu này không ở trạng thái chờ duyệt!' });
        }

        // Kiểm tra xem sách trong kho còn không
        const [books] = await db.query('SELECT quantity FROM books WHERE id = ?', [bookId]);
        if (books[0].quantity <= 0) return res.status(400).json({ message: 'Sách này đã hết trong kho!' });

        // Cập nhật trạng thái phiếu
        await db.query('UPDATE borrowings SET status = "Đang mượn" WHERE id = ?', [borrowingId]);

        // Trừ số lượng sách đi 1
        await db.query('UPDATE books SET quantity = quantity - 1 WHERE id = ?', [bookId]);

        res.json({ message: 'Duyệt phiếu thành công! Đã trừ số lượng sách.' });
    } catch (error) {
        console.error('Lỗi khi duyệt phiếu:', error);
        res.status(500).json({ message: 'Lỗi server nội bộ' });
    }
};

exports.returnBook = async (req, res) => {
    const borrowingId = req.params.id;
    try {
        // Lấy thông tin phiếu mượn từ DB
        const [borrowings] = await db.query('SELECT book_id, status FROM borrowings WHERE id = ?', [borrowingId]);
        
        if (borrowings.length === 0) return res.status(404).json({ message: 'Không tìm thấy phiếu mượn!' });
        
        const borrowing = borrowings[0];
        const bookId = borrowing.book_id; // Lấy book_id từ chính Database

        if (borrowing.status !== 'Đang mượn') {
            return res.status(400).json({ message: 'Sách chưa được mượn hoặc đã trả rồi!' });
        }

        // Cập nhật trạng thái phiếu và thêm ngày trả thực tế (hôm nay)
        await db.query('UPDATE borrowings SET status = "Đã trả", return_date = CURDATE() WHERE id = ?', [borrowingId]);

        // Cộng số lượng sách lên 1
        await db.query('UPDATE books SET quantity = quantity + 1 WHERE id = ?', [bookId]);

        res.json({ message: 'Thu hồi sách thành công! Đã cộng lại số lượng vào kho.' });
    } catch (error) {
        console.error('Lỗi khi thu hồi sách:', error);
        res.status(500).json({ message: 'Lỗi server nội bộ' });
    }
};
// Từ chối phiếu mượn
exports.rejectBorrowing = async (req, res) => {
try {
        const borrowingId = req.params.id;
        await db.query('UPDATE borrowings SET status = "Từ chối" WHERE id = ?', [borrowingId]);
        res.json({ message: 'Đã từ chối phiếu mượn' });
    } catch (error) {
         res.status(500).json({ message: 'Lỗi khi từ chối phiếu' });
    }
};

// Xóa phiếu mượn
exports.deleteBorrowing = async (req, res) => {
    try {
        const borrowingId = req.params.id;
        
        // Cần giải phóng sách nếu phiếu đang ở trạng thái "Đang mượn"
        const [borrowing] = await db.query('SELECT book_id, status FROM borrowings WHERE id = ?', [borrowingId]);
        
        if(borrowing.length > 0 && borrowing[0].status === 'Đang mượn') {
             // Thay đổi: CỘNG LẠI SỐ LƯỢNG SÁCH thay vì đổi status
             await db.query('UPDATE books SET quantity = quantity + 1 WHERE id = ?', [borrowing[0].book_id]);
        }

        await db.query('DELETE FROM borrowings WHERE id = ?', [borrowingId]);
        res.json({ message: 'Xóa phiếu mượn thành công' });
    } catch (error) {
        console.error('Lỗi khi xóa phiếu:', error);
        res.status(500).json({ message: 'Lỗi khi xóa phiếu mượn' });
    }
};