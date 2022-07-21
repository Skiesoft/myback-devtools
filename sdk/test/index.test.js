import axios from 'axios';
import SDK from '../src/index';

jest.mock('axios');

test('list sdk resources', async () => {
  const sdk = new SDK();
  const sampleResources = {
    data: [
      {
        id: 1,
        name: 'Resource 1',
      },
      {
        id: 2,
        name: 'Resource 2',
      },
    ],
  };
  const resp = { data: sampleResources };
  axios.get.mockResolvedValue(resp);
  const resources = await sdk.getResources();
  for (let i = 0; i < 2; i += 1) {
    expect(resources[i].resourceId).toEqual(sampleResources.data[i].id);
  }
});
