const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require("body-parser");
const morgan = require('morgan');
const cors = require('cors');
const http = require('http');
const connectDB = require('./config/db');
const cloudinaryConfig = require('./config/cloudinarydb');
const routes = require('./Route/index');
const errorHandler = require('./Middlewares/errorMiddleware');
const { initializeWSS } = require('./config/websocket');

dotenv.config();

const app = express();

const server = http.createServer(app);

// Initialize WebSocket
initializeWSS(server);

// Middlewares
// app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use(cors());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Use routes
app.use('/api', routes);
app.use(errorHandler);

cloudinaryConfig();

// Database Connection & Start Server
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server running with WebSocket on port ${PORT}`);
    });
}).catch((err) => {
    console.error("Error connecting to database: " + err);
});
