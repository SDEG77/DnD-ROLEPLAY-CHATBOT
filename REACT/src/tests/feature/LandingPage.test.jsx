import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import LandingPage from '../../components/LandingPage'

function renderLandingPage(user = null) {
  return render(
    <MemoryRouter>
      <LandingPage user={user} />
    </MemoryRouter>,
  )
}

describe('LandingPage', () => {
  it('shows guest calls to action when no user is signed in', () => {
    renderLandingPage()

    expect(
      screen.getByRole('link', {
        name: /start your first campaign/i,
      }),
    ).toHaveAttribute('href', '/register')
  })

  it('shows app calls to action when a user is signed in', () => {
    renderLandingPage({ _id: 'user-1', name: 'Sigrae' })

    expect(
      screen.getByRole('link', {
        name: /continue your story/i,
      }),
    ).toHaveAttribute('href', '/app')
  })
})
