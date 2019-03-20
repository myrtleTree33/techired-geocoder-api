import express from 'express';
import path from 'path';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';

import logger from './logger';
import { initPassport } from './utils/socialAuth';

import baseRoutes from './routes/baseRoutes';
import userRoutes from './routes/userRoutes';

// connect to Mongo DB
logger.info(`Connecting to ${process.env.MONGO_URI}..`);
mongoose.connect(process.env.MONGO_URI);
logger.info(`Connected to ${process.env.MONGO_URI}`);

const app = express();
app.disable('x-powered-by');

app.use(
  morgan('combined', {
    // stream: logger.stream,
    skip: () => app.get('env') === 'test'
  })
);

// enable CORS
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../public')));

// Uncomment this to enable social authentication
initPassport(app);

// Routes
app.use('/', baseRoutes);
app.use('/user', userRoutes);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.httpCode = '404';
  err.code = '404';
  next(err);
});

// Error handler
app.use((err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  const { code, message } = err;
  res.status(err.httpCode || 500).json({ code, message });
});

export default app;
