require ("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const logger = require("./utils/logger");
const helmet = require('helmet');
const cors = require("cors");
const {RateLimiterRedis} = require('rate-limiter-flexible')
const {rateLimit} = require('express-rate-limit')
const {RedisStore} = require('rate-limit-redis')
const Redis = require('ioredis')
const routes = require('./routes/identity-service');
const errorHandler = require("./middleware/errorHandler");


const app = express()
const PORT = process.env.PORT || 3001



// connect to mongodb
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => logger.info("Connected to mongodb"))
    .catch((e) =>logger.error("Mongo not connected", e));

    const redisClient = new Redis(process.env.REDIS_URL )


// middleware
app.use(helmet())
app.use(cors())
app.use(express.json())


app.use((req,res,next) => {
    logger.info(`Recived ${req.method} request to ${req.url}`);
    logger.info(`Request body, ${req.body}`)
    next()
})

// DDos protection and rate limiting

const rateLimiter = new RateLimiterRedis({
    storeClient : redisClient,
    keyPrefix : 'middleware',
    points : 10,
    duration : 1
})

app.use((req,res,next) => {
    rateLimiter
        .consume(req.ip).then(() => next()).catch(()=>{
            logger.warn(`Rate limit exceeded for IP: ${req.ip}`)
            res.status(429).json({
                success:false,
                message:"Too many requests"
            });
        });
})

// Ip based rate limiting for sensitive endpoints

const sensitiveEndPointLimiter = rateLimit({
    windowMs : 15 * 60 * 1000,
    max : 50,
    standardHeaders : true,
    legacyHeaders : false,
    handler : (req , res) => {
        logger.warn(`Sensitive end point rate limit exceeded for IP: ${req.ip}`)
        res.status(429).json({
            success:false,
            message:"Too many requests"
        });
    },
    store : new RedisStore({
        sendCommand : (...args)=> redisClient.call(...args)
    })
})

// apply this sensitiveEndPointLimiter to routes
app.use('/api/auth/register' , sensitiveEndPointLimiter)

//Routes
app.use('/api/auth', routes)

// error handler
app.use(errorHandler)

// server

app.listen(PORT, ()=> {
    logger.info(`Idenity service running on port ${PORT}`)
})


// unhandles promise rejection

process.on('unhandledRejection', (reason , promise) => {
    logger.error('Unhandled Rejection at', promise, "reason", reason)
})

