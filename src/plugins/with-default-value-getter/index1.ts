import type {
  WithGetDefaultValue,
  GetDefaultValue,
  WithGetDefaultValuesRecord,
  GetDefaultValuesRecord,
} from './types';
import {
  type DefaultValuesMap,
  createForm,
  DEFAULT_VALUES_MAP,
} from '../../../src';
import { Object_fromEntries } from '../../../src/utils/object.util';

export const withGetDefaultValue: WithGetDefaultValue = (form) => {
  const defaultValuesMap: DefaultValuesMap = form.get(DEFAULT_VALUES_MAP);

  const getDefaultValue: GetDefaultValue = (fieldName) => {
    return defaultValuesMap.get(fieldName);
  };

  return form.set('getDefaultValue', getDefaultValue);
};

export const withGetDefaultValuesRecord: WithGetDefaultValuesRecord = (
  form
) => {
  const defaultValuesMap: DefaultValuesMap = form.get(DEFAULT_VALUES_MAP);

  const getDefaultValuesRecord: GetDefaultValuesRecord = () => {
    return Object_fromEntries(defaultValuesMap);
  };

  return form.set('getDefaultValuesRecord', getDefaultValuesRecord);
};

var f = withGetDefaultValuesRecord(withGetDefaultValue(createForm()));
