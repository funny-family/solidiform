/**
 * @description
 * Array that iterates backwards.
 */
export class ReversIterableArray<T> extends Array<T> {
  *[Symbol.iterator]() {
    for (var i = this.length - 1; i >= 0; i--) {
      yield this[i];
    }
  }

  *[Symbol.asyncIterator]() {
    for (var i = this.length - 1; i >= 0; i--) {
      yield this[i];
    }
  }
}
export class ReversIterableSet<T> extends Set<T> {
  constructor(array: T[]) {
    super(array);
  }

  [Symbol.iterator]() {
    const iterator = this[Symbol.iterator];

    return {};
  }
}
