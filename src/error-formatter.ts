import {isNotNullOrUndefined, isNullOrUndefined} from './lib.js';

export function formatErrorToString(error: any): string {
  if (isNullOrUndefined(error)) {
    return 'error=' + error;
  }
  let errorMessage = 'error=';
  if (isNotNullOrUndefined(error.message)) {
    errorMessage += error.message;
  } else if (error instanceof Map) {
    errorMessage += stringifyNoThrow(Object.fromEntries(error));
  } else if (error instanceof Set) {
    errorMessage += stringifyNoThrow(Array.from(error));
  } else if (typeof error === 'object') {
    errorMessage += stringifyNoThrow(error);
  } else {
    errorMessage += error;
  }

  errorMessage += ', type=' + error.constructor.name;
  if (isNotNullOrUndefined(error.stack)) {
    errorMessage += ', stack=' + error.stack;
  }
  return errorMessage;
}

function stringifyNoThrow(object: any) {
  try {
    return JSON.stringify(object);
  } catch (e) {
    return 'Converting circular structure: ' + object;
  }
}
