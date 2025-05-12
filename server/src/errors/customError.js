export class CustomError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class BadRequestError extends CustomError {
    constructor(message = 'Bad Request') {
        super(message, 400);
    }
}

export class UnauthorizedError extends CustomError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
    }
}

export class NotFoundError extends CustomError {
    constructor(message = 'Not Found') {
        super(message, 404);
    }
}

export class ServerError extends CustomError {
    constructor(message = 'Server Error') {
        super(message, 409);
    }
}

export class InternalServerError extends CustomError {
    constructor(message = 'Internal Server Error') {
        super(message, 409);
    }
}


