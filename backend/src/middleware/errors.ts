// Base application error class
export class AppError extends Error {
  public statusCode: number
  public errorCode: string
  public isOperational: boolean

  constructor(message: string, statusCode: number, errorCode: string, isOperational = true) {
    super(message)
    this.statusCode = statusCode
    this.errorCode = errorCode
    this.isOperational = isOperational

    Object.setPrototypeOf(this, AppError.prototype)
  }
}

// Resource not found error (404)
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND')
  }
}

// Validation error (400)
export class ValidationError extends AppError {
  public errors: string[]

  constructor(message: string, errors: string[] = []) {
    super(message, 400, 'VALIDATION_ERROR')
    this.errors = errors
  }
}

// Business logic error (400)
export class BusinessError extends AppError {
  constructor(message: string) {
    super(message, 400, 'BUSINESS_ERROR')
  }
}

// Authentication required error (401)
export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
  }
}

// Authorization error (403)
export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR')
  }
}

// Resource conflict error (409)
export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT_ERROR')
  }
}

// Rate limit error (429)
export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_ERROR')
  }
}

// Internal server error (500)
export class InternalError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, 500, 'INTERNAL_ERROR', false)
  }
}

// Database error (500)
export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, 500, 'DATABASE_ERROR', false)
  }
}
