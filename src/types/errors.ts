export class ValidationError extends Error {
  constructor(message: string) {
    super(`Validation error: ${message}`);
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(`Database error: ${message}`);
  }
}
