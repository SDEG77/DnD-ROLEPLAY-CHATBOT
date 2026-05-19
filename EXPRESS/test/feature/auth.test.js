const request = require('supertest');
const { createApp } = require('../../src/app');

const app = createApp();

describe('auth feature tests', () => {
  it('registers a user and returns auth cookies', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'Sigrae',
      email: 'sigrae@example.com',
      password: 'StrongPass123!',
    });

    expect(response.status).toBe(201);
    expect(response.body.user).toMatchObject({
      name: 'Sigrae',
      email: 'sigrae@example.com',
    });
    expect(response.body.csrfToken).toBeTruthy();
    expect(response.headers['set-cookie']).toEqual(
      expect.arrayContaining([
        expect.stringContaining('dnd_dm_auth='),
        expect.stringContaining('dnd_dm_csrf='),
      ]),
    );
  });

  it('returns the current user for an authenticated session', async () => {
    const agent = request.agent(app);
    const registerResponse = await agent.post('/api/auth/register').send({
      name: 'Sigrae',
      email: 'sigrae@example.com',
      password: 'StrongPass123!',
    });

    const meResponse = await agent.get('/api/auth/me');

    expect(registerResponse.status).toBe(201);
    expect(meResponse.status).toBe(200);
    expect(meResponse.body.user).toMatchObject({
      name: 'Sigrae',
      email: 'sigrae@example.com',
    });
    expect(meResponse.body.csrfToken).toBeTruthy();
  });

  it('rejects protected campaign writes when the csrf header is missing', async () => {
    const agent = request.agent(app);

    await agent.post('/api/auth/register').send({
      name: 'Sigrae',
      email: 'sigrae@example.com',
      password: 'StrongPass123!',
    });

    const response = await agent.post('/api/campaigns').send({
      title: 'The Crown Below',
      playerName: 'Sigrae',
      characterName: 'Nyra',
      campaignIdea: 'Recover the lost crown',
    });

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('CSRF validation failed.');
  });

  it('logs a user out when a valid csrf token is supplied', async () => {
    const agent = request.agent(app);
    const registerResponse = await agent.post('/api/auth/register').send({
      name: 'Sigrae',
      email: 'sigrae@example.com',
      password: 'StrongPass123!',
    });

    const logoutResponse = await agent
      .post('/api/auth/logout')
      .set('X-CSRF-Token', registerResponse.body.csrfToken);
    const meResponse = await agent.get('/api/auth/me');

    expect(logoutResponse.status).toBe(200);
    expect(logoutResponse.body).toEqual({ ok: true });
    expect(meResponse.status).toBe(401);
  });
});
