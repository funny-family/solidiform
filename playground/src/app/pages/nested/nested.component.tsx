import './nested.styles.css';
import { For } from 'solid-js';
import { createMutable, createStore } from 'solid-js/store';
import { createForm } from '../../../../../src';

export var Nested = () => {
  var form = createForm();
  console.dir((window.form = form));

  var firstNameField = form.register('first-name', '');
  var lastNameField = form.register('last-name', '');

  // var [contactFields, setContactFields] = createStore(new Array());

  var onSubmit = async (event: Event) => {
    console.log({ event, field: form.getValues() });
  };

  var i = 0;

  return (
    <div>
      <form
        class="nested-form"
        onSubmit={(event) => {
          form.submit(event)(onSubmit);
        }}
      >
        <fieldset class="nested-form__fieldset" disabled={false}>
          <legend>User</legend>
          <input
            type="text"
            placeholder="First name"
            name={firstNameField()?.name!}
            value={lastNameField()?.getValue?.()}
            onBlur={() => {
              firstNameField()?.onBlur?.();
            }}
            onChange={(event) => {
              firstNameField()?.onChange?.(event.target.value);
            }}
          />
          <input
            type="text"
            placeholder="Last name"
            name={lastNameField()?.name!}
            value={lastNameField()?.getValue?.()}
            onBlur={() => {
              lastNameField()?.onBlur?.();
            }}
            onChange={(event) => {
              lastNameField()?.onChange?.(event.target.value);
            }}
          />
          {/* <button
            type="button"
            onClick={() => {
              form.register(`contacts[]`, '');
            }}
          >
            Add contact
          </button> */}
          <fieldset>
            <legend>Contacts</legend>
            <For
              // each={[
              //   {
              //     'phone-number': form.register(`contacts[]`, '');,
              //     'whats-app-login': 1,
              //     'agree': 1,
              //   },
              // ]}
              each={Array.from({ length: 2 }, (value, index) => {
                return {
                  'phone-number': form.register(
                    `contacts[${index}]['phone-number']`,
                    ''
                  ),
                  'whats-app-login': form.register(
                    `contacts[${index}]['whats-app-login']`,
                    ''
                  ),
                  'agree': form.register(`contacts[${index}]['agree']`, false),
                };
              })}
            >
              {(field) => {
                console.log(field);

                return (
                  <div
                    class="contacts-form"
                    style={{ border: '1px solid black', padding: '10px' }}
                  >
                    <input
                      type="text"
                      placeholder="Phone number"
                      name={`${field['phone-number']?.()?.name!}`}
                      value={field['phone-number']?.()?.getValue?.()}
                      onBlur={() => {
                        field['phone-number']?.()?.onBlur?.();
                      }}
                      onChange={(event) => {
                        field['phone-number']?.()?.onChange?.(
                          event.target.value
                        );
                      }}
                    />
                    <input
                      type="text"
                      placeholder="WhatsApp login"
                      name={field['phone-number']?.()?.name!}
                      value={field['phone-number']?.()?.getValue?.()}
                      onBlur={() => {
                        field['phone-number']?.()?.onBlur?.();
                      }}
                      onChange={(event) => {
                        field['phone-number']?.()?.onChange?.(
                          event.target.value
                        );
                      }}
                    />
                    <div>
                      <label for="hshg6745">24/7 available</label>
                      <input
                        type="checkbox"
                        id="hshg6745"
                        name={field['agree']?.()?.name!}
                        checked={field['agree']?.()?.getValue?.()}
                        onBlur={() => {
                          field['agree']?.onBlur?.();
                        }}
                        onChange={(event) => {
                          field['agree']?.()?.onChange?.(event.target.checked);
                        }}
                      />
                    </div>
                    {/* <button
                      type="button"
                      class="contacts-form__delete-button"
                      onClick={() => {
                        //
                      }}
                    >
                      X
                    </button> */}
                  </div>
                );
              }}
            </For>
          </fieldset>
          <button type="submit">Submit</button>
        </fieldset>
      </form>

      <code>
        <pre>{JSON.stringify(form.getValues() || {}, null, 2)}</pre>
      </code>
    </div>
  );
};
