import { daysBetween } from '../utils/dates.js';

function BlockProgress({ block }) {
  const today = new Date();
  const start = new Date(`${block.start}T00:00:00`);
  const end = new Date(`${block.end}T00:00:00`);

  const totalDays = daysBetween(start, end);
  const elapsedDays = Math.min(Math.max(daysBetween(start, today), 0), totalDays);
  const daysRemaining = Math.max(daysBetween(today, end), 0);
  const percentComplete = totalDays > 0 ? Math.round((elapsedDays / totalDays) * 100) : 0;

  return (
    <section className="card block-progress">
      <div className="block-progress-header">
        <span className="block-name">{block.name}</span>
        <span className="block-days-remaining">{daysRemaining} days left</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percentComplete}%` }} />
      </div>
    </section>
  );
}

export default BlockProgress;
