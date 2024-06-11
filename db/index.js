require("dotenv").config();

const mongoose = require("mongoose");
const inProduction = process.env.NODE_ENV === "production";

const connectDB = async () => {
  mongoose.set({strictQuery: true});
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      autoIndex: inProduction ? false : true
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = connectDB;