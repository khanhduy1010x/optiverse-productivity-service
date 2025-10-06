import { RequestOptions } from 'src/type/task.test.type';
import { getToken, makeRequest } from './login.helper';
describe('TaskController - E2E', () => {
  const baseUrl = 'http://reverse-proxy:81';
  let token: string;

  beforeAll(async () => {
    token = await getToken(baseUrl);
  });

  // --- Case: GET all tasks ---
  const taskGetAllCases: RequestOptions[] = [
    {
      name: 'GET-01: Get all tasks success',
      method: 'get',
      path: '/productivity/task/all',
      tokenType: 'valid',
      expectedStatus: 200,
      expectCode: 1000,
    },
    {
      name: 'GET-02: Fail - missing auth token',
      method: 'get',
      path: '/productivity/task/all',
      tokenType: 'missing',
      expectedStatus: 401,
      expectCode: 1005,
    },
    {
      name: 'GET-03: Fail - expired/invalid token',
      method: 'get',
      path: '/productivity/task/all',
      tokenType: 'invalid',
      expectedStatus: 401,
      expectCode: 1005,
    },
  ];

  it.each(taskGetAllCases)('$name', async (tc) => {
    await makeRequest(baseUrl, { ...tc, token });
  });

  // --- Case: CREATE task ---
  const taskCreateCases: RequestOptions[] = [
    {
      name: 'POST-01: Create success (full payload)',
      method: 'post',
      path: '/productivity/task',
      tokenType: 'valid',
      expectedStatus: 201,
      body: {
        title: 'Write report',
        description: 'Finish quarterly report',
        status: 'pending',
        priority: 'low',
        start_time: '2024-06-01T10:00:00.000Z',
        end_time: '2024-06-02T10:00:00.000Z',
      },
      expectCode: 1000,
    },
    {
      name: 'POST-03: Fail - unauthorized',
      method: 'post',
      path: '/productivity/task',
      tokenType: 'missing',
      expectedStatus: 401,
      body: { title: 'Any', status: 'pending' },
      expectCode: 1005,
    },
    {
      name: 'POST-04: Fail - missing title',
      method: 'post',
      path: '/productivity/task',
      tokenType: 'valid',
      expectedStatus: 500,
      expectCode: 500,

      body: { status: 'pending' },
    },
    {
      name: 'POST-05: Fail - missing status',
      method: 'post',
      path: '/productivity/task',
      tokenType: 'valid',
      expectedStatus: 500,
      expectCode: 500,

      body: { title: 'Task A' },
    },
    {
      name: 'POST-06: Fail - invalid date',
      method: 'post',
      path: '/productivity/task',
      tokenType: 'valid',
      expectedStatus: 500,
      expectCode: 500,
      body: { title: 'Task B', status: 'pending', start_time: 'not-a-date' },
    },
  ];

  it.each(taskCreateCases)('$name', async (tc) => {
    await makeRequest(baseUrl, { ...tc, token });
  });
});
