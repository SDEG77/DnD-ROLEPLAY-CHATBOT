import { ArrowRight, BookOpenText, Compass, ScrollText, Sparkles, Swords } from 'lucide-react'
import { Link } from 'react-router-dom'

const features = [
  {
    icon: Compass,
    title: 'Start from any premise',
    description: 'Pitch a mystery, heist, war story, or slow-burn quest and let the DM build from it.',
  },
  {
    icon: Sparkles,
    title: 'Reactive scene-by-scene narration',
    description: 'The Dungeon Master responds to your choices with new twists, stakes, and consequences.',
  },
  {
    icon: ScrollText,
    title: 'Remembers the important details',
    description: 'Track story beats, inventory, and campaign memory so the adventure stays coherent.',
  },
  {
    icon: BookOpenText,
    title: 'Return to saved campaigns',
    description: 'Pick up old adventures without losing the tone, party context, or momentum.',
  },
  {
    icon: Swords,
    title: 'Made for solo roleplay',
    description: 'Jump into a campaign whenever inspiration hits, even without a full table.',
  },
]

const campaignPromises = [
  'Set the campaign mood before the first scene.',
  'Let the DM react instead of forcing you through canned branches.',
  'Keep returning to a world that remembers what happened.',
]

function LandingPage({ user }) {
  return (
    <div className="landing-shell">
      <header className="landing-nav">
        <div>
          <p className="eyebrow">AI Dungeon Master</p>
          <strong className="brand-mark">Solo adventures that feel guided, not generic</strong>
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
          <h1>Play a living fantasy campaign with a Dungeon Master that adapts to your decisions.</h1>
          <p className="lede">
            Shape your hero, define the tone, and drop into a world that reacts to what you say.
            The chatbot can help you explore, negotiate, investigate, fight, and keep the story
            moving between sessions.
          </p>
          <div className="landing-cta-row">
            <Link className="primary" to={user ? '/app' : '/register'}>
              {user ? 'Continue your story' : 'Start your first campaign'}
            </Link>
            <Link className="ghost" to="/login">
              Resume a saved adventure
            </Link>
          </div>
          <div className="landing-proof-grid">
            <article className="landing-proof-card">
              <span>Character-led</span>
              <strong>Your hero drives the pace of the story.</strong>
            </article>
            <article className="landing-proof-card">
              <span>Choice-driven</span>
              <strong>Talk your way through scenes or escalate them.</strong>
            </article>
            <article className="landing-proof-card">
              <span>Persistent</span>
              <strong>Save the campaign and return without losing context.</strong>
            </article>
          </div>

          <div className="landing-stat-strip">
            <div>
              <span>Setup</span>
              <strong>Choose your premise, tone, and hero</strong>
            </div>
            <div>
              <span>Play</span>
              <strong>Talk, act, explore, and improvise freely</strong>
            </div>
            <div>
              <span>Continuity</span>
              <strong>Come back to the same world later</strong>
            </div>
          </div>
        </section>

        <section className="landing-showcase">
          <div className="landing-showcase-card">
            <div className="landing-showcase-header">
              <div>
                <p className="choice-label">What playing feels like</p>
                <h3>Built around the moments players remember</h3>
              </div>
            </div>
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
        </section>
      </main>

      <section className="landing-footer-card">
        <div className="landing-footer-copy">
          <p className="choice-label">For players who want momentum</p>
          <h3>Less setup, more storytelling.</h3>
          <p className="campaign-library-empty">
            Start fresh with a new character or jump back into a campaign already in motion. The
            Dungeon Master keeps the thread so you can focus on choices, not bookkeeping.
          </p>
        </div>
        <div className="landing-footer-actions">
          <div className="landing-promise-list" aria-label="Player benefits">
            {campaignPromises.map((promise) => (
              <p key={promise}>{promise}</p>
            ))}
          </div>
          <Link className="ghost inline-link-button" to={user ? '/app' : '/register'}>
            {user ? 'Open the app' : 'Begin your adventure'} <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
