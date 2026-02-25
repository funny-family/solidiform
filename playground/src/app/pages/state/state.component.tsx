import './state.styles.css';
import {
  createForm,
  transformReturnValue,
  type CreateFormReturnRecord,
} from '../../../../../src';
import {
  type WithRegisteredReturnRecord,
  withRegistered,
} from '../../../../../src/plugins/with-registered';
import {
  type WithDefaultValueGetterReturnRecord,
  withDefaultValueGetter,
} from '../../../../../src/plugins/with-default-value-getter';
import {
  type WithStateReturnRecord,
  withState,
} from '../../../../../src/plugins/with-state';
import { fakeWait } from '@src/app/utils';

var useForm = () => {
  type Form = CreateFormReturnRecord &
    WithRegisteredReturnRecord &
    WithDefaultValueGetterReturnRecord &
    WithStateReturnRecord;

  return transformReturnValue<Form>(
    withState(withDefaultValueGetter(withRegistered(createForm())))
  );
};

var FormData = (props: { record: Record<string, any> }) => {
  return (
    <div>
      <h1>Form data:</h1>
      <pre>{JSON.stringify(props.record, null, 2)}</pre>
    </div>
  );
};

var FormState = (props: { record: Record<string, any> }) => {
  return (
    <div>
      <h1>Form state:</h1>
      <pre>{JSON.stringify(props.record, null, 2)}</pre>
    </div>
  );
};

export default () => {
  var form = useForm();
  // @ts-expect-error
  console.log((window.form = form));

  var loginField = form.register('login', '');
  var passwordField = form.register('password', '');

  var onSubmit = async (event: Event) => {
    try {
      await fakeWait(1000, false);
      throw new Error('Error');

      console.log({
        event,
        ['form.getValuesRecord()']: form.getValuesRecord(),
      });

      // alert('submitted yoooo ...');
    } catch (error) {
      console.log(error);

      // throw error;
      Promise.reject(error);
    }
  };

  return (
    <div>
      <form
        class="state-form"
        onSubmit={(event) => {
          form.submit(event)(onSubmit);
        }}
        onReset={() => {
          form.reset();
        }}
        onClick={(event) => {
          const target = event.target as HTMLElement;
          const dataset = target.dataset;
          const resetFieldName = dataset.resetFieldName;

          resetFieldName && form.resetField(resetFieldName);
        }}
      >
        <fieldset
          class="state-form__fieldset"
          disabled={form?.isSubmitting?.()}
        >
          <legend>Send a letter</legend>

          <div class="input">
            <input
              class="input__field"
              type="text"
              placeholder="Login"
              name={loginField().name}
              value={loginField().getValue()}
              onBlur={() => {
                loginField().onBlur();
              }}
              onChange={(event) => {
                loginField().onChange(event.target.value);
              }}
            />
            <button
              type="button"
              class="input__reset-button"
              data-reset-field-name={loginField().name}
            >
              x
            </button>
          </div>

          <div class="input">
            <input
              class="input__field"
              type="password"
              placeholder="Password"
              name={passwordField().name}
              value={passwordField().getValue()}
              onBlur={() => {
                passwordField().onBlur();
              }}
              onChange={(event) => {
                passwordField().onChange(event.target.value);
              }}
            />

            <button
              type="button"
              class="input__reset-button"
              data-reset-field-name={passwordField().name}
            >
              x
            </button>
          </div>

          <button type="submit">Submit</button>

          <button type="reset">Reset</button>
        </fieldset>
      </form>

      <hr />

      <FormData record={form.getValuesRecord()} />
      <FormState
        record={{
          isDirty: form?.isDirty?.(),
          isTouched: form?.isTouched?.(),
          isSubmitted: form?.isSubmitted?.(),
          isSubmitSuccessful: form?.isSubmitSuccessful?.(),
          isSubmitting: form?.isSubmitting?.(),
          submitCount: form?.getSubmitCount?.(),
        }}
      />
    </div>
  );
};
