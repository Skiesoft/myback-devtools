import { mock, fakeServer } from '../src/index';
import MockResponse from './mock-response';

test('mocking', () => {
  const middlewares = [];
  mock(middlewares);
  expect(middlewares[0].name).toBe('api-mock-server');
  expect(middlewares[0].path).toBe('/api/v1');
});

test('server routing - resource index', async () => {
  const res = new MockResponse();
  await fakeServer({
    url: 'resource/',
    method: 'GET',
  }, res);
  const mappedResource = res.get().mapped.data;
  const originalResource = res.get().original.data;
  expect(mappedResource.length).toBe(1);
  expect(originalResource.length).toBe(1);
  expect(mappedResource[0].id).toBe('example');
});

test('server routing - collection index', async () => {
  const res = new MockResponse();
  await fakeServer({
    url: 'resource/1',
    method: 'GET',
  }, res);
  const collection = res.get().data;
  expect(collection.length).toBe(3);
  expect(collection[0].id).toBe('one');
});

test('server routing - get object page', async () => {
  const res = new MockResponse();
  await fakeServer({
    url: 'resource/1/collection/one/object',
    method: 'GET',
  }, res);
  const object = res.get().data;
  expect(object.length).toBeLessThanOrEqual(24);
});

test('server routing - create object', async () => {
  const res = new MockResponse();
  await fakeServer({
    url: 'resource/1/collection/one/object',
    method: 'POST',
    body: { data: { field1: 1, field2: 'somestr' } },
  }, res);
  const record = res.get().data;
  expect(record.field1).toBe(1);
  expect(record.field2).toBe('somestr');
});

test('server routing - update object', async () => {
  const res = new MockResponse();
  await fakeServer({
    url: 'resource/1/collection/one/object?matcher={"field1":1,"field2":"somestr"}',
    method: 'PUT',
    body: { data: { field1: 100, field2: 'a' } },
  }, res);
  const record = res.get().data;
  expect(record.field1).toBe(100);
  expect(record.field2).toBe('a');
});

test('server routing - delete object', async () => {
  const res = new MockResponse();
  await fakeServer({
    url: 'resource/1/collection/one/object?matcher={"field1":1,"field2":"somestr"}',
    method: 'DELETE',
  }, res);
});

test('server routing - get relation', async () => {
  const res = new MockResponse();
  await fakeServer({
    url: 'resource/1/collection/three/object/relation?matcher={"ref1": 2, "ref2": 1}',
    method: 'GET',
  }, res);
  const record = res.get();
  expect(record.out.one.data[0].id).toBe(2);
  expect(record.out.two.data[0].id).toBe(1);
});
