import {
  OsfObservable,
  OsfPresenter,
  OsfView,
  IOsfRenderable,
  IOsfView,
  IOsfPresenter,
  IOsfCollectionView,
} from './internal';

/**
 * Renders provided Views and Presenters inside specified DOM element.
 */
export class OsfRegion extends OsfObservable {
  /**
   * DOM element used as container.
   */
  protected el?: Element;

  /**
   * Currently rendered View.
   */
  public view: IOsfView | IOsfCollectionView<any> | null = null;

  /**
   * Currently rendered Presenter.
   */
  public presenter: IOsfPresenter<any, any> | null = null;

  /**
   * Parent View that uses this region
   */
  protected readonly parent: IOsfRenderable;

  /**
   * CSS selector pointing to the container (this.el) from parent View root (this.parent.el).
   */
  protected readonly selector: string;

  /**
   * @param parent - a View instantiating the Region
   * @param selector - CSS selector to container element
   */
  constructor(parent: IOsfRenderable, selector: string) {
    super();
    this.parent = parent;
    this.selector = selector;
  }

  /**
   * Display provided View or Presenter inside the Region.
   *
   * @param thingToRender - View or Controller to display
   */
  public async show(thingToRender: IOsfRenderable): Promise<void> {
    // Initialize this.el if necessary
    if (!this.el) {
      const el = this.parent.el?.querySelector(this.selector);
      if (el) {
        this.el = el;
      } else {
        throw new Error(`[OSF] Region selector "${this.selector}" not found`);
      }
    }
    // Perform render
    if (thingToRender instanceof OsfView) {
      const view = thingToRender;
      if (this.el) {
        await view.init();
        if (view.el) {
          this.empty();
          this.view = view;
          this.el.append(view.el);
        }
      } else {
        throw new Error('[OSF] Region.el is not set');
      }
    } else if (thingToRender instanceof OsfPresenter) {
      const presenter = thingToRender;
      await presenter.init();
      await presenter.view.init();
      if (this.el) {
        this.empty();
        this.presenter = presenter;
        this.view = presenter.view;
        this.el.append(presenter.view.el);
      } else {
        throw new Error('[OSF] Region.el is not set');
      }
    } else {
      throw new Error('[OSF] Region cannot display passed entity');
    }
  }

  /**
   * Remove currently rendered Presenter/View.
   */
  public empty(): void {
    if (this.presenter) {
      this.presenter.remove();
      this.presenter = null;
    }
    if (this.view) {
      this.view.remove();
      this.view = null;
    }
  }
}
