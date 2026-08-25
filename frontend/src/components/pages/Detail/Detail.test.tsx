// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router'
import Detail from './Detail'

function renderDetailAt(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/confessions/${id}`]}>
      <Routes>
        <Route path="/confessions/:id" element={<Detail />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Detail page', () => {
  it('toont de confession-ID uit de URL in de titel', () => {
    renderDetailAt('abc-123')
    expect(screen.getByText('Confession abc-123')).toBeTruthy()
  })

  it('houdt Genereren disabled tot Markeer als gebruikt aangeklikt is', () => {
    renderDetailAt('1')
    const generateButton = screen.getByText('Genereer afbeeldingen') as HTMLButtonElement
    expect(generateButton.disabled).toBe(true)

    fireEvent.click(screen.getByText('Markeer als gebruikt'))

    expect((screen.getByText('Genereer afbeeldingen') as HTMLButtonElement).disabled).toBe(false)
  })

  it('toont het statistieken-blok pas nadat de confession gebruikt is', () => {
    renderDetailAt('1')
    expect(screen.queryByText('Statistieken')).toBeNull()

    fireEvent.click(screen.getByText('Markeer als gebruikt'))

    expect(screen.getByText('Statistieken')).toBeTruthy()
  })

  it('toont gegenereerde slides na het klikken op Genereren', () => {
    renderDetailAt('1')
    fireEvent.click(screen.getByText('Markeer als gebruikt'))
    expect(screen.getByText('Nog geen afbeeldingen gegenereerd.')).toBeTruthy()

    fireEvent.click(screen.getByText('Genereer afbeeldingen'))

    expect(screen.queryByText('Nog geen afbeeldingen gegenereerd.')).toBeNull()
  })
})
