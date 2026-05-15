import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatRelativeCampaignActivity } from '../utils/campaign'

function IntroScreen({
  aiInfoOpen,
  campaign,
  campaigns,
  campaignsLoading,
  campaignForm,
  editingCampaignId,
  campaignSaving,
  campaignDeletingId,
  onSaveCampaign,
  onCampaignFormChange,
  onOpenAiInfo,
  onOpenCampaign,
  onBeginCampaignCreate,
  onBeginCampaignEdit,
  onDeleteCampaign,
  onCancelCampaignForm,
}) {
  const [isMobileLayout, setIsMobileLayout] = useState(false)
  const [mobileVaultOpen, setMobileVaultOpen] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 720px)')

    const updateLayout = () => {
      setIsMobileLayout(mediaQuery.matches)
    }

    updateLayout()
    mediaQuery.addEventListener('change', updateLayout)

    return () => mediaQuery.removeEventListener('change', updateLayout)
  }, [])

  const formHeading = editingCampaignId
    ? 'Update this campaign'
    : 'Start a campaign worth remembering.'

  function closeMobileVault() {
    setMobileVaultOpen(false)
  }

  function handleOpenCampaign(campaignId) {
    closeMobileVault()
    void onOpenCampaign(campaignId)
  }

  function handleBeginCampaignCreate() {
    closeMobileVault()
    onBeginCampaignCreate()
  }

  function handleBeginCampaignEdit(entry) {
    closeMobileVault()
    onBeginCampaignEdit(entry)
  }

  function handleDeleteCampaign(campaignId) {
    closeMobileVault()
    void onDeleteCampaign(campaignId)
  }

  function renderCampaignLibrary(showModalHeader = false, showHeader = true) {
    return (
      <>
        {showHeader ? (
          <div className="campaign-library-header">
            <div>
              <p className="eyebrow">Campaign vault</p>
              <h3>Saved sessions</h3>
            </div>
            <button type="button" className="ghost" onClick={handleBeginCampaignCreate}>
              <Plus size={16} />
              New
            </button>
          </div>
        ) : null}

        {showModalHeader ? (
          <p className="campaign-library-empty mobile-vault-copy">
            Jump back into a saved session or start a fresh campaign without leaving this screen.
          </p>
        ) : null}

        {campaignsLoading ? (
          <p className="campaign-library-empty">Loading campaign vault...</p>
        ) : campaigns.length > 0 ? (
          <div className="campaign-library-list">
            {campaigns.map((entry) => {
              const isActive = campaign?._id === entry._id

              return (
                <article key={entry._id} className={`campaign-card ${isActive ? 'active' : ''}`}>
                  <div className="campaign-card-copy">
                    <div className="campaign-card-title-row">
                      <strong>{entry.title}</strong>
                      {isActive ? <span className="campaign-badge">Active</span> : null}
                    </div>
                    <p>{entry.characterName} led by {entry.playerName}</p>
                    <p className="campaign-card-meta">
                      {entry.messageCount} messages / {entry.memoryCount} memories / {entry.inventoryCount} items
                    </p>
                    <p className="campaign-card-meta">
                      Last touched {formatRelativeCampaignActivity(entry)}
                    </p>
                  </div>
                  <div className="campaign-card-actions">
                    <button
                      type="button"
                      className="ghost"
                      onClick={() => handleOpenCampaign(entry._id)}
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      className="ghost"
                      onClick={() => handleBeginCampaignEdit(entry)}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      className="ghost inventory-action danger"
                      onClick={() => handleDeleteCampaign(entry._id)}
                      disabled={campaignDeletingId === entry._id}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <p className="campaign-library-empty">
            No campaigns yet. Your first one will show up here once created.
          </p>
        )}
      </>
    )
  }

  return (
    <div className="intro-layout intro-layout-wide">
      <div className="intro-actions">
        <button type="button" className="ghost" onClick={onOpenAiInfo} aria-pressed={aiInfoOpen}>
          View AIs
        </button>
      </div>

      <section className="intro-panel">
        <p className="eyebrow">AI Dungeon Master</p>
        <h1>{formHeading}</h1>
        <p className="lede">
          Create a fresh adventure, or jump back into any saved campaign without losing the others.
        </p>

        {isMobileLayout ? (
          <div className="intro-mobile-toolbar">
            <button
              type="button"
              className="ghost intro-mobile-toolbar-button"
              onClick={() => setMobileVaultOpen(true)}
            >
              View saved sessions
            </button>
            <button
              type="button"
              className="ghost intro-mobile-toolbar-button"
              onClick={onOpenAiInfo}
              aria-pressed={aiInfoOpen}
            >
              AI providers
            </button>
          </div>
        ) : null}

        <form className="campaign-form" onSubmit={onSaveCampaign}>
          <section className="form-section">
            <div className="form-section-copy">
              <p className="choice-label">Campaign basics</p>
              <p className="campaign-library-empty">
                Name the world, set your party lead, and make the campaign easy to recognize later.
              </p>
            </div>

            <label>
              Campaign title
              <input
                value={campaignForm.title}
                onChange={(event) =>
                  onCampaignFormChange((current) => ({ ...current, title: event.target.value }))
                }
                placeholder="The Ashen Crown"
              />
            </label>

            <label>
              Your name
              <input
                value={campaignForm.playerName}
                onChange={(event) =>
                  onCampaignFormChange((current) => ({
                    ...current,
                    playerName: event.target.value,
                  }))
                }
                placeholder="Aria"
              />
            </label>

            <label>
              Character name
              <input
                value={campaignForm.characterName}
                onChange={(event) =>
                  onCampaignFormChange((current) => ({
                    ...current,
                    characterName: event.target.value,
                  }))
                }
                placeholder="Seraphine Vale"
              />
            </label>
          </section>

          <section className="form-section">
            <div className="form-section-copy">
              <p className="choice-label">Adventure setup</p>
              <p className="campaign-library-empty">
                Give the Dungeon Master the premise, mood, and pace you want from the first session.
              </p>
            </div>

            <label>
              Campaign premise
              <textarea
                rows="4"
                value={campaignForm.campaignIdea}
                onChange={(event) =>
                  onCampaignFormChange((current) => ({
                    ...current,
                    campaignIdea: event.target.value,
                  }))
                }
                placeholder="What kind of adventure should the DM run?"
              />
            </label>

            <div className="form-row">
              <label>
                Tone
                <textarea
                  rows="4"
                  value={campaignForm.tone}
                  onChange={(event) =>
                    onCampaignFormChange((current) => ({
                      ...current,
                      tone: event.target.value,
                    }))
                  }
                  placeholder="Describe the tone in more detail, like grim political fantasy, cozy adventure, tragic heroism, or eerie mystery..."
                />
              </label>

              <label>
                Play style
                <textarea
                  rows="4"
                  value={campaignForm.playStyle}
                  onChange={(event) =>
                    onCampaignFormChange((current) => ({
                      ...current,
                      playStyle: event.target.value,
                    }))
                  }
                  placeholder="Describe how you want the campaign to play, like roleplay-heavy, tactical combat, slow-burn mystery, exploration, or character drama..."
                />
              </label>
            </div>
          </section>

          <div className="campaign-form-actions">
            <button type="submit" className="primary" disabled={campaignSaving}>
              {campaignSaving
                ? editingCampaignId
                  ? 'Updating campaign...'
                  : 'Summoning the campaign...'
                : editingCampaignId
                  ? 'Update campaign'
                  : 'Start campaign'}
            </button>
            {(editingCampaignId || campaign) ? (
              <button type="button" className="ghost" onClick={onCancelCampaignForm}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </section>

      {!isMobileLayout ? <aside className="campaign-library">{renderCampaignLibrary()}</aside> : null}

      {isMobileLayout && mobileVaultOpen ? (
        <div className="modal-backdrop mobile-vault-backdrop" onClick={closeMobileVault}>
          <section
            className="modal-panel campaign-library mobile-vault-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header-shell">
              <div className="modal-header mobile-menu-header">
                <div>
                  <p className="choice-label">Campaign vault</p>
                  <h3>Saved sessions</h3>
                </div>
                <button
                  type="button"
                  className="ghost modal-close-button"
                  onClick={closeMobileVault}
                  aria-label="Close saved sessions"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="campaign-library-empty mobile-vault-copy">
                Jump back into a saved session or start a fresh campaign without leaving this screen.
              </p>
            </div>
            <div className="mobile-vault-content">
              {renderCampaignLibrary(false, false)}
            </div>
            <div className="mobile-vault-footer">
              <button type="button" className="primary" onClick={handleBeginCampaignCreate}>
                <Plus size={16} />
                New campaign
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <p className="intro-credit">Sigrae Derf Gabriel</p>
    </div>
  )
}

export default IntroScreen
