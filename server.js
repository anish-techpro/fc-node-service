require('rootpath')();
require('dotenv').config();
require("config/constant");
var express = require('express');
var https = require('https');
var fs = require('fs');
var app = express();

//////////////////  security packages  //////////////////////////

var helmet = require('helmet');

app.use(helmet());

app.get('/', (req, res) => res.send('Hello World'));

/**
 * Get port from environment and store in Express.
 */
//app.set('view engine', 'html');

var port = normalizePort(process.env.PORT || '4000');
app.set('port', port);

/**
 * Create HTTP server.
 */
const tls = {
    cert: fs.readFileSync(process.env.SSL_CRT_PATH),
    key: fs.readFileSync(process.env.SSL_KEY_PATH),
};
var server = https.createServer(tls, app);

require('socket')(server);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

// error handlers
process.on("uncaughtException", function (error) {
    console.log(error);
    console.log("The exception was caught!")
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});



// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    // res.render('error');
    next(err)
});

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}


/**
 * Event listener for HTTP server "listening" event.
 */

async function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log('Listening on ' + bind);
}