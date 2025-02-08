import { createForm, type DefaultValuesMap } from '../../core/create-form';
import { Object_fromEntries } from '../../../src/utils/object.util';
import { DEFAULT_VALUES_MAP } from '../../core/create-form.symbols';

export type WithDefaultValueGetterReturnRecord = {
  getDefaultValue: (fieldName: string) => any;
  getDefaultValuesRecord: () => Record<string, any>;
};

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
