import {
  OsfView,
  IOsfEventListener,
  IOsfModel,
  IOsfView,
} from './internal';

export interface IOsfModelView<M extends IOsfModel<object>> extends IOsfView {
  model: M
}

/**
 * A View that displays Model and processes its events.
 */
export abstract class OsfModelView<
    M extends IOsfModel<object>,
  > extends OsfView implements IOsfModelView<M> {
  /**
   * A Model to render
   */
  public readonly model: M;

  /**
   * A list of Model events and their handlers.
   */
  protected readonly modelEvents: IOsfEventListener[] = [];

  /**
   * @param model - Model instance to use by this view
   */
  constructor(model: M) {
    super();
    this.model = model;
  }

  /**
   * Initialize Model event handlers.
   */
  protected initModelEvents(): void {
    this.modelEvents.forEach((event) => {
      this.model.on(event.on, event.call, this);
    });
  }

  /**
   * Remove Model event handlers.
   */
  protected finalizeModelEvents(): void {
    this.modelEvents.forEach((event) => {
      this.model.off(event.on, event.call);
    });
  }

  /**
   * Remove this.el from DOM.
   */
  public remove(): void {
    this.finalizeModelEvents();
    super.remove();
  }

  /**
   * Process HTML element creation.
   */
  public handleMount(): void {
    this.initDomEvents();
    this.initModelEvents();
  }
}
