const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const xss = require('xss-clean')
const mongoSanitizer = require('express-mongo-sanitize')
const rateLimit = require('express-rate-limit')
const dotenv = require('dotenv')
const logger = require('morgan')
const { fileURLToPath } = require('url')
const { dirname } = require('path')
const {errorHandler} = require('./middlewares/error.js')
const connectDb = require('./utils/db.js')
let app = express();

//load all routes
const userRoutes = require('./routes/UserRoutes.js')
const adminRoutes = require('./routes/AdminRoutes.js')

// Load env vars
dotenv.config();

//db connection
connectDb(process.env.MONGO_URI)

//request parser
app.use(express.json());

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// static files

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


app.use('/api/v1/user', userRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use('/',(req,res)=>{
    res.json({message:'hello'})
})


// app.use(errorHandler)

const PORT = process.env.PORT || 5000;

app.listen(PORT,(err)=>{
    if(err) console.log('error in server : ',err)
    else console.log(`server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
});
app.use('*', (req, res) => {
    res.status(404, {
        message: 'sorry'
    })
});
// Handle unhandled promise rejection
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    //close server and exit process
    server.close(() => process.exit(1));
});



