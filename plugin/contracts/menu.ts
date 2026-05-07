export type PluginAddMenuGroup = 'add';

export interface PluginMenuEntry {
  group: PluginAddMenuGroup;
  label: string;
  routePath: string;
  permission: string;
}
