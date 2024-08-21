import { createForm } from '@src/core/create-form';
import {
  DEFAULT_VALUES_MAP,
  FIELDS_MAP,
  NULLABLE_FIELDS_MAP,
  SUBMIT_QUEUE,
} from '@src/core/create-form.symbols';
import {
  Field,
  SubmitFunction,
  SubmitterFunction,
} from '@src/core/create-form.types';
import { Object_fromEntries } from '@src/utils/object.util';
import { ReactiveMap } from '@src/utils/reactive-map.util';
import { $PROXY } from 'solid-js';
import { createMutable } from 'solid-js/store';

// https://kellenmace.com/blog/list-paths-to-all-deeply-nested-javascript-object-keys

var isValid_defaultValue = false;
var isValidating_defaultValue = false;

export var withValidation = <TForm extends ReturnType<typeof createForm>>(
  form: TForm
) => {
  var fieldsMap = form[FIELDS_MAP] as ReactiveMap<string, Field>;
  var defaultValuesMap = form[DEFAULT_VALUES_MAP] as ReactiveMap<string, Field>;
  var nullableFieldsMap = form[NULLABLE_FIELDS_MAP] as ReactiveMap<
    string,
    Field
  >;
  // var state = form.state as Writeable<typeof form.state>;

  var errorMessagesMap = new ReactiveMap<string, string>();

  var trigger = (fieldNames?: string[]) => {
    fieldNames != null
      ? fieldNames.forEach((fieldName) => {
          //
        })
      : 1;
  };

  var getFieldError = (fieldName: string) => {
    return errorMessagesMap.get(fieldName);
  };

  // var getFieldsErrors = () => {
  //   var entries = Array(errorMessagesMap.size);

  //   var i = 0;
  //   errorMessagesMap.forEach((value, key) => {
  //     entries[i++] = [key, value];
  //   });

  //   return Object_fromEntries(entries);
  // };

  var getFieldsErrors = () => {
    return Object_fromEntries(errorMessagesMap);
  };

  var validation = createMutable({
    isValid: isValid_defaultValue,
    isValidating: isValidating_defaultValue,
    trigger,
    getFieldError,
    getFieldsErrors,
  });

  var register = (fieldName: string, fieldValue: any) => {
    var getField = form.register(fieldName, fieldValue);
    var field = getField();

    // form.register(fieldName, fieldValue);
    // var field = fieldsMap.get(fieldName)!;

    errorMessagesMap.set(fieldName, '');

    var onBlur = field.onBlur!;
    var onChange = field.onChange!;

    var updatedField = {
      name: field.name,
      getValue: field.getValue,
      setValue: field.setValue,
      onBlur: () => {
        onBlur();
      },
      onChange: (fieldValue: any) => {
        onChange(fieldValue);
      },
    };

    fieldsMap.set(fieldName, updatedField);

    // var map = fieldsMap.set(fieldName, updatedField);

    // return () => {
    //   return map.get(fieldName) || nullableFieldsMap.get(fieldName);
    // };

    return getField;
  };

  // var unregister = (fieldName: string) => {
  //   var isDeleted = form.unregister(fieldName);

  //   if (isDeleted) {
  //     errorMessagesMap.delete(fieldName);
  //   }

  //   return isDeleted;
  // };

  var reset = <TArgs extends Record<string, any>>(
    option?: TArgs & { keepIsValid?: boolean }
  ) => {
    var keepIsValid = option?.keepIsValid || false;

    var formReset = form.reset as Function;
 
    validation.isValid = false;

    if (keepIsValid) {
      validation.isValid = true;
    }

    if (option == null) {
      formReset();
    } else {
      formReset(option);
    }
  };

  var submit: SubmitFunction = (event) => {
    var _submitter = form.submit(event);
    var queue = _submitter[SUBMIT_QUEUE];

    validation.isValidating = true;

    var submitter = (async (onSubmit) => {
      queue.push(
        new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(undefined);
            // reject();
          }, 1300);
        })
          .then(() => {
            validation.isValid = true;
            console.log('Validating (fake) successful!');
          })
          .catch(() => {
            validation.isValid = false;
            console.log('Validating (fake) failed!');

            throw undefined;
          })
          .finally(() => {
            validation.isValidating = false;
          })
      );

      // queue.push(
      //   new Promise((resolve, reject) => {
      //     setTimeout(() => {
      //       // resolve(undefined);
      //       reject();
      //     }, 1000);
      //   })
      //     .then(() => {
      //       console.log('MMMMMMMmmm...');
      //     })
      //     .catch(() => {
      //       console.log('NONONONON');

      //       throw undefined;
      //     })
      // );

      try {
        await _submitter(onSubmit);
      } catch {
        //
      } finally {
        //
      }
    }) as SubmitterFunction;

    submitter[SUBMIT_QUEUE] = queue;

    return submitter;
  };

  return {
    ...form,
    validation: validation as Readonly<typeof validation>,
    reset,
    register,
    // unregister,
    submit,
  };
};
