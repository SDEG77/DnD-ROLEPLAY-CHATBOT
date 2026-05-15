import { CheckCircle2, Circle, ShieldAlert } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { loginUser, registerUser } from '../services/authApi'
import {
  getPasswordChecklist,
  getPasswordValidationMessage,
  isStrongPassword,
} from '../utils/passwordPolicy'

function AuthPage({ mode, onAuthSuccess }) {
  const isRegister = mode === 'register'
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const checklist = useMemo(() => getPasswordChecklist(form.password), [form.password])
  const passwordIsStrong = isStrongPassword(form.password)
  const passwordsMatch = !isRegister || (form.password && form.password === form.confirmPassword)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (isRegister) {
      if (!passwordIsStrong) {
        setError(`Use a stronger password: ${getPasswordValidationMessage(form.password)}.`)
        return
      }

      if (!passwordsMatch) {
        setError('Passwords must match before the account can be created.')
        return
      }
    }

    setSubmitting(true)

    try {
      const data = isRegister
        ? await registerUser({
            name: form.name,
            email: form.email,
            password: form.password,
          })
        : await loginUser({
            email: form.email,
            password: form.password,
          })

      onAuthSuccess(data.user)
    } catch (err) {
      setError(err.message || 'Request failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-shell">
      <section className="auth-card">
        <div className="auth-card-copy">
          <p className="eyebrow">{isRegister ? 'Create account' : 'Sign in'}</p>
          <h1>{isRegister ? 'Protect each campaign vault by user account.' : 'Return to your campaign vault.'}</h1>
          <p className="lede">
            {isRegister
              ? 'Registration now requires a strong password before the frontend will submit.'
              : 'Log in with the account that owns the campaigns you want to continue.'}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegister ? (
            <label>
              Display name
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Aria Nightglass"
                disabled={submitting}
                required
              />
            </label>
          ) : null}

          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="you@example.com"
              disabled={submitting}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              placeholder={isRegister ? 'Create a strong password' : 'Enter your password'}
              disabled={submitting}
              required
            />
          </label>

          {isRegister ? (
            <>
              <label>
                Confirm password
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, confirmPassword: event.target.value }))
                  }
                  placeholder="Retype your password"
                  disabled={submitting}
                  required
                />
              </label>

              <div className="password-panel">
                <div className="password-panel-header">
                  <ShieldAlert size={16} />
                  <strong>Password requirements</strong>
                </div>
                <div className="password-rule-list">
                  {checklist.map((rule) => (
                    <div key={rule.id} className={`password-rule ${rule.passed ? 'passed' : ''}`}>
                      {rule.passed ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                      <span>{rule.label}</span>
                    </div>
                  ))}
                  <div className={`password-rule ${passwordsMatch ? 'passed' : ''}`}>
                    {passwordsMatch ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                    <span>Passwords match</span>
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {error ? <p className="form-error">{error}</p> : null}

          <div className="campaign-form-actions">
            <button
              type="submit"
              className="primary"
              disabled={submitting || (isRegister && (!passwordIsStrong || !passwordsMatch))}
            >
              {submitting
                ? isRegister
                  ? 'Creating account...'
                  : 'Signing in...'
                : isRegister
                  ? 'Create account'
                  : 'Log in'}
            </button>
            <Link className="ghost auth-secondary-link" to="/">
              Back to landing
            </Link>
          </div>
        </form>

        <p className="auth-switch-copy">
          {isRegister ? 'Already have an account?' : 'Need a new account?'}{' '}
          <Link to={isRegister ? '/login' : '/register'}>
            {isRegister ? 'Log in here.' : 'Register here.'}
          </Link>
        </p>
      </section>
    </div>
  )
}

export default AuthPage
