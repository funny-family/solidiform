import { batch } from 'solid-js';
import { TriggerCache } from './trigger-cache.util';

export var $KEYS = Symbol('track-keys');

/**
 * A reactive version of `Map` data structure. All the reads (like `get` or `has`) are signals, and all the writes (`delete` or `set`) will cause updates to appropriate signals.
 * @param initial initial entries of the reactive map
 * @param equals signal equals function, determining if a change should cause an update
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/map#ReactiveMap
 * @example
 * const userPoints = new ReactiveMap<User, number>();
 * createEffect(() => {
 *    userPoints.get(user1) // => T: number | undefined (reactive)
 *    userPoints.has(user1) // => T: boolean (reactive)
 *    userPoints.size // => T: number (reactive)
 * });
 * // apply changes
 * userPoints.set(user1, 100);
 * userPoints.delete(user2);
 * userPoints.set(user1, { foo: "bar" });
 */
export class ReactiveMap<K, V> extends Map<K, V> {
  keyTriggers = new TriggerCache<K | typeof $KEYS>();
  valueTriggers = new TriggerCache<K>();

  constructor(initial?: Iterable<readonly [K, V]> | null) {
    super();

    if (initial) {
      for (var entry of initial) {
        super.set(entry[0], entry[1]);
      }
    }
  }

  // reads
  has(key: K, trigger?: boolean): boolean {
    if (trigger == null) {
      trigger = true;
    }

    if (trigger) {
      this.keyTriggers.track(key);
    }

    return super.has(key);
  }

  get(key: K, trigger?: boolean): V | undefined {
    if (trigger == null) {
      trigger = true;
    }

    if (trigger) {
      this.valueTriggers.track(key);
    }

    return super.get(key);
  }

  get size(): number {
    this.keyTriggers.track($KEYS);

    return super.size;
  }

  *keys(): IterableIterator<K> {
    for (var key of super.keys()) {
      this.keyTriggers.track(key);

      yield key;
    }

    this.keyTriggers.track($KEYS);
  }

  *values(): IterableIterator<V> {
    for (var entry of super.entries()) {
      this.valueTriggers.track(entry[0]);

      yield entry[1];
    }

    this.keyTriggers.track($KEYS);
  }

  *entries(): IterableIterator<[K, V]> {
    for (var entry of super.entries()) {
      this.valueTriggers.track(entry[0]);

      yield entry;
    }

    this.keyTriggers.track($KEYS);
  }

  // writes
  set(key: K, value: V, trigger?: boolean): this {
    if (trigger == null) {
      trigger = true;
    }

    batch(() => {
      if (super.has(key)) {
        if (super.get(key)! === value) {
          return;
        }
      } else {
        if (trigger) {
          this.keyTriggers.dirty(key);
          this.keyTriggers.dirty($KEYS);
        }
      }

      if (trigger) {
        this.valueTriggers.dirty(key);
      }

      super.set(key, value);
    });

    return this;
  }

  delete(key: K, trigger?: boolean): boolean {
    if (trigger == null) {
      trigger = true;
    }

    var isDeleted = super.delete(key);

    if (isDeleted && trigger) {
      batch(() => {
        this.keyTriggers.dirty(key);
        this.keyTriggers.dirty($KEYS);
        this.valueTriggers.dirty(key);
      });
    }

    return isDeleted;
  }

  clear(): void {
    if (super.size) {
      batch(() => {
        for (var key of super.keys()) {
          this.keyTriggers.dirty(key);
          this.valueTriggers.dirty(key);
        }

        super.clear();
        this.keyTriggers.dirty($KEYS);
      });
    }
  }

  // callback
  forEach(callback: (value: V, key: K, map: this) => void) {
    this.keyTriggers.track($KEYS);

    for (var entry of super.entries()) {
      var key = entry[0];
      var value = entry[1];

      this.valueTriggers.track(key);

      callback(value, key, this);
    }
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries();
  }
}
