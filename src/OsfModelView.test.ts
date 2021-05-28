import * as sinon from 'sinon';

import {
  OsfModelView,
  OsfModel,
  MODEL_CHANGED_EVENT,
} from './index';

interface IArticlePreview {
  title: string;
  description: string;
}

class ArticlePreviewModel extends OsfModel<IArticlePreview> {

}

test('OsfModelView creates HTML subtree from template', async () => {
  class TestView extends OsfModelView<ArticlePreviewModel> {
    getHTML(): string {
      const preview = this.model.attrs;
      return `
        <div>
          <h1>${preview.title}</h1>
          <p>${preview.description}</p>
        </div>
      `;
    }
  }
  const model = new ArticlePreviewModel({
    title: 'foo',
    description: 'bar',
  });
  const view = new TestView(model);
  await view.init();
  expect(view.el?.tagName).toBe('DIV');
  expect(view.el?.children[0].tagName).toBe('H1');
  expect(view.el?.children[0].textContent).toBe('foo');
  expect(view.el?.children[1].tagName).toBe('P');
  expect(view.el?.children[1].textContent).toBe('bar');
});

test('OsfModelView handles modelEvents', async () => {
  const callback = sinon.fake();
  const model = new ArticlePreviewModel({
    title: 'foo',
    description: 'bar',
  });
  class TestView extends OsfModelView<ArticlePreviewModel> {
    getHTML(): string {
      const preview = this.model.attrs;
      return `
        <div>
          <h1>${preview.title}</h1>
          <p>${preview.description}</p>
        </div>
      `;
    }

    modelEvents = [
      {
        on: MODEL_CHANGED_EVENT, call: callback,
      },
    ];
  }
  const view = new TestView(model);
  await view.init();
  model.set({
    title: 'one',
    description: 'two',
  });
  expect(callback.callCount).toBe(1);
  expect(callback.args[0][0].attrs).toStrictEqual({
    title: 'one',
    description: 'two',
  });
});

test('OsfModelView unsubscribes from modelEvents on removal', async () => {
  const callback = sinon.fake();
  const model = new ArticlePreviewModel({
    title: 'foo',
    description: 'bar',
  });
  class TestView extends OsfModelView<ArticlePreviewModel> {
    getHTML(): string {
      const preview = this.model.attrs;
      return `
        <div>
          <h1>${preview.title}</h1>
          <p>${preview.description}</p>
        </div>
      `;
    }

    modelEvents = [
      {
        on: MODEL_CHANGED_EVENT, call: callback,
      },
    ];
  }
  const view = new TestView(model);
  await view.init();
  // @ts-ignore
  expect(model.listeners[MODEL_CHANGED_EVENT].length).toBe(1);
  view.remove();
  // @ts-ignore
  expect(model.listeners[MODEL_CHANGED_EVENT].length).toBe(0);
});
