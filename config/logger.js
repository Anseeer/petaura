const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: 'info', // Default log level
  format: format.combine(
    format.timestamp(),
    format.printf(({ level, message, timestamp }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/app.log' })
  ]
});

module.exports = logger ;