import { type createForm } from '@src/core/create-form';
import { FIELDS_MAP } from '@src/core/create-form.symbols';
import { Field } from '@src/core/create-form.types';
import { Object_fromEntries } from '@src/utils/object.util';
import { ReactiveMap } from '@src/utils/reactive-map.util';

// https://stackoverflow.com/questions/18936915/dynamically-set-property-of-nested-object
// https://vee-validate.logaretm.com/v4/guide/composition-api/nested-objects-and-arrays/

// https://stackoverflow.com/a/68966700

// export var isArrayIndex = (value: unknown): value is number => {
//   return Number(value) >= 0;
// };

export var isIndex = (value: unknown): value is number => {
  if (value === '') {
    return false;
  }

  var maybeNumber = Number(value);

  if (Number.isNaN(maybeNumber)) {
    return false;
  }

  return maybeNumber >= 0;
};

export var withNestedFields = <TForm extends ReturnType<typeof createForm>>(
  form: TForm
) => {
  type GetValues = typeof form.getValues;
  var form_getValues = form.getValues as Function;
  var getValues = ((option?: {
    useNesting: boolean;
  }): ReturnType<GetValues> => {
    // prettier-ignore
    var value = (
      form_getValues.length > 0
        ? form_getValues(option)
        : form_getValues()
    );

    return value;
  }) satisfies GetValues;

  return {
    ...form,
    getValues,
  };
};
