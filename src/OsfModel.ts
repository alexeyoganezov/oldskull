import {
  OsfObservable,
  IOsfObservable,
  MODEL_CHANGED_EVENT,
} from './internal';

export interface IOsfModel<T extends object> extends IOsfObservable {
  attrs: T;
  getId(): any;
  set(attributes: T): void
  setAttribute<
    K extends keyof T,
    V extends T[K],
  >(attributeName: K, attributeValue: V, suppressChangeEvent: boolean): boolean
}

/**
 * Wraps and manages data object.
 */
export class OsfModel<T extends object> extends OsfObservable implements IOsfModel<T> {
  /**
   * Data object managed by a view.
   */
  public readonly attrs: T;

  /**
   * @param attrs - data object to wrap and manage
   */
  constructor(attrs: T) {
    super();
    this.attrs = attrs;
  }

  /**
   * Get unique identifier of a managed entity.
   * Meant to be implemented by child classes.
   */
  public getId(): any {
    throw new Error('[OSF] Model.getId() needs to be implemented');
  }

  /**
   * Set values on data object and trigger change event if necessary.
   *
   * @param attributes - values to set
   */
  public set(attributes: T): void {
    let wasObjectChanged = false;
    Object.keys(attributes).forEach((key) => {
      const wasAttrChanged = this.setAttribute(
        <keyof T>key, attributes[<keyof T>key],
        true,
      );
      if (wasAttrChanged) {
        wasObjectChanged = true;
      }
    });
    if (wasObjectChanged) {
      this.trigger(MODEL_CHANGED_EVENT, this);
    }
  }

  /**
   * Set data object property value and trigger change event if necessary.
   *
   * @param attributeName - name of an attribute
   * @param attributeValue - value of an attribute to set
   * @param suppressChangeEvent - prevent model change event triggering
   *
   * @returns was attribute value changed
   */
  public setAttribute<
    K extends keyof T,
    V extends T[K],
  >(attributeName: K, attributeValue: V, suppressChangeEvent = false): boolean {
    const currentValue = this.attrs[attributeName];
    const newValueIsTheSame = currentValue === attributeValue;
    if (newValueIsTheSame) {
      return false;
    }
    this.attrs[attributeName] = attributeValue;
    this.trigger(`${MODEL_CHANGED_EVENT} ${attributeName}`, this);
    if (!suppressChangeEvent) {
      this.trigger(MODEL_CHANGED_EVENT, this);
    }
    return true;
  }
}
