const express = require('express');
const router = express.Router();
const recommendProductsForUserNeural = require('../services/neural.filter');
const recommendProductsForUser = require('../services/matrix.filter');
const { getProducts, getSingleProduct, createProduct, updateProduct, deleteProduct } = require('../controllers/product.controller');

const multer = require('multer');

const upload = multer(); 

router.get('/', getProducts);

router.get('/:id', getSingleProduct);

router.post('/', upload.none(), createProduct);

router.put('/:id', updateProduct);

router.delete('/:id', deleteProduct);

router.get('/recommendations/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const recommendations = await recommendProductsForUser(userId);
        res.json(recommendations);
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
});

router.param('id', (req, res, next, id) => {
    req.user = id;
    console.log(id);
    next();
});

module.exports = router;