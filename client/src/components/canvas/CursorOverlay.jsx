import { memo } from 'react';
import { MousePointer2 } from 'lucide-react';

/**
 * CursorOverlay — Renders remote users' cursor positions as colored
 * arrows with username labels. Smooth CSS transitions.
 */
function CursorOverlay({ cursors }) {
  const cursorEntries = Object.entries(cursors);

  if (cursorEntries.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      {cursorEntries.map(([userId, cursor]) => (
        <div
          key={userId}
          className="remote-cursor absolute"
          style={{
            left: cursor.x,
            top: cursor.y,
            transition: 'left 0.1s linear, top 0.1s linear',
          }}
        >
          <MousePointer2
            size={16}
            style={{
              color: cursor.userColor || '#ff4d2d',
              filter: `drop-shadow(0 0 4px ${cursor.userColor || '#ff4d2d'}60)`,
            }}
          />
          <div
            className="absolute left-4 top-4 px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap"
            style={{
              backgroundColor: `${cursor.userColor || '#ff4d2d'}30`,
              color: cursor.userColor || '#ff4d2d',
              border: `1px solid ${cursor.userColor || '#ff4d2d'}40`,
            }}
          >
            {cursor.userName || 'Anonymous'}
          </div>
        </div>
      ))}
    </div>
  );
}

export default memo(CursorOverlay);
