const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    rating: Number // Rating or interaction score
});

module.exports = mongoose.model('Interaction', interactionSchema);