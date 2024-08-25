import { type createForm } from '@src/core/create-form';
import { FIELDS_MAP } from '@src/core/create-form.symbols';
import { Field } from '@src/core/create-form.types';
import { Object_fromEntries } from '@src/utils/object.util';
import { ReactiveMap } from '@src/utils/reactive-map.util';

// https://stackoverflow.com/questions/18936915/dynamically-set-property-of-nested-object
// https://vee-validate.logaretm.com/v4/guide/composition-api/nested-objects-and-arrays/

export var withNestedFields = <TForm extends ReturnType<typeof createForm>>(
  form: TForm
) => {
  type GetValues = typeof form.getValues;
  var form_getValues = form.getValues as Function;
  var getValues = ((option?: {
    useNesting: boolean;
  }): ReturnType<GetValues> => {
    if (form_getValues.length > 0) {
      return form_getValues(option);
    }

    return form_getValues();
  }) satisfies GetValues;

  return {
    ...form,
    getValues,
  };
};
