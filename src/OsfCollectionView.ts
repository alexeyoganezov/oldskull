import {
  OsfView,
  IOsfReference,
  IOsfEventListener,
  IOsfModel,
  IOsfModelView,
  IOsfView,
  IOsfCollection,
} from './internal';

export interface IOsfCollectionView<M extends IOsfModel<object>> extends IOsfView {
  init(): Promise<string>
  addChildView(models: M | M[]): Promise<void>
  removeChildView(modelId: any): void
  removeAllChildViews(): void
  handleMount(): void
  filterFunc?: (models: M[]) => M[]
  sortFunc?: (models: M[]) => M[]
}

/**
 * Creates a container element and renders Models from a Collection there.
 */
export class OsfCollectionView<
    M extends IOsfModel<object>,
    CV extends IOsfModelView<M>,
    EV extends IOsfView = OsfView,
  > extends OsfView implements IOsfCollectionView<M> {
  /**
   * A Collection with Models to render.
   */
  protected readonly collection: IOsfCollection<M>;

  /**
   * ModelView to use.
   */
  protected readonly ChildView: { new(model: M): CV };

  /**
   * View to render when there is nothing to render.
   */
  protected readonly EmptyView?: { new(): EV };

  /**
   * An instance of currently rendered EmptyView.
   * Can be used as a flag indicating whether EmptyView is displayed at the moment.
   */
  protected displayedEmptyView: EV | null = null;

  /**
   * Rendered ModelViews.
   */
  protected children: CV[] = [];

  /**
   * Optional Reference to a child Element where
   * child Views should be added.
   */
  protected childViewContainer?: IOsfReference<Element>;

  /**
   * A list of Collection events and their handlers.
   */
  protected readonly collectionEvents: IOsfEventListener[] = [];

  /**
   * A list of child view events and their handlers.
   */
  protected readonly viewEvents: IOsfEventListener[] = [];

  /**
   * How to filter Models before render
   *
   * @param models - A list of models to filter
   */
  public filterFunc?: (models: M[]) => M[];

  /**
   * How to sort Models before render
   *
   * @param models - A list of models to sort
   */
  public sortFunc?: (models: M[]) => M[];

  constructor(
    collection: IOsfCollection<M>,
    ChildView: { new(model: M): CV },
    EmptyView?: { new(): EV },
  ) {
    super();
    this.collection = collection;
    this.ChildView = ChildView;
    if (EmptyView) {
      this.EmptyView = EmptyView;
    }
  }

  /**
   * Get default markup for container element.
   * Overwrite it in child classes when it doesn't suit your needs.
   */
  getHTML(): string {
    return '<div></div>';
  }

  /**
   * Create container element and render Collection inside.
   *
   * @return HTML of created DOM subtree
   */
  public async init(): Promise<string> {
    await this.handleBeforeInit();
    // Create container
    const html = this.getHTML();
    this.createElement(html);
    // Process models
    let modelsToRender = this.collection.models;
    if (this.filterFunc) {
      modelsToRender = this.filterFunc(modelsToRender);
    }
    if (this.sortFunc) {
      modelsToRender = this.sortFunc(modelsToRender);
    }
    // Initialize children
    if (modelsToRender.length === 0 && this.EmptyView) {
      await this.showEmptyView();
    } else {
      await this.addChildView(modelsToRender);
    }
    //
    this.handleMount();
    await this.handleAfterInit();
    return this.el ? this.el.outerHTML : html;
  }

  /**
   * Render EmptyView.
   */
  protected async showEmptyView() {
    if (!this.EmptyView) return;
    const view = new this.EmptyView();
    await view.init();
    const container = this.childViewContainer ? this.childViewContainer.get() : this.el;
    if (view.el && container) {
      container.append(view.el);
      this.displayedEmptyView = view;
    }
  }

  /**
   * Remove displayed EmptyView.
   */
  protected async hideEmptyView() {
    this.displayedEmptyView?.remove();
    this.displayedEmptyView = null;
  }

  /**
   * Create and append one or several ModelViews.
   *
   * @param models - Model(s) to render
   */
  public async addChildView(models: M | M[]): Promise<void> {
    if (this.displayedEmptyView) {
      this.hideEmptyView();
    }
    if (Array.isArray(models)) {
      const offset = this.children.length;
      const promises = models.map(async (model) => {
        const view = new this.ChildView(model);
        await view.handleBeforeInit();
        this.children.push(view);
        return view.getHTML();
      });
      const htmls = await Promise.all(promises);
      const html = htmls.join('');
      if (this.el) {
        const container = this.childViewContainer ? this.childViewContainer.get() : this.el;
        if (container) {
          container.insertAdjacentHTML('beforeend', html);
          const lastChildIndex = this.children.length;
          for (let i = offset; i < lastChildIndex; i += 1) {
            const childView = this.children[i];
            childView.mountTo(this.el.children[i]);
            childView.handleAfterInit();
            this.subscribeToView(childView);
          }
        } else {
          throw new Error('[OSF] Container element was not found');
        }
      } else {
        throw new Error('[OSF] Cannot add child view without this.el set');
      }
    } else {
      const view = new this.ChildView(models);
      this.subscribeToView(view);
      await view.init();
      this.children.push(view);
      const container = this.childViewContainer ? this.childViewContainer.get() : this.el;
      if (container && view.el) {
        container.append(view.el);
      }
    }
  }

  /**
   * Remove ModelView of specified Model.
   *
   * @param modelId - Model to remove
   */
  public removeChildView(modelId: any): void {
    const viewToRemove = this.children.find((view) => view.model.getId() === modelId);
    if (viewToRemove) {
      viewToRemove.remove();
      this.children = this.children.filter((el) => el !== viewToRemove);
    }
  }

  /**
   * Remove all rendered ModelViews
   */
  public removeAllChildViews(): void {
    this.children.forEach((childView) => {
      childView.remove();
      this.unsubscribeFromView(childView);
    });
    this.children = [];
  }

  /**
   * Process container element creation.
   */
  public handleMount(): void {
    this.collectionEvents.forEach((e) => {
      this.collection.on(e.on, e.call, this);
    });
  }

  /**
   * Start to listen and handle viewEvents on a View
   */
  protected subscribeToView(view: CV): void {
    this.viewEvents.forEach((handler) => {
      view.on(handler.on, handler.call, this);
    });
  }

  /**
   * Stop to listen and handle viewEvents on a View
   */
  protected unsubscribeFromView(view: CV): void {
    this.viewEvents.forEach((handler) => {
      view.off(handler.on, handler.call);
    });
  }
}
