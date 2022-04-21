import {isNotNullOrUndefined, isNullOrUndefined} from './lib';

export function formatErrorToString(error: any): string {
  if (isNullOrUndefined(error)) {
    return 'error=' + error;
  }
  let errorMessage = 'error=';
  if (isNotNullOrUndefined(error.message)) {
    errorMessage += error.message;
    errorMessage += ', type=' + error.constructor.name;
  } else {
    errorMessage += error;
  }
  if (isNotNullOrUndefined(error.stack)) {
    errorMessage += ', stack=' + error.stack;
  }
  return errorMessage;
}
