import { Object_fromEntries } from '../utils/object.util';

export var transformReturnValue: <T extends Record<string, any>>(
  arg: Map<string | symbol, any>
) => T = Object_fromEntries;
