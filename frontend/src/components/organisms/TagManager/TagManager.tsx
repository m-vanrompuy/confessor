import { useState } from 'react'
import { Button, TagChip } from '../../atoms'
import TagForm from '../../molecules/TagForm'
import type { DisplayTag } from '../../_types_'
import type { TagManagerInterface } from './TagManager.interface'

const DEFAULT_NEW_TAG_COLOR = '#aa3bff'

// Eén rij tegelijk in bewerk-modus - puur presentatie-state (welke rij is
// opengeklapt), niet iets waar de pagina om geeft, dus lokaal gehouden i.p.v.
// omhoog geduwd.
const TagManager = ({
  tags,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
  creating = false,
  saving = false,
  deleting = false,
  testID,
}: TagManagerInterface) => {
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(DEFAULT_NEW_TAG_COLOR)
  const [editingTagId, setEditingTagId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')

  const startEditing = (tag: DisplayTag) => {
    setEditingTagId(tag.id)
    setEditName(tag.name)
    setEditColor(tag.color)
  }

  const handleCreate = () => {
    onCreateTag(newName, newColor)
    setNewName('')
    setNewColor(DEFAULT_NEW_TAG_COLOR)
  }

  const handleUpdate = () => {
    if (!editingTagId) {
      return
    }
    onUpdateTag(editingTagId, editName, editColor)
    setEditingTagId(null)
  }

  return (
    <div className="TagManager" data-testid={testID}>
      {tags.length === 0 && <p className="TagManager__empty">Nog geen tags aangemaakt.</p>}

      <ul className="TagManager__list">
        {tags.map((tag) => (
          <li key={tag.id} className="TagManager__row">
            {editingTagId === tag.id ? (
              <TagForm
                name={editName}
                color={editColor}
                onNameChange={(event) => setEditName(event.target.value)}
                onColorChange={(event) => setEditColor(event.target.value)}
                onSubmit={handleUpdate}
                submitLabel="Opslaan"
                saving={saving}
              />
            ) : (
              <>
                <TagChip name={tag.name} color={tag.color} />
                <Button variant="secondary" size="s" onClick={() => startEditing(tag)}>
                  Bewerken
                </Button>
                <Button variant="danger" size="s" onClick={() => onDeleteTag(tag.id)} disabled={deleting}>
                  Verwijderen
                </Button>
              </>
            )}
          </li>
        ))}
      </ul>

      <TagForm
        name={newName}
        color={newColor}
        onNameChange={(event) => setNewName(event.target.value)}
        onColorChange={(event) => setNewColor(event.target.value)}
        onSubmit={handleCreate}
        submitLabel="Aanmaken"
        saving={creating}
      />
    </div>
  )
}

export default TagManager
