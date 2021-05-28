import * as sinon from 'sinon';

import { OsfModel, MODEL_CHANGED_EVENT } from './index';

interface IEmployee {
  id: number;
  name: string;
  age: number;
  company: string;
  skills: string[];
}

class Employee extends OsfModel<IEmployee> {

}

test('OsfModel saves passed object', () => {
  const data: IEmployee = {
    id: 1,
    name: 'John',
    age: 32,
    company: 'Acme',
    skills: ['JS', 'TS'],
  };
  const employee = new Employee(data);
  expect(employee.attrs.name).toBe('John');
  expect(employee.attrs.company).toBe('Acme');
  expect(employee.attrs.age).toBe(32);
  expect(employee.attrs.skills[0]).toBe('JS');
  expect(employee.attrs.skills[1]).toBe('TS');
});

test('OsfModel updates data object and triggers change event', () => {
  const callback = sinon.fake();
  const data = {
    id: 1,
    name: 'John',
    age: 32,
    company: 'Acme',
    skills: ['JS', 'TS'],
  };
  const employee = new Employee(data);
  employee.on(MODEL_CHANGED_EVENT, callback);
  employee.set({
    ...employee.attrs,
    name: 'Doe',
  });
  expect(callback.callCount).toBe(1);
  expect(callback.args[0][0].attrs).toStrictEqual({
    ...data,
    name: 'Doe',
  });
});
