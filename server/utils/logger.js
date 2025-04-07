const winston = require('winston');
const { createLogger, transports, format } = winston;
const { combine, timestamp, errors, printf } = format;

const formattedInfoLog = printf(({ timestamp, level, message, reqMethod, reqUrl })=>{

  return `${timestamp} [${level}] ${message} | Method: ${reqMethod} | URL: ${reqUrl}`;
});

const formattedErrorLog = printf(({ timestamp, level, message, reqMethod, reqUrl, stack })=>{

  if(stack)
  {
    return (
        `${timestamp} [${level}] ${message} | Method: ${reqMethod} | URL: ${reqUrl} | Stack: ${stack}`
      );
  }
  
  return (
    `${timestamp} [${level}] ${message} | Method: ${reqMethod} | URL: ${reqUrl}`
  );
});

const infoLogger = createLogger({
  transports: [
    new transports.File({
      filename: "logs/server.log",
      level: "info",
      format: combine(
        timestamp(),
        formattedInfoLog,
      ),
    }),
    new transports.File({
      filename: "logs/error.log",
      level: "error",
      format: combine(
        timestamp(),
        errors({ stack: true }),
        formattedErrorLog,
      ),
    }),
  ],
});

module.exports = infoLogger;
