import './nested.styles.css';
import { For } from 'solid-js';
import { createMutable } from 'solid-js/store';

export var Nested = () => {
  var contactFields = createMutable(new Array());

  return (
    <div>
      <form
        class="nested-form"
        onSubmit={(event) => {
          //
        }}
      >
        <fieldset class="nested-form__fieldset" disabled={false}>
          <legend>User</legend>
          <input type="text" placeholder="First name" />
          <input type="text" placeholder="Last name" />
          <button
            type="button"
            onClick={() => {
              //
            }}
          >
            Add contact
          </button>
          <fieldset>
            <legend>Contacts</legend>
            <For each={contactFields}>
              {(contactField) => {
                return (
                  <div class="contacts-form">
                    <input type="text" placeholder="Phone number" />
                    <input type="text" placeholder="WhatsApp login" />
                    <div>
                      <label for="hshg6745">24/7 available</label>
                      <input type="checkbox" id="hshg6745" />
                    </div>
                    <button
                      type="button"
                      class="contacts-form__delete-button"
                      onClick={() => {
                        //
                      }}
                    >
                      X
                    </button>
                  </div>
                );
              }}
            </For>
          </fieldset>
          <button type="submit">Submit</button>
        </fieldset>
      </form>
    </div>
  );
};
