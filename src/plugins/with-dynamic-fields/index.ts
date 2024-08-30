// https://stackoverflow.com/questions/44715210/how-to-get-index-based-value-from-set
// https://stackoverflow.com/a/77004942

import { type createForm } from '@src/core/create-form';

/*
  Set.prototype.at = function(index) {
    if (Math.abs(index) > this.size) {
      return null;
    }

    var idx = index;
    if (idx < 0){
      idx = this.size + index;
    }

    var counter = 0;
    for (const elem of this) {
      if (counter == idx){
        return elem;
      }

      counter += 1;
    }
  };
*/

export const withDynamicFields = <TForm extends ReturnType<typeof createForm>>(
  form: TForm
) => {
  //

  return {
    ...form,
  };
};
