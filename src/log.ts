import type { Nullable } from './_types';


class Node<T> {
  public size: number;
  public left: Nullable<Node<T>> = null;
  public right: Nullable<Node<T>> = null;
  public height: number = 1;

  public constructor( public buffer: T[] ) {
    this.size = buffer.length;
  }

  public clone(): Node<T> {
    const target = new Node(this.buffer.slice(0));

    target.size = this.size;
    target.left = this.left?.clone() ?? null;
    target.right = this.right?.clone() ?? null;
    target.height = this.height;

    return target;
  }
}


class LogarithmicArray<T> implements Iterable<T> {
  private _root: Nullable<Node<T>> = null;
  
  public constructor(
    private readonly _chunkSize: number = 64 // eslint-disable-line comma-dangle
  ) {
    if(_chunkSize < 4) {
      throw new Error(`'typeof LinearArray' is expecting in constructor $0 as integer >= 4, but received "${_chunkSize}"`);
    }
  }

  public size(): number {
    return getSize(this._root);
  }

  public get(index: number): T {
    if(index < 0 || index >= getSize(this._root)) {
      throw new RangeError('Node index is out of bounds');
    }

    if(!this._root) {
      throw new RangeError('Cannot retrive items from an empty list');
    }

    const { node, offset } = find(this._root, index);
    return node.buffer[offset];
  }

  public set(index: number, value: T): void {
    if(index < 0 || index >= getSize(this._root)) {
      throw new RangeError('Node index is out of bounds');
    }

    if(!this._root) {
      throw new RangeError('Cannot retrive items from an empty list');
    }

    const { node, offset } = find(this._root, index);
    node.buffer[offset] = value;
  }

  public insert(index: number, value: T): void {
    if(index < 0 || index > getSize(this._root)) {
      throw new RangeError('Node index is out of bounds');
    }

    this._root = insertRec(this._root, index, value, this._chunkSize);
  }

  public remove(index: number): void {
    if(index < 0 || index >= getSize(this._root)) {
      throw new RangeError('Node index is out of bounds');
    }

    this._root = removeRec(this._root, index);
  }

  public delete(index: number): boolean {
    if(index < 0 || index >= getSize(this._root))
      return false;

    try {
      this._root = removeRec(this._root, index);
      return true;
    } catch {
      return false;
    }
  }

  public push(...values: T[]): number {
    let i = 0;

    for(; i < values.length; i++) {
      this._root = insertRec(this._root, getSize(this._root), values[i], this._chunkSize);
    }

    return i;
  }

  public pop(): T | undefined {
    const len = getSize(this._root);

    if(len < 1)
      return void 0;

    if(!this._root) {
      throw new RangeError('Cannot retrive items from an empty list');
    }

    const { node, offset } = find(this._root, len - 1);
    this._root = removeRec(this._root, len - 1);
    
    return node.buffer[offset];
  }

  public unshift(...values: T[]): number {
    let i = 0;

    for(; i < values.length; i++) {
      this._root = insertRec(this._root, 0, values[i], this._chunkSize);
    }
    
    return i;
  }

  public shift(): T | undefined {
    if(getSize(this._root) === 0)
      return void 0;

    if(!this._root) {
      throw new RangeError('Cannot retrive items from an empty list');
    }

    const { node, offset } = find(this._root, 0);
    this._root = removeRec(this._root, 0);

    return node.buffer[offset];
  }

  public at(index: number): Nullable<{ readonly node: Node<T>; readonly offset: number; }> {
    if(!this._root)
      return null;

    return Object.freeze(find(this._root, index));
  }

  public map<U>(callback: (value: T, index: number, arr: LogarithmicArray<T>) => U, thisArgs?: any): LogarithmicArray<U> {
    const result = new LogarithmicArray<U>(this._chunkSize);
    let index = 0;

    for(const item of this.#iterator()) {
      const ir = !!thisArgs && typeof thisArgs === 'object' ?
        callback.call(thisArgs, item, index++, this) :
        callback(item, index++, this);

      result.push(ir);
    }

    return result;
  }

  public filter<S extends T>(predicate: (value: T, index: number, arr: LogarithmicArray<T>) => value is S, thisArgs?: any): LogarithmicArray<S>;
  public filter(predicate: (value: T, index: number, arr: LogarithmicArray<T>) => boolean, thisArgs?: any): LogarithmicArray<T>;
  public filter<S extends T>(predicate: (value: S | T, index: number, arr: LogarithmicArray<T>) => boolean, thisArgs?: any): LogarithmicArray<S | T> {
    const result = new LogarithmicArray<S | T>();
    let index = 0;

    for(const item of this.#iterator()) {
      const ir = !!thisArgs && typeof thisArgs === 'object' ?
        predicate.call(thisArgs, item, index++, this) :
        predicate(item, index++, this);

      if(ir) {
        result.push(item);
      }
    }

    return result;
  }

  public reduce(callback: (prev: T, curr: T, index: number, arr: LogarithmicArray<T>) => T, init: T): T;
  public reduce<U>(callback: (prev: U, curr: T, index: number, arr: LogarithmicArray<T>) => U, init: U): U;
  public reduce<U>(callback: (prev: T | U, curr: T, index: number, arr: LogarithmicArray<T>) => T | U, init: T | U): T | U {
    let acc = init;
    let index = 0;

    for(const item of this.#iterator()) {
      acc = callback(acc, item, index++, this);
    }

    return acc;
  }

