// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    // Lấy token từ header gửi lên (Frontend sẽ gửi dạng: Bearer <token>)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) return res.status(401).json({ message: 'Vui lòng đăng nhập để thực hiện hành động này!' });

    try {
        // Giải mã token (nhớ thay 'YOUR_SECRET_KEY' bằng key bạn dùng lúc login)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Lưu thông tin user vào req để dùng cho các hàm sau
        next(); // Cho phép đi tiếp vào controller
    } catch (error) {
        return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });
    }
};