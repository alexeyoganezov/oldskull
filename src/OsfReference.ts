import { IOsfRenderable } from './internal';

export interface IOsfReference<T extends Element> {
  get(): T | null
}

/**
 * Discovers HTML element in provided View and keeps a reference to it.
 */
export class OsfReference<T extends Element> implements IOsfReference<T> {
  /**
   * Discovered HTML element
   */
  protected el: T | null = null;

  /**
   * A View containing necessary element
   */
  protected readonly parent: IOsfRenderable;

  /**
   * CSS selector of the element
   */
  protected readonly selector: string;

  /**
   * @param parent - a View instantiating the Reference
   * @param selector - CSS selector to the container element
   */
  constructor(parent: IOsfRenderable, selector: string) {
    this.parent = parent;
    this.selector = selector;
  }

  /**
   * Discover HTML element and save a reference to it.
   */
  protected init(): void {
    const el = this.parent.el?.querySelector<T>(this.selector);
    if (el) {
      this.el = el;
    } else {
      throw new Error(`[OSF] Element selector "${this.selector}" not found`);
    }
  }

  /**
   * Get HTML element referenced by this.selector.
   *
   * @returns HTML element specified by this.selector
   */
  public get(): T | null {
    if (!this.el) {
      this.init();
    }
    return this.el;
  }
}
