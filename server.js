const express = require('express');
const mongoose = require('mongoose');
require("express-async-errors"); // removes the need for try catch in every handler
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const connectDB = require("./db/index");
const v1Router = require("./api/v1/routes");
const responseUtilities = require("./api/shared/middlewares/responseUtilities");
const Product = require('./api/v1/models/product.model');
const { ApolloServer, gql } = require('apollo-server-express');

// GraphQL Type Definitions
const typeDefs = gql`
    type Product {
        id: ID!
        name: String!
        quantity: Int!
        price: Float!
        image: String
        createdAt: String
        updatedAt: String
    }

    type Query {
        products: [Product]
        product(id: ID!): Product
    }

    type Mutation {
        createProduct(name: String!, quantity: Int!, price: Float!, image: String): Product
        updateProduct(id: ID!, name: String, quantity: Int, price: Float, image: String): Product
        deleteProduct(id: ID!): Product
    }
`;

// GraphQL Resolvers
const resolvers = {
    Query: {
        products: async () => await Product.find({}),
        product: async (_, { id }) => await Product.findById(id),
    },
    Mutation: {
        createProduct: async (_, { name, quantity, price, image }) => {
            const product = new Product({ name, quantity, price, image });
            await product.save();
            return product;
        },
        updateProduct: async (_, { id, name, quantity, price, image }) => {
            const product = await Product.findByIdAndUpdate(
                id,
                { name, quantity, price, image },
                { new: true, runValidators: true }
            );
            return product;
        },
        deleteProduct: async (_, { id }) => {
            const product = await Product.findByIdAndDelete(id);
            return product;
        },
    },
};

dotenv.config();

const app = express();

connectDB();

const whiteList = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://thesispen-ai.vercel.app",
  ];
  
  //middleware
  // app.use(limiter); // apply rate limiter as a middleware limiter
  app.use(
    cors({
      origin: whiteList,
      // origin: "*",
      credentials: true,
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      optionsSuccessStatus: 200,
    }),
  );

  /*  this protect the server from some well-known web vulnerabilities
 by setting HTTP headers appropriately. */
app.use(helmet());

// middleware
app.use(responseUtilities);
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/', (req, res) => {
    res.send('Hello From CRUD APi');
});


// Initialize GraphQL endpoint
const server = new ApolloServer({ typeDefs, resolvers });

async function startServer() {
    await server.start();
    server.applyMiddleware({ app, path: '/graphql' });
}

startServer();

//routes
app.use("/api/v1", v1Router);

// 404 Route handler
app.use((req, res) => {
    // use custom helper function
    res.error(404, "Resource not found", 404);
});

const port = process.env.PORT || 3000;

mongoose.connection.once("open", () => {
    console.log("connected to MongoDB");

    app.listen(port, async () => {
        console.log(`connected to backend @ ${port}`);
    });
});