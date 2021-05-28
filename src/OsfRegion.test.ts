import {
  OsfRegion,
  OsfView,
  OsfCollectionView,
  OsfCollection,
  OsfModel,
  OsfModelView,
  OsfPresenter,
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
}

class MessageView extends OsfView {
  getHTML() {
    return '<p>message</p>';
  }
}

class NoItemsView extends OsfView {
  getHTML(): string {
    return '<div>No articles</div>';
  }
}

interface IItem {
  title: string;
  description: string;
}

class ItemModel extends OsfModel<IItem> {

}

class ItemView extends OsfModelView<ItemModel> {
  getHTML(): string {
    const item = this.model.attrs;
    return `
        <div>
          <h1>${item.title}</h1>
          <p>${item.description}</p>
        </div>
      `;
  }
}

class ItemsCollectionView extends OsfCollectionView<ItemModel, ItemView, NoItemsView> {
  getHTML(): string {
    return '<div class="list"></div>';
  }
}

test('OsfRegion performs mount on first "show" call', async () => {
  const view = new LayoutView();
  await view.init();
  const region = new OsfRegion(view, '#content');
  // @ts-ignore
  const el1 = region.el;
  expect(el1).toBe(undefined);
  await region.show(new MessageView());
  // @ts-ignore
  const el2 = region.el;
  expect(el2?.tagName).toBe('DIV');
  expect(el2?.id).toBe('content');
});

test('OsfRegion can display OsfView', async () => {
  const view = new LayoutView();
  await view.init();
  const region = new OsfRegion(view, '#content');
  await region.show(new MessageView());
  // @ts-ignore
  const el = region.el;
  expect(el?.children[0].tagName).toBe('P');
  expect(el?.children[0].textContent).toBe('message');
});

test('OsfRegion can display OsfCollectionView', async () => {
  const view = new LayoutView();
  await view.init();
  const region = new OsfRegion(view, '#content');
  const collection = new OsfCollection([
    new ItemModel({ title: 'One', description: 'Hello' }),
    new ItemModel({ title: 'Two', description: 'World' }),
  ]);
  const collectionView = new ItemsCollectionView(collection, ItemView, NoItemsView);
  await region.show(collectionView);
  // @ts-ignore
  const el = region.el;
  // First view
  expect(el?.children[0].children[0].children[0].tagName).toBe('H1');
  expect(el?.children[0].children[0].children[0].textContent).toBe('One');
  expect(el?.children[0].children[0].children[1].tagName).toBe('P');
  expect(el?.children[0].children[0].children[1].textContent).toBe('Hello');
  // Second view
  expect(el?.children[0].children[1].children[0].tagName).toBe('H1');
  expect(el?.children[0].children[1].children[0].textContent).toBe('Two');
  expect(el?.children[0].children[1].children[1].tagName).toBe('P');
  expect(el?.children[0].children[1].children[1].textContent).toBe('World');
});

test('OsfRegion can display OsfPresenter', async () => {
  const view = new LayoutView();
  await view.init();
  const region = new OsfRegion(view, '#content');
  const model = new ItemModel({
    title: 'title',
    description: 'description',
  });
  class TestPresenter extends OsfPresenter<ItemModel, ItemView> {
    model = model;

    view = new ItemView(this.model);
  }
  await region.show(new TestPresenter());
  // @ts-ignore
  const el = region.el;
  expect(el?.children[0].children[0].tagName).toBe('H1');
  expect(el?.children[0].children[0].textContent).toBe('title');
  expect(el?.children[0].children[1].tagName).toBe('P');
  expect(el?.children[0].children[1].textContent).toBe('description');
});

test('OsfRegion can empty its content', async () => {
  const view = new LayoutView();
  await view.init();
  const region = new OsfRegion(view, '#content');
  await region.show(new MessageView());
  region.empty();
  // @ts-ignore
  const el = region.el;
  expect(el?.children.length).toBe(0);
});
