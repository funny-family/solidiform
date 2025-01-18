import { Object_fromEntries } from '../utils/object.util';

export var transformReturnValue = <T extends Record<string, any>>(
  map: Map<string | symbol, any>
) => {
  return Object_fromEntries(map) as T;
};
