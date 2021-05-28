import { IOsfRenderable } from './internal';

/**
 * Discovers HTML element in provided View and keeps a reference to it.
 */
export class OsfReference {
  /**
   * Discovered HTML element
   */
  protected el?: Element;

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
    const el = this.parent.el?.querySelector(this.selector);
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
  public get(): Element | undefined {
    if (!this.el) {
      this.init();
    }
    return this.el;
  }
}
