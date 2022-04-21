import {isNotNullOrUndefined, isNullOrUndefined} from './lib';

export function formatErrorToString(error: any): string {
  if (isNullOrUndefined(error)) {
    return 'error=' + error;
  }
  let errorMessage = 'error=';
  if (isNotNullOrUndefined(error.message)) {
    errorMessage += error.message;
  } else if (error instanceof Map) {
    errorMessage += JSON.stringify(Object.fromEntries(error));
  } else if (error instanceof Set) {
    errorMessage += JSON.stringify(Array.from(error));
  } else if (typeof error === 'object') {
    errorMessage += JSON.stringify(error);
  } else {
    errorMessage += error;
  }

  errorMessage += ', type=' + error.constructor.name;
  if (isNotNullOrUndefined(error.stack)) {
    errorMessage += ', stack=' + error.stack;
  }
  return errorMessage;
}
