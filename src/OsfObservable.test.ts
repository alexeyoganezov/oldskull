import * as sinon from 'sinon';

import { OsfObservable, ALL_EVENTS } from './index';

class Duck extends OsfObservable {
  quack() {
    this.trigger('quack');
  }
}

test('OsfObservable triggers event handlers', () => {
  const callback = sinon.fake();
  const duck = new Duck();
  duck.on('quack', callback);
  duck.quack();
  expect(callback.callCount).toBe(1);
});

test('OsfObservable removes event handlers', () => {
  const callback = sinon.fake();
  const duck = new Duck();
  duck.on('quack', callback);
  duck.off('quack', callback);
  duck.quack();
  expect(callback.callCount).toBe(0);
});

test('OsfObservable can notify about all events', () => {
  const callback = sinon.fake();
  const duck = new Duck();
  duck.on(ALL_EVENTS, callback);
  duck.quack();
  expect(callback.callCount).toBe(1);
});

test.todo('OsfObservable can bind event handler to provided context');

test.todo('OsfObservable can retrigger received events');
