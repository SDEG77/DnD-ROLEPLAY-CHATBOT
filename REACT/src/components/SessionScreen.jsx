import {
  Backpack,
  Bot,
  BookCopy,
  ChevronsDown,
  Menu,
  Minimize2,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  InventoryEditorModal,
  InventoryModal,
} from './feedback'
import CampaignManagerModal from './CampaignManagerModal'
import { formatAiMode, formatAiProvider } from '../utils/campaign'

function SessionScreen({
  user,
  campaign,
  campaigns,
  campaignsLoading,
  campaignManagerOpen,
  campaignDeletingId,
  topbarVisible,
  setTopbarVisible,
  chatViewportRef,
  quickChoices,
  loading,
  draft,
  setDraft,
  inventoryOpen,
  inventoryEditorOpen,
  inventoryForm,
  setInventoryForm,
  editingInventoryId,
  inventorySaving,
  onChooseOption,
  onSendMessage,
  onOpenInventory,
  onCloseInventory,
  onBeginInventoryCreate,
  onBeginInventoryEdit,
  onCloseInventoryEditor,
  onSaveInventoryItem,
  onDeleteInventoryItem,
  onOpenCampaignManager,
  onCloseCampaignManager,
  onOpenCampaign,
  onBeginCampaignCreate,
  onBeginCampaignEdit,
  onDeleteCampaign,
  onScrollChatToBottom,
  onOpenAiInfo,
  onLogout,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobileLayout, setIsMobileLayout] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 720px)')

    const updateLayout = () => {
      setIsMobileLayout(mediaQuery.matches)
    }

    updateLayout()
    mediaQuery.addEventListener('change', updateLayout)

    return () => mediaQuery.removeEventListener('change', updateLayout)
  }, [])

  useEffect(() => {
    if (!isMobileLayout && mobileMenuOpen) {
      setMobileMenuOpen(false)
    }
  }, [isMobileLayout, mobileMenuOpen])

  useEffect(() => {
    if (!mobileMenuOpen) {
      return undefined
    }

    const originalOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileMenuOpen])

  function openMobileMenu() {
    setMobileMenuOpen(true)
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false)
  }

  function handleJumpToBottom() {
    closeMobileMenu()
    onScrollChatToBottom('smooth')
  }

  function handleOpenInventory() {
    closeMobileMenu()
    onOpenInventory()
  }

  function handleOpenCampaignManager() {
    closeMobileMenu()
    onOpenCampaignManager()
  }

  function handleOpenAiInfo() {
    closeMobileMenu()
    onOpenAiInfo()
  }

  function handleHideControls() {
    closeMobileMenu()
    setTopbarVisible(false)
  }

  return (
    <>
      {!topbarVisible ? (
        <button
          type="button"
          className="floating-action topbar-toggle"
          onClick={() => setTopbarVisible(true)}
          aria-label="Show controls"
          title="Show controls"
        >
          <Menu size={20} />
        </button>
      ) : null}

      <main className={`session-stage ${topbarVisible ? 'with-topbar' : 'without-topbar'}`}>
        {topbarVisible ? (
          isMobileLayout ? (
            <header className="story-header fixed mobile-story-header">
              <div className="mobile-story-header-main">
                <div className="mobile-story-copy">
                  <p className="eyebrow">Live session</p>
                  <h2>{campaign.title}</h2>
                </div>
                <button
                  type="button"
                  className="icon-button mobile-menu-trigger"
                  onClick={openMobileMenu}
                  aria-label="Open session menu"
                  title="Session menu"
                >
                  <Menu size={18} />
                </button>
              </div>
              <div className="campaign-actions mobile-campaign-summary">
                <span className="campaign-badge">{user?.name}</span>
                <span className="campaign-badge">{campaign.characterName}</span>
                <span className="campaign-badge">{campaign.tone}</span>
              </div>
            </header>
          ) : (
            <header className="story-header fixed">
              <div>
                <p className="eyebrow">Live session</p>
                <h2>{campaign.title}</h2>
              </div>
              <div className="campaign-actions">
                <span className="campaign-badge">{campaign.characterName}</span>
                <span className="campaign-badge">{campaign.tone}</span>
                <span className="campaign-badge">{user?.name}</span>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => onScrollChatToBottom('smooth')}
                  aria-label="Jump to bottom"
                  title="Jump to bottom"
                >
                  <ChevronsDown size={18} />
                </button>
                <button
                  type="button"
                  className="icon-button"
                  onClick={onOpenCampaignManager}
                  aria-label="Open campaign vault"
                  title="Campaign vault"
                >
                  <BookCopy size={18} />
                </button>
                <button
                  type="button"
                  className="icon-button"
                  onClick={onLogout}
                  aria-label="Log out"
                  title="Log out"
                >
                  <X size={18} />
                </button>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => setTopbarVisible(false)}
                  aria-label="Hide top bar"
                  title="Hide top bar"
                >
                  <Minimize2 size={18} />
                </button>
              </div>
            </header>
          )
        ) : null}

        <section className="chat-log" ref={chatViewportRef}>
          {campaign.messages.map((message) => (
            <article key={message._id} className={`message ${message.role}`}>
              <p className="message-role">
                {message.role === 'assistant' ? 'Dungeon Master' : campaign.characterName}
              </p>
              <p className="message-content">{message.content}</p>
            </article>
          ))}
        </section>

        {quickChoices.length > 0 ? (
          <section className="quick-choices">
            <p className="choice-label">Quick choices</p>
            <div className="choice-grid">
              {quickChoices.map((choice) => (
                <button
                  key={choice}
                  type="button"
                  className="choice-button"
                  disabled={loading}
                  onClick={() => void onChooseOption(choice)}
                >
                  {choice}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <form className="composer" onSubmit={onSendMessage}>
          <textarea
            rows="4"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="What does your character say or do next?"
            disabled={loading}
          />
          <div className="composer-actions">
            <button type="submit" className="primary" disabled={loading || !draft.trim()}>
              {loading ? 'Thinking...' : 'Send action'}
            </button>
          </div>
        </form>
      </main>

      <div className="ai-indicator" aria-label="Current AI details">
        <button type="button" className="ai-indicator-trigger" aria-label="Current AI">
          <Bot size={18} />
        </button>
        <div className="ai-indicator-tooltip">
          <span className="ai-indicator-label">Current AI</span>
          <strong>{formatAiProvider(campaign)}</strong>
          <span className="ai-indicator-model">{campaign.activeAiModel || 'No active model yet'}</span>
          <span className="ai-indicator-mode">{formatAiMode(campaign)}</span>
        </div>
      </div>

      {isMobileLayout && mobileMenuOpen ? (
        <div className="modal-backdrop mobile-menu-backdrop" onClick={closeMobileMenu}>
          <section
            className="modal-panel mobile-menu-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header-shell">
              <div className="modal-header mobile-menu-header">
                <div>
                  <p className="choice-label">Session menu</p>
                  <h3>{campaign.title}</h3>
                </div>
                <button
                  type="button"
                  className="ghost modal-close-button"
                  onClick={closeMobileMenu}
                  aria-label="Close session menu"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="mobile-menu-summary">
              <span className="campaign-badge">{campaign.characterName}</span>
              <span className="campaign-badge">{campaign.tone}</span>
              <span className="campaign-badge">
                {formatAiProvider(campaign)} / {formatAiMode(campaign)}
              </span>
            </div>

            <div className="mobile-menu-actions">
              <button type="button" className="ghost mobile-menu-action" onClick={handleJumpToBottom}>
                <ChevronsDown size={18} />
                Jump to latest
              </button>
              <button
                type="button"
                className="ghost mobile-menu-action"
                onClick={handleOpenInventory}
              >
                <Backpack size={18} />
                Open inventory
              </button>
              <button
                type="button"
                className="ghost mobile-menu-action"
                onClick={handleOpenCampaignManager}
              >
                <BookCopy size={18} />
                Campaign vault
              </button>
              <button type="button" className="ghost mobile-menu-action" onClick={handleOpenAiInfo}>
                <Bot size={18} />
                View AI details
              </button>
              <button type="button" className="ghost mobile-menu-action" onClick={onLogout}>
                <X size={18} />
                Log out
              </button>
              <button type="button" className="ghost mobile-menu-action" onClick={handleHideControls}>
                <Minimize2 size={18} />
                Hide controls
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {!isMobileLayout ? (
        <button
          type="button"
          className="floating-action inventory-fab"
          onClick={onOpenInventory}
          aria-label="Open inventory"
          title="Inventory"
        >
          <Backpack size={20} />
        </button>
      ) : null}

      <InventoryModal
        open={inventoryOpen}
        campaign={campaign}
        inventorySaving={inventorySaving}
        onAddItem={onBeginInventoryCreate}
        onClose={onCloseInventory}
        onEditItem={onBeginInventoryEdit}
        onDeleteItem={onDeleteInventoryItem}
      />

      <InventoryEditorModal
        open={inventoryEditorOpen}
        inventoryForm={inventoryForm}
        setInventoryForm={setInventoryForm}
        editingInventoryId={editingInventoryId}
        inventorySaving={inventorySaving}
        onClose={onCloseInventoryEditor}
        onSubmit={onSaveInventoryItem}
      />

      <CampaignManagerModal
        open={campaignManagerOpen}
        campaign={campaign}
        campaigns={campaigns}
        campaignsLoading={campaignsLoading}
        campaignDeletingId={campaignDeletingId}
        onClose={onCloseCampaignManager}
        onOpenCampaign={onOpenCampaign}
        onBeginCampaignCreate={onBeginCampaignCreate}
        onBeginCampaignEdit={onBeginCampaignEdit}
        onDeleteCampaign={onDeleteCampaign}
      />
    </>
  )
}

export default SessionScreen
