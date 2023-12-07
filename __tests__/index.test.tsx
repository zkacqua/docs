import { render, screen } from '@testing-library/react'
import React from 'react'
import Home from '../src/app/page'

describe('Home', () => {
  it('renders a heading', () => {
    render(<Home />)

    const heading = screen.getByText('Get started by editing')

    expect(heading).toBeInTheDocument()
  })
})
