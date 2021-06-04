import {
  OsfView,
  OsfReference,
} from './index';

class LayoutView extends OsfView {
  getHTML() {
    return `
      <div id="wrapper">
          <div id="content">

          </div>
      </div>
    `;
  }
  content = new OsfReference<HTMLElement>(this, '#content');
}

test('OsfReference returns referenced element', async () => {
  const view = new LayoutView();
  await view.init();
  const el = view.content.get();
  expect(el?.tagName).toBe('DIV');
  expect(el?.id).toBe('content');
});

test.todo('OsfReference throws an error when element not found');
