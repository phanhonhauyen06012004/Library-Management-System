// final_backend/controllers/categoryController.js
const db = require('../db');

exports.getAllCategories = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categories ORDER BY name ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy thể loại' });
    }
};