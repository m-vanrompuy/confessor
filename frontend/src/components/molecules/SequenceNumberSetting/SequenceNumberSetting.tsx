import { TextInput, Button } from '../../atoms'
import type { SequenceNumberSettingInterface } from './SequenceNumberSetting.interface'

const SequenceNumberSetting = ({ value, onChange, onSave, saving = false, testID }: SequenceNumberSettingInterface) => {
  return (
    <div className="SequenceNumberSetting" data-testid={testID}>
      <label className="SequenceNumberSetting__field">
        Eerstvolgend volgnummer
        <TextInput type="number" min={1} value={value} onChange={onChange} size="s" />
      </label>
      <p className="SequenceNumberSetting__hint">
        Voorkomt dat de nummering opnieuw bij 1 begint als er al confessions buiten deze tool om gepubliceerd zijn.
        Eenmalig instellen bij het opstarten van de tool volstaat - eens de echte nummering dit inhaalt, doet deze
        instelling niets meer.
      </p>
      <Button variant="secondary" size="s" onClick={onSave} disabled={saving}>
        {saving ? 'Bezig...' : 'Opslaan'}
      </Button>
    </div>
  )
}

export default SequenceNumberSetting
