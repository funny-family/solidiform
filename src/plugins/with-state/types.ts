import type { ReactiveMap } from '../../../src/utils/reactive-map.util';

export type FieldState = {
  isDirty: boolean;
  isTouched: boolean;
};

export type State = {
  isDirty: boolean;
  isTouched: boolean;
  isSubmitted: boolean;
  isSubmitSuccessful: boolean;
  isSubmitting: boolean;
  submitCount: number;
};

export type DirtyFieldsMap = ReactiveMap<string, boolean>;

export type TouchedFieldsMap = ReactiveMap<string, boolean>;

export type WithStateReturnRecord = {
  isDirty: () => boolean;
  isTouched: () => boolean;
  isSubmitted: () => boolean;
  isSubmitSuccessful: () => boolean;
  isSubmitting: () => boolean;
  getSubmitCount: () => number;
  getFieldState: (fieldName: string) => FieldState;
  getDirtyStateFieldsRecord: () => Record<string, boolean>;
  getTouchedStateFieldsRecord: () => Record<string, boolean>;
};
