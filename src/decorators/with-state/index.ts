import { batch } from 'solid-js';
import { createMutable } from 'solid-js/store';
import { ReactiveMap } from '@src/utils/reactive-map.util';
import { object_fromEntries } from '@src/utils/object.util';
import type { createForm } from '@src/core/create-form';
import {
  FIELDS_MAP,
  NULLABLE_FIELDS_MAP,
  SUBMIT_QUEUE,
} from '@src/core/create-form.symbols';
import type {
  Field,
  SubmitFunction,
  SubmitterFunction,
} from '@src/core/create-form.types';
import {
  isDirty_defaultValue,
  isSubmitSuccessful_defaultValue,
  isSubmitted_defaultValue,
  isSubmitting_defaultValue,
  isTouched_defaultValue,
  submitCount_defaultValue,
} from './default-values';
import { DIRTY_FIELDS_MAP, TOUCHED_FIELDS_MAP } from './symbols';

export var withState = <TForm extends ReturnType<typeof createForm>>(
  form: TForm
) => {
  var fieldsMap = form[FIELDS_MAP] as ReactiveMap<string, Field>;
  var nullableFieldsMap = form[NULLABLE_FIELDS_MAP] as Map<string, Field>;

  var dirtyFieldsMap = new ReactiveMap<string, boolean>();
  var touchedFieldsMap = new ReactiveMap<string, boolean>();

  var getDirtyFields = () => {
    return object_fromEntries(dirtyFieldsMap);
  };

  var getTouchedFields = () => {
    return object_fromEntries(touchedFieldsMap);
  };

  var getFieldState = (fieldName: string) => {
    var fieldState = {
      isDirty: isDirty_defaultValue,
      isTouched: isTouched_defaultValue,
    };

    batch(() => {
      var dirtyField = dirtyFieldsMap.get(fieldName);
      var touchedField = touchedFieldsMap.get(fieldName);

      if (dirtyField != null) {
        fieldState.isDirty = dirtyField;
      }

      if (touchedField != null) {
        fieldState.isTouched = touchedField;
      }
    });

    return fieldState;
  };

  var state = createMutable({
    isDirty: isDirty_defaultValue,
    isTouched: isTouched_defaultValue,
    isSubmitted: isSubmitted_defaultValue,
    isSubmitSuccessful: isSubmitSuccessful_defaultValue,
    isSubmitting: isSubmitting_defaultValue,
    submitCount: submitCount_defaultValue,
    getFieldState,
    getDirtyFields,
    getTouchedFields,
  });

  var register = (fieldName: string, fieldValue: any) => {
    form.register(fieldName, fieldValue);

    var field = fieldsMap.get(fieldName, false)!;

    batch(() => {
      dirtyFieldsMap.set(fieldName, false);
      touchedFieldsMap.set(fieldName, false);
    });

    var onBlur = field.onBlur!;
    var onChange = field.onChange!;

    var updatedField = {
      name: field.name,
      getValue: field.getValue,
      setValue: field.setValue,
      onBlur: () => {
        onBlur();

        state.isTouched = true;

        touchedFieldsMap.set(fieldName, true);
      },
      onChange: (fieldValue: any) => {
        onChange(fieldValue);

        state.isDirty = true;

        dirtyFieldsMap.set(fieldName, true);
      },
    };

    var map = fieldsMap.set(fieldName, updatedField);

    return () => {
      return map.get(fieldName) || nullableFieldsMap.get(fieldName);
    };
  };

  var unregister = function (
    this: {
      onCleanup?: () => void;
    },
    fieldName: Parameters<TForm['unregister']>[0],
    option: Parameters<TForm['unregister']>[1] & {
      keepFormDirty?: boolean;
      keepFormTouched?: boolean;
    }
  ) {
    var keepFormDirty = option?.keepFormDirty || false;
    var keepFormTouched = option?.keepFormTouched || false;

    var formUnregister = form.unregister.bind({
      onCleanup: () => {
        dirtyFieldsMap.delete(fieldName);
        touchedFieldsMap.delete(fieldName);

        if (keepFormDirty) {
          state.isDirty = true;
        } else {
          if (dirtyFieldsMap.size === 0) {
            state.isDirty = false;
          }
        }

        if (keepFormTouched) {
          state.isTouched = true;
        } else {
          if (touchedFieldsMap.size === 0) {
            state.isTouched = false;
          }
        }

        var cleanup = this?.onCleanup;
        if (cleanup != null) {
          cleanup();
        }
      },
    });

    return formUnregister(fieldName, option);
  };

  var reset = (option?: {
    keepDirty?: boolean;
    keepTouched?: boolean;
    keepValues?: boolean;
    keepSubmitCount?: boolean;
  }) => {
    var keepDirty = option?.keepDirty || false;
    var keepTouched = option?.keepTouched || false;
    var keepValues = option?.keepValues || false;
    var keepSubmitCount = option?.keepSubmitCount || false;

    batch(() => {
      if (keepDirty === false) {
        state.isDirty = false;

        dirtyFieldsMap.forEach((fieldValue, fieldName, map) => {
          map.set(fieldName, false);
        });
      }

      if (keepTouched === false) {
        state.isTouched = false;

        touchedFieldsMap.forEach((fieldValue, fieldName, map) => {
          map.set(fieldName, false);
        });
      }

      if (keepSubmitCount === false) {
        state.submitCount = 0;
      }

      if (keepValues === false) {
        form.reset();
      }

      batch(() => {
        state.isSubmitted = false;
        state.isSubmitSuccessful = false;
      });
    });
  };

  var resetField = (
    fieldName: string,
    option?: {
      keepDirty?: boolean;
      keepTouched?: boolean;
      keepValue?: boolean;
    }
  ) => {
    var keepDirty = option?.keepDirty || false;
    var keepTouched = option?.keepTouched || false;
    var keepValue = option?.keepValue || false;

    var field = fieldsMap.get(fieldName);

    if (field == null) {
      return undefined;
    }

    batch(() => {
      if (keepDirty === false) {
        var isAllFields_NOT_Dirty = true;
        var map = dirtyFieldsMap.set(fieldName, false);

        for (var entry of map) {
          if (entry[1] === true) {
            isAllFields_NOT_Dirty = false;

            break;
          }
        }

        if (isAllFields_NOT_Dirty) {
          state.isDirty = false;
        }
      }

      if (keepTouched === false) {
        var isAllFields_NOT_Touched = true;
        var map = touchedFieldsMap.set(fieldName, false);

        for (var entry of map) {
          if (entry[1] === true) {
            isAllFields_NOT_Touched = false;

            break;
          }
        }

        if (isAllFields_NOT_Touched) {
          state.isTouched = false;
        }
      }
    });

    if (keepValue) {
      return form.getValue(fieldName);
    }

    var value = form.resetField(fieldName)!;

    return value();
  };

  var submit: SubmitFunction = (event) => {
    var _submitter = form.submit(event);
    var queue = _submitter[SUBMIT_QUEUE];

    state.isSubmitting = true;

    var submitter = (async (onSubmit) => {
      try {
        await _submitter(onSubmit);

        state.isSubmitSuccessful = true;
        console.log('then1');
      } catch {
        state.isSubmitSuccessful = false;
        console.log('catch1');
      } finally {
        batch(() => {
          state.isSubmitted = true;
          state.isSubmitting = false;
          state.submitCount++;
        });
      }
    }) as SubmitterFunction;

    submitter[SUBMIT_QUEUE] = queue;

    return submitter;
  };

  return {
    [DIRTY_FIELDS_MAP]: dirtyFieldsMap,
    [TOUCHED_FIELDS_MAP]: touchedFieldsMap,
    state: state as Readonly<typeof state>,
    ...form,
    register,
    unregister,
    reset,
    resetField,
    submit,
  };
};
