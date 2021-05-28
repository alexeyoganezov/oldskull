import * as sinon from 'sinon';

import {
  OsfPresenter,
  OsfModel,
  OsfModelView,
  MODEL_CHANGED_EVENT,
} from './index';

interface IArticle {
  title: string;
  description: string;
}

class ArticleModel extends OsfModel<IArticle> {

}

class ArticleView extends OsfModelView<ArticleModel> {
  getHTML(): string {
    const article = this.model.attrs;
    return `
        <div>
          <h1>${article.title}</h1>
          <p>${article.description}</p>
        </div>
      `;
  }

  public triggerTestEvent() {
    this.trigger('test');
  }
}

test('OsfPresenter handles modelEvents', async () => {
  const callback = sinon.fake();
  class TestPresenter extends OsfPresenter<ArticleModel, ArticleView> {
    model = new ArticleModel({
      title: '',
      description: '',
    });

    view = new ArticleView(this.model);

    modelEvents = [
      { on: MODEL_CHANGED_EVENT, call: this.handleModelChange },
    ];

    handleModelChange() {
      callback();
    }
  }
  const presenter = new TestPresenter();
  await presenter.init();
  presenter.model.set({
    title: 'title',
    description: 'description',
  });
  expect(callback.callCount).toBe(1);
});

test('OsfPresenter handles viewEvents', async () => {
  const callback = sinon.fake();
  class TestPresenter extends OsfPresenter<ArticleModel, ArticleView> {
    model = new ArticleModel({
      title: '',
      description: '',
    });

    view = new ArticleView(this.model);

    viewEvents = [
      { on: 'test', call: this.handleTest },
    ];

    handleTest() {
      callback();
    }
  }
  const presenter = new TestPresenter();
  await presenter.init();
  presenter.view.triggerTestEvent();
  expect(callback.callCount).toBe(1);
});
