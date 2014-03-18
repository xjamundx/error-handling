error-handling
==============

## Ways to think about errors

- this whole server is borked
- this user session is broken
- whatever action i just tried to complete did not work
- an error will happen if we continue, so let’s not
- who cares

## Log level of various errors

- call me right now
- e-mail me after it’s happened a few times
- log it, so i can dig in later if i hear something
- tell the user about the problem, not me
- who cares

## Types of User Facing Errors

- Works (silently handle the error)
- Stop me from causing an error
- Apologize, because a task couldn’t complete and help me understand why
- Apologize, because a task couldn’t complete
- Apologize
- Broken

## Why I started to Care

```
var express = require("express");
var app = express();

app.get("/", function(req, res) {
  res.send(undefined, "hello world");
});

app.listen(3000);
```

## Dealing with errors in asynchronous functions…

- The Callback Pattern
- Custom Error Objects

### The Callback Pattern

```
fs.readFile("file.txt", function(err, data) {
   if (err) {
     // do something nice
   }
});
```

### Custom Error Objects

```
function MountainError(message) {
   Error.captureStackTrace(this);
   this.message = message;
   this.name = "MountainError";
}
MountainError.prototype = Object.create(Error.prototype);

// var x = new MountainError("Too cold exception.");
// x instanceof MountainError; // true
// x instanceof Error; // true
// typeof x.stack; // String
// x.name; // "MountainError"
// x.message; "Too cold exception"
```

http://www.devthought.com/2011/12/22/a-string-is-not-an-error/
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error


## Dealing with errors in synchronous functions…

- incomplete data structures
- validation errors
- JSON parsing

### Incomplete Data Structures

```
function Person(options) {
	this.name = options.name;
}
var j = new Person({name: “Jamund”});
```

At some point we start to expect that the `name` property exists on persons, so we build off it

```
function sendPersonToTimeOut(person) {
	console.log(person.name  + ‘ gets sent to timeout’);
}
```

Let's make a Todd:

```
var todd = new Person({
	name: ‘Todd’,
	family: {
		wife: ‘Shelly’,
		kids: [’Billy’, ‘Bob’]
	}
});
```

And so we then create a new function.

```
function sendKidsMoney(person) {
	person.family.kids.forEach(sendMoneyToKid);
};
```

This works when `family` exists and `kids` is an `Array`, but it doesn’t work in the rest of the cases.

Moral of story. Basically, _just pretend you have types_ and prefill things as much as possible.

```
function Person(options) {
	this.name = options.name;
	this.family = options.family;
	this.family.kids = this.family.kids || [];
}
```

http://underscorejs.org/#defaults can make this easier.

* This will give v8 a better chance at optimizing your code http://www.html5rocks.com/en/tutorials/speed/v8/

### Validation

Basically an easy way to do this is to have a `validate()` function that returns `true` or `false`. These are usually errors that we can do something about given enough information.

```
var user = new Person({name: "Jamund"});
if (validate(user)) {
   saveUser(user);
} else {
   // but what information is missing?
   tryToCollectionMoreInformation();
}
```

We can be more robust if we provide a way to see the errors.

```
var errors = getValidationErrors(user);
if (!errors.length) {
   saveUser(user);
} else {
   tryToCollectMoreInformation(errors);
}
```

You just need an array of issues:

```
function getValidationErrors() {
   return [{
      field: "name",
      errorType: "required"
   }];
}
```

Some people already figured out a way to handle all of this stuff:
https://www.npmjs.org/package/jsonschema

### JSON Parsing

Similar to the issue with incomplete data structures, errors while parsing JSON can be pretty detrimental to your application. Consider the following examples.

```
// @returns {User}
function parseUser(json) {
    var user = JSON.parse(badJSON);
    return user;
}
var badJSON = "{'name':'Jamund'}";
var user = parseUser(badJSON);
```

Here's a safer example:

```
// @returns {User}|{null}
function parseUser(json) {
    try {
        return JSON.parse(badJSON);
    } catch(e) {
        return null;
    }
}
var badJSON = "{'name':'Jamund'}";
var user = parseUser(badJSON);
if (user === null) {
   // precise checking for null is a good way to tell that this is broken
}

```

## Uncaught Exception Handlers

- `try`/`catch`
- Express Default Error Handler
- Uncaught Exception Handling

## Dealing with People

- Have a standard API for error handling
  - localized error message
  - field-specific error messages (for form validation)
- Deal with catastrphic failure in a sane way (timeouts, etc.)
- Send any client-side errors back to the server

## Anti-Patterns or just reminders

1. Don't `throw` unless you want your server to blow up
2. `Error` objects everywhere, use custom `Error` objects if needed
3. Provide a consistent error API for your AJAX calls
4. Use static analysis to enforce the pattern https://github.com/eslint/eslint/pull/633