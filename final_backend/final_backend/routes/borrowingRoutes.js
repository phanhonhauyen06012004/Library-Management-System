const express = require('express');
const router = express.Router();
const borrowingController = require('../controllers/borrowingController');

// 1. Các API Lấy dữ liệu và Tạo mới
router.get('/', borrowingController.getAllBorrowings); // Lấy tất cả cho Admin
router.get('/user/:userId', borrowingController.getBorrowingsByUserId); // Lấy cho 1 User
router.post('/', borrowingController.createBorrowing); // Tạo phiếu mượn mới

// 2. Các API Thao tác duyệt/trả/xóa của Admin
router.put('/:id/approve', borrowingController.approveBorrowing); // Nút Duyệt
router.put('/:id/return', borrowingController.returnBook);        // Nút Thu hồi
router.put('/:id/reject', borrowingController.rejectBorrowing);   // Nút Từ chối
router.put('/:id', borrowingController.updateBorrowing);          // Sửa phiếu (admin)
router.delete('/:id', borrowingController.deleteBorrowing);       // Nút Xóa

module.exports = router;
