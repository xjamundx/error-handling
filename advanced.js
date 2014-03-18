var express = require('express');
var app = express();

// turn on some loging
app.use(express.logger('dev'));

/*****************************/
/** Dealing with User Input **/
/*****************************/

// invalid input
app.post('/user', function() {
	var user = req.body;
	var isValid = validateUser(user);
	if (isValid) doSomethingWith(user);
});

function validateUser(data) {
	return data && data.name && data.age && Array.isArray(user.family);
}

// missing property
app.get('/2', function() {
	var user = {};
	user.friends.forEach(function(friend) {
		friend.call();
	});
});

// throw a string
app.get('/3', function() {
	throw 'Help';
});

// throw an error
app.get('/4', function() {
	throw new Error('Help');
});

/****************/
/** Async Land **/
/****************/

// async throw
app.get('/5', function() {
	setTimeout(function() {
		throw new Error('Help');
	}, 0);
});

//process.on('uncaughtException', function(e) {
//	console.log(e.stack);
//});

/***************/
/** Purgatory **/
/***************/

app.get('/7', function(req, res) {
	res.send(undefined, 'goodbye forever');
});

//app.use(function(err, req, res, next) {
//	res.send(500);
//});

app.listen(3333);