import {
  OsfRenderable,
  IOsfRenderable,
} from './internal';

export interface IOsfDomEventListener {
  el: string
  on: string
  call: EventListenerOrEventListenerObject
}

export interface IOsfView extends IOsfRenderable {
  el?: Element;
  init(): Promise<string>
  remove(): void
  mountTo(el: Element): void
  getHTML(): string
}

/**
 * Creates and manages a subtree of HTML elements.
 */
export abstract class OsfView extends OsfRenderable implements IOsfView {
  /**
   * A list of DOM events and their handlers.
   */
  protected readonly domEvents: IOsfDomEventListener[] = [];

  /**
   * Create and initialize HTML element subtree (this.el).
   *
   * @returns HTML markup of the created HTML subtree
   */
  public async init(): Promise<string> {
    await this.handleBeforeInit();
    const html = this.getHTML();
    this.createElement(html);
    this.handleMount();
    await this.handleAfterInit();
    return this.el ? this.el.outerHTML : html;
  }

  /**
   * Create string representation of HTML subtree to create.
   * Should be implemented by child classes.
   *
   * @returns HTML to create DOM subtree from
   */
  public abstract getHTML(): string;

  /**
   * Create HTML element subtree from a string and save it.
   *
   * @param html - HTML string to create subtree from
   */
  protected createElement(html: string): void {
    const container = document.createElement('template');
    container.innerHTML = html;
    if (container.content.firstChild) {
      this.el = container.content.children[0];
    }
  }

  /**
   * Process HTML element creation.
   */
  public handleMount(): void {
    this.initDomEvents();
  }

  /**
   * Initialize DOM event handlers from this.domEvents.
   */
  protected initDomEvents(): void {
    this.domEvents.forEach((event) => {
      if (this.el) {
        const listeners = this.el.querySelectorAll(event.el);
        if (listeners.length > 0) {
          listeners.forEach((listener: HTMLElement | Node) => {
            listener.addEventListener(event.on, event.call);
          });
        }
      } else {
        throw new Error('[OSF] Cannot initialize event handlers on non-existing Element');
      }
    });
  }

  /**
   * Remove HTML element subtree from DOM.
   */
  public remove(): void {
    if (this.el) {
      this.beforeRemove();
      this.el.remove();
      this.afterRemove();
    }
  }

  /**
   * Bind the view to existing DOM element and perform initialization.
   *
   * @param el - HTML Element to bind to
   */
  public mountTo(el: Element): void {
    this.el = el;
    this.handleMount();
  }
}
