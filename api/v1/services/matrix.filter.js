const tf = require('@tensorflow/tfjs-node');
const numeric = require('numeric');
const User = require('../models/User.model');
const Product = require('../models/product.model');
const Interaction = require('../models/interaction.model');

async function createInteractionMatrix() {
    const users = await User.find();
    const products = await Product.find();
    const interactions = await Interaction.find();

    const userIndex = new Map(users.map((u, i) => [u._id.toString(), i]));
    const productIndex = new Map(products.map((p, i) => [p._id.toString(), i]));

    let matrix = tf.buffer([users.length, products.length]);

    interactions.forEach(interaction => {
        if (interaction.user && interaction.product && interaction.rating !== undefined) {
            const userIdx = userIndex.get(interaction.user.toString());
            const productIdx = productIndex.get(interaction.product.toString());
            if (userIdx !== undefined && productIdx !== undefined) {
                matrix.set(interaction.rating, userIdx, productIdx);
            }
        }
    });

    return { matrix: matrix.toTensor(), userIndex, productIndex, users, products };
}

async function recommendProductsForUser(userId) {
    const { matrix, userIndex, productIndex, products } = await createInteractionMatrix();
    const userIdx = userIndex.get(userId);

    // Convert the TensorFlow.js tensor to a regular JavaScript array
    const matrixArray = matrix.arraySync();

    // Perform SVD using numeric.js
    const svdResult = numeric.svd(matrixArray);
    const u = tf.tensor2d(svdResult.U);
    const s = tf.tensor2d(numeric.diag(svdResult.S));
    const v = tf.tensor2d(svdResult.V);

    // Extract the user vector from the U matrix
    const userVector = u.gather([userIdx]);

    // Perform the matrix multiplications
    const userVectorS = userVector.matMul(s);
    const scores = userVectorS.matMul(v.transpose());

    const userScores = scores.arraySync()[0];

    const recommendedProductIndices = userScores.map((score, idx) => ({ score, idx }))
                                                .sort((a, b) => b.score - a.score)
                                                .slice(0, 10)
                                                .map(obj => obj.idx);

    const recommendations = recommendedProductIndices.map(idx => products[idx]);

    return recommendations;
}

module.exports = recommendProductsForUser;