  public forEach(callback: (value: T, index: number, arr: LogarithmicArray<T>) => unknown, thisArgs?: any): void {
    let index = 0;

    for(const item of this.#iterator()) {
      if(!!thisArgs && typeof thisArgs === 'object') {
        callback.call(thisArgs, item, index++, this);
      } else {
        callback(item, index++, this);
      }
    }
  }

  public clear(): void {
    this._root = null;
  }

  public toArray(): T[] {
    return [ ...this.#iterator() ];
  }

  public [Symbol.iterator](): IterableIterator<T> {
    return this.#iterator();
  }

  *#iterator(): IterableIterator<T> {
    function* inorder<T>(node: Nullable<Node<T>>): IterableIterator<T> {
      if(!node)
        return;

      yield* inorder(node.left);
      yield* node.buffer;
      yield* inorder(node.right);
    }

    yield* inorder(this._root);
  }
}


function getSize<T>(node: Nullable<Node<T>>): number {
  return node ? node?.size : 0;
}

function getHeight<T>(node: Nullable<Node<T>>): number {
  return node ? node.height : 0;
}

function update<T>(node: Node<T>): void {
  node.size = getSize(node.left) + node.buffer.length + getSize(node.right);
  node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
}

function balanceFactor<T>(node: Node<T>): number {
  return getHeight(node.left) - getHeight(node.right);
}

function rotateRight<T>(y: Node<T>): Node<T> {
  const x = y.left!;
  y.left = x.right;
  x.right = y;

  update(y);
  update(x);
  
  return x;
}

function rotateLeft<T>(x: Node<T>): Node<T> {
  const y = x.right!;
  x.right = y.left;
  y.left = x;

  update(x);
  update(y);

  return y;
}

function balance<T>(node: Node<T>): Node<T> {
  update(node);
  const factor = balanceFactor(node);

  if(factor > 1) {
    if(balanceFactor(node.left!) < 0) {
      node.left = rotateLeft(node.left!);
    }

    return rotateRight(node);
  } else if(factor < -1) {
    if(balanceFactor(node.right!) > 0) {
      node.right = rotateRight(node.right!);
    }

    return rotateLeft(node);
  }

  return node;
}

function find<T>(node: Node<T>, index: number): { node: Node<T>; offset: number } {
  const leftSize = getSize(node.left);

  if(index < leftSize)
    return find(node.left!, index);
    
  index -= leftSize;

  if(index < node.buffer.length)
    return { node, offset: index };
    
  return find(node.right!, index - node.buffer.length);
}

function splitBuffer<T>(buffer: T[], offset: number): [T[], T[]] {
  return [buffer.slice(0, offset), buffer.slice(offset)];
}

function insertInNode<T>(node: Node<T>, offset: number, value: T, chunkSize: number): Node<T> {
  node.buffer.splice(offset, 0, value);
  node.size++;

  if(node.buffer.length > chunkSize) {
    const mid = (node.buffer.length / 2) | 0;
    const [leftBuf, rightBuf] = splitBuffer(node.buffer, mid);

    node.buffer = leftBuf;

    const rightNode = new Node(rightBuf);
    rightNode.left = node.right;
    node.right = rightNode;

    update(node);
    update(rightNode);

    return balance(node);
  }

  update(node);
  return node;
}

function insertRec<T>(node: Nullable<Node<T>>, index: number, value: T, chunkSize: number): Node<T> {
  if(!node)
    return new Node([value]);
    
  const leftSize = getSize(node.left);

  if(index <= leftSize) {
    node.left = insertRec(node.left, index, value, chunkSize);
  } else if(index <= leftSize + node.buffer.length) {
    const offset = index - leftSize;
    return insertInNode(node, offset, value, chunkSize);
  } else {
    node.right = insertRec(node.right, index - leftSize - node.buffer.length, value, chunkSize);
  }

  return balance(node);
}

function removeFromNode<T>(node: Node<T>, offset: number): Node<T> | null {
  node.buffer.splice(offset, 1);
  node.size--;

  if(node.buffer.length === 0)
    return mergeNodes(node.left, node.right);
    
  update(node);
  return node;
}

function mergeNodes<T>(left: Nullable<Node<T>>, right: Nullable<Node<T>>): Nullable<Node<T>> {
  if(!left)
    return right;

  if(!right)
    return left;
    
  let min = right;

  while(min.left) {
    min = min.left;
  }
    
  right = removeRec(right, 0);
    
  min.left = left;
  min.right = right;

  update(min);
  return balance(min);
}

function removeRec<T>(node: Nullable<Node<T>>, index: number): Nullable<Node<T>> {
  if(!node) {
    throw new RangeError('Node index is out of bounds');
  }

  const leftSize = getSize(node.left);

  if(index < leftSize) {
    node.left = removeRec(node.left, index);
  } else if (index < leftSize + node.buffer.length) {
    const offset = index - leftSize;
    return removeFromNode(node, offset);
  } else {
    node.right = removeRec(node.right, index - leftSize - node.buffer.length);
  }

  return balance(node);
}



export default LogarithmicArray;
