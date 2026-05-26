import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import OrbitCanvas from '../components/canvas/OrbitCanvas';
import Navbar from '../components/ui/Navbar';
import Toolbar from '../components/ui/Toolbar';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import { useSocket } from '../hooks/useSocket';
import { SERVER_URL } from '../socket';

export default function CanvasPage() {
  const { boardId } = useParams();
  const { isConnected, roomUsers, currentUser } = useSocket(boardId);

  const [boardTitle, setBoardTitle] = useState('Untitled Board');
  const [initialNodes, setInitialNodes] = useState(null);
  const [initialEdges, setInitialEdges] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNameModal, setShowNameModal] = useState(false);
  const [tempTitle, setTempTitle] = useState('');

  // Fetch initial canvas state
  useEffect(() => {
    async function fetchState() {
      try {
        const boardRes = await fetch(`${SERVER_URL}/api/boards/${boardId}`);
        if (boardRes.ok) {
          const board = await boardRes.json();
          const title = board.title || 'Untitled Board';
          setBoardTitle(title);
          if (title === 'Untitled Board') setShowNameModal(true);
        } else {
          setShowNameModal(true);
        }

        const stateRes = await fetch(`${SERVER_URL}/api/boards/${boardId}/state`);
        if (stateRes.ok) {
          const state = await stateRes.json();
          setInitialNodes(state.nodes || []);
          setInitialEdges(state.edges || []);
        } else {
          setInitialNodes([]);
          setInitialEdges([]);
        }
      } catch (err) {
        console.warn('Could not fetch canvas state, starting fresh:', err.message);
        setInitialNodes([]);
        setInitialEdges([]);
        setShowNameModal(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchState();
  }, [boardId]);

  const handleSave = useCallback(() => {
    // Manual save triggers auto-save logic in OrbitCanvas
  }, []);

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    const newTitle = tempTitle.trim() || 'Untitled Board';
    setBoardTitle(newTitle);
    setShowNameModal(false);
    
    try {
      await fetch(`${SERVER_URL}/api/boards/${boardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });
    } catch (err) {
      console.error('Failed to update title', err);
    }
  };

  if (isLoading) {
    return <LoadingOverlay message="Loading canvas..." />;
  }

  return (
    <div className="canvas-page relative bg-[#0d0d0d]" data-lenis-prevent>
      {/* Navbar */}
      <Navbar
        boardTitle={boardTitle}
        isConnected={isConnected}
        roomUsers={roomUsers}
        currentUser={currentUser}
        onSave={handleSave}
      />

      {/* Toolbar */}
      <Toolbar />

      {/* Canvas */}
      <div className="absolute inset-0 pt-[49px]">
        <OrbitCanvas
          boardId={boardId}
          currentUser={currentUser}
          initialNodes={initialNodes}
          initialEdges={initialEdges}
        />
      </div>

      {/* Board ID indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-orbit-card/80 backdrop-blur-md border border-white/[0.06] rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
          <span className="text-[10px] font-mono text-orbit-text-muted">Board:</span>
            <span className="font-mono text-[10px] text-orbit-text-muted select-all bg-white/[0.04] px-2 py-0.5 rounded cursor-text">{boardId}</span>
        </div>
      </div>

      {/* Name Board Modal */}
      {showNameModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-orbit-card rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6 w-[90%] max-w-md border border-white/[0.06] animate-fade-in">
              <h3 className="text-xl font-semibold text-orbit-text mb-1 tracking-tight">Name your universe</h3>
              <p className="text-sm text-orbit-text-muted mb-5">Give this board a title before you start building.</p>
            <form onSubmit={handleNameSubmit}>
              <input
                type="text"
                autoFocus
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                placeholder="e.g. Q3 Roadmap Brainstorm"
                className="w-full px-4 py-3 bg-orbit-surface border border-white/[0.06] rounded-xl text-orbit-text focus:outline-none focus:border-white/20 focus:bg-white/[0.02] transition-colors mb-5 placeholder-orbit-text-muted/50"
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNameModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-orbit-text bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-colors"
                >
                  Save Name
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
