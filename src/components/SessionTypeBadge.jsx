const TYPE_LABELS = {
  strength: 'Strength',
  cardio: 'Cardio',
  hiit: 'HIIT',
  recovery: 'Recovery',
};

function SessionTypeBadge({ type }) {
  const label = TYPE_LABELS[type] || type;
  return <span className={`badge badge-${type}`}>{label}</span>;
}

export default SessionTypeBadge;
