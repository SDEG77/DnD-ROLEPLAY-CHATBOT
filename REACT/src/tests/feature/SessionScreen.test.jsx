import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const synthesizeCampaignMessageSpeech = vi.fn()

vi.mock('../../services/campaignApi', () => ({
  synthesizeCampaignMessageSpeech,
}))

vi.mock('../../components/feedback', () => ({
  InventoryEditorModal: () => null,
  InventoryModal: () => null,
}))

vi.mock('../../components/CampaignManagerModal', () => ({
  default: () => null,
}))

import SessionScreen from '../../components/SessionScreen'

function createProps() {
  return {
    user: { _id: 'user-1', name: 'Sigrae' },
    campaign: {
      _id: 'campaign-1',
      title: 'The Crown Below',
      characterName: 'Nyra',
      tone: 'Dark fantasy',
      activeAiProvider: 'Mock Provider',
      activeAiModel: 'mock-model',
      activeAiMode: 'Standard',
      messages: [
        {
          _id: 'message-user-1',
          role: 'user',
          content: 'I step into the ruined hall.',
        },
        {
          _id: 'message-assistant-1',
          role: 'assistant',
          content: 'Torches flare to life as the hall answers your footsteps.',
        },
      ],
    },
    campaigns: [],
    campaignsLoading: false,
    campaignManagerOpen: false,
    campaignDeletingId: null,
    topbarVisible: true,
    setTopbarVisible: vi.fn(),
    chatViewportRef: {
      current: {
        scrollTop: 0,
        scrollTo: vi.fn(),
        getBoundingClientRect: () => ({ top: 0 }),
      },
    },
    quickChoices: [],
    loading: false,
    draft: '',
    setDraft: vi.fn(),
    inventoryOpen: false,
    inventoryEditorOpen: false,
    inventoryForm: {},
    setInventoryForm: vi.fn(),
    editingInventoryId: null,
    inventorySaving: false,
    onChooseOption: vi.fn(),
    onSendMessage: vi.fn((event) => event.preventDefault()),
    onOpenInventory: vi.fn(),
    onCloseInventory: vi.fn(),
    onBeginInventoryCreate: vi.fn(),
    onBeginInventoryEdit: vi.fn(),
    onCloseInventoryEditor: vi.fn(),
    onSaveInventoryItem: vi.fn(),
    onDeleteInventoryItem: vi.fn(),
    onOpenCampaignManager: vi.fn(),
    onCloseCampaignManager: vi.fn(),
    onOpenCampaign: vi.fn(),
    onBeginCampaignCreate: vi.fn(),
    onBeginCampaignEdit: vi.fn(),
    onDeleteCampaign: vi.fn(),
    onScrollChatToBottom: vi.fn(),
    onOpenAiInfo: vi.fn(),
    onLogout: vi.fn(),
  }
}

describe('SessionScreen speech playback', () => {
  let audioInstances
  let createObjectURL
  let revokeObjectURL

  beforeEach(() => {
    audioInstances = []

    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })

    window.requestAnimationFrame = vi.fn((callback) => {
      callback()
      return 1
    })

    window.cancelAnimationFrame = vi.fn()

    createObjectURL = vi.fn(() => 'blob:dm-audio')
    revokeObjectURL = vi.fn()

    URL.createObjectURL = createObjectURL
    URL.revokeObjectURL = revokeObjectURL

    globalThis.Audio = vi.fn().mockImplementation((src) => {
      const audio = {
        src,
        currentTime: 0,
        play: vi.fn().mockResolvedValue(undefined),
        pause: vi.fn(),
        onended: null,
        onerror: null,
      }

      audioInstances.push(audio)
      return audio
    })

    synthesizeCampaignMessageSpeech.mockReset()
    synthesizeCampaignMessageSpeech.mockResolvedValue(new Blob(['audio-bytes'], { type: 'audio/mpeg' }))
  })

  it('prefetches the latest assistant speech and reuses the cached audio for replay', async () => {
    render(<SessionScreen {...createProps()} />)

    await waitFor(() => {
      expect(synthesizeCampaignMessageSpeech).toHaveBeenCalledTimes(1)
    })

    expect(synthesizeCampaignMessageSpeech).toHaveBeenCalledWith('campaign-1', 'message-assistant-1')
    expect(createObjectURL).toHaveBeenCalledTimes(1)

    const readOutLoudButton = screen.getByRole('button', { name: /read out loud/i })

    fireEvent.click(readOutLoudButton)

    await waitFor(() => {
      expect(globalThis.Audio).toHaveBeenCalledTimes(1)
    })

    expect(audioInstances[0].src).toBe('blob:dm-audio')
    expect(audioInstances[0].play).toHaveBeenCalledTimes(1)
    expect(synthesizeCampaignMessageSpeech).toHaveBeenCalledTimes(1)

    const stopButton = await screen.findByRole('button', { name: /stop reading/i })
    fireEvent.click(stopButton)

    expect(audioInstances[0].pause).toHaveBeenCalledTimes(1)
    expect(audioInstances[0].currentTime).toBe(0)

    fireEvent.click(screen.getByRole('button', { name: /read out loud/i }))

    await waitFor(() => {
      expect(globalThis.Audio).toHaveBeenCalledTimes(2)
    })

    expect(audioInstances[1].src).toBe('blob:dm-audio')
    expect(audioInstances[1].play).toHaveBeenCalledTimes(1)
    expect(synthesizeCampaignMessageSpeech).toHaveBeenCalledTimes(1)
    expect(createObjectURL).toHaveBeenCalledTimes(1)
  })
})
