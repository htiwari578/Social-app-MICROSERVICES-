const express = require('express');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { searchPostController } = require('../controllers/search-controller');



const router = express.Router()

router.use(isAuthenticated)

router.get('/posts', searchPostController);

module.exports = router;