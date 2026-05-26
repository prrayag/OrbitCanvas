import { memo } from 'react';
import { Users, Wifi, WifiOff, Save } from 'lucide-react';

/**
 * Navbar — Top bar with board title, connection status, and user avatars.
 */
function Navbar({ boardTitle, isConnected, roomUsers, currentUser, onSave }) {
  return (
    <nav className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-2.5 bg-orbit-bg/90 backdrop-blur-xl border-b border-white/[0.06]">
      {/* Left: Logo + Board Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <img src="/orbit-logo.svg" alt="Orbit" className="w-6 h-6 invert" />
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-orbit-text" style={{ fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif" }}>Orbit</span>
        </div>
        <div className="w-px h-5 bg-white/10" />
        <span className="text-sm text-orbit-text-muted font-mono">{boardTitle || 'Untitled Board'}</span>
      </div>

      {/* Right: Status + Users + Save */}
      <div className="flex items-center gap-3">
        {/* Save button */}
        <button
          onClick={onSave}
          className="font-mono text-[11px] text-orbit-text-muted hover:text-orbit-text px-2 py-1 hover:bg-white/[0.04] rounded transition-colors"
          title="Save canvas"
        >
          <Save size={15} />
        </button>

        {/* Connection status */}
        <div className={`flex items-center gap-2 text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full border ${isConnected ? 'text-orbit-cyan border-orbit-cyan/20 bg-orbit-cyan/5' : 'text-red-400 border-red-500/20 bg-red-500/5'}`}>
          {isConnected ? (
            <Wifi size={13} />
          ) : (
            <WifiOff size={13} />
          )}
          <span>
            {isConnected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>

        {/* User avatars */}
        {roomUsers.length > 0 && (
          <>
            <div className="w-px h-5 bg-white/10" />
            <div className="flex items-center gap-1">
              <Users size={13} className="text-orbit-text-muted mr-1" />
              <div className="flex -space-x-1.5">
                {roomUsers.slice(0, 5).map((user) => (
                  <div
                    key={user.id}
                    className="w-6 h-6 rounded-full border-2 border-orbit-bg flex items-center justify-center text-[9px] font-bold text-white shadow-sm"
                    style={{ backgroundColor: user.color || '#ff4d2d' }}
                    title={user.name}
                  >
                    {(user.name || 'U')[0].toUpperCase()}
                  </div>
                ))}
              </div>
              {roomUsers.length > 5 && (
                <span className="text-[10px] text-black/50 ml-1">
                  +{roomUsers.length - 5}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

export default memo(Navbar);
