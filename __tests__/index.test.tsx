import { render, screen } from '@testing-library/react'
import Home from '../src/app/page'
import React from 'react'

describe('Home', () => {
  it('renders a heading', () => {
    render(<Home />)

    const heading = screen.getByText('Get started by editing')

    expect(heading).toBeInTheDocument()
  })
})
