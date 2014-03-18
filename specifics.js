var express = require('express');
var app = express();

// turn on some loging
app.use(express.logger('dev'));

app.use(function(req, res, next) {
	updateThatSession(req.session, function(err) {
		if (err) next(err);
		next();
	});
});

function updateThatSession(session, cb) {
	cb(new Error("bad things"));
}

/***********/
/** Model **/
/***********/

var db = {
	get: function(id, cb) {
		process.nextTick(function() {
			cb(new Error("There is no get."));
		});
	},
	all: function(cb) {
		process.nextTick(function() {
			cb(new Error("There is no all."));
		});
	}
};

/************************/
/** Middleware Example **/
/************************/

app.use("/users", function(req, res, next) {
	db.all(function(err, users) {
		if (err) {
			return next(err);
		}
		res.locals.users = users;
	})
});

/****************/
/** Controller **/
/****************/

app.get('/money/:currency', function(req, res) {
	db.get(req.params.currency, function(err, user) {
		if (err) {
			res.send(err);
			return;
		}
		res.json(user);
	});
});

//// custom toJSON for errors
//Error.prototype.toJSON = function() {
//	return {
//		message: this.message,
//		stack: this.stack
//	};
//};


/*****************/
/** Error Pages **/
/*****************/

// custom 404 page
//app.use(function(req, res, next) {
//	console.log(req.path);
//	res.send(404, "Page not found");
//});
//
//// custom 500 page
//app.use(function(err, req, res, next) {
//	console.log(err);
//	res.send(500, "Internal Server Error");
//});

/*******************/
/** Custom Errors **/
/*******************/

			app.get('/mountains/:id', function(req, res) {
				db.get(req.params.id, function(err, user) {
					if (err) {
						return handleError(err, req, res);
					}
					res.json(user);
				});
			});

// custom mountain error
function MountainError(message) {
	Error.captureStackTrace(this);
	this.message = message;
	this.name = "MountainError";
}
MountainError.prototype = Object.create(Error.prototype);

var error = new MountainError("It's way too cold!");

/*****************/
/** L10n Errors **/
/*****************/

app.get('/languages/:id', function(req, res) {
	db.get(req.params.id, function(err, user) {
		if (err) {
			var error = new BableError(err.message);
			error.getMessage(function(error, message) {
				message = message || 'Internal Server Error';
				return res.send(500, message);
			});
		}
		res.json(user);
	});
});

// custom babel error
function BabelError(message) {
	Error.captureStackTrace(this);
	this.message = message;
	this.name = "BabelError";
}
BabelError.prototype = Object.create(Error.prototype);
BabelError.prototype.getMessage = function(cb) {
	translateYourError(this.message, cb);
};

function translateYourError(message, cb) {
	cb(null, "And it came to pass that, " + message.toLowerCase());
}

/****************/
/** Full Stack **/
/****************/

app.get('/pancakes/:id', function(req, res) {
	db.get(req.params.id, function(err, user) {
		if (err) {
			return handleError(new BabelError(err.message), req, res);
		}
		res.json(user);
	});
});


function handleErrorBasic(err, req, res) {

	logError(err);

	var message = err ? err.message : "Internal Server Error";

	res.json({
		error: {message: message}
	});

	function logError(error) {
		console.log({
			message: error.message,
			stack: error.stack
		});
	}
}



		app.use(function(err, req, res, next) {
			console.log(err);
			res.send(500);z
		});


function handleError(err, req, res) {

	logError(err);

	if (err instanceof BabelError) {
		return err.getMessage(dealWithError);
	}

	if (err instanceof Error) {
		return dealWithError(null, err.message);
	}

	return handleError(new BabelError("Internal Server Error"), req, res);

	function dealWithError(error, message) {
		if (error) {
			logError(error);
			message = "Internal Server Error";
		}
		res.json({
			error: {message: message}
		});
	}

	function logError(error) {
		console.log({
			message: error.message,
			stack: error.stack
		});
	}
}

/**
 * Client side code
 */
//var originalSync = Backbone.sync;
//Backbone.sync = function (method, model, options) {
//	var oldSuccess = options.success;
//	options.success = function(response) {
//		if (response.error && response.error.message) {
//			model.trigger('error', model, response, response.error.message);
//			return;
//		}
//		oldSuccess(response);
//	};
//
//	options.error = function(response) {
//		model.trigger('error', model, response, 'Please try again.');
//	};
//
//	originalSync(method, model, options);
//};

app.listen(4444);