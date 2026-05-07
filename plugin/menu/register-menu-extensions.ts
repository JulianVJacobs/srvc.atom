import type { PluginMenuEntry } from '../contracts/menu';
import type { PluginScaffold } from '../scaffold/plugin-scaffold';

export const ARTICLE_ADD_MENU_ENTRY: PluginMenuEntry = {
  group: 'add',
  label: 'Article',
  routePath: '/articles',
  permission: 'articles:read',
};

export const registerMenuExtensions = (plugin: PluginScaffold): void => {
  plugin.registerMenuExtension(ARTICLE_ADD_MENU_ENTRY);
};
