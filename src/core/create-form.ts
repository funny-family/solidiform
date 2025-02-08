import {
  type Accessor,
  batch,
  createMemo,
  createSignal,
  type Setter,
} from 'solid-js';
import { ReactiveMap } from '../utils/reactive-map.util';
import { Object_fromEntries } from '../utils/object.util';
import type {
  Field,
  SubmitFunction,
  SubmitterFunction,
} from './create-form.types';
import {
  FIELDS_MAP,
  DEFAULT_VALUES_MAP,
  NULLABLE_FIELDS_MAP,
  SUBMIT_QUEUE,
  RETURNED_VALUES_MAP,
} from './create-form.symbols';
import {
  nullableField_name,
  nullableField_onBlur,
  nullableField_onChange,
  nullableField_setValue,
} from './utils';

export type FieldsMap = ReactiveMap<string, Field>;
export type DefaultValuesMap = ReactiveMap<string, any>;
export type NullableFieldsMap = ReactiveMap<string, any>;

export type CreateFormReturnRecord = {
  // @ts-expect-error
  [FIELDS_MAP]: FieldsMap;
  // @ts-expect-error
  [DEFAULT_VALUES_MAP]: DefaultValuesMap;
  // @ts-expect-error
  [NULLABLE_FIELDS_MAP]: NullableFieldsMap;
  // // @ts-expect-error
  // [RETURNED_VALUES_MAP]: Map<string | symbol, any>;
  register: (fieldName: string, fieldValue: any) => Accessor<Field>;
  unregister: (
    this: {
      onCleanup?: () => void;
    },
    fieldName: string,
    option?: {
      keepDefaultValue?: boolean;
    }
  ) => boolean;
  setValue: (
    fieldName: string,
    predicate: (previousFieldValue: any) => any
  ) => any;
  getValue: (fieldName: string) => any | undefined;
  getValuesRecord: () => Record<string, any>;
  reset: () => void;
  resetField: (fieldName: string) => any;
  submit: SubmitFunction;
};

export var createForm = () => {
  var fieldsMap = new ReactiveMap<string, Field>();
  var nullableFieldsMap = new Map<string, Field>();
  var defaultValuesMap = new ReactiveMap<string, any>();
  const returnedValuesMap = new Map<string | symbol, any>();

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

    // TODO: completely remove usage of "nullableFieldsMap" since it can be replaced with raw object
    // See example below.

    return () => {
      const nullableField = {
        name: nullableField_name as any,
        getValue: fieldSignalValue,
        setValue: nullableField_setValue,
        onBlur: nullableField_onBlur,
        onChange: nullableField_onChange,
      };

      return map.get(fieldName) || nullableField;
    };
  };

  const unregister: CreateFormReturnRecord['unregister'] = function (
    fieldName,
    option
  ) {
    var keepDefaultValue =
      option?.keepDefaultValue == null ? false : option.keepDefaultValue;

    var field = fieldsMap.get(fieldName, false)!;

    if (field == null) {
      return false;
    }

    var defaultFieldValue = defaultValuesMap.get(fieldName);
    keepDefaultValue && field.setValue(defaultFieldValue);

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

    var queue = new Set<Promise<any>>();

    var submitter: SubmitterFunction = async (onSubmit) => {
      if (queue.size > 0) {
        await Promise.all(Array.from(queue).toReversed());
      }

      await onSubmit(event);
    };

    submitter[SUBMIT_QUEUE] = queue;

    return submitter;
  };

  // window.fieldsMap = fieldsMap;

  console.log(returnedValuesMap);

  return returnedValuesMap
    .set(FIELDS_MAP, fieldsMap)
    .set(DEFAULT_VALUES_MAP, defaultValuesMap)
    .set(NULLABLE_FIELDS_MAP, nullableFieldsMap)
    .set('setValue', setValue)
    .set('getValue', getValue)
    .set('getValuesRecord', getValuesRecord)
    .set('register', register)
    .set('unregister', unregister)
    .set('reset', reset)
    .set('resetField', resetField)
    .set('submit', submit);
};
