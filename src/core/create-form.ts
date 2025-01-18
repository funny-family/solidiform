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
  setValue: (fieldName: string, fieldValue: any) => any;
  getValue: (fieldName: string) => any;
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
  const returnValuesMap = new Map<string | symbol, any>();

  var register: CreateFormReturnRecord['register'] = (
    fieldName,
    fieldValue
  ) => {
    var { 0: value, 1: setValue } = createSignal(fieldValue);

    defaultValuesMap.set(fieldName, fieldValue);

    var field: any = {
      name: fieldName,
      getValue: value,
      setValue: (fieldValue: Setter<any>) => {
        setValue(fieldValue);

        return value;
      },
      onBlur: () => {
        //
      },
      onChange: (fieldValue: any) => {
        setValue(fieldValue);
      },
    };

    var map = fieldsMap.set(fieldName, field);

    var memoizeField = (
      _fieldsMap: typeof fieldsMap,
      _nullableFieldsMap: typeof nullableFieldsMap,
      _createMemo: typeof createMemo
    ) => {
      return _createMemo(() => {
        return (map.get(fieldName) || nullableFieldsMap.get(fieldName))!;
      });
    };

    return memoizeField(map, nullableFieldsMap, createMemo);
  };

  var unregister: CreateFormReturnRecord['unregister'] = function (
    fieldName,
    option
  ) {
    var keepDefaultValue = option?.keepDefaultValue || false;

    var field = fieldsMap.get(fieldName, false)!;

    if (field == null) {
      return false;
    }

    var defaultValue = defaultValuesMap.get(fieldName, false); // ??? (false)

    var nullableField = {
      name: nullableField_name as any,
      getValue: () => {
        return defaultValue;
      },
      setValue: nullableField_setValue,
      onBlur: nullableField_onBlur,
      onChange: nullableField_onChange,
    };

    if (keepDefaultValue) {
      nullableFieldsMap.set(fieldName, nullableField);
    } else {
      nullableField.getValue = () => {
        return field.getValue();
      };

      nullableFieldsMap.set(fieldName, nullableField);
    }

    batch(() => {
      defaultValuesMap.delete(fieldName);
      fieldsMap.delete(fieldName);

      var cleanup = this?.onCleanup;
      if (cleanup != null) {
        cleanup();
      }
    });

    nullableFieldsMap.delete(fieldName);

    return true;
  };

  var setValue: CreateFormReturnRecord['setValue'] = (
    fieldName,
    fieldValue
  ) => {
    var field = fieldsMap.get(fieldName);

    if (field == null) {
      return undefined;
    }

    var value = field.setValue(fieldValue);

    return value();
  };

  var getValue: CreateFormReturnRecord['getValue'] = (fieldName) => {
    return fieldsMap.get(fieldName)?.getValue();
  };

  var getValues: CreateFormReturnRecord['getValues'] = () => {
    var fieldsEntries = Array(fieldsMap.size);

    var i = 0;
    fieldsMap.forEach((field, key) => {
      fieldsEntries[i++] = [key, field.getValue!()];
    });

    return Object_fromEntries(fieldsEntries);
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
      var fields = Array<Field>(fieldsMap.size);

      var i = 0;
      fieldsMap.forEach((field) => {
        fields[i++] = field;
      });

      return fields;
    };

  var reset: CreateFormReturnRecord['reset'] = () => {
    fieldsMap.forEach((field, key) => {
      field.setValue(defaultValuesMap.get(key));
    });
  };

  var resetField: CreateFormReturnRecord['resetField'] = (fieldName) => {
    const defaultFieldValue = defaultValuesMap.get(fieldName, false);
    const field = fieldsMap.get(fieldName, false);

    if (defaultFieldValue == null || field == null) {
      return () => {
        return undefined;
      };
    }

    return field.setValue(defaultFieldValue);
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

  return returnValuesMap
    .set(FIELDS_MAP, fieldsMap)
    .set(DEFAULT_VALUES_MAP, defaultValuesMap)
    .set(NULLABLE_FIELDS_MAP, nullableFieldsMap)
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
    .set('submit', submit);
};
