// final_backend/routes/memberRoutes.js
const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');

router.get('/', memberController.getAllMembers);         // Lấy danh sách
router.get('/:id', memberController.getMemberById);      // Lấy 1 người
router.post('/', memberController.createMember);         // Thêm mới
router.put('/:id', memberController.updateMember);       // Cập nhật
router.delete('/:id', memberController.deleteMember);    // Xóa

module.exports = router;