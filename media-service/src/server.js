require("dotenv").config();

const express = require('express')
const mongoose = require("mongoose")
const cors = require("cors")
const helmet = require("helmet")
const mediaRoutes = require('./routes/media.routes')
const errorHandler = require('./middleware/errorHandler');
const logger = require("./utils/logger");
const { connectRabbitMQ, consumeEvent } = require("./utils/rabbitmq");
const { handlePostDeleted } = require("./eventHandlers.js/media-event-handler");


const app = express()
const PORT = process.env.PORT || 3003;

//connect to mongodb
mongoose
    .connect(process.env.MONGO_URI)
    .then(()=> logger.info("Connected to mongodb"))
    .catch((e)=>logger.error("Mongodb connection error",e));

//middlewares
app.use(cors())
app.use(helmet())
app.use(express.json())
app.use((req,res,next)=>{
    logger.info(`Request ${req.method} request to ${req.url}`);
    logger.info(`Request body, ${req.body}`)
    next();
});


app.use('/api/media', mediaRoutes)
app.use(errorHandler)

async function startServer() {
    try {
        await connectRabbitMQ();

        //consume all events
        await consumeEvent('post.deleted', handlePostDeleted)
        app.listen(PORT, ()=> {
            logger.info(`Media service running on port ${PORT}`)
        })
        
    } catch (error) {
        logger.error('Failed to connect server', error);
        process.exit(1);
    }
}
startServer()


//unhandled promise rejection

process.on("unhandledRejection", (reason, promise)=> {
    logger.error("Unhandled Rejection at" , promise, "reason", reason);
})