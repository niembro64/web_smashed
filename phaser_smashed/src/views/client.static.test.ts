import axios from 'axios';
import moment from 'moment';
import {
  backendDisabled, fetchClientData, axiosSaveOne, axiosUpsertOne,
  getAllGameHistory, fetchNeuralNetwork, saveNeuralNetwork,
} from './client';

jest.mock('axios', () => ({ get: jest.fn(), post: jest.fn(), patch: jest.fn() }));

test('static demo starts and finishes sessions without contacting any server', async () => {
  expect(backendDisabled).toBe(true);
  const fetchMock = jest.fn();
  global.fetch = fetchMock;
  const client = await fetchClientData();
  const created = moment('2026-10-18T12:00:00Z');
  const session = await axiosSaveOne(created, client, {} as any, {} as any);
  expect(session.momentCreated).toContain('2026-10-18');
  await axiosUpsertOne(created, [[1]], [[2]], [[3]]);
  expect(await getAllGameHistory()).toEqual([]);
  expect(await fetchNeuralNetwork()).toBeNull();
  expect(await saveNeuralNetwork({ layers: [] })).toBe(false);
  expect(fetchMock).not.toHaveBeenCalled();
  expect(axios.get).not.toHaveBeenCalled();
  expect(axios.post).not.toHaveBeenCalled();
  expect(axios.patch).not.toHaveBeenCalled();
});
