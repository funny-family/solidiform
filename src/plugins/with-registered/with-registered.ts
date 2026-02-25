import { type FieldsMap, createForm, FIELDS_MAP } from '../../../src';
import type { WithRegisteredReturnRecord } from './types';

export var withRegistered = <TForm extends ReturnType<typeof createForm>>(
  form: TForm
) => {
  var fieldsMap: FieldsMap = form.get(FIELDS_MAP);

  const getRegisteredField: WithRegisteredReturnRecord['getRegisteredField'] = (
    fieldName
  ) => {
    return fieldsMap.get(fieldName);
  };

  const getRegisteredFields: WithRegisteredReturnRecord['getRegisteredFields'] =
    () => {
      return Array.from(fieldsMap, (fieldEntry) => {
        const field = fieldEntry[1];

        return field;
      });
    };

  return form
    .set('getRegisteredField', getRegisteredField)
    .set('getRegisteredFields', getRegisteredFields);
};
