import {
  IOsfEventListener,
  OsfRenderable,
  IOsfModel,
  IOsfView,
} from './internal';

export interface IOsfPresenter<M extends IOsfModel<object>, V extends IOsfView> {
  model: M
  view: V
  init(): void
  remove(): void
}

/**
 * Intermediary between a Model and a View.
 */
export abstract class OsfPresenter<
    M extends IOsfModel<object>,
    V extends IOsfView,
  > extends OsfRenderable implements IOsfPresenter<M, V> {
  /**
   * Managed Model
   */
  public abstract readonly model: M;

  /**
   * Managed View
   */
  public abstract readonly view: V;

  /**
   * A list of Model events and their handlers.
   */
  protected readonly modelEvents: IOsfEventListener[] = [];

  /**
   * A list of View events and their handlers.
   */
  protected readonly viewEvents: IOsfEventListener[] = [];

  /**
   * Initialize event handlers.
   */
  public async init(): Promise<void> {
    await this.handleBeforeInit();
    this.modelEvents.forEach((handler) => {
      this.model.on(handler.on, handler.call);
    });
    this.viewEvents.forEach((handler) => {
      this.view.on(handler.on, handler.call);
    });
    await this.handleAfterInit();
  }

  /**
   * Remove managed View and event handlers.
   */
  public remove(): void {
    this.beforeRemove();
    this.modelEvents.forEach((handler) => {
      this.model.off(handler.on, handler.call);
    });
    this.viewEvents.forEach((handler) => {
      this.view.off(handler.on, handler.call);
    });
    this.view.remove();
    this.afterRemove();
  }
}
