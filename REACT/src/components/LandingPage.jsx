import { ArrowRight, LockKeyhole, ScrollText, ShieldCheck, Swords } from 'lucide-react'
import { Link } from 'react-router-dom'

const features = [
  {
    icon: ScrollText,
    title: 'Persistent adventures',
    description: 'Keep campaign history, memories, and inventory between sessions.',
  },
  {
    icon: LockKeyhole,
    title: 'Account-based saves',
    description: 'Each account only loads its own campaign vault and save data.',
  },
  {
    icon: ShieldCheck,
    title: 'JWT-protected API',
    description: 'Frontend sessions authenticate against secured backend routes.',
  },
  {
    icon: Swords,
    title: 'AI-driven DM',
    description: 'Run solo campaigns with persistent world state and quick replies.',
  },
]

function LandingPage({ user }) {
  return (
    <div className="landing-shell">
      <header className="landing-nav">
        <div>
          <p className="eyebrow">AI Dungeon Master</p>
          <strong className="brand-mark">Campaigns with real ownership</strong>
        </div>
        <div className="landing-nav-actions">
          <Link className="ghost" to="/login">
            Log in
          </Link>
          <Link className="primary" to={user ? '/app' : '/register'}>
            {user ? 'Open app' : 'Create account'}
          </Link>
        </div>
      </header>

      <main className="landing-hero">
        <section className="landing-copy">
          <p className="eyebrow">Story-first solo play</p>
          <h1>Run personal D&D campaigns without mixing one player’s saves into another’s.</h1>
          <p className="lede">
            This app gives each user a protected campaign vault, account login, and a persistent
            AI Dungeon Master that keeps track of memory, inventory, and progress.
          </p>
          <div className="landing-cta-row">
            <Link className="primary" to={user ? '/app' : '/register'}>
              {user ? 'Continue campaigning' : 'Start with an account'}
            </Link>
            <Link className="ghost" to="/login">
              Existing user login
            </Link>
          </div>
        </section>

        <section className="landing-showcase">
          <div className="landing-showcase-card">
            <p className="choice-label">What the site does</p>
            <div className="feature-grid">
              {features.map(({ icon: Icon, title, description }) => (
                <article key={title} className="feature-card">
                  <div className="feature-icon">
                    <Icon size={18} />
                  </div>
                  <strong>{title}</strong>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="landing-stat-strip">
            <div>
              <span>Auth</span>
              <strong>JWT + protected routes</strong>
            </div>
            <div>
              <span>Storage</span>
              <strong>User-owned MongoDB campaigns</strong>
            </div>
            <div>
              <span>Frontend</span>
              <strong>Landing, register, login, app</strong>
            </div>
          </div>
        </section>
      </main>

      <section className="landing-footer-card">
        <div>
          <p className="choice-label">Built for your current stack</p>
          <h3>Docker-friendly changes only</h3>
          <p className="campaign-library-empty">
            Dependencies are declared in `package.json`. Rebuild your containers after pulling the
            changes and provide your JWT secret in the backend env file.
          </p>
        </div>
        <Link className="ghost inline-link-button" to={user ? '/app' : '/register'}>
          Continue <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  )
}

export default LandingPage
