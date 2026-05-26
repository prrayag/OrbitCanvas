import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import OrbitCanvas from '../components/canvas/OrbitCanvas';
import Navbar from '../components/ui/Navbar';
import Toolbar from '../components/ui/Toolbar';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import { useSocket } from '../hooks/useSocket';

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
        const boardRes = await fetch(`/api/boards/${boardId}`);
        if (boardRes.ok) {
          const board = await boardRes.json();
          const title = board.title || 'Untitled Board';
          setBoardTitle(title);
          if (title === 'Untitled Board') setShowNameModal(true);
        } else {
          setShowNameModal(true);
        }

        const stateRes = await fetch(`/api/boards/${boardId}/state`);
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
      await fetch(`/api/boards/${boardId}`, {
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
    <div className="canvas-page relative bg-[#f4f4f5]" data-lenis-prevent>
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
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-md border border-black/[0.06] rounded-full shadow-sm">
          <span className="text-[10px] font-mono text-black/40">Board:</span>
          <code className="text-[10px] font-mono text-black/70 select-all cursor-pointer">{boardId}</code>
        </div>
      </div>

      {/* Name Board Modal */}
      {showNameModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6 w-[90%] max-w-md border border-black/[0.04] animate-fade-in">
            <h2 className="text-xl font-semibold mb-2 text-black">Name your board</h2>
            <p className="text-sm text-black/50 mb-5">Give this canvas a name to get started.</p>
            <form onSubmit={handleNameSubmit}>
              <input
                type="text"
                autoFocus
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                placeholder="e.g. Q3 Roadmap Brainstorm"
                className="w-full px-4 py-3 bg-black/[0.02] border border-black/[0.06] rounded-xl text-black focus:outline-none focus:border-black/[0.15] focus:bg-white transition-colors mb-5 placeholder-black/30"
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNameModal(false)}
                  className="px-4 py-2 text-sm font-medium text-black/60 hover:text-black transition-colors"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-black/80 transition-colors"
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
