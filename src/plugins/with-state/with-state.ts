import { batch } from 'solid-js';
import { createMutable } from 'solid-js/store';
import {
  type FieldsMap,
  type SubmitFunction,
  type Field,
  type SubmitterFunction,
  createForm,
  FIELDS_MAP,
  SUBMIT_QUEUE,
} from '../../../src';
import { ReactiveMap } from '../../../src/utils/reactive-map.util';
import { Object_fromEntries } from '../../../src/utils/object.util';
import type {
  WithStateReturnRecord,
  DirtyFieldsMap,
  FieldState,
  State,
  TouchedFieldsMap,
} from './types';

export var withState = <TForm extends ReturnType<typeof createForm>>(
  form: TForm
) => {
  var fieldsMap: FieldsMap = form.get(FIELDS_MAP);

  var dirtyFieldsMap: DirtyFieldsMap = new ReactiveMap();
  var touchedFieldsMap: TouchedFieldsMap = new ReactiveMap();

  var state = createMutable<State>({
    isDirty: false,
    isTouched: false,
    isSubmitted: false,
    isSubmitSuccessful: false,
    isSubmitting: false,
    submitCount: 0,
  });

  const getFieldState: WithStateReturnRecord['getFieldState'] = (fieldName) => {
    const fieldState: FieldState = {
      isDirty: false,
      isTouched: false,
    };

    batch(() => {
      const dirtyField = dirtyFieldsMap.get(fieldName);
      const touchedField = touchedFieldsMap.get(fieldName);

      dirtyField != null && (fieldState.isDirty = dirtyField);
      touchedField != null && (fieldState.isTouched = touchedField);
    });

    return fieldState;
  };

  const getDirtyStateFieldsRecord: WithStateReturnRecord['getDirtyStateFieldsRecord'] =
    () => {
      return Object_fromEntries(dirtyFieldsMap);
    };

  const getTouchedStateFieldsRecord: WithStateReturnRecord['getTouchedStateFieldsRecord'] =
    () => {
      return Object_fromEntries(touchedFieldsMap);
    };

  const isDirty: WithStateReturnRecord['isDirty'] = () => {
    return state.isDirty;
  };

  const isTouched: WithStateReturnRecord['isTouched'] = () => {
    return state.isTouched;
  };

  const isSubmitted: WithStateReturnRecord['isSubmitted'] = () => {
    return state.isSubmitted;
  };

  const isSubmitSuccessful: WithStateReturnRecord['isSubmitSuccessful'] =
    () => {
      return state.isSubmitSuccessful;
    };

  const isSubmitting: WithStateReturnRecord['isSubmitting'] = () => {
    return state.isSubmitting;
  };

  const getSubmitCount: WithStateReturnRecord['getSubmitCount'] = () => {
    return state.submitCount;
  };

  var form_submit = form.get('submit');
  var submit: SubmitFunction = (event) => {
    var _submitter = form_submit(event);
    var queue = _submitter[SUBMIT_QUEUE];

    state.isSubmitting = true;

    var submitter = (async (onSubmit) => {
      try {
        await _submitter(onSubmit);

        state.isSubmitSuccessful = true;
      } catch (error) {
        console.log(1111, error);

        state.isSubmitSuccessful = false;
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

  return (
    form
      .set('isDirty', isDirty)
      .set('isTouched', isTouched)
      .set('isSubmitted', isSubmitted)
      .set('isSubmitSuccessful', isSubmitSuccessful)
      .set('isSubmitting', isSubmitting)
      .set('getSubmitCount', getSubmitCount)
      .set('getFieldState', getFieldState)
      .set('getDirtyStateFieldsRecord', getDirtyStateFieldsRecord)
      .set('getTouchedStateFieldsRecord', getTouchedStateFieldsRecord)
      // overrides
      .set('submit', submit)
  );
};
