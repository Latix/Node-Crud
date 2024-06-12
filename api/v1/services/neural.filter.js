const tf = require('@tensorflow/tfjs-node');
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

async function buildNeuralModel(userCount, productCount) {
    const userInput = tf.input({ shape: [1], name: 'user' });
    const productInput = tf.input({ shape: [1], name: 'product' });

    const userEmbedding = tf.layers.embedding({ inputDim: userCount, outputDim: 50 }).apply(userInput);
    const productEmbedding = tf.layers.embedding({ inputDim: productCount, outputDim: 50 }).apply(productInput);

    const mergedLayer = tf.layers.concatenate().apply([userEmbedding, productEmbedding]);
    const denseLayer = tf.layers.dense({ units: 128, activation: 'relu' }).apply(mergedLayer);
    const output = tf.layers.dense({ units: 1, activation: 'sigmoid' }).apply(denseLayer);

    const model = tf.model({ inputs: [userInput, productInput], outputs: output });
    model.compile({ optimizer: 'adam', loss: 'binaryCrossentropy', metrics: ['accuracy'] });

    return model;
}

async function trainNeuralModel(model, interactions, userIndex, productIndex) {
    const userIndices = interactions.map(interaction => userIndex.get(interaction.user.toString()));
    const productIndices = interactions.map(interaction => productIndex.get(interaction.product.toString()));
    const ratings = interactions.map(interaction => interaction.rating);

    const userTensor = tf.tensor2d(userIndices, [userIndices.length, 1]);
    const productTensor = tf.tensor2d(productIndices, [productIndices.length, 1]);
    const ratingTensor = tf.tensor2d(ratings, [ratings.length, 1]);

    await model.fit([userTensor, productTensor], ratingTensor, { epochs: 10 });
}

async function recommendProductsForUserNeural(userId) {
    const { matrix, userIndex, productIndex, users, products } = await createInteractionMatrix();
    const userIdx = userIndex.get(userId);

    if (userIdx === undefined) {
        throw new Error('User not found in the interaction matrix');
    }

    const model = await buildNeuralModel(users.length, products.length);
    await trainNeuralModel(model, await Interaction.find(), userIndex, productIndex);

    const userTensor = tf.tensor2d([userIdx], [1, 1]);
    const productScores = await Promise.all(products.map(async (product, idx) => {
        const productTensor = tf.tensor2d([idx], [1, 1]);
        const score = await model.predict([userTensor, productTensor]).data();
        return { product, score: score[0] };
    }));

    productScores.sort((a, b) => b.score - a.score);

    return productScores.slice(0, 10).map(p => p.product);
}

module.exports = recommendProductsForUserNeural;