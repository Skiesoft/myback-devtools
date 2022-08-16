import axios from 'axios';
import { SDK } from '../src/index';

jest.mock('axios');

test('list sdk original resources', async () => {
  const sdk = new SDK();
  const sampleResources = {
    original: {
      data: [
        {
          id: '1',
        },
      ],
    },
    mapped: {
      data: [
        {
          id: 'test resource',
        },
      ],
    },
  };
  const resp = { data: sampleResources };
  axios.get.mockResolvedValue(resp);
  const resources = await sdk.getOriginalResources();
  expect(resources[0].resourceId).toEqual(sampleResources.original.data[0].id);
});

test('list sdk mapped resources', async () => {
  const sdk = new SDK();
  const sampleResources = {
    original: {
      data: [
        {
          id: '1',
        },
      ],
    },
    mapped: {
      data: [
        {
          id: 'test resource',
        },
      ],
    },
  };
  const resp = { data: sampleResources };
  axios.get.mockResolvedValue(resp);
  const resources = await sdk.getMappedResources();
  expect(resources[0].resourceId).toEqual(sampleResources.mapped.data[0].id);
});
