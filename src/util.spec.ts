import { tail, findLastIndex } from './util';


describe('tail', () => {
  test('returns all but last and the last element', () => {
    const input = [1, 2, 3];
    const [rest, last] = tail(input);
    expect(rest).toEqual([1, 2]);
    expect(last).toBe(3);
  });

  test('works with two elements', () => {
    const input = ['a', 'b'];
    const [rest, last] = tail(input);
    expect(rest).toEqual(['a']);
    expect(last).toBe('b');
  });

  test('works with one element', () => {
    const input = [42];
    const [rest, last] = tail(input);
    expect(rest).toEqual([]);
    expect(last).toBe(42);
  });

  test('works with empty array (last becomes undefined)', () => {
    const input: number[] = [];
    const [rest, last] = tail(input);
    expect(rest).toEqual([]);
    expect(last).toBeUndefined();
  });
});

describe('findLastIndex', () => {
  const arr = [1, 2, 3, 4, 5, 2];

  test('finds the last matching index', () => {
    const index = findLastIndex(arr, x => x === 2);
    expect(index).toBe(5);
  });

  test('respects fromIndex parameter', () => {
    const index = findLastIndex(arr, x => x === 2, 4);
    expect(index).toBe(1);
  });

  test('returns -1 when not found', () => {
    const index = findLastIndex(arr, x => x === 99);
    expect(index).toBe(-1);
  });

  test('works with empty array', () => {
    const index = findLastIndex([], _ => true);
    expect(index).toBe(-1);
  });

  test('works with fromIndex = 0', () => {
    const index = findLastIndex(arr, x => x === 1, 0);
    expect(index).toBe(0);
  });
});
