// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TagManager from './TagManager'
import { TagManagerMock } from './TagManager.mock'

const testID = 'TagManager-' + Math.floor(Math.random() * 90000 + 10000)

describe('TagManager', () => {
  it('toont de bestaande tags en een leeg-bericht wanneer er geen zijn', () => {
    const { rerender } = render(<TagManager testID={testID} {...TagManagerMock} />)
    expect(screen.getByText('meme')).toBeTruthy()
    expect(screen.getByText('zoekertje')).toBeTruthy()

    rerender(<TagManager testID={testID} {...TagManagerMock} tags={[]} />)
    expect(screen.getByText('Nog geen tags aangemaakt.')).toBeTruthy()
  })

  it('maakt een nieuwe tag aan en maakt het formulier daarna weer leeg', () => {
    const onCreateTag = vi.fn()
    render(<TagManager testID={testID} {...TagManagerMock} tags={[]} onCreateTag={onCreateTag} />)

    const nameInput = screen.getByPlaceholderText('Naam') as HTMLInputElement
    fireEvent.change(nameInput, { target: { value: 'nieuwe tag' } })
    fireEvent.click(screen.getByText('Aanmaken'))

    expect(onCreateTag).toHaveBeenCalledWith('nieuwe tag', expect.any(String))
    expect(nameInput.value).toBe('')
  })

  it('klapt een rij open om te bewerken, en slaat de wijziging op', () => {
    const onUpdateTag = vi.fn()
    render(<TagManager testID={testID} {...TagManagerMock} onUpdateTag={onUpdateTag} />)

    const editButtons = screen.getAllByText('Bewerken')
    fireEvent.click(editButtons[0])

    const nameInputs = screen.getAllByPlaceholderText('Naam') as HTMLInputElement[]
    // De eerste is nu het bewerk-formulier voor 'meme' (staat vóór het
    // altijd-zichtbare "nieuwe tag"-formulier in de DOM-volgorde).
    fireEvent.change(nameInputs[0], { target: { value: 'meme (bewerkt)' } })
    fireEvent.click(screen.getByText('Opslaan'))

    expect(onUpdateTag).toHaveBeenCalledWith('tag-1', 'meme (bewerkt)', '#aa3bff')
  })

  it('roept onDeleteTag aan met het juiste ID', () => {
    const onDeleteTag = vi.fn()
    render(<TagManager testID={testID} {...TagManagerMock} onDeleteTag={onDeleteTag} />)

    fireEvent.click(screen.getAllByText('Verwijderen')[0])

    expect(onDeleteTag).toHaveBeenCalledWith('tag-1')
  })
})
