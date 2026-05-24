import { beforeEach, describe, expect, it, vi } from 'vitest'

const callMock = vi.fn()
const EdgeTTSMock = vi.fn()

vi.mock('@seepine/edge-tts', () => ({
  EdgeTTS: EdgeTTSMock,
}))

async function loadService() {
  const serviceModule = await import('../../src/services/ttsService')
  return serviceModule.default || serviceModule
}

describe('ttsService', () => {
  beforeEach(() => {
    vi.resetModules()
    callMock.mockReset()
    EdgeTTSMock.mockReset()
    EdgeTTSMock.mockImplementation(() => ({
      call: callMock,
    }))
  })

  it('rejects empty text before calling the TTS client', async () => {
    const { synthesizeDungeonMasterSpeech } = await loadService()

    await expect(synthesizeDungeonMasterSpeech('   ')).rejects.toThrow(
      'Text is required to synthesize speech.',
    )
    expect(EdgeTTSMock).not.toHaveBeenCalled()
  })

  it('builds the Dungeon Master voice request and returns mp3 audio', async () => {
    callMock.mockResolvedValue({
      data: Buffer.from('mock-audio'),
    })

    const { synthesizeDungeonMasterSpeech } = await loadService()
    const result = await synthesizeDungeonMasterSpeech('  The torchlight flickers.  ')

    expect(EdgeTTSMock).toHaveBeenCalledWith({
      voice: 'en-US-ChristopherNeural',
      lang: 'en-US',
      outputFormat: 'audio-24khz-96kbitrate-mono-mp3',
      rate: '-12%',
      pitch: '-8Hz',
    })
    expect(callMock).toHaveBeenCalledWith('The torchlight flickers.')
    expect(result).toEqual({
      audioBuffer: Buffer.from('mock-audio'),
      contentType: 'audio/mpeg',
    })
  })

  it('throws a useful error when synthesis returns no audio', async () => {
    callMock.mockResolvedValue({
      data: null,
    })

    const { synthesizeDungeonMasterSpeech } = await loadService()

    await expect(synthesizeDungeonMasterSpeech('A door groans open.')).rejects.toThrow(
      'No audio was generated for the requested speech.',
    )
  })
})
