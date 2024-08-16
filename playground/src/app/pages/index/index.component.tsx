import { type Component, type ParentProps } from 'solid-js';
import { A } from '@solidjs/router';

export var Index: Component<ParentProps> = (props) => {
  return (
    <main>
      <h1>Examples</h1>
      <ul>
        <li>
          <A href="/base">base</A>
        </li>
        <li>
          <A href="/nested">nested</A>
        </li>
      </ul>
      {props.children}
    </main>
  );
};
