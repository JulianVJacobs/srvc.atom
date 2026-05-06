import { registerPluginRoutes } from '../routes/register-plugin-routes';
import { PluginScaffold } from '../scaffold/plugin-scaffold';
import type {
  ActorPayload,
  ArticlePayload,
  ClaimArchivalLinkPayload,
  ClaimRecordPayload,
  EventPayload,
  PluginUserContext,
  PerpetratorPayload,
  ParticipantPayload,
  PluginDomainServices,
  VictimPayload,
} from '../contracts/plugin-api-contract';

const createListService = <T extends { id: string }>(
  seed: T,
  createShape: (input: Omit<T, 'id'>) => T,
) => ({
  list: jest.fn(async () => ({ items: [seed], total: 1 })),
  create: jest.fn(async (input: Omit<T, 'id'>) => createShape(input)),
});

describe('plugin API contract routes', () => {
  const actorSeed: ActorPayload = {
    id: 'actor-1',
    canonicalLabel: 'Jane Doe',
    actorKind: 'person',
    aliases: ['J. Doe'],
  };
  const eventSeed: EventPayload = {
    id: 'event-1',
    title: 'Case event',
    occurredOn: '2026-01-01',
    location: 'Johannesburg',
  };
  const claimSeed: ClaimRecordPayload = {
    id: 'claim-1',
    eventId: 'event-1',
    recordType: 'homicide',
    summary: 'Victim found at location',
  };
  const victimSeed: VictimPayload = {
    id: 'victim-1',
    eventId: 'event-1',
    name: 'Victim Name',
  };
  const perpetratorSeed: PerpetratorPayload = {
    id: 'perp-1',
    eventId: 'event-1',
    name: 'Perp Name',
  };
  const participantSeed: ParticipantPayload = {
    id: 'participant-1',
    eventId: 'event-1',
    actorId: 'actor-1',
    role: 'witness',
  };
  const claimLinkSeed: ClaimArchivalLinkPayload = {
    id: 'link-1',
    claimId: 'claim-1',
    linkedRecordType: 'authority_record',
    linkedRecordId: 'QUBIT-AR-1',
  };
  const articleSeed: ArticlePayload = {
    id: 'article-1',
    title: 'Test Article',
    slug: 'test-article',
    body: 'Article body text.',
    publicationDate: '2026-01-10',
    status: 'published',
    linkedClaimIds: ['claim-1'],
  };

  const buildTestServices = (): PluginDomainServices => {
    const linkageStore: ClaimArchivalLinkPayload[] = [claimLinkSeed];
    const articleStore: ArticlePayload[] = [articleSeed];

    return {
      actors: createListService(actorSeed, (input) => ({ id: 'actor-2', ...input })),
      events: createListService(eventSeed, (input) => ({ id: 'event-2', ...input })),
      claims: createListService(claimSeed, (input) => ({ id: 'claim-2', ...input })),
      claimArchivalLinks: {
        listByClaimId: jest.fn(
          async (claimId: string, _context?: PluginUserContext) => ({
            items: linkageStore.filter((link) => link.claimId === claimId),
            total: linkageStore.filter((link) => link.claimId === claimId).length,
          }),
        ),
        create: jest.fn(
          async (
            input: Omit<ClaimArchivalLinkPayload, 'id'>,
            _context?: PluginUserContext,
          ) => {
            const payload = {
              id: `link-${linkageStore.length + 1}`,
              ...input,
            };
            linkageStore.push(payload);
            return payload;
          },
        ),
      },
      victims: createListService(victimSeed, (input) => ({ id: 'victim-2', ...input })),
      perpetrators: createListService(perpetratorSeed, (input) => ({
        id: 'perp-2',
        ...input,
      })),
      participants: createListService(participantSeed, (input) => ({
        id: 'participant-2',
        ...input,
      })),
      articles: {
        list: jest.fn(async () => ({ items: [articleSeed], total: 1 })),
        create: jest.fn(async (input: Omit<ArticlePayload, 'id'>) => ({
          id: 'article-2',
          ...input,
        })),
        getById: jest.fn(async (id: string) =>
          articleStore.find((a) => a.id === id) ?? null,
        ),
        update: jest.fn(
          async (id: string, input: Partial<Omit<ArticlePayload, 'id'>>) => {
            const existing = articleStore.find((a) => a.id === id);
            if (!existing) throw new Error(`Article not found: ${id}`);
            return { ...existing, ...input, id: existing.id };
          },
        ),
      },
    };
  };

  const scaffold = new PluginScaffold();
  const services = buildTestServices();
  registerPluginRoutes(scaffold, services);

  it.each([
    ['/actors', actorSeed],
    ['/events', eventSeed],
    ['/claims', claimSeed],
    ['/victims', victimSeed],
    ['/perpetrators', perpetratorSeed],
    ['/participants', participantSeed],
  ] as const)('GET %s returns list contract shape', async (path, expectedItem) => {
    const response = await scaffold.dispatch('GET', path, {
      query: { limit: '10', offset: '0' },
      auth: { userId: 'user-1', permissions: [`${path.slice(1)}:read`] },
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: {
        items: [expectedItem],
        total: 1,
      },
    });
  });

  it.each([
    ['/actors', { canonicalLabel: 'New Actor', actorKind: 'person', aliases: [] }],
    [
      '/events',
      {
        title: 'New Event',
        occurredOn: '2026-02-11',
        location: 'Cape Town',
      },
    ],
    [
      '/claims',
      { eventId: 'event-1', recordType: 'claim', summary: 'Claim summary' },
    ],
    ['/victims', { eventId: 'event-1', name: 'New Victim' }],
    ['/perpetrators', { eventId: 'event-1', name: 'New Perpetrator' }],
    [
      '/participants',
      { eventId: 'event-1', actorId: 'actor-1', role: 'observer' },
    ],
  ] as const)('POST %s returns entity contract shape', async (path, input) => {
    const response = await scaffold.dispatch('POST', path, {
      body: input,
      auth: { userId: 'user-1', permissions: [`${path.slice(1)}:create`] },
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        id: expect.any(String),
        ...input,
      },
    });
  });

  it('rejects unauthorized requests and accepts authorized requests', async () => {
    const unauthorized = await scaffold.dispatch('GET', '/actors', {
      auth: { userId: 'user-1' },
    });
    expect(unauthorized.status).toBe(403);

    const authorized = await scaffold.dispatch('GET', '/actors', {
      auth: { userId: 'user-1', permissions: ['actors:read'] },
    });
    expect(authorized.status).toBe(200);
  });

  it('binds authenticated user context into service operations', async () => {
    await scaffold.dispatch('GET', '/events', {
      auth: {
        userId: 'user-ctx-1',
        roles: ['editor'],
        permissions: ['events:read'],
        credential: { id: 42 },
      },
      query: { limit: '5' },
    });

    expect(services.events.list).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        userId: 'user-ctx-1',
        roles: ['editor'],
        permissions: ['events:read'],
        credential: { id: 42 },
      }),
    );
  });

  it('persists and retrieves claim archival linkage associations', async () => {
    const createResponse = await scaffold.dispatch('POST', '/claim-linkages', {
      auth: { userId: 'user-1', permissions: ['claims:linkages:create'] },
      body: {
        claimId: 'claim-1',
        linkedRecordType: 'archival_description',
        linkedRecordId: 'QUBIT-IO-44',
      },
    });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toMatchObject({
      success: true,
      data: {
        claimId: 'claim-1',
        linkedRecordType: 'archival_description',
        linkedRecordId: 'QUBIT-IO-44',
      },
    });

    const listResponse = await scaffold.dispatch('GET', '/claim-linkages', {
      auth: { userId: 'user-1', permissions: ['claims:linkages:read'] },
      query: {
        claimId: 'claim-1',
      },
    });

    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toMatchObject({
      success: true,
      data: {
        items: expect.arrayContaining([
          expect.objectContaining({
            claimId: 'claim-1',
            linkedRecordType: 'authority_record',
            linkedRecordId: 'QUBIT-AR-1',
          }),
          expect.objectContaining({
            claimId: 'claim-1',
            linkedRecordType: 'archival_description',
            linkedRecordId: 'QUBIT-IO-44',
          }),
        ]),
        total: 2,
      },
    });
  });

  it('GET /articles returns article list contract shape', async () => {
    const response = await scaffold.dispatch('GET', '/articles', {
      query: { limit: '10', offset: '0' },
      auth: { userId: 'user-1', permissions: ['articles:read'] },
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: {
        items: [articleSeed],
        total: 1,
      },
    });
  });

  it('POST /articles creates an article and returns 201 with entity shape', async () => {
    const input = {
      title: 'New Article',
      slug: 'new-article',
      body: 'Content here.',
      publicationDate: '2026-03-01',
      status: 'draft' as const,
      linkedClaimIds: [],
    };

    const response = await scaffold.dispatch('POST', '/articles', {
      body: input,
      auth: { userId: 'user-1', permissions: ['articles:create'] },
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        id: expect.any(String),
        ...input,
      },
    });
  });

  it('GET /articles/edit retrieves a single article by id for editing', async () => {
    const response = await scaffold.dispatch('GET', '/articles/edit', {
      query: { id: 'article-1' },
      auth: { userId: 'user-1', permissions: ['articles:read'] },
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: articleSeed,
    });
  });

  it('GET /articles/edit returns 404 when article is not found', async () => {
    const response = await scaffold.dispatch('GET', '/articles/edit', {
      query: { id: 'does-not-exist' },
      auth: { userId: 'user-1', permissions: ['articles:read'] },
    });

    expect(response.status).toBe(404);
  });

  it('GET /articles/edit returns 400 when id query param is missing', async () => {
    const response = await scaffold.dispatch('GET', '/articles/edit', {
      query: {},
      auth: { userId: 'user-1', permissions: ['articles:read'] },
    });

    expect(response.status).toBe(400);
  });

  it('POST /articles/edit updates an article and returns 200 with updated shape', async () => {
    const response = await scaffold.dispatch('POST', '/articles/edit', {
      body: { id: 'article-1', title: 'Updated Title', status: 'published' },
      auth: { userId: 'user-1', permissions: ['articles:update'] },
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        id: 'article-1',
        title: 'Updated Title',
        status: 'published',
      },
    });
  });

  it('rejects article routes when permission is not granted', async () => {
    const listResponse = await scaffold.dispatch('GET', '/articles', {
      auth: { userId: 'user-1' },
    });
    expect(listResponse.status).toBe(403);

    const editGetResponse = await scaffold.dispatch('GET', '/articles/edit', {
      query: { id: 'article-1' },
      auth: { userId: 'user-1' },
    });
    expect(editGetResponse.status).toBe(403);

    const editPostResponse = await scaffold.dispatch('POST', '/articles/edit', {
      body: { id: 'article-1', title: 'Attempt' },
      auth: { userId: 'user-1' },
    });
    expect(editPostResponse.status).toBe(403);
  });
});
