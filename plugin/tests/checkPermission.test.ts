import { checkPermission } from '../auth/checkPermission';

describe('checkPermission', () => {
  afterEach(() => {
    delete (globalThis as { QubitAcl?: unknown }).QubitAcl;
  });

  it('rejects requests without authenticated user context', async () => {
    await expect(checkPermission(undefined, 'actors:read')).resolves.toBe(false);
    await expect(checkPermission({ roles: ['administrator'] }, 'actors:read')).resolves.toBe(
      false,
    );
  });

  it('allows explicit plugin permission grants', async () => {
    await expect(
      checkPermission({ userId: 'user-1', permissions: ['actors:read'] }, 'actors:read'),
    ).resolves.toBe(true);
  });

  it('delegates to QubitAcl permission check when available', async () => {
    const check = jest.fn(() => true);
    (globalThis as { QubitAcl?: { check: typeof check } }).QubitAcl = { check };

    await expect(
      checkPermission({ userId: 'user-1', credential: { id: 7 } }, 'claims:linkages:create'),
    ).resolves.toBe(true);

    expect(check).toHaveBeenCalledWith('update', { id: 7 });
  });
});
