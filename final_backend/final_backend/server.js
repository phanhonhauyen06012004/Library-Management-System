require('dotenv').config(); // Luôn để dòng này ở dòng số 1
const express = require('express');
const cors = require('cors');
const db = require('./db');

// Xóa tất cả các dòng "const express = ..." khác ở phía dưới (nếu có)
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = 3000;

// Giả sử bạn đã có controller ở trên
const catController = require('./controllers/categoryController');
app.get('/api/categories', catController.getAllCategories);

// 1. MIDDLEWARE (Phải đặt trước các route)
app.use(cors()); // Cho phép kết nối từ Frontend
app.use(express.json()); // Cho phép đọc dữ liệu JSON từ request body
app.use('/api/reports', require('./routes/reportRoutes'));

const memberRoutes = require('./routes/memberRoutes');
app.use('/api/members', memberRoutes);

const bookRoutes = require('./routes/bookRoutes');
app.use('/api/books', bookRoutes);


const borrowingRoutes = require('./routes/borrowingRoutes');
app.use('/api/borrowings', borrowingRoutes); // Bật đường dẫn API

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);
// 2. KHAI BÁO ROUTES
app.use('/api/auth', authRoutes);



// ==========================================
// API ROUTES DỰA TRÊN DATABASE
// ==========================================

// Lấy danh sách Sách
app.get('/api/books', async (req, res) => {
    try {
        const query = `
            SELECT b.*, c.name as category_name 
            FROM books b
            LEFT JOIN categories c ON b.category_id = c.id
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi khi lấy dữ liệu sách' });
    }
});

// Lấy danh sách Bạn đọc (Members)
app.get('/api/members', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM members');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi khi lấy dữ liệu bạn đọc' });
    }
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`Backend Server đang chạy tại: http://localhost:${PORT}`);
});