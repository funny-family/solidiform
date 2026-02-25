import { batch, createSignal } from 'solid-js';
import { ReactiveMap } from '../utils/reactive-map.util';
import { Object_fromEntries } from '../utils/object.util';
import type {
  Field,
  SubmitterFunction,
  FieldsMap,
  DefaultValuesMap,
  PromiseQueue,
  CreateFormReturnRecord,
  ReturnedValuesMap,
} from './create-form.types';
import {
  FIELDS_MAP,
  DEFAULT_VALUES_MAP,
  SUBMIT_QUEUE,
} from './create-form.symbols';
import {
  nullableField_name,
  nullableField_onBlur,
  nullableField_onChange,
  nullableField_setValue,
} from './utils';

export var createForm = () => {
  var fieldsMap: FieldsMap = new ReactiveMap();
  var defaultValuesMap: DefaultValuesMap = new ReactiveMap();
  const returnedValuesMap: ReturnedValuesMap = new Map();

  const register: CreateFormReturnRecord['register'] = (
    fieldName,
    defaultFieldValue
  ) => {
    var { 0: fieldSignalValue, 1: setFieldSignalValue } =
      createSignal(defaultFieldValue);

    defaultValuesMap.set(fieldName, defaultFieldValue);

    const name: Field['name'] = fieldName;
    const getValue: Field['getValue'] = fieldSignalValue;
    const setValue: Field['setValue'] = (predicate) => {
      const newFieldValue = predicate(fieldSignalValue());

      return setFieldSignalValue(newFieldValue);
    };
    const onBlur: Field['onBlur'] = nullableField_onBlur;
    const onChange: Field['onChange'] = (fieldValue) => {
      setFieldSignalValue(fieldValue);
    };
    const field: Field = {
      name,
      getValue,
      setValue,
      onBlur,
      onChange,
    };

    var map = fieldsMap.set(fieldName, field);

    return () => {
      const name = nullableField_name as any;
      const getValue = fieldSignalValue;
      const setValue = nullableField_setValue;
      const onBlur = nullableField_onBlur;
      const onChange = nullableField_onChange;
      const nullableField = {
        name,
        getValue,
        setValue,
        onBlur,
        onChange,
      };

      return map.get(fieldName) || nullableField;
    };
  };

  const unregister: CreateFormReturnRecord['unregister'] = (
    fieldName,
    option
  ) => {
    var keepDefaultValue =
      option?.keepDefaultValue == null ? false : option.keepDefaultValue;

    var field = fieldsMap.get(fieldName, false)!;

    if (field == null) {
      return false;
    }

    const defaultFieldValue = defaultValuesMap.get(fieldName);
    keepDefaultValue &&
      field.setValue(() => {
        return defaultFieldValue;
      });

    batch(() => {
      defaultValuesMap.delete(fieldName);
      fieldsMap.delete(fieldName);
    });

    return true;
  };

  const setValue: CreateFormReturnRecord['setValue'] = (
    fieldName,
    predicate
  ) => {
    var field = fieldsMap.get(fieldName);
    var newFieldValue = predicate(field?.getValue());

    // prettier-ignore
    return (
      (field == null)
      ? (
        undefined
      ) : (
        field.setValue(() => {
          return newFieldValue
        })
      )
    )
  };

  const getValue: CreateFormReturnRecord['getValue'] = (fieldName) => {
    return fieldsMap.get(fieldName)?.getValue();
  };

  const getValuesRecord: CreateFormReturnRecord['getValuesRecord'] = () => {
    return Object_fromEntries(
      Array.from(fieldsMap, (fieldEntry) => {
        const fieldName = fieldEntry[0];
        const field = fieldEntry[1];

        return Array(fieldName, field.getValue());
      })
    );
  };

  const reset: CreateFormReturnRecord['reset'] = () => {
    fieldsMap.forEach((field, key) => {
      field.setValue(() => {
        return defaultValuesMap.get(key);
      });
    });
  };

  const resetField: CreateFormReturnRecord['resetField'] = (fieldName) => {
    const defaultFieldValue = defaultValuesMap.get(fieldName, false);
    const field = fieldsMap.get(fieldName, false);

    // prettier-ignore
    return (
      (defaultFieldValue == null || field == null)
        ? (
          () => {
            return undefined;
          }
        )
        : (
          field.setValue(() => {
            return defaultFieldValue
          })
        )
    );
  };

  const submit: CreateFormReturnRecord['submit'] = (event) => {
    event.preventDefault();

    var queue: PromiseQueue = new Set();

    var submitter: SubmitterFunction = async (onSubmit) => {
      // try {
      //   if (queue.size > 0) {
      //     await Promise.all(Array.from(queue).toReversed());
      //   }

      //   await onSubmit(event);
      // } catch (error) {
      //   console.log(3333, { error });
      // }

      if (queue.size > 0) {
        await Promise.all(Array.from(queue).toReversed());
      }

      await onSubmit(event);
    };

    // var submitter: SubmitterFunction = async (onSubmit) => {
    //   await Promise.all(Array.from(queue).toReversed());

    //   return await onSubmit(event).catch((ee) => {
    //     console.log({ ee });
    //   });
    // };

    submitter[SUBMIT_QUEUE] = queue;

    return submitter;
  };

  return returnedValuesMap
    .set(FIELDS_MAP, fieldsMap)
    .set(DEFAULT_VALUES_MAP, defaultValuesMap)
    .set('setValue', setValue)
    .set('getValue', getValue)
    .set('getValuesRecord', getValuesRecord)
    .set('register', register)
    .set('unregister', unregister)
    .set('reset', reset)
    .set('resetField', resetField)
    .set('submit', submit);
};
