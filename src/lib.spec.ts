import tap from 'tap';
import {isNotNullOrUndefined, isNullOrUndefined} from './lib';


for (let {input, output} of [{
  input: null,
  output: true
}, {
  input: undefined,
  output: true
}, {
  input: 0,
  output: false
}, {
  input: false,
  output: false
}, {
  input: true,
  output: false
}, {
  input: '',
  output: false
}, {
  input: 'some',
  output: false
}, {
  input: {},
  output: false
}]) {
  await tap.test(`isNullOrUndefined should return ${output} for input ${input}`, async (t) => {
    t.equal(isNullOrUndefined(input), output);
  });
}

for (let {input, output} of [{
  input: null,
  output: false
}, {
  input: undefined,
  output: false
}, {
  input: 0,
  output: true
}, {
  input: false,
  output: true
}, {
  input: true,
  output: true
}, {
  input: '',
  output: true
}, {
  input: 'some',
  output: true
}, {
  input: {},
  output: true
}]) {
  await tap.test(`isNotNullOrUndefined should return ${output} for input ${input}`, async (t) => {
    t.equal(isNotNullOrUndefined(input), output);
  });
}
