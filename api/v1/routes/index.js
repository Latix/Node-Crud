const router = require("express").Router();
const productRouter = require("./product.route");

router.get("/", (req, res) => {
    // use custom response utility function to send response
    res.ok({ message: "Welcome to CRUD app V1 API" });
});

router.use("/products", productRouter);

module.exports = router;