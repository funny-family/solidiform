import { batch, createMemo, createSignal, type Setter } from 'solid-js';
import { ReactiveMap } from '../utils/reactive-map.util';
import { ReversIterableArray } from '../utils/revers-iterable-array.util';
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

  // /**
  //  * @param {string} fieldName Form`s field that has been registered.
  //  * @param {Map<'keepDefaultValue', boolean>} option
  //  */
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

  var setValue = (fieldName: string, fieldValue: any) => {
    var field = fieldsMap.get(fieldName);

    if (field == null) {
      return undefined;
    }

    var value = field.setValue(fieldValue);

    return value();
  };

  var getValue = (fieldName: string) => {
    return fieldsMap.get(fieldName)?.getValue();
  };

  var getValues = () => {
    var fieldsEntries = Array(fieldsMap.size);

    var i = 0;
    fieldsMap.forEach((field, key) => {
      fieldsEntries[i++] = [key, field.getValue!()];
    });

    return Object_fromEntries(fieldsEntries);
  };

  var getDefaultValue = (fieldName: string) => {
    return defaultValuesMap.get(fieldName);
  };

  var getDefaultValues = () => {
    return Object_fromEntries(defaultValuesMap);
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
      field.setValue(defaultValuesMap.get(key));
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

    return field.setValue(defaultFieldValue);
  };

  var submit: SubmitFunction = (event) => {
    event.preventDefault();

    var queue = new ReversIterableArray<Promise<any>>();

    var submitter = (async (onSubmit) => {
      await Promise.all(queue);
      await onSubmit(event);

      // try {
      //   await Promise.all(queue);
      //   await onSubmit(event);
      // } catch (error) {
      //   throw undefined;
      // } finally {
      //   //
      // }
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

/*
> %DebugPrint(map1)
DebugPrint: 0x25c10007b601: [JSMap] in OldSpace
 - map: 0x358034978871 <Map[32](HOLEY_ELEMENTS)> [FastProperties]
 - prototype: 0x3580349788b9 <Object map = 0x358034976921>
 - elements: 0x327c2b200c31 <FixedArray[0]> [HOLEY_ELEMENTS]
 - table: 0x25c100078ec1 <OrderedHashMap[17]>
 - properties: 0x327c2b200c31 <FixedArray[0]>
 - All own properties (excluding elements): {}
0x358034978871: [Map] in OldSpace
 - map: 0x04ea371411a1 <MetaMap (0x04ea37141231 <NativeContext[287]>)>
 - type: JS_MAP_TYPE
 - instance size: 32
 - inobject properties: 0
 - unused property fields: 0
 - elements kind: HOLEY_ELEMENTS
 - enum length: 0
 - back pointer: 0x327c2b200069 <undefined>
 - prototype_validity cell: 0x327c2b201249 <Cell value= 1>
 - instance descriptors (own) #0: 0x327c2b200c91 <DescriptorArray[0]>
 - prototype: 0x3580349788b9 <Object map = 0x358034976921>
 - constructor: 0x01271db5e059 <JSFunction Map (sfi = 0x327c2b218b41)>
 - dependent code: 0x327c2b200c51 <Other heap object (WEAK_ARRAY_LIST_TYPE)>
 - construction counter: 0

 ===========================================================================================

 var obj = {};
 > obj.value = '345353';
'345353'
> %DebugPrint(obj)
DebugPrint: 0x1348754e8239: [JS_OBJECT_TYPE] in OldSpace
 - map: 0x125f7b0e0df9 <Map[56](HOLEY_ELEMENTS)> [FastProperties]
 - prototype: 0x358034949541 <Object map = 0x4ea37141bd1>
 - elements: 0x327c2b200c31 <FixedArray[0]> [HOLEY_ELEMENTS]
 - properties: 0x327c2b200c31 <FixedArray[0]>
 - All own properties (excluding elements): {
    0x327c2b201859: [String] in ReadOnlySpace: #value: 0x125f7b0e0639 <String[6]: #345353> (const data field 0), location: in-object
 }
0x125f7b0e0df9: [Map] in OldSpace
 - map: 0x04ea371411a1 <MetaMap (0x04ea37141231 <NativeContext[287]>)>
 - type: JS_OBJECT_TYPE
 - instance size: 56
 - inobject properties: 4
 - unused property fields: 3
 - elements kind: HOLEY_ELEMENTS
 - enum length: invalid
 - stable_map
 - back pointer: 0x04ea371533d9 <Map[56](HOLEY_ELEMENTS)>
 - prototype_validity cell: 0x01271db6b7f1 <Cell value= 0>
 - instance descriptors (own) #1: 0x24bd789e3b89 <DescriptorArray[1]>
 - prototype: 0x358034949541 <Object map = 0x4ea37141bd1>
 - constructor: 0x04ea371530d1 <JSFunction Object (sfi = 0x327c2b210a01)>
 - dependent code: 0x327c2b200c51 <Other heap object (WEAK_ARRAY_LIST_TYPE)>
 - construction counter: 0

 ===========================================================================================

 var ttt =Object.create(null)
 ttt.value = 35476;
 > %DebugPrint(ttt)
DebugPrint: 0x135ff9881df9: [JS_OBJECT_TYPE] in OldSpace
 - map: 0x04ea37143789 <Map[24](HOLEY_ELEMENTS)> [DictionaryProperties]
 - prototype: 0x327c2b200099 <null>
 - elements: 0x327c2b200c31 <FixedArray[0]> [HOLEY_ELEMENTS]
 - properties: 0x125f7b0fabd1 <NameDictionary[18]>
 - All own properties (excluding elements): {
   value: 35476 (data, dict_index: 1, attrs: [WEC])
 }
0x4ea37143789: [Map] in OldSpace
 - map: 0x04ea371411a1 <MetaMap (0x04ea37141231 <NativeContext[287]>)>
 - type: JS_OBJECT_TYPE
 - instance size: 24
 - inobject properties: 0
 - unused property fields: 0
 - elements kind: HOLEY_ELEMENTS
 - enum length: invalid
 - dictionary_map
 - may_have_interesting_properties
 - back pointer: 0x327c2b200069 <undefined>
 - prototype_validity cell: 0x327c2b201249 <Cell value= 1>
 - instance descriptors (own) #0: 0x327c2b200c91 <DescriptorArray[0]>
 - prototype: 0x327c2b200099 <null>
 - constructor: 0x04ea371530d1 <JSFunction Object (sfi = 0x327c2b210a01)>
 - dependent code: 0x327c2b200c51 <Other heap object (WEAK_ARRAY_LIST_TYPE)>
 - construction counter: 0
*/
