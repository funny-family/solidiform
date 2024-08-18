import type { Setter } from 'solid-js';
import type { ReversIterableArray } from '@src/utils/revers-iterable-array.util';
import type { SUBMIT_QUEUE } from './create-form.symbols';

export type Field = {
  name: string | null;
  getValue: (() => any) | null;
  setValue: Setter<any> | null;
  onBlur: (() => void) | null;
  onChange: ((fieldValue: any) => void) | null;
};

export type PromiseQueue = ReversIterableArray<Promise<any>>;

export interface SubmitterFunction extends Function {
  [SUBMIT_QUEUE]: PromiseQueue;
  (onSubmit: (event: Event) => Promise<any>): Promise<any>;
}

export type SubmitFunction<TEvent extends Event = Event> = (
  event: TEvent
) => SubmitterFunction;
