import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import IntroScreen from './components/IntroScreen'
import SessionScreen from './components/SessionScreen'
import AuthPage from './components/AuthPage'
import LandingPage from './components/LandingPage'
import AdminUnlockPage from './components/AdminUnlockPage'
import AdminConsolePage from './components/AdminConsolePage'
import { AiInfoModal, ErrorViewer, Toast } from './components/feedback'
import { useCampaignSession } from './hooks/useCampaignSession'
import { fetchCurrentUser, logoutUser } from './services/authApi'
import { fetchAdminSession, unlockAdminSession } from './services/adminApi'
import { clearAuthSession, getStoredUser } from './utils/authStorage'
import { clearAdminSession } from './utils/adminStorage'

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [authReady, setAuthReady] = useState(false)
  const [adminReady, setAdminReady] = useState(false)
  const [user, setUser] = useState(() => getStoredUser())
  const [adminSession, setAdminSession] = useState(null)
  const [adminUnlocking, setAdminUnlocking] = useState(false)
  const [adminError, setAdminError] = useState('')

  useEffect(() => {
    void Promise.allSettled([fetchCurrentUser(), fetchAdminSession()]).then((results) => {
      const [userResult, adminResult] = results

      if (userResult.status === 'fulfilled') {
        setUser(userResult.value.user)
      } else {
        clearAuthSession()
        setUser(null)
      }

      if (adminResult.status === 'fulfilled') {
        setAdminSession(adminResult.value.admin)
      } else {
        clearAdminSession()
        setAdminSession(null)
      }

      setAuthReady(true)
      setAdminReady(true)
    })
  }, [])

  function handleAuthSuccess(nextUser) {
    setUser(nextUser)
    navigate('/app', { replace: true })
  }

  function handleLogout() {
    void logoutUser().finally(() => {
      setUser(null)

      if (location.pathname.startsWith('/app')) {
        navigate('/login', { replace: true })
      }
    })
  }

  async function handleAdminUnlock(payload) {
    setAdminUnlocking(true)
    setAdminError('')

    try {
      const data = await unlockAdminSession(payload)
      setAdminSession(data.admin)
      navigate('/endmin/dashboard', { replace: true })
    } catch (error) {
      setAdminError(error.message || 'Failed to unlock admin console.')
    } finally {
      setAdminUnlocking(false)
    }
  }

  function handleAdminLogout() {
    clearAdminSession()
    setAdminSession(null)
    setAdminError('')
  }

  if (!authReady || !adminReady) {
    return (
      <div className="auth-shell">
        <section className="auth-card auth-card-compact">
          <p className="eyebrow">AI Dungeon Master</p>
          <h1>Loading your vault</h1>
          <p className="lede">Restoring your session and checking account access.</p>
        </section>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage user={user} />} />
      <Route
        path="/login"
        element={
          user ? <Navigate to="/app" replace /> : <AuthPage mode="login" onAuthSuccess={handleAuthSuccess} />
        }
      />
      <Route
        path="/register"
        element={
          user ? (
            <Navigate to="/app" replace />
          ) : (
            <AuthPage mode="register" onAuthSuccess={handleAuthSuccess} />
          )
        }
      />
      <Route
        path="/app"
        element={
          user ? (
            <AuthenticatedExperience user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/endmin"
        element={
          <AdminUnlockPage
            grantToken={new URLSearchParams(location.search).get('grant') || ''}
            adminSession={adminSession}
            onUnlock={handleAdminUnlock}
            unlocking={adminUnlocking}
            errorMessage={adminError}
          />
        }
      />
      <Route
        path="/endmin/dashboard"
        element={
          adminSession ? (
            <AdminConsolePage
              adminSession={adminSession}
              view="dashboard"
              onAdminLogout={handleAdminLogout}
            />
          ) : (
            <Navigate to="/endmin" replace />
          )
        }
      />
      <Route
        path="/endmin/users"
        element={
          adminSession ? (
            <AdminConsolePage
              adminSession={adminSession}
              view="users"
              onAdminLogout={handleAdminLogout}
            />
          ) : (
            <Navigate to="/endmin" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to={user ? '/app' : '/'} replace />} />
    </Routes>
  )
}

function AuthenticatedExperience({ user, onLogout }) {
  const [aiInfoOpen, setAiInfoOpen] = useState(false)
  const {
    campaign,
    campaigns,
    campaignsLoading,
    campaignForm,
    setCampaignForm,
    editingCampaignId,
    campaignManagerOpen,
    campaignSaving,
    campaignDeletingId,
    topbarVisible,
    setTopbarVisible,
    inventoryOpen,
    inventoryEditorOpen,
    inventoryForm,
    setInventoryForm,
    editingInventoryId,
    inventorySaving,
    draft,
    setDraft,
    loading,
    toast,
    errorDetail,
    errorViewerOpen,
    chatViewportRef,
    quickChoices,
    saveCampaign,
    openCampaign,
    beginCampaignCreate,
    beginCampaignEdit,
    deleteCampaign,
    sendMessage,
    chooseOption,
    saveInventoryItem,
    deleteInventoryItem,
    openInventoryModal,
    closeInventoryModal,
    beginInventoryCreate,
    beginInventoryEdit,
    closeInventoryEditor,
    dismissToast,
    openErrorViewer,
    closeErrorViewer,
    openCampaignManager,
    closeCampaignManager,
    cancelCampaignForm,
    scrollChatToBottom,
  } = useCampaignSession(user._id, onLogout)

  if (!campaign) {
    return (
      <div className="intro-shell">
        <IntroScreen
          user={user}
          aiInfoOpen={aiInfoOpen}
          campaign={campaign}
          campaigns={campaigns}
          campaignsLoading={campaignsLoading}
          campaignForm={campaignForm}
          editingCampaignId={editingCampaignId}
          campaignSaving={campaignSaving}
          campaignDeletingId={campaignDeletingId}
          onSaveCampaign={saveCampaign}
          onCampaignFormChange={setCampaignForm}
          onOpenAiInfo={() => setAiInfoOpen(true)}
          onOpenCampaign={openCampaign}
          onBeginCampaignCreate={beginCampaignCreate}
          onBeginCampaignEdit={beginCampaignEdit}
          onDeleteCampaign={deleteCampaign}
          onCancelCampaignForm={cancelCampaignForm}
          onLogout={onLogout}
        />
        <AiInfoModal open={aiInfoOpen} onClose={() => setAiInfoOpen(false)} />
        <Toast toast={toast} onClose={dismissToast} onViewError={openErrorViewer} />
        <ErrorViewer open={errorViewerOpen} detail={errorDetail} onClose={closeErrorViewer} />
      </div>
    )
  }

  return (
    <div className="session-shell">
      <SessionScreen
        user={user}
        campaign={campaign}
        campaigns={campaigns}
        campaignsLoading={campaignsLoading}
        campaignManagerOpen={campaignManagerOpen}
        campaignDeletingId={campaignDeletingId}
        topbarVisible={topbarVisible}
        setTopbarVisible={setTopbarVisible}
        chatViewportRef={chatViewportRef}
        quickChoices={quickChoices}
        loading={loading}
        draft={draft}
        setDraft={setDraft}
        inventoryOpen={inventoryOpen}
        inventoryEditorOpen={inventoryEditorOpen}
        inventoryForm={inventoryForm}
        setInventoryForm={setInventoryForm}
        editingInventoryId={editingInventoryId}
        inventorySaving={inventorySaving}
        onChooseOption={chooseOption}
        onSendMessage={sendMessage}
        onOpenInventory={openInventoryModal}
        onCloseInventory={closeInventoryModal}
        onBeginInventoryCreate={beginInventoryCreate}
        onBeginInventoryEdit={beginInventoryEdit}
        onCloseInventoryEditor={closeInventoryEditor}
        onSaveInventoryItem={saveInventoryItem}
        onDeleteInventoryItem={deleteInventoryItem}
        onOpenCampaignManager={openCampaignManager}
        onCloseCampaignManager={closeCampaignManager}
        onOpenCampaign={openCampaign}
        onBeginCampaignCreate={beginCampaignCreate}
        onBeginCampaignEdit={beginCampaignEdit}
        onDeleteCampaign={deleteCampaign}
        onScrollChatToBottom={scrollChatToBottom}
        onOpenAiInfo={() => setAiInfoOpen(true)}
        onLogout={onLogout}
      />
      <AiInfoModal open={aiInfoOpen} onClose={() => setAiInfoOpen(false)} />
      <Toast toast={toast} onClose={dismissToast} onViewError={openErrorViewer} />
      <ErrorViewer open={errorViewerOpen} detail={errorDetail} onClose={closeErrorViewer} />
    </div>
  )
}

export default App
