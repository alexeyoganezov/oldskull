import {
  OsfRenderable,
  OsfRegion,
} from './internal';

/**
 * Application entry point.
 * Keeps initialization logic and a reference to the root element/region.
 */
export abstract class OsfApplication extends OsfRenderable {
  /**
   * Root HTML element
   */
  public el: Element = window.document.body;

  /**
   * A region attached to the root HTML element
   */
  protected readonly mainRegion: OsfRegion;

  /**
   * @param mainRegionLocator - CSS selector to root application element
   */
  constructor(mainRegionLocator: string) {
    super();
    this.mainRegion = new OsfRegion(this, mainRegionLocator);
  }

  /**
   * Perform application initialization.
   * Meant to be implemented by child classes.
   */
  public abstract init(): Promise<any>;

  /**
   * Remove application content.
   */
  public remove(): void {
    this.beforeRemove();
    this.mainRegion.empty();
    this.afterRemove();
  }
}
