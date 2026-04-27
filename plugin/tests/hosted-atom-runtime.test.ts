import { describe, expect, it } from '@jest/globals';
import { bindHostedAuthContext } from '../runtime/hosted-atom-runtime';

const createRequest = (headers: Record<string, string | undefined>): Request =>
  ({
    headers: {
      get: (name: string) => {
        const key = name.toLowerCase();
        for (const [headerName, value] of Object.entries(headers)) {
          if (headerName.toLowerCase() === key) {
            return value ?? null;
          }
        }
        return null;
      },
    },
  }) as unknown as Request;

describe('hosted atom runtime auth header binding', () => {
  it('normalizes empty and comma-only role/permission headers', () => {
    const context = bindHostedAuthContext(
      createRequest({
        'x-atom-user-id': 'user-1',
        'x-atom-user-roles': '  ,  ,  ',
        'x-atom-user-permissions': ',,',
      }),
    );

    expect(context.userId).toBe('user-1');
    expect(context.roles).toEqual([]);
    expect(context.permissions).toEqual([]);
  });

  it('returns empty auth values when hosted headers are absent', () => {
    const context = bindHostedAuthContext(createRequest({}));
    expect(context).toMatchObject({
      userId: undefined,
      roles: [],
      permissions: [],
    });
  });
});
