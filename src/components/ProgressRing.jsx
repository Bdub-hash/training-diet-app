import AnimatedNumber from './AnimatedNumber.jsx';

function ProgressRing({ value, max, unit, size }) {
  const ringSize = size || 168;
  const strokeWidth = ringSize * 0.09;
  const radius = (ringSize - strokeWidth) / 2;
  const center = ringSize / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circumference * (1 - ratio);

  return (
    <div className="progress-ring" style={{ width: ringSize, height: ringSize }}>
      <svg width={ringSize} height={ringSize} viewBox={`0 0 ${ringSize} ${ringSize}`}>
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7ee8ff" />
            <stop offset="100%" stopColor="#00d4ff" />
          </linearGradient>
          <radialGradient id="ringGloss" cx="35%" cy="25%" r="65%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
            <stop offset="55%" stopColor="rgba(255,255,255,0.08)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--surface-alt)" strokeWidth={strokeWidth} />
        <circle
          className="progress-ring-arc"
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="url(#ringGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${center} ${center})`}
        />
        <circle cx={center} cy={center} r={radius - strokeWidth / 2 - 2} fill="url(#ringGloss)" />
      </svg>
      <div className="progress-ring-center">
        <span className="progress-ring-value">
          <AnimatedNumber value={value} />
        </span>
        <span className="progress-ring-sublabel">
          / {max} {unit}
        </span>
      </div>
    </div>
  );
}

export default ProgressRing;
