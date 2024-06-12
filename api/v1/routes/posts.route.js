const router = require('express').Router();
const verify = require('./verifyToken');

router.get('/', verify, (req, res) => {
    res.json({posts: {title: 'My first pet dog', 'description': 'Random Data you shouldn\'t access'}})
})

module.exports = router;