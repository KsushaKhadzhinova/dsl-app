import * as diagramsApi from '../src/api/diagramsApi.js';
import { API_BASE_URL, ApiError } from '../src/api/client.js';

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  delete global.fetch;
});

test('renderDsl posts the dsl content to the render endpoint', async () => {
  global.fetch.mockResolvedValue({ ok: true, text: async () => JSON.stringify({ svg: '<svg/>', issues: [] }) });
  const result = await diagramsApi.renderDsl('diagram erd "x" {}', 'tok');
  expect(result).toEqual({ svg: '<svg/>', issues: [] });
  expect(global.fetch).toHaveBeenCalledWith(
    `${API_BASE_URL}/api/v1/diagrams/render`,
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ dsl_content: 'diagram erd "x" {}', message: '' }),
    }),
  );
});

test('listDiagrams issues an authenticated GET', async () => {
  global.fetch.mockResolvedValue({ ok: true, text: async () => JSON.stringify([]) });
  await diagramsApi.listDiagrams('tok');
  const [, options] = global.fetch.mock.calls[0];
  expect(options.headers.Authorization).toBe('Bearer tok');
});

test('createDiagram posts the title and notation', async () => {
  global.fetch.mockResolvedValue({ ok: true, text: async () => JSON.stringify({ id: 'd1' }) });
  await diagramsApi.createDiagram('Untitled', 'erd.crows_foot.logical', 'tok');
  expect(global.fetch).toHaveBeenCalledWith(
    `${API_BASE_URL}/api/v1/diagrams`,
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ title: 'Untitled', notation: 'erd.crows_foot.logical' }),
    }),
  );
});

test('saveVersion posts to the versions sub-resource of the diagram', async () => {
  global.fetch.mockResolvedValue({ ok: true, text: async () => JSON.stringify({ id: 'c1' }) });
  await diagramsApi.saveVersion('d1', 'diagram erd "x" {}', 'my message', 'tok');
  expect(global.fetch).toHaveBeenCalledWith(
    `${API_BASE_URL}/api/v1/diagrams/d1/versions`,
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ dsl_content: 'diagram erd "x" {}', message: 'my message' }),
    }),
  );
});

test('exportDiagram parses the filename from Content-Disposition and returns the text body', async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    headers: { get: () => 'attachment; filename="process.dsl"' },
    text: async () => 'diagram erd "x" {}',
  });

  const result = await diagramsApi.exportDiagram('d1', 'tok');

  expect(result).toEqual({ filename: 'process.dsl', content: 'diagram erd "x" {}' });
  expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/v1/diagrams/d1/export`, {
    headers: { Authorization: 'Bearer tok' },
  });
});

test('exportDiagram falls back to a default filename when the header is missing', async () => {
  global.fetch.mockResolvedValue({ ok: true, headers: { get: () => null }, text: async () => 'content' });
  const result = await diagramsApi.exportDiagram('d1', 'tok');
  expect(result.filename).toBe('diagram.dsl');
});

test('exportDiagram throws an ApiError on a non-ok response', async () => {
  global.fetch.mockResolvedValue({ ok: false, status: 404 });
  await expect(diagramsApi.exportDiagram('missing', 'tok')).rejects.toBeInstanceOf(ApiError);
});

test('exportDiagram wraps network failures', async () => {
  global.fetch.mockRejectedValue(new TypeError('Failed to fetch'));
  await expect(diagramsApi.exportDiagram('d1', 'tok')).rejects.toMatchObject({ status: 0 });
});
