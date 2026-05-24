import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const synthesizeDungeonMasterSpeech = vi.fn()

vi.mock('../../src/services/ttsService', () => ({
  synthesizeDungeonMasterSpeech,
}))

const { createApp } = await import('../../src/app')

function buildAgent() {
  return request.agent(createApp())
}

async function registerUser(agent, suffix) {
  const response = await agent.post('/api/auth/register').send({
    name: `User ${suffix}`,
    email: `user-${suffix}@example.com`,
    password: 'StrongPass123!',
  })

  return response.body.csrfToken
}

async function createCampaign(agent, csrfToken) {
  const response = await agent
    .post('/api/campaigns')
    .set('X-CSRF-Token', csrfToken)
    .send({
      title: 'The Crown Below',
      playerName: 'Sigrae',
      characterName: 'Nyra',
      campaignIdea: 'Recover the lost crown from a haunted city.',
    })

  return response.body.campaign
}

describe('campaign TTS feature tests', () => {
  beforeEach(() => {
    synthesizeDungeonMasterSpeech.mockReset()
    synthesizeDungeonMasterSpeech.mockResolvedValue({
      audioBuffer: Buffer.from('mock-mp3-audio'),
      contentType: 'audio/mpeg',
    })
  })

  it('returns synthesized audio for a Dungeon Master message', async () => {
    const agent = buildAgent()
    const csrfToken = await registerUser(agent, 'tts-owner')
    const campaign = await createCampaign(agent, csrfToken)
    const assistantMessage = campaign.messages.find((message) => message.role === 'assistant')

    const response = await agent
      .post(`/api/campaigns/${campaign._id}/messages/${assistantMessage._id}/tts`)
      .set('X-CSRF-Token', csrfToken)
      .buffer(true)

    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toContain('audio/mpeg')
    expect(response.headers['cache-control']).toBe('no-store')
    expect(Number(response.headers['content-length'] || 0)).toBeGreaterThan(0)
    expect(Buffer.from(response.body).length).toBeGreaterThan(0)
  })

  it('rejects text-to-speech for non-assistant messages', async () => {
    const agent = buildAgent()
    const csrfToken = await registerUser(agent, 'tts-user-message')
    const campaign = await createCampaign(agent, csrfToken)

    const addMessageResponse = await agent
      .post(`/api/campaigns/${campaign._id}/messages`)
      .set('X-CSRF-Token', csrfToken)
      .send({
        message: 'I draw my sword and step into the fog.',
      })

    expect(addMessageResponse.status).toBe(503)

    const userMessage = addMessageResponse.body.campaign.messages.find((message) => message.role === 'user')
    const response = await agent
      .post(`/api/campaigns/${campaign._id}/messages/${userMessage._id}/tts`)
      .set('X-CSRF-Token', csrfToken)

    expect(response.status).toBe(400)
    expect(response.body.error).toBe('Only Dungeon Master messages can be read aloud.')
    expect(synthesizeDungeonMasterSpeech).not.toHaveBeenCalled()
  })

  it('does not allow another user to read a campaign message aloud', async () => {
    const ownerAgent = buildAgent()
    const ownerCsrfToken = await registerUser(ownerAgent, 'tts-owner-2')
    const campaign = await createCampaign(ownerAgent, ownerCsrfToken)
    const assistantMessage = campaign.messages.find((message) => message.role === 'assistant')

    const intruderAgent = buildAgent()
    const intruderCsrfToken = await registerUser(intruderAgent, 'tts-intruder')
    const response = await intruderAgent
      .post(`/api/campaigns/${campaign._id}/messages/${assistantMessage._id}/tts`)
      .set('X-CSRF-Token', intruderCsrfToken)

    expect(response.status).toBe(404)
    expect(response.body.error).toBe('Campaign not found.')
    expect(synthesizeDungeonMasterSpeech).not.toHaveBeenCalled()
  })
})
