const config = require('./config');
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('./logger');
const auth = require('./security/auth');
const RequestService = require('./services/request.service');
const AnalysisService = require('./services/analysis.service');

process.on('uncaughtException',function (error) {
    logger.error(error);
});

/** RUN */
const app = express();
const http = require('http').Server(app);

/**
 * socket run
 */
const io = require('socket.io')(http);
io.on('connection', function(client) {

	client.on('control', function(request) {
		let url = request.data.url;
		RequestService.loadService(url,function (response) {

			let analysis = new AnalysisService(response.body,url);

			//load title
			analysis.loadTitle(function (data) {
				client.emit('title',{data  : data});
			},function (error) {
				client.emit('title',{error  : 'Not found!'});
			});

			//load version
			analysis.loadVersion(function (data) {
				client.emit('version',{data  : data});
			},function (error) {
				client.emit('version',{error  : 'Not found!'});
			});

			//load heads
			analysis.loadHeads(function (data) {
				client.emit('heads',{data  : data});
			},function (error) {
				client.emit('heads',{error  : 'Not found!'});
			});

			//load loginForm
			analysis.loadLoginInfo(function (data) {
				client.emit('loginInfo',{data  : data});
			},function (error) {
				client.emit('loginInfo',{data  : false});
			});

			//load links
			analysis.loadLinks(function (start) {
				client.emit('linkStart',{data  : start});
			},function (data) {
				client.emit('link',{data  : data});
			},function (error) {
				client.emit('link',{data  : error});
			});


		},function (error) {

		})
	});

	client.on('disconnect', function() {

	});
});

/**
 * CORS Handle
 * For client actions i need to define CORS.
 */
app.all('*',function(req,res,next)
{
    if (!req.get('Origin')) return next();
    res.set('Access-Control-Allow-Origin','*');
    res.set('Access-Control-Allow-Methods','GET,POST');
    res.set('Access-Control-Allow-Headers','X-Requested-With,Content-Type');
    if ('OPTIONS'.toLocaleLowerCase() === req.method.toLocaleLowerCase()) return res.sendStatus(200);
    next();
});

/**
 * Express.js need to use bodyparser for convert application/json data form.
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(express.static(__dirname + '/dist'));

/**
 * AUTH CONTROL
 */
app.use(auth({}));

/**
 * ROUTES
 */
app.get('/', function(req, res){
    res.sendStatus(200);
});

/**
 * ERROR HANDLING
 */

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let result = {
        error : new Error(req.originalUrl + " not found." ),
        status : 500
    };
    next(result);
});

/**
 * RESULT FOR SERVICES
 */
app.use(function(result, req, res, next) {
    if(result.error){
        res.status(500).send({
            status:500,
            message: result.error.message || 'server error',
            result : result.error,
            type:'internal'
        });
    }else{
        res.status(200);
        res.send(result);
    }

});

/**
 * START
 */

http.listen(config.port,function (error) {
    if(error) logger.error(error);
    logger.info("Server running on http://localhost:" + config.port);
});
