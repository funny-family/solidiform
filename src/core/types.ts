/**
 * @see https://gist.github.com/foretoo/7c9e8f3d7312f1702662e6f82d57d427
 */
export interface TypedMap<M extends Record<string | number | symbol, any>>
  extends Map<keyof M, any> {
  get: <K extends keyof M>(key: K) => M[K];
  set: <K extends keyof M>(key: K, value: M[K]) => this;
  has: <K extends keyof M>(key: K) => boolean;
  delete: <K extends keyof M>(key: K) => boolean;
  forEach: (
    callbackFn: (value: M[keyof M], key: keyof M, map: TypedMap<M>) => void,
    thisArg?: any
  ) => void;
  entries: () => IterableIterator<[keyof M, M[keyof M]]>;
  keys: () => IterableIterator<keyof M>;
  values: () => IterableIterator<M[keyof M]>;
  [Symbol.iterator]: () => IterableIterator<[keyof M, M[keyof M]]>;
}
