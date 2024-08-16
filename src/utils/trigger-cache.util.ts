import {
  DEV,
  SignalOptions,
  createSignal,
  getListener,
  onCleanup,
} from 'solid-js';
import { isServer } from 'solid-js/web';

// prettier-ignore
var triggerOptions: SignalOptions<any> = (
  !isServer && DEV ?
    {
      equals: false,
      name: 'trigger',
    } :
    {
      equals: false,
    }
);

// prettier-ignore
var triggerCacheOptions: SignalOptions<any> = (
  !isServer && DEV ?
    {
      equals: false,
      internal: true,
    } :
    triggerOptions
);

export class TriggerCache<T> {
  #map: Map<
    T,
    {
      // track
      $(): void;
      // dirty
      $$(): void;
      // n of listeners
      n: number;
    }
  >;

  constructor(mapConstructor?: WeakMapConstructor | MapConstructor) {
    mapConstructor = Map;

    this.#map = new (mapConstructor as MapConstructor)();
  }

  dirty(key: T) {
    if (isServer) {
      return;
    }

    this.#map.get(key)?.$$();
  }

  track(key: T) {
    if (!getListener()) {
      return;
    }

    var trigger = this.#map.get(key);

    if (!trigger) {
      const { 0: $, 1: $$ } = createSignal(undefined, triggerCacheOptions);

      this.#map.set(key, (trigger = { $, $$, n: 1 }));
    } else {
      trigger.n++;
    }

    onCleanup(() => {
      // remove the trigger when no one is listening to it
      if (trigger!.n-- === 1) {
        // microtask is to avoid removing the trigger used by a single listener
        queueMicrotask(() => {
          trigger!.n === 0 && this.#map.delete(key);
        });
      }
    });

    trigger.$();
  }
}
