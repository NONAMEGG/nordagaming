import { CustomError } from "../errors/customError.js";

export default function errorHandler(err, req, res, next) {
    console.error(err); 
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let errors = [];

    if (err.validationErrors) {
        statusCode = 422; 
        message = 'Validation failed';
        errors = err.validationErrors; 
    }
    else if (err instanceof CustomError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    else if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Database validation failed';
        errors = Object.values(err.errors).map(e => ({ msg: e.message, field: e.path }));
    }
    else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }

    res.status(statusCode).json({
        success: false,
        message: message,
        errors: errors.length > 0 ? errors : undefined, 
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
}


