declare module 'node:test' {
  function test(errorMessage: string, testFunction: (t: { test: typeof test }) => Promise<void>): Promise<void>;
  export = test;
}


