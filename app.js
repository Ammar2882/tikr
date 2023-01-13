import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import xss from 'xss-clean'
import mongoSanitizer from 'express-mongo-sanitize'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import logger from 'morgan'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {errorHandler} from './middlewares/error.js'
import {connectDb} from './utils/db.js'
let app = express();

//load all routes
import userRoutes from './routes/userRoutes.js'
import adminRoutes from './routes/AdminRoutes.js'

// Load env vars
dotenv.config();

//db connection
connectDb(process.env.MONGO_URI)

//request parser
app.use(express.json());

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// static files

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

//Data sanitization against NoSQL query injection
app.use(mongoSanitizer());

//Data sanitization against xss(cross site scripting)
app.use(xss()); 

// Set security headers
app.use(helmet());

//Request Rate Limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, //10 mins
    max: 5000 //100 requests per 10 mins
});

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(logger('dev'));
}

app.use('/',(req,res,next)=>{
    console.log('Application Changed')
})

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/admin', adminRoutes);


app.use(errorHandler)

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT,console.log(`server running in ${process.env.NODE_ENV} mode on port ${PORT}`));

// Handle unhandled promise rejection
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    //close server and exit process
    server.close(() => process.exit(1));
});

app.use('*', (req, res) => {
    res.status(404, {
        message: 'NOT FOUND'
    })
});


export default app;
