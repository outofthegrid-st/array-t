import LogarithmicArray from './log';
import { findLastIndex, tail } from './util';

export * from './util';
export { default as LogarithmicArray } from './log';


export default Object.freeze({
  tail,
  findLastIndex,
  LogarithmicArray,
} as const);
