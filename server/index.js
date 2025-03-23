const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');

const connection = require('./config/db');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

const PORT = process.env.PORT || 5000;



app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Database Connection & Start Server
connection.query("SELECT 1")
    .then(()=> {
        console.log("Connected to database");
        app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Error connecting to database: " + err);
    });


