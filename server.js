const express = require('express');
const mongoose = require('mongoose');
require("express-async-errors");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const connectDB = require("./db/index");
const v1Router = require("./api/v1/routes");
const responseUtilities = require("./api/shared/middlewares/responseUtilities");
const twilio = require('twilio');

// Twilio Credentials
const accountSid = '';
const authToken = '';
const client = twilio(accountSid, authToken);

// const { buildSchema } = require("graphql");
// const { createHandler } = require('graphql-http/lib/use/express');
// const { ruruHTML } = require("ruru/server");
const cron = require('node-cron');
// const { express: playground } = require('graphql-playground-middleware-express');

dotenv.config();

const app = express();

connectDB();

// cron.schedule('* * * * *', () => {
//   console.log('Running cron job to update document');
// });

console.log('Cron job scheduled to run every minute');

const whiteList = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://thesispen-ai.vercel.app",
];

app.use(
    cors({
      origin: whiteList,
      credentials: true,
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      optionsSuccessStatus: 200,
    }),
);

app.use(helmet());
app.use(responseUtilities);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', logger, loggerWithName, (req, res) => {
    res.send('Hello From CRUD API');
});

// Webhook to receive WhatsApp messages
app.post('/whatsapp', (req, res) => {
    const incomingMsg = req.body.Body.toLowerCase();
    const from = req.body.From;

    let responseMsg = '';

    if (incomingMsg.includes('book event')) {
        // Handle event booking logic
        responseMsg = 'Thanks for your interest! Please provide the event name and date.';
    } else if (incomingMsg.includes('event name')) {
        // Capture the event details and call your API to book
        responseMsg = 'Your event has been booked! You will receive a confirmation soon.';
    } else {
        responseMsg = 'Sorry, I didn’t understand that. You can say "Book event" to start booking.';
    }

    client.messages.create({
        from: 'whatsapp:+14155238886',
        to: from,
        body: responseMsg
    }).then(message => console.log(message.sid));

    res.send('Message received');
});

// var schema = buildSchema(`
//   type Query {
//     hello: String,
//     age: Float
//   }
// `);

// var rootValue = {
//   hello() {
//     return "Hello world!";
//   },
//   age() {
//     return 26;
//   }
// };

// app.all('/graphql', createHandler({ schema: schema, rootValue: rootValue }));

// app.get('/playground', playground({ endpoint: '/graphql' }));

// app.get("/", (req, res, next) => {
//   res.writeHead(200, { "Content-Type": "text/html" });
//   return res.end(
//     ruruHTML({
//       endpoint: "/graphql",
//     }),
//   );
// });

function logger(req, res, next) {
  console.log(req.originalUrl);
  req.apiUrl = req.originalUrl;
  next();
}

function loggerWithName(req, res, next) {
  console.log("Url: " + req.apiUrl);
  next();
}

app.use("/api/v1", v1Router);

app.use((req, res) => {
    res.error(404, "Resource not found", 404);
});

const port = process.env.PORT || 4000;

mongoose.connection.once("open", () => {
    console.log("connected to MongoDB");

    app.listen(port, async () => {
        console.log(`connected to backend @ ${port}`);
    });
});
