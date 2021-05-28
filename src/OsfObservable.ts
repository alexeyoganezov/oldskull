import { ALL_EVENTS } from './internal';

export interface ICallback {
  (payload: unknown, eventName: string): void;
}

export interface IListener {
  callback: ICallback;
  context?: object;
}

export interface IListenerContainer {
  [eventName: string]: IListener[];
}

export interface IOsfObservable {
  on(eventName: string, callback: ICallback, context?: object): void
  off(eventName: string, callback: ICallback): void
}

/**
 * Observer pattern implementation.
 * Allows to trigger events that other objects can listen and handle.
 */
export class OsfObservable implements IOsfObservable {
  /**
   * A list of registered events and their listeners.
   */
  private readonly listeners: IListenerContainer = {};

  /**
   * Add event listener
   *
   * @param eventName - name of the event
   * @param callback - event handler
   * @param context - where "this" should point inside event handler
   */
  public on(eventName: string, callback: ICallback, context?: object): void {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push({ callback, context });
  }

  /**
   * Remove event listener
   *
   * @param eventName - name of the event
   * @param callback - event handler
   */
  public off(eventName: string, callback: ICallback): void {
    if (!this.listeners[eventName]) {
      return;
    }
    this.listeners[eventName] = this.listeners[eventName].filter(
      (listener) => listener.callback !== callback,
    );
  }

  /**
   * Trigger specific event
   *
   * @param eventName - name of the event
   * @param payload - additional data describing an event
   */
  public trigger(eventName: string, payload?: unknown): void {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach((listener) => {
        if (listener.context) {
          listener.callback.call(listener.context, payload, eventName);
        } else {
          listener.callback(payload, eventName);
        }
      });
    }
    if (this.listeners[ALL_EVENTS]) {
      this.listeners[ALL_EVENTS].forEach((listener) => {
        if (listener.context) {
          listener.callback.call(listener.context, payload, eventName);
        } else {
          listener.callback(payload, eventName);
        }
      });
    }
  }

  /**
   * Callback used to retrigger received event from a an observer:
   *
   * ```
   * observable.on(ALL_EVENTS, this.retrigger);
   * ```
   *
   * @param payload - data describing an event
   * @param eventName - name of the event
   */
  protected retrigger(payload: unknown, eventName: string): void {
    this.trigger(eventName, payload);
  }
}
