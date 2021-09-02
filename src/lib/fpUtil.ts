import { Errors } from "io-ts";
import { ValidationError } from "../types/errors";

export function toValidationError(errors: Errors): ValidationError {
  return new ValidationError(errors.map(err => err.message).join(','));
}
