const router = require('express').Router();
const User = require('../models/User.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { registerSchema, LoginSchema } = require('../validators/Auth.validator');


router.post('/register', async (req, res) => {
    const {error} = registerSchema.validate(req.body);

    if (error) return res.error(400, error.details[0].message);

    const emailExists = await User.findOne({ email: req.body.email });

    if (emailExists) return res.error(400, "User already exists!");

    try {
        const saltRounds = 10;
        const hashPassword = await bcrypt.hash(req.body.password, saltRounds)

        const user = await User.create({...req.body, password: hashPassword});
        res.ok({'_id': user._id}, { message: "Registered user successfully." });
    } catch (error) {
        res.error(500, { message: error.message });
    }
    
});

router.post('/login', async (req, res) => {
    const {error} = LoginSchema.validate(req.body);

    if (error) return res.error(400, error.details[0].message);

    const user = await User.findOne({ email: req.body.email });

    if (!user) return res.error(400, "User doesn't exist!");

    const checkPassword = await bcrypt.compare(req.body.password, user.password);

    if(!checkPassword) return res.error(400, "Passwords do not macth!");

    const token = jwt.sign({
        _id: user._id
    }, process.env.TOKEN_SECRET);
    res.header('auth-token', token);

    res.ok({'_id': user._id, token}, { message: "User found." });
});

module.exports = router;