const Product = require('../models/product.model');

const getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.status(200).json({
            "status": "OK",
            "message": "success",
            data: products
        });
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

const getSingleProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id);
        res.status(200).json({
            "status": "OK",
            "message": "success",
            data: product
        });
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

const createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(200).json({
            "status": "OK",
            "message": "success",
            data: product
        });
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

const updateProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!product) {
            res.status(404).json({
                "status": "404",
                "message": "error"
            });
        }

        // const updateProduct = await Product.findById(id);

        res.status(200).json({
            "status": "200",
            "message": "success",
            data: product
        });
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            res.status(404).json({
                "status": "404",
                "message": "error"
            });
        }

        const products = await Product.find({});

        res.status(200).json({
            "status": "200",
            "message": "success",
            data: products
        });
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

module.exports = {
    getProducts,
    getSingleProduct,
    createProduct,
    updateProduct,
    deleteProduct
}