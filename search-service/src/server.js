require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const Redis = require('ioredis')
const cors = require('cors')
const helmet = require('helmet')
const logger = require('./utils/logger')
const searchRoutes = require('./routes/search-routes')
const errorHandler = require('./middleware/errorHandler')
const { connectRabbitMQ, consumeEvent } = require('./utils/rabbitmq')
const { handlePostCreated, handlePostDeleted } = require('./eventHandlers.js/serach-event-handler')


const app = express()
const PORT = process.env.PORT || 3004;

mongoose
    .connect(process.env.MONGO_URI)
    .then(()=>logger.info("Connected to mongodb" ))
    .catch((error)=>logger.error("Mongodb not connected", error))

const redisClient = new Redis(process.env.REDIS_URL)

//middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req,res,next)=>{
    logger.info(`Recived ${req.method} request to ${req.url}`);
    logger.info(`Request body, ${req.body}`);
    next();
})


app.use('/api/search',searchRoutes);

app.use(errorHandler)

async function startServer() {
    try {
        await connectRabbitMQ();
        //consume the events / subscribe to the events

        await consumeEvent('post.created', handlePostCreated)
        await consumeEvent('post.deleted', handlePostDeleted)
        app.listen(PORT, ()=>{
            logger.info(`Search service is running on port ${PORT}`)
        })
    } catch (error) {
        logger.error('Failed to start search service',error)
        process.exit(1)
    }
}
startServer();