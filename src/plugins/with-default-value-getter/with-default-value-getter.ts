import {
  type DefaultValuesMap,
  createForm,
  DEFAULT_VALUES_MAP,
} from '../../../src';
import { Object_fromEntries } from '../../../src/utils/object.util';
import type { WithDefaultValueGetterReturnRecord } from './types';

export var withDefaultValueGetter = <
  TForm extends ReturnType<typeof createForm>
>(
  form: TForm
) => {
  const defaultValuesMap: DefaultValuesMap = form.get(DEFAULT_VALUES_MAP);

  const getDefaultValue: WithDefaultValueGetterReturnRecord['getDefaultValue'] =
    (fieldName) => {
      return defaultValuesMap.get(fieldName);
    };

  const getDefaultValuesRecord: WithDefaultValueGetterReturnRecord['getDefaultValuesRecord'] =
    () => {
      return Object_fromEntries(defaultValuesMap);
    };

  return form
    .set('getDefaultValue', getDefaultValue)
    .set('getDefaultValuesRecord', getDefaultValuesRecord);
};
