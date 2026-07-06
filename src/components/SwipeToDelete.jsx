import { useRef, useState } from 'react';

const REVEAL_WIDTH = 88;
const OPEN_THRESHOLD = REVEAL_WIDTH / 2;

function SwipeToDelete({ onDelete, children }) {
  const [offset, setOffset] = useState(0);
  const startRef = useRef({ x: 0, y: 0 });
  const baseOffsetRef = useRef(0);
  const draggingRef = useRef(false);

  function handleTouchStart(event) {
    const touch = event.touches[0];
    startRef.current = { x: touch.clientX, y: touch.clientY };
    baseOffsetRef.current = offset;
    draggingRef.current = true;
  }

  function handleTouchMove(event) {
    if (!draggingRef.current) {
      return;
    }
    const touch = event.touches[0];
    const dx = touch.clientX - startRef.current.x;
    const dy = touch.clientY - startRef.current.y;
    if (Math.abs(dx) < Math.abs(dy)) {
      return;
    }
    const next = Math.max(-REVEAL_WIDTH, Math.min(0, baseOffsetRef.current + dx));
    setOffset(next);
  }

  function handleTouchEnd() {
    draggingRef.current = false;
    if (offset < -OPEN_THRESHOLD) {
      setOffset(-REVEAL_WIDTH);
    } else {
      setOffset(0);
    }
  }

  return (
    <div className="swipe-row">
      <button type="button" className="swipe-delete-action" onClick={onDelete} aria-label="Delete">
        Delete
      </button>
      <div
        className="swipe-content"
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}

export default SwipeToDelete;
