// IMPORTS/CONFIGS
const express = require('express');
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorMiddleware');
//ROUTE IMPORTS
const userRoute = require('./routes/userRoutes');
const gameRoutes = require('./routes/gameRoutes');
// MIDDLEWARES
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(
  cors({
    origin: 'https://resonant-cranachan-6ad07d.netlify.app',
    credentials: true,
  })
);

app.use(function (req, res, next) {
  //   res.header(
  //     'Access-Control-Allow-Origin',
  //     'https://resonant-cranachan-6ad07d.netlify.app'
  //   );
  //   res.header(
  //     'Access-Control-Allow-Headers',
  //     'Origin, X-Requested-With, Content-Type, Accept'
  //   );
  //   next();
  res.setHeader(
    'Access-Control-Allow-Origin',
    'https://resonant-cranachan-6ad07d.netlify.app'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'POST, GET, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  next();
});

app.get('/', (req, res) => {
  res.send('Welcome');
});

// ROUTES
app.use('/api/users', userRoute);
app.use('/api/games', gameRoutes);

// ERROR HANDLING MIDDLEWARE
app.use(errorHandler);

// CONNECT DB AND START SERVER
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('DB Connected');
  })
  .catch((err) => {
    console.log(`DB CONNECTION ERROR: ${err}`);
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`SERVER LISTENING ON PORT: ${PORT}`);
});
