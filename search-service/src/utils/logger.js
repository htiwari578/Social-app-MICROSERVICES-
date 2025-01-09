const winston = require ('winston');

const logger = winston.createLogger({
    level : process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format : winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({stack : true}),
        winston.format.splat(),
        winston.format.json()

    ),
    defaultMeta : {service : 'search-service'},
    transports : [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
        }),
        new winston.transports.File({filename : 'error.log', level : 'error'}),
        new winston.transports.File({filename : 'combine.log', level : 'error'})
    ],
})

module.exports = logger;
