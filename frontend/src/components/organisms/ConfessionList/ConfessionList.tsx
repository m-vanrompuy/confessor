import ConfessionCard from '../../molecules/ConfessionCard'
import type { ConfessionListInterface } from './ConfessionList.interface'

const ConfessionList = ({ confessions, onSelectConfession, testID }: ConfessionListInterface) => {
  if (confessions.length === 0) {
    return (
      <p className="ConfessionList__empty" data-testid={testID}>
        Geen confessions gevonden.
      </p>
    )
  }

  return (
    <div className="ConfessionList" data-testid={testID}>
      {confessions.map((confession) => (
        <ConfessionCard
          key={confession.id}
          title={confession.title}
          text={confession.text}
          tags={confession.tags}
          status={confession.status}
          onClick={() => onSelectConfession(confession.id)}
        />
      ))}
    </div>
  )
}

export default ConfessionList
