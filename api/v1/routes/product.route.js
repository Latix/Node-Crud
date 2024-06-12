const express = require('express');
const router = express.Router();
const { getProducts, getSingleProduct, createProduct, updateProduct, deleteProduct, getGraphQLProducts } = require('../controllers/product.controller');

const multer = require('multer');

const upload = multer(); 

router.get('/', getProducts);

router.get('/:id', getSingleProduct);

router.post('/', upload.none(), createProduct);

router.put('/:id', updateProduct);

router.delete('/:id', deleteProduct);

module.exports = router;