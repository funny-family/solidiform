import './base.styles.css';

export var Base = () => {
  return (
    <div>
      <form
        class="base-form"
        onSubmit={(event) => {
          //
        }}
      >
        <fieldset class="base-form__fieldset" disabled={false}>
          <legend>Send a letter</legend>
          <input type="email" placeholder="E-mail" />
          <input type="text" placeholder="Budget" />
          <input type="text" placeholder="Required expertise" />
          <textarea placeholder="Other details and questions" name="" id="" />
          <div>
            <label for="bf674">I agree bla, bla, bla, bla...</label>
            <input type="checkbox" id="bf674" />
          </div>
          <button type="submit">Submit</button>
        </fieldset>
      </form>
    </div>
  );
};
