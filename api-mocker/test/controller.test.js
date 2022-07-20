import Controller from '../src/controller';
import MockResponse from './mock-response';

test('get resources', async () => {
  const res = new MockResponse();
  await Controller.getResources({}, res);
  const resources = res.get().data;
  expect(resources.length).toBe(1);
  expect(resources[0].name).toBe('example.db');
});

test('get collections', async () => {
  const req = { url: 'resource/1' };
  const res = new MockResponse();
  await Controller.getCollections(req, res);
  const collection = res.get().data;
  expect(collection.length).toBe(1);
  expect(collection[0].id).toBe('one');
});

test('get pages', async () => {
  const req = { url: 'resource/1/collection/one/object' };
  const res = new MockResponse();
  await Controller.getPage(req, res);
  const object = res.get().data;
  expect(object.length).toBeLessThanOrEqual(24);
});

test('create object', async () => {
  const req = {
    url: 'resource/1/collection/one/object',
    body: { field1: 1, field2: 'somestr' },
  };
  const res = new MockResponse();
  await Controller.createObject(req, res);
  const record = res.get().data;
  expect(record.field1).toBe(req.body.field1);
  expect(record.field2).toBe(req.body.field2);
});

test('query object', async () => {
  const req = {
    url: 'resource/1/collection/one/object/query?matcher={"field1":1}',
  };
  const res = new MockResponse();
  await Controller.queryObject(req, res);
  const records = res.get().data;
  records.forEach((record) => {
    expect(record.field1).toBe(1);
  });
});

test('update object', async () => {
  const newObj = { field1: 100, field2: 'a' };
  const req = {
    url: 'resource/1/collection/one/object?matcher={"field1":1,"field2":"somestr"}',
    body: { data: newObj },
  };
  const res = new MockResponse();
  await Controller.updateObject(req, res);
  const record = res.get().data;
  expect(record.field1).toBe(newObj.field1);
  expect(record.field2).toBe(newObj.field2);
});

test('delete object', async () => {
  const req = {
    url: 'resource/1/collection/one/object?matcher={"field1":1,"field2":"somestr"}',
  };
  const res = new MockResponse();
  await Controller.deleteObject(req, res);
});
