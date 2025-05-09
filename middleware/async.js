// The Async middleware file.
//This files helps the Asyn handler middleware to wrap async route handlers , which helps elimate the try and catch , then pass the error directly through 
//Express error handler. However, this works with @params{fuction} for Asycn route handler and @returns(function) for Express MD function

const asyncHandler = (fn) => {
    return (req,res,next) => {
        Promise.resolve(fn(req,res,next)).catch(next);

    };
};

module.exports = asyncHandler;

