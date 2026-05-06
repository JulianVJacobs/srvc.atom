import { bootstrapPlugin, PLUGIN_CONFIG } from '../bootstrap';
import { registerPluginRoutes } from '../routes/register-plugin-routes';
import { PluginScaffold } from '../scaffold/plugin-scaffold';
import type {
  ArticlePayload,
  PluginDomainServices,
  PluginUserContext,
} from '../contracts/plugin-api-contract';

const articleSeed: ArticlePayload = {
  id: 'article-1',
  title: 'Test Article',
  slug: 'test-article',
  sourceUrl: 'https://example.com/test-article',
  publicationDate: '2026-01-15',
  outlet: 'Test Outlet',
};

const buildMinimalServices = (): PluginDomainServices => ({
  actors: {
    list: jest.fn(async () => ({ items: [], total: 0 })),
    create: jest.fn(),
  },
  events: {
    list: jest.fn(async () => ({ items: [], total: 0 })),
    create: jest.fn(),
  },
  claims: {
    list: jest.fn(async () => ({ items: [], total: 0 })),
    create: jest.fn(),
  },
  claimArchivalLinks: {
    listByClaimId: jest.fn(async () => ({ items: [], total: 0 })),
    create: jest.fn(),
  },
  victims: {
    list: jest.fn(async () => ({ items: [], total: 0 })),
    create: jest.fn(),
  },
  perpetrators: {
    list: jest.fn(async () => ({ items: [], total: 0 })),
    create: jest.fn(),
  },
  participants: {
    list: jest.fn(async () => ({ items: [], total: 0 })),
    create: jest.fn(),
  },
  articles: {
    list: jest.fn(async () => ({ items: [articleSeed], total: 1 })),
    create: jest.fn(
      async (
        input: Omit<ArticlePayload, 'id'>,
        _context?: PluginUserContext,
      ): Promise<ArticlePayload> => ({ id: 'article-2', ...input }),
    ),
  },
});

describe('Article menu entry and route binding', () => {
  describe('menu entry registration', () => {
    it('registers an Article entry under the add menu via bootstrapPlugin', () => {
      const services = buildMinimalServices();
      const plugin = bootstrapPlugin(services);

      const menuEntries = plugin.getMenuEntries();
      const articleEntry = menuEntries.find(
        (entry) => entry.menu === 'add' && entry.label === 'Article',
      );

      expect(articleEntry).toBeDefined();
      expect(articleEntry?.menu).toBe('add');
      expect(articleEntry?.label).toBe('Article');
    });

    it('binds the Article menu entry to the plugin article route', () => {
      const services = buildMinimalServices();
      const plugin = bootstrapPlugin(services);

      const menuEntries = plugin.getMenuEntries();
      const articleEntry = menuEntries.find((entry) => entry.label === 'Article');

      expect(articleEntry?.route).toBe(
        `${PLUGIN_CONFIG.routePrefix}/articles/new`,
      );
    });

    it('sets articles:create as the access permission for the Article menu entry', () => {
      const services = buildMinimalServices();
      const plugin = bootstrapPlugin(services);

      const menuEntries = plugin.getMenuEntries();
      const articleEntry = menuEntries.find((entry) => entry.label === 'Article');

      expect(articleEntry?.accessPermission).toBe('articles:create');
    });

    it('getMenuEntries returns a copy and does not expose internal state', () => {
      const services = buildMinimalServices();
      const plugin = bootstrapPlugin(services);

      const first = plugin.getMenuEntries();
      const second = plugin.getMenuEntries();

      expect(first).not.toBe(second);
      expect(first).toEqual(second);
    });
  });

  describe('article route binding', () => {
    const scaffold = new PluginScaffold();
    const services = buildMinimalServices();
    registerPluginRoutes(scaffold, services);

    it('GET /articles returns list contract shape', async () => {
      const response = await scaffold.dispatch('GET', '/articles', {
        query: { limit: '10', offset: '0' },
        auth: { userId: 'user-1', permissions: ['articles:read'] },
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: { items: [articleSeed], total: 1 },
      });
    });

    it('POST /articles returns entity contract shape', async () => {
      const input: Omit<ArticlePayload, 'id'> = {
        title: 'New Article',
        slug: 'new-article',
        sourceUrl: null,
        publicationDate: '2026-03-01',
        outlet: 'Daily News',
      };

      const response = await scaffold.dispatch('POST', '/articles', {
        body: input,
        auth: { userId: 'user-1', permissions: ['articles:create'] },
      });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        success: true,
        data: { id: expect.any(String), ...input },
      });
    });

    it('GET /articles rejects unauthorized access', async () => {
      const response = await scaffold.dispatch('GET', '/articles', {
        auth: { userId: 'user-1' },
      });
      expect(response.status).toBe(403);
    });

    it('POST /articles rejects unauthorized access', async () => {
      const response = await scaffold.dispatch('POST', '/articles', {
        auth: { userId: 'user-1' },
        body: { title: 'x', slug: 'x', sourceUrl: null, publicationDate: null, outlet: null },
      });
      expect(response.status).toBe(403);
    });

    it('GET /articles/new returns stub entry point for authenticated user', async () => {
      const response = await scaffold.dispatch('GET', '/articles/new', {
        auth: { userId: 'user-1', permissions: ['articles:create'] },
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: { route: 'article:new', ready: false },
      });
    });

    it('GET /articles/new rejects unauthenticated access', async () => {
      const response = await scaffold.dispatch('GET', '/articles/new', {});

      expect(response.status).toBe(403);
    });
  });
});
