import LogarithmicArray from './log';


describe('LogarithmicArray', () => {
  let array: LogarithmicArray<number>;

  beforeEach(() => {
    array = new LogarithmicArray<number>();
  });

  test('initial size is 0', () => {
    expect(array.size()).toBe(0);
  });

  test('push and get values', () => {
    array.push(1, 2, 3);
    expect(array.size()).toBe(3);
    expect(array.get(0)).toBe(1);
    expect(array.get(1)).toBe(2);
    expect(array.get(2)).toBe(3);
  });

  test('set modifies existing value', () => {
    array.push(1, 2, 3);
    array.set(1, 42);
    expect(array.get(1)).toBe(42);
  });

  test('insert value at specific index', () => {
    array.push(1, 3);
    array.insert(1, 2);
    expect(array.toArray()).toEqual([1, 2, 3]);
  });

  test('remove and delete elements', () => {
    array.push(1, 2, 3);
    array.remove(1);
    expect(array.toArray()).toEqual([1, 3]);

    const deleted = array.delete(1);
    expect(deleted).toBe(true);
    expect(array.toArray()).toEqual([1]);
  });

  test('pop and shift elements', () => {
    array.push(1, 2, 3);

    expect(array.pop()).toBe(3);
    expect(array.shift()).toBe(1);
    expect(array.toArray()).toEqual([2]);
  });

  test('unshift adds to beginning', () => {
    array.push(3);
    array.unshift(1, 2);
    expect(array.toArray()).toEqual([1, 2, 3]);
  });

  test('map creates new array', () => {
    array.push(1, 2, 3);
    const mapped = array.map((x) => x * 2);
    expect(mapped.toArray()).toEqual([2, 4, 6]);
  });

  test('filter creates filtered array', () => {
    array.push(1, 2, 3, 4);
    const filtered = array.filter((x) => x % 2 === 0);
    expect(filtered.toArray()).toEqual([2, 4]);
  });

  test('reduce aggregates values', () => {
    array.push(1, 2, 3);
    const sum = array.reduce((acc, val) => acc + val, 0);
    expect(sum).toBe(6);
  });

  test('forEach iterates all values', () => {
    array.push(1, 2, 3);
    const result: number[] = [];
    array.forEach((x) => result.push(x));
    expect(result).toEqual([1, 2, 3]);
  });

  test('clear empties the array', () => {
    array.push(1, 2, 3);
    array.clear();
    expect(array.size()).toBe(0);
    expect(array.toArray()).toEqual([]);
  });

  test('iteration works via for...of', () => {
    array.push(1, 2, 3);
    const result = [];
    for (const val of array) {
      result.push(val);
    }
    expect(result).toEqual([1, 2, 3]);
  });

  test('at returns correct node info', () => {
    array.push(10, 20, 30);
    const at1 = array.at(1);
    expect(at1).not.toBeNull();
    expect(at1?.offset).toBe(1);
    expect(at1?.node).toBeDefined();
  });

  test('handles edge cases gracefully safe-return finder', () => {
    expect(array.findByIndex(0)).toBeUndefined();
    expect(array.delete(0)).toBe(false);
    expect(array.pop()).toBeUndefined();
    expect(array.shift()).toBeUndefined();
  });

  test('handles edge cases gracefully with strict get', () => {
    expect(() => array.get(0)).toThrow(RangeError);
    expect(array.delete(0)).toBe(false);
    expect(array.pop()).toBeUndefined();
    expect(array.shift()).toBeUndefined();
  });
});
