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

export type CreateFormReturnRecord = {
  // @ts-expect-error
  [FIELDS_MAP]: ReactiveMap<string, Field>;
  // @ts-expect-error
  [DEFAULT_VALUES_MAP]: ReactiveMap<string, any>;
  // @ts-expect-error
  [NULLABLE_FIELDS_MAP]: Map<string, Field>;
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
  getValues: () => Record<string, any>;
  getDefaultValue: (fieldName: string) => any;
  getDefaultValues: () => Record<string, any>;
  getRegisteredField: (fieldName: string) => Field | undefined;
  getRegisteredFields: () => Field[];
  reset: () => void;
  resetField: (fieldName: string) => any;
  submit: SubmitFunction;
};

export var createForm = () => {
  var fieldsMap = new ReactiveMap<string, Field>();
  var nullableFieldsMap = new Map<string, Field>();
  var defaultValuesMap = new ReactiveMap<string, any>();
  const returnedValuesMap = new Map<string | symbol, any>();

  var register: CreateFormReturnRecord['register'] = (
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

  var unregister: CreateFormReturnRecord['unregister'] = function (
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

  var setValue: CreateFormReturnRecord['setValue'] = (fieldName, predicate) => {
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

  var getValue: CreateFormReturnRecord['getValue'] = (fieldName) => {
    return fieldsMap.get(fieldName)?.getValue();
  };

  var getValues: CreateFormReturnRecord['getValues'] = () => {
    return Object_fromEntries(
      Array.from(fieldsMap, (fieldEntry) => {
        const fieldName = fieldEntry[0];
        const field = fieldEntry[1];

        return Array(fieldName, field.getValue());
      })
    );
  };

  var getDefaultValue: CreateFormReturnRecord['getDefaultValue'] = (
    fieldName
  ) => {
    return defaultValuesMap.get(fieldName);
  };

  var getDefaultValues: CreateFormReturnRecord['getDefaultValues'] = () => {
    return Object_fromEntries(defaultValuesMap);
  };

  var getRegisteredField: CreateFormReturnRecord['getRegisteredField'] = (
    fieldName
  ) => {
    return fieldsMap.get(fieldName);
  };

  var getRegisteredFields: CreateFormReturnRecord['getRegisteredFields'] =
    () => {
      return Array.from(fieldsMap, (fieldEntry) => {
        const field = fieldEntry[1];

        return field;
      });
    };

  var reset: CreateFormReturnRecord['reset'] = () => {
    fieldsMap.forEach((field, key) => {
      field.setValue(() => {
        return defaultValuesMap.get(key);
      });
    });
  };

  var resetField: CreateFormReturnRecord['resetField'] = (fieldName) => {
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

  var submit: CreateFormReturnRecord['submit'] = (event) => {
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

  return (
    returnedValuesMap
      .set(FIELDS_MAP, fieldsMap)
      .set(DEFAULT_VALUES_MAP, defaultValuesMap)
      .set(NULLABLE_FIELDS_MAP, nullableFieldsMap)
      // .set(RETURNED_VALUES_MAP, returnedValuesMap)
      .set('setValue', setValue)
      .set('getValue', getValue)
      .set('getValues', getValues)
      .set('getDefaultValue', getDefaultValue)
      .set('getDefaultValues', getDefaultValues)
      .set('getRegisteredField', getRegisteredField)
      .set('getRegisteredFields', getRegisteredFields)
      .set('register', register)
      .set('unregister', unregister)
      .set('reset', reset)
      .set('resetField', resetField)
      .set('submit', submit)
  );
};
