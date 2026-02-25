import { type Field } from '../../../src';

export type WithRegisteredReturnRecord = {
  getRegisteredField: (fieldName: string) => Field | undefined;
  getRegisteredFields: () => Field[];
};
