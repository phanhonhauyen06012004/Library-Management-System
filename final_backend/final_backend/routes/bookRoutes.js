const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

router.get('/', bookController.getAllBooks);          // Lấy danh sách
router.get('/:id', bookController.getBookById);      // Lấy 1 cuốn để Sửa
router.post('/', bookController.createBook);         // Thêm mới
router.put('/:id', bookController.updateBook);       // Lưu Sửa
router.delete('/:id', bookController.deleteBook);    // Xóa

module.exports = router;