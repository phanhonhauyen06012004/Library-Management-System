const express = require('express');
const router = express.Router();

// 1. Nhập Controller và Middleware
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware'); 

// 2. Định nghĩa các API
// Lấy thông tin (GET)
router.get('/profile', authMiddleware.verifyToken, userController.getProfile);

// Cập nhật thông tin (PUT) - Dùng cho form sửa hồ sơ
router.put('/profile', authMiddleware.verifyToken, userController.updateProfile);

// 3. Xuất router để file server.js có thể dùng
module.exports = router;