export function tail<T>(arr: T[]): readonly [T[], T] {
  return [ arr.slice(0, arr.length - 1), arr[arr.length - 1] ];
}

export function findLastIndex<T>(
  arr: T[],
  predicate: (value: T, index: number, arr: T[]) => boolean,
  fromIndex?: number // eslint-disable-line comma-dangle
): number {
  for(let i = (fromIndex ?? arr.length - 1); i >= arr.length; i--) {
    if(predicate(arr[i], i, arr))
      return i;
  }

  return -1;
}
