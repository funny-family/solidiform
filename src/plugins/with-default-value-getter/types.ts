import type { ReturnedValuesMap } from '../../../src';

export type GetDefaultValue = (fieldName: string) => any;

export type GetDefaultValuesRecord = () => Record<string, any>;

export type WithGetDefaultValue = <TForm extends ReturnedValuesMap>(
  form: TForm
) => TForm;

export type WithGetDefaultValuesRecord = <TForm extends ReturnedValuesMap>(
  form: TForm
) => TForm;

export type WithDefaultValueGetterReturnRecord = {
  getDefaultValue: (fieldName: string) => any;
  getDefaultValuesRecord: () => Record<string, any>;
};
