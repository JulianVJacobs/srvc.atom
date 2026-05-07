import { describe, expect, it } from '@jest/globals';
import { PluginScaffold } from '../scaffold/plugin-scaffold';
import {
  ARTICLE_ADD_MENU_ENTRY,
  registerMenuExtensions,
} from '../menu/register-menu-extensions';
import { bootstrapPlugin } from '../bootstrap';
import type { PluginDomainServices } from '../contracts/plugin-api-contract';

const buildStubServices = (): PluginDomainServices =>
  ({
    actors: { list: async () => ({ items: [], total: 0 }), create: async () => ({} as never) },
    events: { list: async () => ({ items: [], total: 0 }), create: async () => ({} as never) },
    claims: { list: async () => ({ items: [], total: 0 }), create: async () => ({} as never) },
    claimArchivalLinks: {
      listByClaimId: async () => ({ items: [], total: 0 }),
      create: async () => ({} as never),
    },
    victims: { list: async () => ({ items: [], total: 0 }), create: async () => ({} as never) },
    perpetrators: {
      list: async () => ({ items: [], total: 0 }),
      create: async () => ({} as never),
    },
    participants: {
      list: async () => ({ items: [], total: 0 }),
      create: async () => ({} as never),
    },
  }) as unknown as PluginDomainServices;

describe('Article menu extension', () => {
  it('ARTICLE_ADD_MENU_ENTRY targets the Add menu group', () => {
    expect(ARTICLE_ADD_MENU_ENTRY.group).toBe('add');
  });

  it('ARTICLE_ADD_MENU_ENTRY has label Article', () => {
    expect(ARTICLE_ADD_MENU_ENTRY.label).toBe('Article');
  });

  it('ARTICLE_ADD_MENU_ENTRY routePath is /articles', () => {
    expect(ARTICLE_ADD_MENU_ENTRY.routePath).toBe('/articles');
  });

  it('ARTICLE_ADD_MENU_ENTRY permission is articles:read', () => {
    expect(ARTICLE_ADD_MENU_ENTRY.permission).toBe('articles:read');
  });

  it('registerMenuExtensions registers the Article entry on the scaffold', () => {
    const plugin = new PluginScaffold();
    registerMenuExtensions(plugin);
    const extensions = plugin.getMenuExtensions();
    expect(extensions).toHaveLength(1);
    expect(extensions[0]).toEqual(ARTICLE_ADD_MENU_ENTRY);
  });

  it('bootstrapPlugin registers the Article Add-menu extension', () => {
    const plugin = bootstrapPlugin(buildStubServices());
    const extensions = plugin.getMenuExtensions();
    const articleEntry = extensions.find((e) => e.label === 'Article');
    expect(articleEntry).toBeDefined();
    expect(articleEntry?.group).toBe('add');
    expect(articleEntry?.routePath).toBe('/articles');
  });
});

describe('Article entry-point route', () => {
  it('GET /articles returns 200 for an authorized request', async () => {
    const plugin = bootstrapPlugin(buildStubServices());
    const response = await plugin.dispatch('GET', '/articles', {
      auth: { userId: 'user-1', permissions: ['articles:read'] },
    });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: { module: 'article', routePath: '/articles', status: 'route-registered' },
    });
  });

  it('GET /articles returns 403 for an unauthenticated request', async () => {
    const plugin = bootstrapPlugin(buildStubServices());
    const response = await plugin.dispatch('GET', '/articles', {});
    expect(response.status).toBe(403);
  });

  it('GET /articles returns 403 when permission is absent', async () => {
    const plugin = bootstrapPlugin(buildStubServices());
    const response = await plugin.dispatch('GET', '/articles', {
      auth: { userId: 'user-1', permissions: [] },
    });
    expect(response.status).toBe(403);
  });

  it('GET /articles is registered on the scaffold routes', () => {
    const plugin = bootstrapPlugin(buildStubServices());
    const routes = plugin.getRoutes();
    const articleRoute = routes.find((r) => r.method === 'GET' && r.path === '/articles');
    expect(articleRoute).toBeDefined();
  });
});
