const router = require("express").Router();
const productRouter = require("./product.route");
const authRouter = require("./auth.route");
const postRouter = require("./posts.route");
const serviceRouter = require("./service.route");

router.get("/", (req, res) => {
    // use custom response utility function to send response
    res.ok({ message: "Welcome to CRUD app V1 API" });
});

router.use("/auth", authRouter);
router.use("/posts", postRouter);
router.use("/products", productRouter);
router.use("/services", serviceRouter);

module.exports = router;