import type { Setter } from 'solid-js';
import type { ReversIterableArray } from '@src/utils/revers-iterable-array.util';
import type { SUBMIT_QUEUE } from './create-form.symbols';

export type Field = {
  name: string;
  getValue: () => any;
  setValue: Setter<any> | ((fieldValue: any) => any);
  onBlur: () => void;
  onChange: (fieldValue: any) => void;
};

export type PromiseQueue = ReversIterableArray<Promise<any>>;

export interface SubmitterFunction extends Function {
  [SUBMIT_QUEUE]: PromiseQueue;
  (onSubmit: (event: Event) => Promise<any>): Promise<any>;
}

export type SubmitFunction<TEvent extends Event = Event> = (
  event: TEvent
) => SubmitterFunction;
