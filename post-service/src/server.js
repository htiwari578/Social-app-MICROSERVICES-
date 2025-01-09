require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const Redis = require('ioredis')
const cors = require('cors')
const helmet = require('helmet')
const postRoutes = require('./routes/post-routes')
const errorHandler = require('./middleware/errorHandler')
const logger = require('./utils/logger')
const { connectRabbitMQ } = require('./utils/rabbitmq')


const app = express();
const PORT = process.env.PORT || 3002;

// connect to mongodb
mongoose 
    .connect(process.env.MONGO_URI)
    .then(()=>logger.info("Connected to Mongodb"))
    .catch((error)=> logger.error("Mongo connection error",error));

    const redisClient = new Redis(process.env.REDIS_URL)

// middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req,res,next)=>{
    logger.info(`Recived ${req.method} request to ${req.url}`);
    logger.info(`Request body, ${req.body}`);
    next();
});

//routes-> pass redisclient to routes
app.use('/api/posts' , (req,res,next)=>{
    req.redisClient =  redisClient
    next();
},postRoutes)

//error handler
app.use(errorHandler)

async function startServer() {
    try {
        await connectRabbitMQ();
        app.listen(PORT, ()=>{
            logger.info(`Post server running on port ${PORT}`)
        });
    } catch (error) {
        logger.error('Failed to connect to server', error)
        process.exit(1)
    }
}
startServer()



//unhandled promise rejection
process.on("unhandledRejection", (reason,promise)=>{
    logger.error("Unhandled Rejection at" , promise, "reason", reason);
})
