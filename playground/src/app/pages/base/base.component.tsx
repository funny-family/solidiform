import './base.styles.css';
import {
  createForm,
  transformReturnValue,
  type CreateFormReturnRecord,
} from '../../../../../src';
import { createEffect } from 'solid-js';
import { MenuItem, Select } from '@suid/material';

var useForm = () => {
  return transformReturnValue<CreateFormReturnRecord>(createForm());
};

var FormData = (props: { record: Record<string, any> }) => {
  return <pre>{JSON.stringify(props.record, null, 2)}</pre>;
};

export var Base = () => {
  var form = useForm();
  // @ts-expect-error
  console.log((window.form = form));

  var emailField = form.register('email', '');
  var budgetField = form.register('budget', '');
  var expertiseField = form.register('expertise', '');
  var numberField = form.register('number', 0);
  var detailsField = form.register('details', '');
  var agreeField = form.register('agree', false);

  var onSubmit = async (event: Event) => {
    console.log({ event, ['form.getValues()']: form.getValues() });

    // alert('submitted yoooo ...');
  };

  createEffect(() => {
    console.log('emailField():', emailField());
    window.emailField = emailField;
  });

  return (
    <div>
      <form
        class="base-form"
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
        <fieldset class="base-form__fieldset" disabled={false}>
          <legend>Send a letter</legend>

          <div class="input">
            <input
              class="input__field"
              type="email"
              placeholder="E-mail"
              name={emailField().name}
              value={emailField().getValue()}
              onBlur={() => {
                emailField().onBlur();
              }}
              onChange={(event) => {
                emailField().onChange(event.target.value);
              }}
            />
            <button
              type="button"
              class="input__reset-button"
              data-reset-field-name={emailField().name}
            >
              x
            </button>
          </div>

          <div class="input">
            <input
              class="input__field"
              type="text"
              placeholder="Budget"
              name={budgetField().name}
              value={budgetField().getValue()}
              onBlur={() => {
                budgetField().onBlur();
              }}
              onChange={(event) => {
                budgetField().onChange(event.target.value);
              }}
            />

            <button
              type="button"
              class="input__reset-button"
              data-reset-field-name={budgetField().name}
            >
              x
            </button>
          </div>

          <div class="input">
            <input
              class="input__field"
              type="text"
              placeholder="Required expertise"
              name={expertiseField().name}
              value={expertiseField().getValue()}
              onBlur={() => {
                expertiseField().onBlur();
              }}
              onChange={(event) => {
                expertiseField().onChange(event.target.value);
              }}
            />

            <button
              type="button"
              class="input__reset-button"
              data-reset-field-name={expertiseField().name}
            >
              x
            </button>
          </div>

          <div class="input">
            <Select
              class="input__field"
              label="Number"
              defaultValue={form.getDefaultValue(numberField().name)}
              value={numberField().getValue()}
              name={numberField().name}
              onBlur={() => {
                numberField().onBlur();
              }}
              onChange={(event) => {
                numberField().onChange(event.target.value);
              }}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={30}>30</MenuItem>
            </Select>

            <button
              type="button"
              class="input__reset-button"
              data-reset-field-name={numberField().name}
            >
              x
            </button>
          </div>

          <div class="input">
            <textarea
              class="input__field"
              placeholder="Other details and questions"
              id=""
              name={detailsField().name}
              value={detailsField().getValue()}
              onBlur={() => {
                detailsField().onBlur();
              }}
              onChange={(event) => {
                detailsField().onChange(event.target.value);
              }}
            />

            <button
              type="button"
              class="input__reset-button"
              data-reset-field-name={detailsField().name}
            >
              x
            </button>
          </div>

          <div>
            <div class="input">
              <label for="bf674">I agree bla, bla, bla, bla...</label>
              <input
                type="checkbox"
                id="bf674"
                name={agreeField().name}
                checked={agreeField().getValue()}
                onBlur={() => {
                  agreeField().onBlur();
                }}
                onChange={(event) => {
                  agreeField().onChange(event.target.checked);
                }}
              />
            </div>

            <button
              type="button"
              class="input__reset-button"
              data-reset-field-name={agreeField().name}
            >
              x
            </button>
          </div>

          <button type="submit">Submit</button>

          <button type="reset">Reset</button>
        </fieldset>
      </form>

      <hr />

      <FormData record={form.getValues()} />
    </div>
  );
};
