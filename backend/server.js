const express = require('express');
const cookieParser = require('cookie-parser');
const dbConnect = require('./database/index');
const {PORT} = require('./config/index');
const router = require('./routes/index')
const errorHandler = require('./middleware/errorHandler')
const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(router);
dbConnect();
// for static availability of images from the server
app.use('/storage',express.static('storage'));
app.use(errorHandler);
app.listen(PORT,console.log(`Backend is running on the ${PORT}`))