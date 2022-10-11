import createError, { HttpError } from 'http-errors';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import db from './config/database.config';
import mailRouter from './routes/email';
import cors from 'cors';

// Swagger
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
const swaggerDocument = YAML.load('./swagger.yaml');

// ROUTESS
import usersRouter from './routes/users';
import accountRouter from './routes/accounts';
import withdrawRouter from './routes/withdraw';
import transferAirtimeRouter from './routes/transaction';
import creditRouter from './routes/credit';
db.sync({})
  .then(() => {
    console.log('Database connected successfully 🚀');
  })
  .catch((err) => {
    console.log(err);
  });

const app = express();

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/mail', mailRouter);
app.use('/user', usersRouter);
app.use('/account', accountRouter);
app.use('/cash', withdrawRouter);
app.use('/transfer', transferAirtimeRouter);
app.use('/wallet', creditRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));



// catch 404 and forward to error handler


// error handler
app.use(function (err: HttpError, req: Request, res: Response, next: NextFunction) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
});


export default app;
