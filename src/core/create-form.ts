import { batch, createSignal, type Setter } from 'solid-js';
import { ReactiveMap } from '../utils/reactive-map.util';
import { ReversIterableArray } from '../utils/revers-iterable-array.util';
import { object_fromEntries } from '../utils/object.util';
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

export var createForm = () => {
  var fieldsMap = new ReactiveMap<string, Field>();
  var nullableFieldsMap = new Map<string, Field>();
  var defaultValuesMap = new ReactiveMap<string, any>();

  var register = (fieldName: string, fieldValue: any) => {
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

    return () => {
      return map.get(fieldName) || nullableFieldsMap.get(fieldName);
    };
  };

  var unregister = function (
    this: {
      onCleanup?: () => void;
    },
    fieldName: string,
    option?: {
      keepDefaultValue?: boolean;
    }
  ) {
    var keepDefaultValue = option?.keepDefaultValue || false;

    var field = fieldsMap.get(fieldName, false)!;

    if (field == null) {
      return false;
    }

    var defaultValue = defaultValuesMap.get(fieldName);

    if (keepDefaultValue) {
      nullableFieldsMap.set(fieldName, {
        name: null,
        getValue: () => {
          return defaultValue;
        },
        setValue: null,
        onBlur: null,
        onChange: null,
      });
    } else {
      nullableFieldsMap.set(fieldName, {
        name: null,
        getValue: () => {
          return field.getValue!();
        },
        setValue: null,
        onBlur: null,
        onChange: null,
      });
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

  var setValue = (fieldName: string, fieldValue: any) => {
    var field = fieldsMap.get(fieldName);

    if (field == null) {
      return undefined;
    }

    var value = field?.setValue!(fieldValue);

    return value();
  };

  var getValue = (fieldName: string) => {
    return fieldsMap.get(fieldName)?.getValue!();
  };

  var getValues = () => {
    var fieldsEntries = Array(fieldsMap.size);

    var i = 0;
    fieldsMap.forEach((field, key) => {
      fieldsEntries[i++] = [key, field.getValue!()];
    });

    return object_fromEntries(fieldsEntries);
  };

  var getDefaultValue = (fieldName: string) => {
    return defaultValuesMap.get(fieldName);
  };

  var getDefaultValues = () => {
    return object_fromEntries(defaultValuesMap);
  };

  var getRegisteredField = (fieldName: string) => {
    return fieldsMap.get(fieldName);
  };

  var getRegisteredFields = () => {
    var fields = Array<Field>(fieldsMap.size);

    var i = 0;
    fieldsMap.forEach((field) => {
      fields[i++] = field;
    });

    return fields;
  };

  var reset = () => {
    fieldsMap.forEach((field, key) => {
      field.setValue!(defaultValuesMap.get(key));
    });
  };

  var resetField = (fieldName: string) => {
    const defaultFieldValue = defaultValuesMap.get(fieldName, false);
    const field = fieldsMap.get(fieldName, false);

    if (defaultFieldValue == null || field == null) {
      return () => {
        return undefined;
      };
    }

    return field.setValue!(defaultFieldValue);
  };

  var submit: SubmitFunction = (event) => {
    event.preventDefault();

    var queue = new ReversIterableArray<Promise<any>>();

    var submitter = (async (onSubmit) => {
      try {
        await Promise.all(queue);
        await onSubmit(event);
      } catch (error) {
        throw undefined;
      } finally {
        //
      }
    }) as SubmitterFunction;

    submitter[SUBMIT_QUEUE] = queue;

    return submitter;
  };

  return {
    [FIELDS_MAP]: fieldsMap,
    [DEFAULT_VALUES_MAP]: defaultValuesMap,
    [NULLABLE_FIELDS_MAP]: nullableFieldsMap,
    setValue,
    getValue,
    getValues,
    getDefaultValue,
    getDefaultValues,
    getRegisteredField,
    getRegisteredFields,
    register,
    unregister,
    reset,
    resetField,
    submit,
  };
};
