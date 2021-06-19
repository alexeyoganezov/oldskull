import { OsfObservable, IOsfObservable } from './internal';

export interface IOsfRenderable<E extends Element = Element> extends IOsfObservable {
  el?: E
  init(): void
  remove(): void
  handleBeforeInit(): Promise<void>
  handleAfterInit(): Promise<void>
}

/**
 * An entity that creates or uses DOM element and has create/remove logic with lifecycle methods.
 */
export abstract class OsfRenderable<
  E extends Element = Element,
> extends OsfObservable implements IOsfRenderable<E> {
  /**
   * Root HTML element of a subtree used by the class.
   */
  public el?: E;

  /**
   * A flag to prevent repetitive this.beforeInit() call
   */
  protected wasBeforeInitCalled: boolean = false;

  /**
   * A flag to prevent repetitive this.afterInit() call
   */
  protected wasAfterInitCalled: boolean = false;

  /**
   * Perform additional actions before this.init() call.
   * Meant to be extended by child classes.
   */
  protected beforeInit(): void {

  }

  /**
   * Process this.beforeInit() call.
   */
  public async handleBeforeInit(): Promise<void> {
    if (!this.wasBeforeInitCalled) {
      await this.beforeInit();
      this.wasBeforeInitCalled = true;
    }
  }

  /**
   * Initialization logic.
   */
  public abstract init(): void;

  /**
   * Perform additional actions after this.init() call.
   * Meant to be extended by child classes.
   */
  protected afterInit(): void {

  }

  /**
   * Process this.afterInit() call.
   */
  public async handleAfterInit(): Promise<void> {
    if (!this.wasAfterInitCalled) {
      await this.afterInit();
      this.wasAfterInitCalled = true;
    }
  }

  /**
   * Perform additional actions before this.remove() call.
   * Meant to be extended by child classes.
   */
  protected beforeRemove(): void {

  }

  /**
   * Remove managed element from DOM
   */
  public abstract remove(): void;

  /**
   * Perform additional actions after this.remove() call.
   * Meant to be extended by child classes.
   */
  protected afterRemove(): void {

  }
}
