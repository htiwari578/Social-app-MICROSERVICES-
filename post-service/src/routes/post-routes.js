const express = require('express');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { createPost,  getAllPost, getPost, deletePost } = require('../controllers/post-controller');


const router = express.Router();

router.use(isAuthenticated)

router.post('/create-post',createPost )
router.get('/all-posts',getAllPost )
router.get('/:id',getPost )
router.delete('/:id',deletePost )


module.exports = router;