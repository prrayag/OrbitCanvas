import { memo } from 'react';
import { Users, Wifi, WifiOff, Save } from 'lucide-react';

/**
 * Navbar — Top bar with board title, connection status, and user avatars.
 */
function Navbar({ boardTitle, isConnected, roomUsers, currentUser, onSave }) {
  return (
    <nav className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-2.5 bg-white/80 backdrop-blur-xl border-b border-black/[0.06]">
      {/* Left: Logo + Board Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <img src="/orbit-logo.svg" alt="Orbit" className="w-6 h-6 brightness-0" />
          <span className="text-sm font-semibold text-black tracking-wide">ORBIT</span>
        </div>
        <div className="w-px h-5 bg-black/10" />
        <span className="text-sm text-black/60 font-mono">{boardTitle || 'Untitled Board'}</span>
      </div>

      {/* Right: Status + Users + Save */}
      <div className="flex items-center gap-3">
        {/* Save button */}
        <button
          onClick={onSave}
          className="p-2 rounded-lg text-black/40 hover:text-black hover:bg-black/[0.05] transition-all duration-200"
          title="Save canvas"
        >
          <Save size={15} />
        </button>

        {/* Connection status */}
        <div className="flex items-center gap-1.5">
          {isConnected ? (
            <Wifi size={13} className="text-green-500" />
          ) : (
            <WifiOff size={13} className="text-red-500" />
          )}
          <span className="text-[10px] font-mono text-black/40">
            {isConnected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>

        {/* User avatars */}
        {roomUsers.length > 0 && (
          <>
            <div className="w-px h-5 bg-black/10" />
            <div className="flex items-center gap-1">
              <Users size={13} className="text-black/40 mr-1" />
              <div className="flex -space-x-1.5">
                {roomUsers.slice(0, 5).map((user) => (
                  <div
                    key={user.id}
                    className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white shadow-sm"
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
