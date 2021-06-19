# Old Skull Framework

New front-end framework for old software developers. 🧙‍♂️

Features:

- Written in TypeScript (strict mode) using OOP
- Implements Model-View-Presenter architecture
- Relies on Observer design pattern for communication
- Smaller and faster than mainstream frameworks
- Fully covered by documentation
- Provides direct access to DOM
- Has no dependencies

## Contents

- [Motivation](#motivation)
- [Overview](#overview)
- [Installation](#installation)
- [Classes:](#classes)
  - [Observable](#observable)
  - [Renderable](#renderable)
  - [View](#view)
  - [Model](#model)
  - [ModelView](#modelview)
  - [Collection](#collection)
  - [CollectionView](#collectionview)
  - [Presenter](#presenter)
  - [Region](#region)
  - [Reference](#reference)
  - [Application](#application)
- [FAQ:](#faq)
  - [Can it be used in production?](#can-it-be-used-in-production)
  - [Does it support server-side rendering?](#does-it-support-server-side-rendering)
  - [Are there UI kits for it?](#are-there-ui-kits-for-it)

## Motivation

Development of web-interfaces should be simple and accessible to
any kind of developers.
It's not rocket science, it's just lists and forms implemented by
platform widgets.

Somehow modern front-end frameworks don't offer that. Instead they:

- Impose [new syntax](https://reactjs.org/docs/introducing-jsx.html) not compatible with language specification

- Hide high-level platform abstraction with [even more high-level abstraction](https://reactjs.org/docs/faq-internals.html)

- Replace successful well-known paradigms with [weird and unobvious one](https://reactjs.org/docs/hooks-intro.html)

I think all of that is unnecessary and "Old Skull Framework" is developed to prove it.

## Overview

As was mentioned before `oldskull` implements Model-View-Presenter architecture.
It means UI logic is always divided into three loosely coupled parts:

- Model stores and manages data
- View displays that data and handles user input
- Presenter acts as an intermediary between them

This architecture is implemented as a set of classes: `OsfView`,
`OsfModel`, `OsfModelView`, `OsfCollection`, `OsfCollectionView` and
`OsfPresenter`

`OsfView` creates and manages DOM structures:

```typescript
import { OsfView } from 'oldskull';

class TaskView extends OsfView {
  getHTML() {
    return `
      <div class="task">
        <h2>Example task</h2>
        <button class="btn btn-complete">
          Complete
        </button>
      </div>
    `;
  }
  domEvents = [
    {
      el: '.btn-complete',
      on: 'click',
      call: this.markAsCompleted.bind(this),
    },
  ];
  markAsCompleted() {
    // ...
  }
}

const taskView = new TaskView();
await taskView.init();
```

`OsfModel` wraps data and implements business logic:

```typescript
import { OsfModel } from 'oldskull';

interface ITask {
  id: number;
  name: string;
  isCompleted: boolean;
}

class TaskModel extends OsfModel<ITask> {
  switchStatus() {
    // ...
  }
}

const taskModel = new TaskModel({
  id: 1,
  name: 'Go for a walk',
  isCompleted: false,
});
```

`OsfModelView` is a `OsfView` that's able to display a Model and handles its events:

```typescript
import { OsfModelView, MODEL_CHANGED_EVENT } from 'oldskull';

class TaskView extends OsfModelView<TaskModel> {
  getHTML() {
    const task = this.model.attrs;
    return `
      <div class="task">
        <h2>${ task.name }</h2>
      </div>
    `;
  }
  modelEvents = [
    {
      on: MODEL_CHANGED_EVENT,
      call: this.handleModelChange.bind(this)
    },
  ];
  handleModelChange() {
    // ...
  }
}

const taskView = TaskView(taskModel);
await taskView.init();
```

`OsfCollection` is just a set of Models that can be rendered by `OsfCollectionView`:

```typescript
import { OsfCollection, OsfCollectionView } from 'oldskull';

class TaskCollection extends OsfCollection<TaskModel> {
  // Nothing's here for now
}

const tasks = new TaskCollection([
  new TaskModel({ id: 1, name: 'Do this', isCompleted: false }),
  new TaskModel({ id: 2, name: 'Do that', isCompleted: false }),
]);

class TaskListView extends OsfCollectionView<TaskModel, TaskView, NoTasksView> {
  constructor(collection: OsfCollection<TaskModel>) {
    super(collection, TaskView, NoTasksView);
  }
  getHTML() {
    return '<div class="tasks"></div>';
  }
}

const taskListView = new TaskListView(tasks);
await taskListView.init();
```

`OsfPresenter` creates and manages a Model/View pair:

```typescript
import { OsfPresenter } from 'oldskull';

class TaskPresenter extends OsfPresenter<TaskModel, TaskView> {
    model = new TaskModel();
    view = new TaskView(this.model);
    viewEvents = [
      {
        on: 'completed',
        call: this.handleViewCompleted.bind(this),
      },
    ];
    modelEvents = [
      {
        on: 'change isCompleted',
        call: this.handleModelStatusChange.bind(this),
      },
    ];
    async beforeInit() {
      // Model initialization here
    }
    handleViewCompleted() {
      // Update a value in Model
    }
    handleModelStatusChange() {
      // Call a View method that updates displayed status
    }
}

const taskPresenter = new TaskPresenter();
await taskPresenter.init();
```

Below you will find detailed documentation on all mentioned classes
and a few others that allow you to:

- Define application entry point: `OsfApplication`
- Nest and switch Views: `OsfRegion`
- Trigger and listen custom events: `OsfObservable`

See also:

- [Benchmark results](https://krausest.github.io/js-framework-benchmark/index.html)
- [Application example](https://github.com/alexeyoganezov/oldskull-realworld) (WIP)

## Installation

yarn: `yarn add oldskull`

npm: `npm install oldskull --save`

It's highly recommended to import all the `oldskull` entities inside of
your project and re-export them for internal use:

```typescript
// ./utils/framework/index.ts

import {
  OsfRenderable,
  IOsfRenderable,
  OsfObservable,
  IOsfObservable,
  OsfView,
  IOsfView,
  OsfModel,
  IOsfModel,
  OsfModelView,
  IOsfModelView,
  OsfCollection,
  IOsfCollection,
  OsfCollectionView,
  IOsfCollectionView,
  OsfPresenter,
  IOsfPresenter,
  OsfApplication,
  OsfRegion,
  OsfReference,
  ALL_EVENTS,
  MODEL_CHANGED_EVENT,
  MODEL_ADDED_EVENT,
  MODEL_REMOVED_EVENT,
  COLLECTION_RESETED_EVENT,
} from 'oldskull';

export {
  OsfRenderable as Renderable,
  IOsfRenderable as IRenderable,
  OsfObservable as Observable,
  IOsfObservable as IObservable,
  OsfView as View,
  IOsfView as IView,
  OsfModel as Model,
  IOsfModel as IModel,
  OsfModelView as ModelView,
  IOsfModelView as IModelView,
  OsfCollection as Collection,
  IOsfCollection as ICollection,
  OsfCollectionView as CollectionView,
  IOsfCollectionView as ICollectionView,
  OsfPresenter as Presenter,
  IOsfPresenter as IPresenter,
  OsfApplication as Application,
  OsfRegion as Region,
  OsfReference as Reference,
  ALL_EVENTS,
  MODEL_CHANGED_EVENT,
  MODEL_ADDED_EVENT,
  MODEL_REMOVED_EVENT,
  COLLECTION_RESETED_EVENT,
};
```

This way you can always easily extend or override functionality of
core classes afterwards without messing with each and every
child class definition.

## Classes

### Observable

`OsfObservable` class implements [Observer](https://en.wikipedia.org/wiki/Observer_pattern) design pattern.

Objects of this class can trigger events with optional payload,
other objects can listen and handle those events.

```typescript
import { OsfObservable } from 'oldskull';

const NEW_LETTER = 'NEW_LETTER';

class Mailbox extends OsfObservable {
  add(letter: string) {
    this.trigger(NEW_LETTER, letter);
  }
}

const mailbox = new Mailbox();

mailbox.on(NEW_LETTER, (data: unknown) => {
  const letter = <string>data;
  console.log('New letter: ', letter);
});
```

Almost all `oldskull` classes already extend `OsfObservable` and able to trigger events.

An event can be triggered with or without a payload of any type:

```typescript
this.trigger('eventName');

this.trigger('eventName', {
  // ...
});

this.trigger('eventName', 'eventDescription');
```

To add an event handler use `on` method:

```typescript
function eventHandler(payload: unknown) {
  // ...
}

somethingObservable.on('eventName', eventHandler);
```

To remove an event handler use `off` method:

```typescript
somethingObservable.off('eventName', eventHandler);
```

There is also a special method that simplifies the case when
observable object needs to retrigger an event from other observable:

```typescript
// in a method of custom observable class
somethingObservable.on(ALL_EVENTS, this.retrigger.bind(this));
```

Retriggering is often happens in `OsfCollectionView` (described below)
to pass events from child Views to proper handler in a parent:

```typescript
class ExampleCollectionView extends OsfCollectionView {
  // ...
  viewEvents = [
    { on: ALL_EVENTS, call: this.retrigger.bind(this) },
  ];
}
```

### Renderable

`OsfRenderable` is a base class for all renderable entities like
`OsfView`, `OsfModelView`, `OsfCollectionView`, `OsfPresenter` and
`OsfApplication`.

Classes that extend it have:

 - `el` property containing created HTML
 [Element](https://developer.mozilla.org/en-US/docs/Web/API/Element)

- `async init()` method that creates and initializes `el`.

- Hook methods `beforeInit()` and `afterInit()` that are called once on first `init()` call.

- `remove()` method that removes `el` from DOM end performs finalization.

- Hook methods `beforeRemove()` and `afterRemove()` that are called on each `remove()` call.

By default all hooks methods does nothing and meant to be overwritten by child classes:

```typescript
class MyView extends View {
  // ...
  async beforeInit() {
    // right before this.el creation and initialization
  }
  async afterInit() {
    // right after this.el creation and initialization
  }
  addOpacity() {
    this.el?.style.opacity = 0.5;
  }
  async beforeRemove() {
    // right before this.el removed
  }
  async afterRemove() {
    // right after this.el removed
  }
}

// Create Element
const myView = new MyView();
await myView.init();

// Do something with it
document.body.append(myView.el);

// And remove it when it's no longer needed
myView.remove();
```

### View

`OsfView` class creates and manages DOM structures.

To define a desired DOM structure implement `getHTML()` method returning HTML string:

```typescript
import { OsfView } from 'oldskull';

class GreetingView extends OsfView {
  getHTML() {
    return `
      <div class="greeting">
        <h1>Hello</h1>
        <p>How are you?</p>
      </div>
    `;
  }
}
```

Any view has `init()`/`remove()` methods, `el` property with created
Element and lifecycle hooks. See `OsfRenderable` class for details.

Views can listen to DOM events and handle them:

```typescript
class HeaderView extends OsfView {
  getHTML() {
    return `
      <div class="header">
        <button class="btn-logout">
          Log out
        </button>
      </div>
    `;
  }
  domEvents = [
    {
      el: '.btn-logout',
      on: 'click',
      call: this.handleLogout.bind(this),
    },
  ];
  handleLogout(event: Event) {
    // ...
  }
}
```

Views should be responsible only for UI displaying and user input handling.
Data management and any other kind of business logic should happen outside.

### Model

`OsfModel` class encapsulates your data and provides common API for its management.

Preferable way of defining Models is class inheritance:

```typescript
import { OsfModel } from 'oldskull';

interface ITask {
  id: number;
  name: string;
}

class TaskModel extends OsfModel<ITask> {
  // Implement task specific methods here
  // or leave it empty for now
}

const taskModel = new TaskModel({
  id: 1,
  name: 'Example task',
});
```

You can avoid class creation and rely on generics but this way
you will lose an important ability to add common Model functionality
without mass code refactoring:

```typescript
const task = new OsfModel<ITask>({
  id: 1,
  name: 'Example task',
});
```

If you want to be able to create Model instances with default values
you can overwrite Model constructor:

```typescript
class TaskModel extends OsfModel<ITask> {
  constructor(attrs?: ITask) {
    super();
    this.attrs = attrs || {
      id: 0,
      name: '',
    };
  }
}

const taskModel = new TaskModel();
```

Model attributes (`this.attrs`) is our data managed by the Model.
You can read directly from it but must avoid writing to it:

```typescript
const taskModel = new TaskModel();
console.log(`Task id is `, taskModel.attrs.id);
```

To modify attributes you should use `set()` or `setAttribute()` methods
that automatically trigger Model change events with model entity
as a payload:

```typescript
const taskModel = new TaskModel();

// Handle all model changes
taskModel.on('change', (data: unknown) => {
  const taskModel = <TaskModel>data;
  console.log('The task was changed:', taskModel);
});

// Handle only "name" attribute changes
taskModel.on('change name', (data: unknown) => {
  const taskModel = <TaskModel>data;
  console.log('The task name was changed:', taskModel.attrs.name);
});

// Update all attribute values
taskModel.set({ id: 1, name: 'First task' });

// Update single attribute value
taskModel.setAttribute('name', 'foobar');
```

When you're manually adding event handlers
(not via `modelEvents`/`viewEvents`)
don't forget to remove them later, not doing so can cause memory leaks.

Instead of writing `'change'` string each time you can use
`MODEL_CHANGED_EVENT` variable with the same value:

```typescript
import { MODEL_CHANGED_EVENT } from 'oldskull';

taskModel.on(MODEL_CHANGED_EVENT, (data: unknown) => {
  // ...
});
```

If you plan to use a Model inside a Collection you should implement
`getId()` method that returns unique id of the entity:

```typescript
class TaskModel extends OsfModel<ITask> {
  getId(): number {
    return this.attrs.id;
  }
}
```

### ModelView

`OsfModelView` is an extended `OsfView` that's able to display Model attributes:

```typescript
import { OsfModelView } from 'oldskull';

class TaskView extends OsfModelView<TaskModel> {
  getHTML() {
    const task = this.model.attrs;
    return `
      <div class="task">
        <h2>${ task.name }</h2>
      </div>
    `;
  }
}
```

Make sure you perform XSS sanitization of untrusted fields
using [DOMPurify](https://github.com/cure53/DOMPurify) or
similar tools.

ModelView also can listen and handle Model events:

```typescript
import { OsfModelView, MODEL_CHANGED_EVENT } from 'oldskull';

class TaskView extends OsfModelView<TaskModel> {
  getHTML() {
    // ...
  }
  modelEvents = [
    {
      on: MODEL_CHANGED_EVENT,
      call: this.handleModelChange.bind(this),
    },
  ];
  handleModelChange() {
    // ...
  }
}
```

This way of model event handling is fine but use of `OsfPresenter` is preferable.

### Collection

`OsfCollection` class encapsulates a set of Models and provides an API
for its management.

```typescript
import { OsfCollection } from 'oldskull';

class TaskCollection extends OsfCollection<TaskModel> {
  // Nothing's here for now
}

const taskCollection = new TaskCollection([
  new TaskModel({ id: 1, name: 'Do this'}),
  new TaskModel({ id: 2, name: 'Do that'}),
]);
```

Collections as child classes may look unnecessary at first but it
becomes very useful when you start to implement entity-specific logic
like loading items from server.

You can add and remove Models from a Collection and handle those events:

```typescript
const taskCollection = new OsfCollection<TaskModel>();

taskCollection.on(MODEL_ADDED_EVENT, (payload: unknown) => {
  const task = <TaskModel>payload;
  console.log('Task was added:', task);
});

taskCollection.on(MODEL_REMOVED_EVENT, (payload: unknown) => {
  const task = <TaskModel>payload;
  console.log('Task was removed:', task);
});

taskCollection.on(COLLECTION_RESETED_EVENT, () => {
  console.log('All tasks was replaced');
});

// Add a model
taskCollection.add(taskModel0);

// Add a set of tasks
taskCollection.add([ taskModel1, taskModel2, taskModel3 ]);

// Remove a model by id
taskCollection.remove(1);

// Set array of models
// Already stored taskModel3 will be merged with provided
// Other models will be removed
taskCollection.set([taskModel3]);

// Reset array of models
// Skips merging and triggering model removal events
// Just overwrites Model array and triggers reset event
taskCollection.set([taskModel2]);
```

You can get specific Model from Collection by providing a Model id:

```typescript
const taskModel = taskCollection.get(2);
```

It's possible to access Models directly by using `models` property
but try to avoid it when possible:

```typescript
const taskModel =
    taskCollection.models.find(model => model.attrs.id === 2);
```

### CollectionView

`OsfCollectionView` class is a View that creates a container Element and
inside of it renders Models from a Collection using provided
`OsfModelView`.

If a Collection has no Models then other View called
"EmptyView" can rendered instead.

Default container element is `<div></div>` but you can change it by
overwriting `getHTML()` method:

```typescript
import { OsfCollectionView } from 'oldskull';

class TaskListView extends OsfCollectionView<TaskModel, TaskView, NoTasksView> {
  constructor(collection: OsfCollection<TaskModel>) {
    super(collection, TaskView, NoTasksView);
  }
  getHTML(): string {
    return '<div class="tasks"></div>';
  }
}

class NoTasksView extends OsfView {
  // ...
}

const taskListView = new TaskListView(tasks);
await taskListView.init();
```

CollectionView can listen to events from a Collection and child Views:

```typescript
class TaskListView extends OsfCollectionView<TaskModel, TaskView, NoTasksView> {
  collectionEvents = [
    {
      on: MODEL_ADDED_EVENT,
      call: this.addChildView.bind(this),
    },
  ]
  viewEvents = [
    {
      on: 'completed',
      call: this.handleViewCompleted.bind(this),
    },
  ]
  handleViewCompleted() {
    // ...
  }
}
```

There are three methods for managing Views inside a CollectionView:

- `addChildView(modelOrArrayOfModels)` adds a ModelView that renders provided Model(s)

- `removeChildView(modelId)` removes a ModelView that renders a model
with specified id

- `removeAllChildViews()` removes all rendered ModelViews

Set `filterFunc` and `sortFunc` properties on a CollectionView to filter
and sort models before rendering:

```typescript
class TaskListView extends OsfCollectionView<TaskModel, TaskView, NoTasksView> {
  filterFunc = (models) => models.filter((m) => m.attrs.name !== '');
  sortFunc = (models) => models.reverse();
}
```

### Presenter

`OsfPresenter` class is responsible for creation and initialization of a
Model/View pair and handling of their events:

```typescript
import { OsfPresenter } from 'oldskull';

class TaskPresenter extends OsfPresenter<TaskModel, TaskView> {
  model = new TaskModel();
  view = new TaskView(this.model);
  viewEvents = [
    {
      on: 'completed',
      call: this.handleViewCompleted.bind(this),
    },
  ];
  modelEvents = [
    {
      on: 'change isCompleted',
      call: this.handleModelStatusChange.bind(this),
    },
  ];
  async beforeInit() {
    // Model initialization here
  }
  handleViewCompleted() {
    // Update a value in Model
  }
  handleModelStatusChange() {
    // Call a View method that updates displayed status
  }
}

const taskPresenter = new TaskPresenter();
await taskPresenter.init();

```

Presenter class extends `OsfRenderable` so you can make use of
lifecycle methods like `beforeInit`/`afterInit` to initialize
Model attributes and perform other necessary actions that are out
of Model/View scope.

### Reference

`OsfReference` is used in Views to get access to nested DOM Elements
that was rendered by them.

```typescript
import { OsfReference } from 'oldskull';

class LayoutView extends OsfView {
  getHTML() {
    return `
      <div class="root">
        <div class="header"></div>
        <div class="content"></div>
        <div class="footer"></div>
      </div>
    `;
  }
  content = new OsfReference<HTMLElement>(this, '.content');
  afterInit() {
    const contentEl = this.content.get();
    contentEl.classList.add('loaded');
  }
}
```

To create a Reference just pass a View and a CSS selector of the
needed element to the constructor and specify referenced element type
in generic.

Actual Element can be obtained by `get()` call.

### Region

`OsfRegion` allows to render Views and Presenters inside of specified
DOM Element that was rendered by the View:

```typescript
import { OsfRegion } from 'oldskull';

class LayoutView extends OsfView {
  getHTML() {
    return `
      <div class="page">
        <div class="header"></div>
        <div class="content"></div>
        <div class="footer"></div>
      </div>
    `;
  }
  headerRegion = new OsfRegion(this, '.header');
  contentRegion = new OsfRegion(this, '.content');
  footerRegion = new OsfRegion(this, '.footer');
  async afterInit() {
    await this.headerRegion.show(new HeaderView());
    await this.contentRegion.show(new ArticlesPresenter());
    await this.footerRegion.show(new FooterView());
  }
}
```

Region's constructor accepts a View and CSS selector of
an Element where is should be attached.

Region itself provides only two methods:

- `show(viewOrPresenter)` to display a renderable item
- `empty()` to remove what's currently rendered in the region

### Application

`OsfApplication` is a skaffold for an application entry point.

```typescript
import { OsfApplication } from 'oldskull';

export class MyApp extends OsfApplication {
  async init() {
    await this.mainRegion.show(new TaskListPresenter());
  }
}

const app = new MyApp('#root');
app.init();
```

It creates a `mainRegion` on the Element found by provided CSS selector
and expects you to implement `init()` method that performs application start.

For more thorough example see
[index.ts](https://github.com/alexeyoganezov/oldskull-realworld/blob/master/src/index.ts) from
[oldskull-realworld](https://github.com/alexeyoganezov/oldskull-realworld).

Usually initialization logic sets up:

- Router
- Global error handler
- Custom logger
- Page layout

## FAQ

### Can it be used in production?

Not yet.

Right now it's more like public beta so breaking changes still may
appear based on initial feedback.

### Does it support server-side rendering?

Not yet.

Draft SSR implementation showed that there is no way to implement it
in a more or less appropriate manner without dirty hacks, performance
penalties and code quality deterioration.

If you know how to make it possible without mentioned drawbacks
 feel free to tell us.

### Are there UI kits for it?

Not yet.

For now you can use CSS frameworks that apply styles to common elements
 via global styles or class usage.

If you plan to implement your own UI kit we recommend to try to make
it in a framework-agnostic way so it could be used without any
framework or with any other framework that doesn't hide DOM access.

### Isn't it just a [Marionette.js](https://marionettejs.com/) clone?

Well, it is. But at least it doesn't depend on Backbone/Underscore/JQuery
and written in TypeScript that's much more suitable for SPA development.
