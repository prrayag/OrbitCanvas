import { useState, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// Security items with descriptions that reveal on hover
const SECURITY_ITEMS = [
  { title: 'End-to-end Encryption', desc: 'Customer data is encrypted in transit and at rest.' },
  { title: 'Zero Data Retention', desc: 'AI queries are never stored or used for model training.' },
  { title: 'Access Controls', desc: 'Fine-grained permissions for every board and workspace.' },
  { title: 'Data Isolation', desc: 'Each workspace runs in a fully isolated environment.' },
  { title: 'Compliant by Design', desc: 'Built to meet SOC 2 and GDPR requirements from day one.' },
  { title: 'Secure and Scalable Architecture', desc: 'Enterprise-ready infrastructure with 99.9% uptime SLA.' },
];

function SecurityItem({ item }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '24px 32px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backgroundColor: hovered ? 'rgba(224,132,85,0.12)' : '#161616',
        transition: 'background-color 0.35s ease',
        cursor: 'default',
      }}
    >
      <h4 style={{ fontSize: 16, fontWeight: 600, color: '#f5f5f5', marginBottom: hovered ? 6 : 0, transition: 'margin-bottom 0.3s ease' }}>{item.title}</h4>
      <div style={{
        maxHeight: hovered ? 40 : 0,
        opacity: hovered ? 1 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease',
      }}>
        <p style={{ fontSize: 14, color: '#999', lineHeight: 1.5, paddingTop: 2 }}>{item.desc}</p>
      </div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [boardIdInput, setBoardIdInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const containerRef = useRef(null);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.reveal').forEach((el) => {
        gsap.from(el, {
          y: 40, opacity: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' }
        });
      });

      ScrollTrigger.create({
        trigger: '#features',
        start: 'top 120px',
        end: 'bottom 80%',
        pin: '.features-sidebar',
        pinSpacing: false,
      });

      const sections = gsap.utils.toArray('.feature-section');
      const navItems = gsap.utils.toArray('.sidebar-item');
      sections.forEach((section, i) => {
        ScrollTrigger.create({
          trigger: section, start: 'top 50%', end: 'bottom 50%',
          onToggle: (self) => {
            if (self.isActive) {
              navItems.forEach((nav, j) => {
                const dot = nav.querySelector('.dot');
                if (i === j) { nav.style.color = '#E08455'; if (dot) dot.style.opacity = '1'; }
                else { nav.style.color = ''; if (dot) dot.style.opacity = '0'; }
              });
            }
          }
        });
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleCreateBoard = async () => {
    setIsCreating(true);
    setError('');
    try {
      const res = await fetch('/api/boards', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'Untitled Board' }) });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      navigate(`/canvas/${data.boardId}`);
    } catch { navigate(`/canvas/demo-${Date.now().toString(36)}`); }
    finally { setIsCreating(false); }
  };

  const handleJoinBoard = () => {
    setError('');
    if (!boardIdInput.trim()) { setError('Enter a board ID'); return; }
    navigate(`/canvas/${boardIdInput.trim()}`);
  };

  return (
    <div ref={containerRef} className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#0d0d0d', color: '#f5f5f5' }}>
      
      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ backgroundColor: 'rgba(13,13,13,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-[1400px] mx-auto flex items-center justify-between h-16 px-6 md:px-12">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <img src="/orbit-logo.svg" alt="Orbit" className="w-7 h-7" />
            <span className="text-sm font-bold tracking-[0.2em] uppercase" style={{ fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif" }}>Orbit</span>
          </div>
          
          {/* Center Nav - absolutely centered */}
          <div className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
            <button onClick={() => scrollToSection('features')} className="text-sm text-[#888] hover:text-[#f5f5f5] transition-colors font-medium">Product</button>
            <button onClick={() => scrollToSection('features')} className="text-sm text-[#888] hover:text-[#f5f5f5] transition-colors font-medium">Use Cases</button>
            <button onClick={() => scrollToSection('security')} className="text-sm text-[#888] hover:text-[#f5f5f5] transition-colors font-medium">Security</button>
          </div>

          {/* Launch Canvas - pushed right with ml-auto */}
          <button
            onClick={handleCreateBoard}
            className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-[#f5f5f5] text-[#0d0d0d] rounded hover:opacity-85 transition-opacity"
            style={{ fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif" }}
          >
            Launch Canvas
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-40 pb-24 px-6 md:px-12 max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-16 items-center">
        <div className="flex-1 reveal" style={{ minWidth: 320 }}>
          <p className="text-[11px] font-bold tracking-[0.15em] text-[#888] mb-6 uppercase" style={{ fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif" }}>
            AI-Native Spatial Intelligence
          </p>
          <h1 className="font-medium leading-[0.95] tracking-[-0.03em] mb-8" style={{ fontSize: 'clamp(3rem, 5.5vw, 5.5rem)' }}>
            The AI canvas<br />for teams that<br />ship fast
          </h1>
          <p className="text-lg text-[#999] max-w-xl leading-relaxed mb-10">
            Orbit helps product, design, and engineering teams brainstorm with deep AI assistance. Free your team from linear documents, uncover insights visually, and accelerate planning.
          </p>
          
          {/* CTA Row */}
          <div className="flex items-center gap-4 flex-wrap mb-6">
            <button
              onClick={handleCreateBoard}
              disabled={isCreating}
              className="group inline-flex items-center gap-2.5 px-8 py-4 text-[15px] font-semibold text-white rounded-full transition-all duration-300 hover:-translate-y-0.5"
              style={{ backgroundColor: '#E08455', letterSpacing: '0.02em', fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif" }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor='#cd7345'; e.currentTarget.style.boxShadow='0 8px 24px rgba(224,132,85,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor='#E08455'; e.currentTarget.style.boxShadow='none'; }}
            >
              {isCreating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Start Building <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
            </button>
          </div>
          
          {/* Join board */}
          <div className="flex gap-2 max-w-[400px]">
            <input
              type="text"
              value={boardIdInput}
              onChange={(e) => setBoardIdInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoinBoard()}
              placeholder="Paste a board ID to join..."
              className="flex-1 px-4 py-3 text-sm bg-white/[0.04] text-[#f5f5f5] border border-white/[0.08] rounded-lg outline-none focus:border-white/20 transition-colors placeholder-[#555]"
            />
            <button
              onClick={handleJoinBoard}
              className="px-5 py-3 text-sm font-semibold text-[#ccc] border border-white/[0.1] rounded-lg hover:border-white/[0.25] hover:text-[#f5f5f5] transition-all"
            >
              Join
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-[#E08455]">{error}</p>}
        </div>
        
        <div className="flex-1 w-full relative reveal" style={{ minWidth: 320 }}>
          <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #E29D7D 0%, #CD6E42 100%)', padding: '48px 48px 0 48px', aspectRatio: '4/3', display: 'flex', alignItems: 'flex-end' }}>
            <div className="relative z-10 rounded-t-xl overflow-hidden shadow-2xl" style={{ width: '115%', marginLeft: 16 }}>
              <img src="/hero-mockup.png" alt="Orbit Canvas" className="w-full h-auto block" />
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES (STICKY SIDEBAR) ── */}
      <section id="features" className="max-w-[1400px] mx-auto px-6 md:px-12 py-32 flex gap-16" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="features-sidebar w-[220px] shrink-0 pt-2 hidden lg:block">
          <ul className="flex flex-col gap-5" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {['Spatial Ideation', 'Streaming AI', 'Live Collaboration'].map((label, i) => (
              <li key={label} className="sidebar-item flex items-center gap-2.5 text-xs font-bold tracking-[0.1em] uppercase transition-colors duration-300 cursor-default" style={{ color: i === 0 ? '#E08455' : '#888', fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif" }}>
                <div className="dot w-1.5 h-1.5 rounded-full bg-[#E08455] transition-opacity duration-300" style={{ opacity: i === 0 ? 1 : 0 }} />
                {label}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex-1 flex flex-col gap-44">
          {/* Feature 1 */}
          <div className="feature-section reveal">
            <h2 className="text-4xl md:text-5xl font-medium mb-2">Spatial Ideation</h2>
            <p className="text-xl text-[#888] mb-12 font-light leading-relaxed">Effortless structuring, always visual, always connected</p>
            <div className="rounded-2xl p-8 mb-8" style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="rounded-xl overflow-hidden" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                <img src="/hero-mockup.png" alt="Canvas" className="w-full h-auto block" />
              </div>
              <p className="mt-6 text-sm text-[#888] max-w-lg leading-relaxed">
                <strong className="text-[#f5f5f5]">Connect all your thoughts.</strong> Bring concepts from any source—notes, APIs, docs—into one living, unified map.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {[['Infinite Pan & Zoom.', 'Never run out of space for your ideas.'], ['Smart node snapping.', 'Keep your boards perfectly aligned.'], ['Visual relationships.', 'Draw connections between concepts.']].map(([t, d]) => (
                <div key={t}><p className="text-sm font-semibold text-[#f5f5f5] mb-1">{t}</p><p className="text-sm text-[#888] leading-relaxed">{d}</p></div>
              ))}
            </div>
          </div>

          {/* Feature 2 */}
          <div className="feature-section reveal">
            <h2 className="text-4xl md:text-5xl font-medium mb-2">Streaming AI</h2>
            <p className="text-xl text-[#888] mb-12 font-light leading-relaxed">High-quality ideas that feel handcrafted, delivered in seconds</p>
            <div className="rounded-2xl p-8 mb-8" style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="rounded-xl p-6" style={{ backgroundColor: '#222', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex justify-between items-center mb-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-sm font-medium text-[#ccc]">Node: Authentication Flow</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-1 rounded" style={{ color: '#E08455', backgroundColor: 'rgba(224,132,85,0.15)', fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif" }}>Generating...</span>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="h-3 bg-[#333] rounded-md w-3/4" />
                  <div className="h-3 bg-[#333] rounded-md w-full" />
                  <div className="h-3 bg-[#333] rounded-md w-5/6" />
                </div>
              </div>
              <p className="mt-6 text-sm text-[#888] max-w-lg leading-relaxed">
                <strong className="text-[#f5f5f5]">Autofill responses with precision.</strong> Instantly answer complex architectural questions, freeing teams from repetitive drafting.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {['Autofill nodes with precision.', 'Adapt answers to context.', 'Powered by Gemini 1.5.', 'Reduce escalation.'].map(t => (
                <div key={t}><p className="text-sm font-semibold text-[#f5f5f5]">{t}</p></div>
              ))}
            </div>
          </div>

          {/* Feature 3 */}
          <div className="feature-section reveal">
            <h2 className="text-4xl md:text-5xl font-medium mb-2">Live Collaboration</h2>
            <p className="text-xl text-[#888] mb-12 font-light leading-relaxed">Absolute alignment across teams in real-time</p>
            <div className="rounded-2xl p-8" style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="rounded-xl p-8 h-60 relative overflow-hidden" style={{ backgroundColor: '#222', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                <div className="absolute" style={{ top: '45%', left: '30%' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 1L6 14L8 8L14 6L1 1Z" fill="#3B82F6" stroke="#fff" strokeWidth="0.5"/></svg>
                  <div className="text-[10px] font-bold px-2 py-0.5 rounded mt-0.5 inline-block" style={{ backgroundColor: '#3B82F6', color: '#fff' }}>Alex</div>
                </div>
                <div className="absolute" style={{ top: '30%', right: '30%' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 1L6 14L8 8L14 6L1 1Z" fill="#10B981" stroke="#fff" strokeWidth="0.5"/></svg>
                  <div className="text-[10px] font-bold px-2 py-0.5 rounded mt-0.5 inline-block" style={{ backgroundColor: '#10B981', color: '#fff' }}>Sarah</div>
                </div>
                <div className="absolute top-6 left-6 bg-[#2a2a2a] border border-white/[0.08] rounded-lg px-4 py-2 text-xs text-[#ccc]">Product Spec</div>
                <div className="absolute bottom-6 right-6 bg-[#2a2a2a] border border-white/[0.08] rounded-lg px-4 py-2 text-xs text-[#ccc]">Sprint Plan</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECURITY ── */}
      <section id="security" className="py-32 px-6 md:px-12" style={{ backgroundColor: '#111', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-16 lg:gap-20">
          <div className="lg:w-1/3 reveal">
            <p className="text-[11px] font-bold tracking-[0.1em] text-[#888] mb-6 uppercase" style={{ fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif" }}>Security</p>
            <h2 className="text-4xl md:text-5xl font-medium mb-6 leading-tight">Built for enterprise-grade security and compliance</h2>
            <p className="text-lg text-[#888] leading-relaxed">
              Orbit ensures the highest standards of data protection, accuracy, and traceability. With fully auditable state, robust infrastructure, and strict adherence to security protocols.
            </p>
          </div>
          <div className="lg:w-2/3 reveal">
            <div className="flex flex-col rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              {SECURITY_ITEMS.map((item) => (
                <SecurityItem key={item.title} item={item} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-6 md:px-12 py-10" style={{ backgroundColor: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-[1400px] mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/orbit-logo.svg" alt="Orbit" className="w-5 h-5 opacity-50" />
            <span className="text-xs tracking-[0.15em] text-[#555] uppercase" style={{ fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif" }}>Orbit Canvas · 2026</span>
          </div>
          <div className="flex gap-8">
            {['Terms', 'Privacy'].map(label => (
              <span key={label} className="text-sm text-[#555] hover:text-[#ccc] transition-colors cursor-pointer">{label}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
