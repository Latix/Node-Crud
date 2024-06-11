const express = require('express');
const mongoose = require('mongoose');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello From Node APi V2');
});

app.post('/api/products', (req, res) => {
    console.log(req.body);
    res.send(req.body);
});


mongoose.connect("mongodb+srv://admin:3bJLdVNcnSoEJ8dp@backenddb.jaw0k1m.mongodb.net/Crud-App?retryWrites=true&w=majority&appName=backendDB").then(() =>{
    console.log('Connected to DB!');
    app.listen(3000, () => {
        console.log('listening on port 3000');
    });
}).catch(() => {
    console.log('Not Connected!')
})