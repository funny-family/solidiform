import {
  createForm,
  // type CreateFormReturnRecord,
  type FieldsMap,
} from '../../core/create-form';
import { Field } from '../../core/create-form.types';
import { FIELDS_MAP } from '../../core/create-form.symbols';

export type WithRegisteredReturnRecord = {
  getRegisteredField: (fieldName: string) => Field | undefined;
  getRegisteredFields: () => Field[];
};

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
