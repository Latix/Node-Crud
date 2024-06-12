const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const token = req.header('auth-token');

    if (!token) return res.status(401).send('Access Denied');
    console.log("Entered >>>")

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
        next();
    } catch(error) {
        res.error(400, 'JWT Mismatch');
    }
}