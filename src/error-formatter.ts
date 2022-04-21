import {isNotNullOrUndefined, isNullOrUndefined} from './lib';

export function formatErrorToString(error: any): string {
  let errorMessage = ' error=';
  if (isNullOrUndefined(error)) {
    return errorMessage + error;
  }
  if (isNotNullOrUndefined(error.message)) {
    errorMessage += typeof error;
    errorMessage += error.message;
  } else {
    errorMessage += error;
  }
  if (isNotNullOrUndefined(error.stack)) {
    errorMessage += ', stack=' + error.stack;
  }
  return errorMessage;
}
