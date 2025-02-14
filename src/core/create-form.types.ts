import type { Accessor } from 'solid-js';
import { ReactiveMap } from '../utils/reactive-map.util';
import type { SUBMIT_QUEUE } from './create-form.symbols';

export type FieldsMap = ReactiveMap<string, Field>;
export type DefaultValuesMap = ReactiveMap<string, any>;
// export type NullableFieldsMap = ReactiveMap<string, any>;
export type ReturnedValuesMap = Map<string | symbol, any>;

export type Field = {
  name: string;
  getValue: () => any;
  setValue: (predicate: (previousFieldValue: any) => any) => any;
  onBlur: () => void;
  onChange: (fieldValue: any) => void;
};

// export type PromiseQueue = ReversIterableArray<Promise<any>>;
export type PromiseQueue = Set<Promise<any>>;

export interface SubmitterFunction extends Function {
  [SUBMIT_QUEUE]: PromiseQueue;
  (onSubmit: (event: Event) => Promise<any>): Promise<any>;
}

export type SubmitFunction<TEvent extends Event = Event> = (
  event: TEvent
) => SubmitterFunction;

export type CreateFormReturnRecord = {
  // @ts-expect-error
  [FIELDS_MAP]: FieldsMap;
  // @ts-expect-error
  [DEFAULT_VALUES_MAP]: DefaultValuesMap;
  // // @ts-expect-error
  // [RETURNED_VALUES_MAP]: Map<string | symbol, any>;
  register: (fieldName: string, fieldValue: any) => Accessor<Field>;
  unregister: (
    fieldName: string,
    option?: {
      keepDefaultValue?: boolean;
    }
  ) => boolean;
  setValue: (
    fieldName: string,
    predicate: (previousFieldValue: any) => any
  ) => any;
  getValue: (fieldName: string) => any | undefined;
  getValuesRecord: () => Record<string, any>;
  reset: () => void;
  resetField: (fieldName: string) => any;
  submit: SubmitFunction;
};
