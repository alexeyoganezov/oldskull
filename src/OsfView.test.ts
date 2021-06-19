import * as sinon from 'sinon';

import { IOsfDomEventListener, OsfView } from './index';

test('OsfView creates HTML subtree from provided template', async () => {
  class TestView extends OsfView {
    getHTML(): string {
      return `
        <div class="container">
          <p class="text">Hello</p>
        </div>
      `;
    }
  }
  const view = new TestView();
  await view.init();
  expect(view.el?.tagName).toBe('DIV');
  expect(view.el?.getAttribute('class')).toBe('container');
  expect(view.el?.children[0].tagName).toBe('P');
  expect(view.el?.children[0].getAttribute('class')).toBe('text');
  expect(view.el?.children[0].textContent).toBe('Hello');
});

test('OsfView can render different Element subtypes', async () => {
  class TestView extends OsfView<HTMLInputElement> {
    getHTML(): string {
      return `<input class="input" type="text" value="hello">`;
    }
  }
  const view = new TestView();
  await view.init();
  expect(view.el?.tagName).toBe('INPUT');
  expect(view.el?.getAttribute('class')).toBe('input');
  expect(view.el?.value).toBe('hello');
});

test('OsfView calls beforeInit/afterInits hooks', async () => {
  const beforeInit = sinon.fake();
  const afterInit = sinon.fake();
  class TestView extends OsfView {
    getHTML(): string {
      return '<p>Hello</p>';
    }

    beforeInit(): void {
      beforeInit();
    }

    afterInit(): void {
      afterInit();
    }
  }
  const view = new TestView();
  await view.init();
  expect(beforeInit.callCount).toBe(1);
  expect(afterInit.callCount).toBe(1);
});

test('OsfView calls beforeInit/afterInits only once', async () => {
  const beforeInit = sinon.fake();
  const afterInit = sinon.fake();
  class TestView extends OsfView {
    getHTML(): string {
      return '<p>Hello</p>';
    }

    beforeInit(): void {
      beforeInit();
    }

    afterInit(): void {
      afterInit();
    }
  }
  const view = new TestView();
  await view.init();
  await view.init();
  expect(beforeInit.callCount).toBe(1);
  expect(afterInit.callCount).toBe(1);
});

test('OsfView handles domEvents on child elements', async () => {
  const callback = sinon.fake();
  class TestView extends OsfView {
    getHTML(): string {
      return `
        <div>
          <p>Hello</p>
        </div>
      `;
    }

    domEvents: IOsfDomEventListener[] = [
      {
        el: 'p', on: 'click', call: this.handleParagraphClick.bind(this),
      },
    ];

    handleParagraphClick() {
      callback();
    }
  }
  const view = new TestView();
  await view.init();
  const el = view.el?.querySelector('p');
  if (el) {
    el.click();
  }
  expect(callback.callCount).toBe(1);
});

test('OsfView handles domEvents on root element', async () => {
  const callback = sinon.fake();
  class TestView extends OsfView {
    getHTML(): string {
      return `
        <div>
          <p>Hello</p>
        </div>
      `;
    }
    domEvents = [
      {
        on: 'click', call: this.handleClick.bind(this),
      },
    ];
    handleClick() {
      callback();
    }
  }
  const view = new TestView();
  await view.init();
  const el = view.el?.querySelector('p');
  if (el) {
    el.click();
  }
  expect(callback.callCount).toBe(1);
});

test('OsfView calls beforeRemove/afterRemove hooks', async () => {
  const beforeRemove = sinon.fake();
  const afterRemove = sinon.fake();
  class TestView extends OsfView {
    getHTML(): string {
      return '<p>Hello</p>';
    }

    beforeRemove(): void {
      beforeRemove();
    }

    afterRemove(): void {
      afterRemove();
    }
  }
  const view = new TestView();
  await view.init();
  view.remove();
  expect(beforeRemove.callCount).toBe(1);
  expect(afterRemove.callCount).toBe(1);
});

test.todo('OsfView removes the subtree from DOM');

test.todo('OsfView can be mounted to existing DOM element');
