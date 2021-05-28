import { OsfModel, OsfCollection } from './index';

interface IEmployee {
  id: number;
  name: string;
}

class Employee extends OsfModel<IEmployee> {
  getId(): number {
    return this.attrs.id;
  }
}

test('OsfCollection saves passed models', () => {
  const model = new Employee({
    id: 1,
    name: 'Unu',
  });
  const employees = new OsfCollection([model]);
  expect(employees.models.length).toBe(1);
  expect(employees.models[0].attrs.name).toBe('Unu');
});

test('OsfCollection can add models', () => {
  const model1 = new Employee({
    id: 1,
    name: 'Unu',
  });
  const model2 = new Employee({
    id: 2,
    name: 'Du',
  });
  const employees = new OsfCollection([model1]);
  employees.add(model2);
  expect(employees.models.length).toBe(2);
  expect(employees.models[1].attrs.name).toBe('Du');
});

test('OsfCollection can retrieve models', () => {
  const model1 = new Employee({
    id: 1,
    name: 'Unu',
  });
  const model2 = new Employee({
    id: 2,
    name: 'Du',
  });
  const employees = new OsfCollection([model1, model2]);
  const employee = employees.get(1);
  expect(employee?.attrs.name).toBe('Unu');
});

test('OsfCollection can remove models', () => {
  const model1 = new Employee({
    id: 1,
    name: 'Unu',
  });
  const model2 = new Employee({
    id: 2,
    name: 'Du',
  });
  const employees = new OsfCollection([model1]);
  employees.add(model2);
  employees.remove(1);
  expect(employees.models.length).toBe(1);
  expect(employees.models[0].attrs.name).toBe('Du');
});
