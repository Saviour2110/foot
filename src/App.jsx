import { useState, useEffect, useRef, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  RotateCw, ArrowUpDown, MoveVertical, Settings2,
  Play, Pause, ChevronDown, Box, Cog, Link2, Layers,
  CheckCircle2, ShieldCheck, HeartPulse, FileText, Printer,
  Eye, EyeOff, RotateCcw, Activity, Info, Zap, AlertTriangle
} from 'lucide-react'
import MechanismScene from './components/MechanismScene'
import './index.css'

/* =========================================================
   TOP NAVBAR
   ========================================================= */
function Navbar({ onOpenReport }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <a href="#" className="nav-logo">
          <div className="nav-logo-icon">
            <Cog size={18} className="spin-slow" />
          </div>
          <span>KINEMATIX<span className="accent-dot">.</span>3DOF</span>
        </a>

        <div className="nav-links">
          <a href="#motions">Motions</a>
          <a href="#viewer">3D Visualizer</a>
          <a href="#diagram">Kinematics</a>
          <a href="#principle">Working Principle</a>
          <a href="#safety">Safety &amp; Ergonomics</a>
          <a href="#specs">Specifications</a>
        </div>

        <div className="nav-actions">
          <button className="nav-btn-secondary" onClick={onOpenReport}>
            <FileText size={15} />
            <span>Assignment Dossier</span>
          </button>
        </div>
      </div>
    </nav>
  )
}

/* =========================================================
   HERO SECTION
   ========================================================= */
function Hero({ onOpenReport }) {
  return (
    <section className="hero">
      <div className="hero-grid-bg" />
      <div className="hero-circles">
        <div className="hero-circle" />
        <div className="hero-circle" />
        <div className="hero-circle" />
      </div>

      <motion.div
        className="hero-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9 }}
      >
        <motion.div
          className="hero-badge"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <span className="hero-badge-dot" />
          Kinematics &amp; Linkage Mechanism Design · Live Human Foot
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          Multi-DOF Foot Linkage Mechanism
        </motion.h1>

        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
        >
          A precision-engineered mechanical platform providing decoupled axial rotation,
          sagittal tilting, and vertical translation for safe rehabilitation, gait simulation,
          and biomechanical exercise of a live human foot.
        </motion.p>

        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}
        >
          <a href="#viewer" className="btn-primary">
            <Play size={16} /> Explore Live 3D Mechanism
          </a>
          <button className="btn-outline" onClick={onOpenReport}>
            <FileText size={16} /> View Academic Assignment
          </button>
        </motion.div>

        <motion.div
          className="hero-stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <div className="hero-stat">
            <div className="hero-stat-value">3 DOF</div>
            <div className="hero-stat-label">Decoupled Motion Axes</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">±15°</div>
            <div className="hero-stat-label">Yaw Rotation Range</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">±10°</div>
            <div className="hero-stat-label">Pitch Tilting Range</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">30 mm</div>
            <div className="hero-stat-label">Vertical Elevation Stroke</div>
          </div>
        </motion.div>
      </motion.div>

      <div className="scroll-indicator">
        <span>Scroll to Explore</span>
        <div className="scroll-indicator-line" />
        <ChevronDown size={14} />
      </div>
    </section>
  )
}

/* =========================================================
   ANIMATED SECTION WRAPPER
   ========================================================= */
function AnimatedSection({ children, className = '', id }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      id={id}
      className={className}
      initial={{ opacity: 0, y: 35 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

/* =========================================================
   MOTION CARDS SECTION
   ========================================================= */
const motionTypes = [
  {
    icon: RotateCw,
    title: '1. Axial Rotation (Yaw)',
    sub: 'Medial / Lateral Foot Rotation',
    desc: 'The foot turns left and right around a vertical axis (±15°). Achieved via a thrust-bearing revolute joint placed directly beneath the platform, allowing controlled internal and external rotation without tilting.',
    jointType: 'Revolute Pair (R)',
    range: '±15° Continuous Angle',
    speed: 'Max 6°/s (Controlled)',
    color: '#10b981',
    colorRgb: '16, 185, 129'
  },
  {
    icon: ArrowUpDown,
    title: '2. Sagittal Tilting (Pitch)',
    sub: 'Dorsiflexion & Plantarflexion',
    desc: 'The platform inclines upward and downward (±10°), lifting the toes or the heel. A precision horizontal hinge pin joint (or four-bar rocker) drives natural ankle flexion while supporting the full plantar surface.',
    jointType: 'Hinge Joint (H)',
    range: '±10° Pitch Angle',
    speed: 'Max 4°/s (Safe Flex)',
    color: '#8b5cf6',
    colorRgb: '139, 92, 246'
  },
  {
    icon: MoveVertical,
    title: '3. Up-and-Down Motion (Z)',
    sub: 'Vertical Translation / Clearance',
    desc: 'The entire foot assembly translates linearly up and down (0–30 mm). Guided by dual cylindrical prismatic rails and actuated by an anti-backlash lead screw for smooth, steady elevation adjustments.',
    jointType: 'Prismatic Pair (P)',
    range: '0 – 30 mm Linear Travel',
    speed: 'Max 10 mm/s (Low Velocity)',
    color: '#38bdf8',
    colorRgb: '56, 189, 248'
  }
]

function MotionCards() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <AnimatedSection className="section" id="motions">
      <div className="section-header">
        <span className="section-label">// Kinematic Requirements</span>
        <h2 className="section-title">The Three Required Foot Movements</h2>
        <p className="section-desc">
          To simulate natural ankle bio-mechanics, the mechanism combines three distinct,
          independent motions into a single consolidated mechanical assembly.
        </p>
      </div>

      <div className="motion-cards" ref={ref}>
        {motionTypes.map((m, i) => (
          <motion.div
            key={m.title}
            className="motion-card"
            style={{
              '--card-accent': m.color,
              '--card-accent-rgb': m.colorRgb,
              '--card-glow': m.color + '25'
            }}
            initial={{ opacity: 0, y: 35 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.15, duration: 0.55 }}
          >
            <div className="motion-card-badge" style={{ color: m.color, background: m.color + '18' }}>
              {m.jointType}
            </div>
            <div className="motion-card-icon" style={{ background: m.color + '15', color: m.color }}>
              <m.icon size={22} />
            </div>
            <h3>{m.title}</h3>
            <div className="motion-card-sub">{m.sub}</div>
            <p>{m.desc}</p>
            <div className="motion-card-metrics">
              <span className="metric-tag" style={{ background: m.color + '12', color: m.color }}>
                <strong>Range:</strong> {m.range}
              </span>
              <span className="metric-tag" style={{ background: m.color + '0a', color: '#94a3b8' }}>
                <strong>Velocity:</strong> {m.speed}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </AnimatedSection>
  )
}

/* =========================================================
   3D INTERACTIVE VIEWER & SIMULATOR
   ========================================================= */
const PRESETS = [
  { name: 'Neutral Rest', rot: 0, tilt: 0, h: 0, desc: '0°, 0°, 0mm' },
  { name: 'Dorsiflexion', rot: 0, tilt: 10, h: 10, desc: 'Toes raised +10°' },
  { name: 'Plantarflexion', rot: 0, tilt: -10, h: 5, desc: 'Toes pressed -10°' },
  { name: 'Medial Yaw', rot: 15, tilt: 0, h: 15, desc: 'Turn left +15°' },
  { name: 'Lateral Yaw', rot: -15, tilt: 0, h: 15, desc: 'Turn right -15°' },
  { name: 'Full Elevation', rot: 0, tilt: 0, h: 30, desc: 'Max height 30mm' }
]

function InteractiveViewer() {
  const [rotation, setRotation] = useState(0)
  const [tilt, setTilt] = useState(0)
  const [height, setHeight] = useState(0)
  const [autoAnimate, setAutoAnimate] = useState(false)
  const [showFoot, setShowFoot] = useState(true)
  const [showLabels, setShowLabels] = useState(true)
  const animRef = useRef(null)

  useEffect(() => {
    if (!autoAnimate) {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      return
    }
    let t = 0
    function tick() {
      t += 0.015
      setRotation(Math.sin(t * 1.0) * 15)
      setTilt(Math.sin(t * 1.4 + 0.8) * 10)
      setHeight(((Math.sin(t * 0.9 + 1.8) + 1) / 2) * 30)
      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [autoAnimate])

  const applyPreset = (preset) => {
    setAutoAnimate(false)
    setRotation(preset.rot)
    setTilt(preset.tilt)
    setHeight(preset.h)
  }

  const resetAll = () => {
    setAutoAnimate(false)
    setRotation(0)
    setTilt(0)
    setHeight(0)
  }

  return (
    <AnimatedSection className="viewer-section" id="viewer">
      <div className="section-header">
        <span className="section-label">// Interactive 3D Simulator</span>
        <h2 className="section-title">Kinematic Digital Twin</h2>
        <p className="section-desc">
          Interact in real-time with the full 3D assembly. Rotate, tilt, and elevate the live
          foot platform with sub-millimeter visual precision.
        </p>
      </div>

      <div className="viewer-container">
        {/* 3D Canvas Area */}
        <div className="viewer-canvas-wrap">
          <div className="viewer-label">
            <span className="viewer-label-dot" />
            Live 3D Model · Orbit Controls Active
          </div>

          <div className="viewer-toolbar">
            <button
              className={`tool-btn ${showFoot ? 'active' : ''}`}
              onClick={() => setShowFoot(!showFoot)}
              title="Toggle Live Human Foot Model"
            >
              {showFoot ? <Eye size={14} /> : <EyeOff size={14} />}
              <span>{showFoot ? 'Human Foot: ON' : 'Human Foot: OFF'}</span>
            </button>
            <button
              className={`tool-btn ${showLabels ? 'active' : ''}`}
              onClick={() => setShowLabels(!showLabels)}
              title="Toggle Engineering Labels"
            >
              <Info size={14} />
              <span>{showLabels ? 'Labels: ON' : 'Labels: OFF'}</span>
            </button>
            <button className="tool-btn" onClick={resetAll} title="Reset to Neutral Position">
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          </div>

          <Canvas
            camera={{ position: [3.8, 3.2, 3.8], fov: 42 }}
            shadows
            dpr={[1, 2]}
          >
            <color attach="background" args={['#0a0f1d']} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[6, 9, 6]} intensity={1.3} castShadow />
            <directionalLight position={[-4, 6, -4]} intensity={0.4} />
            <pointLight position={[0, 2, 0]} intensity={0.5} color="#38bdf8" />
            <Suspense fallback={null}>
              <MechanismScene
                rotation={rotation}
                tilt={tilt}
                height={height}
                showFoot={showFoot}
                showLabels={showLabels}
              />
              <ContactShadows
                position={[0, -0.44, 0]}
                opacity={0.45}
                scale={9}
                blur={2.4}
                far={4}
              />
              <Environment preset="city" />
            </Suspense>
            <OrbitControls
              enablePan={false}
              minDistance={2.8}
              maxDistance={9.5}
              minPolarAngle={Math.PI / 8}
              maxPolarAngle={Math.PI / 2.1}
            />
            <gridHelper args={[10, 20, '#1e293b', '#0f172a']} />
          </Canvas>

          {/* Quick Presets Strip */}
          <div className="presets-bar">
            <span className="preset-label">Presets:</span>
            {PRESETS.map((p) => (
              <button
                key={p.name}
                className="preset-btn"
                onClick={() => applyPreset(p)}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Control & Telemetry Panel */}
        <div className="viewer-controls">
          <div className="controls-header">
            <h3><Settings2 size={16} /> Kinematic Controls</h3>
            <span className="status-pill active">
              <span className="status-dot" /> 3 DOF Active
            </span>
          </div>

          {/* Control 1: Rotation */}
          <div className="control-group">
            <div className="control-label">
              <span>
                <RotateCw size={13} style={{ display: 'inline', marginRight: 4, color: '#10b981' }} />
                Axial Rotation (Yaw)
              </span>
              <span className="control-value" style={{ color: '#10b981' }}>
                {rotation.toFixed(1)}°
              </span>
            </div>
            <input
              type="range"
              className="control-slider green"
              min={-15}
              max={15}
              step={0.1}
              value={rotation}
              onChange={e => { setAutoAnimate(false); setRotation(Number(e.target.value)) }}
            />
            <div className="slider-limits">
              <span>-15° Lateral</span>
              <span>0° Neutral</span>
              <span>+15° Medial</span>
            </div>
          </div>

          {/* Control 2: Tilting */}
          <div className="control-group">
            <div className="control-label">
              <span>
                <ArrowUpDown size={13} style={{ display: 'inline', marginRight: 4, color: '#a855f7' }} />
                Sagittal Tilt (Pitch)
              </span>
              <span className="control-value" style={{ color: '#a855f7' }}>
                {tilt.toFixed(1)}°
              </span>
            </div>
            <input
              type="range"
              className="control-slider purple"
              min={-10}
              max={10}
              step={0.1}
              value={tilt}
              onChange={e => { setAutoAnimate(false); setTilt(Number(e.target.value)) }}
            />
            <div className="slider-limits">
              <span>-10° Plantar</span>
              <span>0° Flat</span>
              <span>+10° Dorsi</span>
            </div>
          </div>

          {/* Control 3: Vertical Stroke */}
          <div className="control-group">
            <div className="control-label">
              <span>
                <MoveVertical size={13} style={{ display: 'inline', marginRight: 4, color: '#38bdf8' }} />
                Vertical Stroke (Z)
              </span>
              <span className="control-value" style={{ color: '#38bdf8' }}>
                {height.toFixed(1)} mm
              </span>
            </div>
            <input
              type="range"
              className="control-slider blue"
              min={0}
              max={30}
              step={0.1}
              value={height}
              onChange={e => { setAutoAnimate(false); setHeight(Number(e.target.value)) }}
            />
            <div className="slider-limits">
              <span>0 mm Base</span>
              <span>15 mm Mid</span>
              <span>30 mm Peak</span>
            </div>
          </div>

          {/* Auto Animation Button */}
          <button
            className={`auto-animate-btn ${autoAnimate ? 'active' : ''}`}
            onClick={() => setAutoAnimate(v => !v)}
          >
            {autoAnimate ? <Pause size={16} /> : <Play size={16} />}
            {autoAnimate ? 'Pause Synchronized Cycle' : 'Auto Animate Gait Cycle'}
          </button>

          {/* Real-time Telemetry Card */}
          <div className="telemetry-card">
            <div className="telemetry-header">
              <Activity size={13} />
              <span>LIVE TELEMETRY STREAM</span>
            </div>
            <div className="telemetry-grid">
              <div className="tele-item">
                <span className="tele-label">Z-Displacement</span>
                <span className="tele-val">{(height).toFixed(1)} mm</span>
              </div>
              <div className="tele-item">
                <span className="tele-label">Pitch Angle</span>
                <span className="tele-val">{(tilt).toFixed(1)}°</span>
              </div>
              <div className="tele-item">
                <span className="tele-label">Yaw Angle</span>
                <span className="tele-val">{(rotation).toFixed(1)}°</span>
              </div>
              <div className="tele-item">
                <span className="tele-label">Safety Status</span>
                <span className="tele-val ok">VERIFIED SAFE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  )
}

/* =========================================================
   KINEMATIC DIAGRAM & MOBILITY DERIVATION SECTION
   ========================================================= */
function KinematicDiagram() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <div className="kinematic-section" id="diagram">
      <AnimatedSection className="section">
        <div className="section-header">
          <span className="section-label">// Kinematic Analysis &amp; Topology</span>
          <h2 className="section-title">Schematic Mechanism &amp; Mobility Proof</h2>
          <p className="section-desc">
            Serial kinematic chain: Ground (Link 1) → Prismatic Slider (Link 2) →
            Revolute Turntable (Link 3) → Hinge Platform (Link 4).
          </p>
        </div>

        {/* SVG Kinematic Diagram */}
        <div className="kinematic-svg-wrap" ref={ref}>
          <svg viewBox="0 0 820 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Ground / Base Link 1 */}
            <motion.rect
              x="30" y="320" width="760" height="44" rx="6"
              fill="#181e29" stroke="#334155" strokeWidth="2"
              initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ duration: 0.5 }}
            />
            <motion.text x="410" y="348" textAnchor="middle" fill="#94a3b8" fontSize="13" fontFamily="monospace" fontWeight="600"
              initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.1 }}
            >LINK 1: RIGID GROUND BASE FRAME</motion.text>

            {/* Hatching for Ground */}
            {[...Array(24)].map((_, i) => (
              <motion.line
                key={i}
                x1={50 + i * 31} y1="364" x2={38 + i * 31} y2="376"
                stroke="#334155" strokeWidth="1.5"
                initial={{ opacity: 0 }} animate={isInView ? { opacity: 0.6 } : {}} transition={{ delay: 0.03 * i }}
              />
            ))}

            {/* Twin Vertical Guide Rods (Prismatic Pair Guides) */}
            <motion.rect x="180" y="110" width="10" height="210" rx="5" fill="#475569"
              initial={{ scaleY: 0, originY: '100%' }} animate={isInView ? { scaleY: 1 } : {}} transition={{ delay: 0.25, duration: 0.5 }}
            />
            <motion.rect x="630" y="110" width="10" height="210" rx="5" fill="#475569"
              initial={{ scaleY: 0, originY: '100%' }} animate={isInView ? { scaleY: 1 } : {}} transition={{ delay: 0.25, duration: 0.5 }}
            />

            {/* Prismatic Joint Graphic Box Link 2 */}
            <motion.rect x="160" y="190" width="50" height="70" rx="6" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" strokeDasharray="5 3"
              initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.4 }}
            />
            <motion.rect x="610" y="190" width="50" height="70" rx="6" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" strokeDasharray="5 3"
              initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.4 }}
            />

            {/* Motion Arrows for Prismatic Joint */}
            <motion.path d="M145 205 L145 180 M139 187 L145 178 L151 187" stroke="#38bdf8" strokeWidth="2" fill="none"
              initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.5 }}
            />
            <motion.path d="M145 235 L145 260 M139 253 L145 262 L151 253" stroke="#38bdf8" strokeWidth="2" fill="none"
              initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.5 }}
            />
            <motion.text x="122" y="225" textAnchor="middle" fill="#38bdf8" fontSize="12" fontFamily="monospace" fontWeight="700"
              initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.55 }}
            >J1 (P)</motion.text>

            {/* Slider Carriage (Link 2) */}
            <motion.rect x="175" y="180" width="470" height="20" rx="4" fill="#334155" stroke="#64748b" strokeWidth="1.5"
              initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.6 }}
            />
            <motion.text x="410" y="215" textAnchor="middle" fill="#cbd5e1" fontSize="11" fontFamily="monospace" fontWeight="600"
              initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.65 }}
            >LINK 2: SLIDING CARRIAGE (Stroke: 0–30mm)</motion.text>

            {/* Revolute Joint (J2) Turntable */}
            <motion.circle cx="410" cy="155" r="22" fill="#0f172a" stroke="#10b981" strokeWidth="2.5"
              initial={{ scale: 0 }} animate={isInView ? { scale: 1 } : {}} transition={{ delay: 0.75, type: 'spring' }}
            />
            <motion.circle cx="410" cy="155" r="5" fill="#10b981"
              initial={{ scale: 0 }} animate={isInView ? { scale: 1 } : {}} transition={{ delay: 0.8 }}
            />

            {/* Rotation Arc Arrow */}
            <motion.path d="M432 138 A26 26 0 0 1 432 172" stroke="#10b981" strokeWidth="2" fill="none"
              initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : {}} transition={{ delay: 0.85, duration: 0.5 }}
            />
            <motion.path d="M428 135 L433 138 L437 133" stroke="#10b981" strokeWidth="2" fill="none"
              initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.0 }}
            />
            <motion.text x="460" y="159" fill="#10b981" fontSize="11" fontFamily="monospace" fontWeight="700"
              initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.9 }}
            >J2 (R: ±15° Yaw)</motion.text>

            {/* Turntable Stanchions (Link 3) */}
            <motion.line x1="410" y1="180" x2="410" y2="177" stroke="#64748b" strokeWidth="3" />
            <motion.line x1="330" y1="110" x2="490" y2="110" stroke="#64748b" strokeWidth="3"
              initial={{ scaleX: 0 }} animate={isInView ? { scaleX: 1 } : {}} transition={{ delay: 0.95, duration: 0.4 }}
            />
            <motion.line x1="410" y1="133" x2="410" y2="110" stroke="#64748b" strokeWidth="3" />

            {/* Hinge Joint (J3) */}
            <motion.circle cx="410" cy="110" r="12" fill="#0f172a" stroke="#a855f7" strokeWidth="2.5"
              initial={{ scale: 0 }} animate={isInView ? { scale: 1 } : {}} transition={{ delay: 1.05, type: 'spring' }}
            />
            <motion.circle cx="410" cy="110" r="4" fill="#a855f7"
              initial={{ scale: 0 }} animate={isInView ? { scale: 1 } : {}} transition={{ delay: 1.1 }}
            />

            {/* Tilt Arc */}
            <motion.path d="M340 92 A70 70 0 0 1 340 128" stroke="#a855f7" strokeWidth="2" fill="none" strokeDasharray="4 3"
              initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : {}} transition={{ delay: 1.15, duration: 0.5 }}
            />
            <motion.text x="290" y="114" textAnchor="middle" fill="#a855f7" fontSize="11" fontFamily="monospace" fontWeight="700"
              initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.2 }}
            >J3 (H: ±10° Pitch)</motion.text>

            {/* Foot Platform (Link 4) */}
            <motion.rect x="290" y="60" width="240" height="34" rx="8" fill="#1e293b" stroke="#64748b" strokeWidth="2"
              initial={{ opacity: 0, y: -20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 1.25, duration: 0.4 }}
            />
            <motion.text x="410" y="82" textAnchor="middle" fill="#f8fafc" fontSize="12" fontFamily="monospace" fontWeight="700"
              initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.3 }}
            >LINK 4: FOOT PLATFORM BED</motion.text>
            <motion.line x1="410" y1="98" x2="410" y2="94" stroke="#64748b" strokeWidth="3" />

            {/* Stylized Human Foot Outline */}
            <motion.path
              d="M370 42 Q375 22 410 20 Q440 22 450 42 L445 54 Q430 58 410 58 Q385 58 375 54 Z"
              fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2"
              initial={{ opacity: 0 }} animate={isInView ? { opacity: 0.9 } : {}} transition={{ delay: 1.4 }}
            />
            <motion.text x="410" y="14" textAnchor="middle" fill="#f59e0b" fontSize="10" fontFamily="monospace" fontWeight="700"
              initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.45 }}
            >LIVE HUMAN FOOT (PATIENT RESTING)</motion.text>

            {/* Legend Box */}
            <motion.g initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.5 }}>
              <rect x="640" y="30" width="160" height="100" rx="8" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />
              <text x="655" y="50" fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="700">TOPOLOGY LEGEND</text>
              <circle cx="660" cy="68" r="4.5" fill="#38bdf8" />
              <text x="674" y="72" fill="#38bdf8" fontSize="10" fontFamily="monospace">J1: Prismatic (P)</text>
              <circle cx="660" cy="88" r="4.5" fill="#10b981" />
              <text x="674" y="92" fill="#10b981" fontSize="10" fontFamily="monospace">J2: Revolute (R)</text>
              <circle cx="660" cy="108" r="4.5" fill="#a855f7" />
              <text x="674" y="112" fill="#a855f7" fontSize="10" fontFamily="monospace">J3: Hinge (H)</text>
            </motion.g>
          </svg>
        </div>

        {/* Grübler-Kutzbach Equation Card */}
        <div className="math-proof-card">
          <div className="math-header">
            <Zap size={16} className="text-amber" />
            <h3>Grübler-Kutzbach Spatial Mobility Criterion (Mathematical Proof)</h3>
          </div>
          <p className="math-desc">
            To strictly verify that our combined linkage mechanism achieves exactly <strong>3 Degrees of Freedom (DOF)</strong> without over-constraint or under-actuation, we evaluate the spatial Kutzbach criterion:
          </p>
          <div className="math-formula">
            <div className="formula-text">
              M = 6(N - 1 - J) + &sum; f<sub>i</sub>
            </div>
            <div className="formula-sub">
              or in standard form: M = 6(N - 1) - &sum; (6 - f<sub>i</sub>)
            </div>
          </div>
          <div className="math-variables-grid">
            <div className="var-col">
              <strong>N = 4 Rigid Links:</strong>
              <ul>
                <li>Link 1: Base ground frame</li>
                <li>Link 2: Vertical sliding carriage</li>
                <li>Link 3: Turntable intermediate link</li>
                <li>Link 4: Movable foot platform</li>
              </ul>
            </div>
            <div className="var-col">
              <strong>J = 3 Kinematic Pairs:</strong>
              <ul>
                <li>J<sub>1</sub>: Prismatic pair (f<sub>1</sub> = 1, vertical Z)</li>
                <li>J<sub>2</sub>: Revolute pair (f<sub>2</sub> = 1, yaw axis)</li>
                <li>J<sub>3</sub>: Revolute/Hinge pair (f<sub>3</sub> = 1, pitch axis)</li>
              </ul>
            </div>
            <div className="var-col result-col">
              <strong>Evaluation:</strong>
              <div className="calc-step">M = 6 &times; (4 - 1 - 3) + (1 + 1 + 1)</div>
              <div className="calc-step">M = 6 &times; (0) + 3 = <strong>3 DOF</strong></div>
              <div className="badge-verified">
                <CheckCircle2 size={14} /> Rigorously Verified 3 DOF
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  )
}

/* =========================================================
   WORKING PRINCIPLE SECTION
   ========================================================= */
const principleSteps = [
  {
    num: '01',
    title: 'Stage 1 — Vertical Motion (Prismatic Slider Mechanism)',
    desc: 'The ground base houses two hardened precision steel guide rods and a central lead screw driven by a stepper motor. The sliding carriage rides on recirculating linear ball bushings, constraining all lateral and rotational movement while allowing pure vertical translation along the Z-axis (0–30 mm). Dual limit switches safeguard against over-travel.',
    accent: '#38bdf8',
    accentRgb: '56, 189, 248'
  },
  {
    num: '02',
    title: 'Stage 2 — Axial Rotation (Revolute Turntable Joint)',
    desc: 'Mounted on top of the vertical carriage is a high-load thrust-bearing turntable. A worm gear reduction drive rotates the upper assembly about the vertical axis. The worm gear provides a critical self-locking safety feature: it resists external backdriving forces exerted by involuntary muscle spasms. Mechanical stop lugs rigidly limit yaw to ±15°.',
    accent: '#10b981',
    accentRgb: '16, 185, 129'
  },
  {
    num: '03',
    title: 'Stage 3 — Sagittal Tilting (Hinge / Four-Bar Arrangement)',
    desc: 'The topmost stage connects to the footbed via a horizontal pin joint aligned with the natural transverse malleolar axis of the ankle. A motorized actuator or balanced 4-bar rocker arm smoothly pitches the foot up (dorsiflexion up to +10°) and down (plantarflexion down to -10°). Mechanical bumpers prevent hyperextension.',
    accent: '#a855f7',
    accentRgb: '168, 85, 247'
  }
]

function WorkingPrinciple() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <AnimatedSection className="section" id="principle">
      <div className="section-header">
        <span className="section-label">// Kinematic Mechanics</span>
        <h2 className="section-title">Working Principle &amp; Motion Transmission</h2>
        <p className="section-desc">
          How electrical/manual drive torque is sequentially converted into three independent
          foot trajectories without parasitic coupling.
        </p>
      </div>

      <div className="explainer-steps" ref={ref}>
        {principleSteps.map((s, i) => (
          <motion.div
            key={s.num}
            className="explainer-step"
            style={{ '--step-accent': s.accent, '--step-accent-rgb': s.accentRgb }}
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: i * 0.18, duration: 0.55 }}
          >
            <div className="step-number">{s.num}</div>
            <div className="step-content">
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </AnimatedSection>
  )
}

/* =========================================================
   SAFETY & BIOMECHANICAL ERGONOMICS SECTION
   ========================================================= */
const safetyFeatures = [
  {
    icon: ShieldCheck,
    title: 'Mechanical Hard Stops',
    desc: 'Machined steel stop lugs at ±15° yaw and ±10° pitch physically prevent joint over-travel, protecting ankle ligaments even in the event of an electrical sensor failure.'
  },
  {
    icon: HeartPulse,
    title: 'Biomechanical Comfort Footbed',
    desc: 'High-density closed-cell EVA foam padding lines the platform, distributing planter contact pressure evenly across the heel, arch, and metatarsal heads.'
  },
  {
    icon: AlertTriangle,
    title: 'Emergency Stop & Low Velocity',
    desc: 'Instant emergency-stop cutoff switch and rate-limiting actuators cap linear velocity under 12 mm/s and angular velocity under 5°/s for gentle, controlled movement.'
  },
  {
    icon: Layers,
    title: 'Dual Restraint Strapping',
    desc: 'Padded medical-grade hook-and-loop straps over the forefoot and instep firmly secure the foot against slippage without restricting peripheral venous circulation.'
  }
]

function SafetySection() {
  return (
    <AnimatedSection className="section" id="safety">
      <div className="section-header">
        <span className="section-label">// Live Human Foot Considerations</span>
        <h2 className="section-title">Safety, Ergonomics &amp; Comfort</h2>
        <p className="section-desc">
          Because this mechanism directly interfaces with a live human foot, user safety and
          physiological compliance are the primary design priorities.
        </p>
      </div>

      <div className="safety-grid">
        {safetyFeatures.map((f, i) => (
          <div key={f.title} className="safety-card">
            <div className="safety-icon-wrap">
              <f.icon size={22} />
            </div>
            <h4>{f.title}</h4>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </AnimatedSection>
  )
}

/* =========================================================
   SPECIFICATIONS & ASSUMPTIONS TABLE
   ========================================================= */
const specs = [
  ['Vertical Movement Stroke', '30 mm', 'Prismatic slider joint travel (0–30 mm) along Z-axis'],
  ['Tilting Angle Range', '±10°', 'Sagittal dorsiflexion / plantarflexion about horizontal axis'],
  ['Rotation Angle Range', '±15°', 'Axial yaw rotation about vertical axis (medial/lateral)'],
  ['Human Foot Model', 'Rigid Body Assumption', 'Standard adult foot profile simplified for kinematic analysis'],
  ['Foot Platform Dimensions', '240 mm &times; 110 mm', 'Accommodates 95th percentile human foot length/width'],
  ['Foot Retention System', 'Padded Velcro Straps', 'Dual instep & forefoot restraints with heel cup alignment'],
  ['Motion Dynamics', 'Slow &amp; Controlled', 'Actuated under 12 mm/s and 5°/s for patient safety'],
  ['Mechanism Mobility (DOF)', '3 Degrees of Freedom', 'Independently decoupled motion stages (P-R-H)'],
  ['Structural Materials', 'Aluminium 6061-T6 / Steel', 'High rigidity, low deflection under 150 N human leg load'],
  ['Actuation Method', 'Precision Lead Screw &amp; Worm Drive', 'Self-locking geometry prevents accidental backdriving']
]

function SpecsTable() {
  return (
    <AnimatedSection className="section" id="specs">
      <div className="section-header">
        <span className="section-label">// Academic Design Data</span>
        <h2 className="section-title">Kinematic Assumptions &amp; Specifications</h2>
        <p className="section-desc">
          Engineering assumptions adopted to fulfill the kinematic motion requirements for an academic design.
        </p>
      </div>

      <div className="specs-table-wrap">
        <table className="specs-table">
          <thead>
            <tr>
              <th>Design Parameter</th>
              <th>Assumed Value</th>
              <th>Kinematic Rationale &amp; Notes</th>
            </tr>
          </thead>
          <tbody>
            {specs.map(([param, val, note]) => (
              <tr key={param}>
                <td><strong>{param}</strong></td>
                <td><span className="mono font-semibold" dangerouslySetInnerHTML={{ __html: val }} /></td>
                <td dangerouslySetInnerHTML={{ __html: note }} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AnimatedSection>
  )
}

/* =========================================================
   COMPONENT BREAKDOWN SECTION
   ========================================================= */
const components = [
  { icon: Box, title: 'Base Frame (Link 1)', desc: 'Ground datum foundation with vibration-damping rubber mounts' },
  { icon: ArrowUpDown, title: 'Vertical Slider (Link 2)', desc: 'Hardened linear guide rails and anti-backlash lead screw carriage' },
  { icon: RotateCw, title: 'Turntable (Link 3)', desc: 'Heavy-duty thrust bearing revolute pair with worm gear drive' },
  { icon: Link2, title: 'Hinge Joint', desc: 'Precision steel pin joint positioned along the ankle pivot line' },
  { icon: Layers, title: 'Foot Platform (Link 4)', desc: 'Ergonomic footbed with high-friction pad, straps & heel cup' },
  { icon: Cog, title: 'Safety Stops & Drive', desc: 'Mechanical limit lugs and torque-limiting safety actuators' }
]

function ComponentList() {
  return (
    <AnimatedSection className="section" id="components">
      <div className="section-header">
        <span className="section-label">// Bill of Components</span>
        <h2 className="section-title">Mechanism Assembly Components</h2>
      </div>

      <div className="component-grid">
        {components.map((c, i) => (
          <div key={c.title} className="component-item">
            <div className="component-icon">
              <c.icon size={18} />
            </div>
            <div>
              <h4>{c.title}</h4>
              <p>{c.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </AnimatedSection>
  )
}

/* =========================================================
   ACADEMIC ASSIGNMENT DOSSIER MODAL / DRAWER
   ========================================================= */
function AssignmentModal({ isOpen, onClose }) {
  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container print-area" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="modal-tag">ACADEMIC DESIGN DOSSIER</span>
            <h2>Foot Linkage Mechanism Design Report</h2>
            <p className="modal-sub">Structured Academic Submission · Kinematics &amp; Dynamics of Mechanisms</p>
          </div>
          <div className="modal-actions">
            <button className="btn-print" onClick={handlePrint} title="Print / Save PDF">
              <Printer size={16} /> Print Report
            </button>
            <button className="btn-close" onClick={onClose}>&times;</button>
          </div>
        </div>

        <div className="modal-body">
          {/* Section 1 */}
          <div className="report-section">
            <h3>1. Introduction</h3>
            <p>
              In biomechanical engineering, robotic rehabilitation, and physical therapy, providing
              controlled motion to a human lower extremity is vital for joint mobilization, edema prevention,
              and gait retraining. The purpose of this mechanism is to support a live human foot and provide
              three independent, smoothly controlled degrees of freedom: vertical translation, axial rotation,
              and sagittal tilting. Unlike shoe design or medical orthotics, this task focuses strictly on
              the kinematic synthesis and topological design of a multi-link mechanism that safely guides the
              foot through prescribed trajectories.
            </p>
          </div>

          {/* Section 2 */}
          <div className="report-section">
            <h3>2. Design Objectives</h3>
            <ul>
              <li><strong>Objective 1 (Axial Rotation):</strong> Enable controlled yaw rotation of the foot (left and right) around a vertical axis by &plusmn;15&deg;.</li>
              <li><strong>Objective 2 (Sagittal Tilting):</strong> Enable controlled pitch tilting (dorsiflexion and plantarflexion) by &plusmn;10&deg; about a horizontal transverse axis.</li>
              <li><strong>Objective 3 (Vertical Translation):</strong> Provide 30 mm of pure linear up-and-down motion along the vertical Z-axis.</li>
              <li><strong>Objective 4 (Kinematic Decoupling):</strong> Ensure each of the three movements can occur independently without parasitic motion cross-talk.</li>
              <li><strong>Objective 5 (Human Safety):</strong> Provide mechanical failsafes, low velocities, and restraint straps appropriate for a live human foot.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="report-section">
            <h3>3. Assumptions for Kinematic Motion</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Assumed Value</th>
                  <th>Engineering Justification</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Vertical Stroke</td>
                  <td>30 mm</td>
                  <td>Sufficient for elevation clearance and ground clearance simulation without over-stretching the leg.</td>
                </tr>
                <tr>
                  <td>Tilting Angle</td>
                  <td>&plusmn;10&deg;</td>
                  <td>Conservative safe range of motion for human ankle dorsiflexion/plantarflexion during passive therapy.</td>
                </tr>
                <tr>
                  <td>Rotation Angle</td>
                  <td>&plusmn;15&deg;</td>
                  <td>Matches typical inward (medial) and outward (lateral) foot rotation without knee torque discomfort.</td>
                </tr>
                <tr>
                  <td>Foot Representation</td>
                  <td>Rigid Body</td>
                  <td>Standard kinematic assumption treating the foot as a single rigid body mounted to the platform bed.</td>
                </tr>
                <tr>
                  <td>Motion Profile</td>
                  <td>Slow &amp; Controlled</td>
                  <td>Velocities maintained below 12 mm/s and 5&deg;/s to prevent shock, inertia forces, or muscle spasms.</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 4 */}
          <div className="report-section">
            <h3>4. Mechanism Design &amp; Linkage Architecture</h3>
            <p>
              A single four-bar linkage alone possesses only 1 Degree of Freedom and cannot independently deliver
              all three required spatial motions. Therefore, the proposed solution employs a <strong>serial kinematic architecture</strong> comprising three distinct stages:
            </p>
            <ol>
              <li><strong>Base Ground Frame (Link 1):</strong> Rigid datum supporting two vertical precision steel guide rods and a central leadscrew drive.</li>
              <li><strong>Vertical Slider Carriage (Link 2):</strong> Prismatic pair (P) constrained by linear ball bushings, moving vertically along the Z-axis.</li>
              <li><strong>Turntable Swivel Stage (Link 3):</strong> Revolute pair (R) with a thrust bearing mounted on the carriage, providing yaw rotation.</li>
              <li><strong>Tilting Foot Platform (Link 4):</strong> Hinge joint (H) mounted atop the turntable with twin transfer struts connecting to the footbed.</li>
            </ol>
          </div>

          {/* Section 5 */}
          <div className="report-section">
            <h3>5. Working Principle</h3>
            <p>
              Motion is transferred from actuators to the foot platform through an uncoupled series arrangement:
            </p>
            <ul>
              <li><strong>Vertical Motion:</strong> Actuation of the central leadscrew translates Link 2 vertically along Link 1, carrying the entire upper mechanism with 30 mm stroke.</li>
              <li><strong>Yaw Rotation:</strong> The worm-wheel drive on Link 2 rotates Link 3 relative to Link 2 by &plusmn;15&deg;. The worm mesh is self-locking, preventing involuntary patient movement from backdriving the motor.</li>
              <li><strong>Pitch Tilting:</strong> A motorized rocker arm or linear pushrod acts on Link 4, pivoting it about the horizontal hinge pin on Link 3 by &plusmn;10&deg;.</li>
            </ul>
          </div>

          {/* Section 6 */}
          <div className="report-section">
            <h3>6. Kinematic Mobility Proof</h3>
            <p>
              Applying the spatial Kutzbach mobility equation for spatial mechanisms:
            </p>
            <div className="formula-box">
              M = 6(N - 1 - J) + &sum; f<sub>i</sub><br />
              N = 4 links, J = 3 joints (1 Prismatic, 1 Revolute, 1 Hinge, each with f = 1)<br />
              M = 6(4 - 1 - 3) + (1 + 1 + 1) = 6(0) + 3 = <strong>3 DOF</strong>
            </div>
            <p>
              This mathematically confirms that the mechanism possesses exactly three independent spatial degrees of freedom with zero kinematic redundancy or over-constraint.
            </p>
          </div>

          {/* Section 7 */}
          <div className="report-section">
            <h3>7. Conclusion &amp; Safety Verification</h3>
            <p>
              The proposed 3-DOF linkage mechanism successfully satisfies all design requirements: it provides
              vertical translation (30 mm), rotation (&plusmn;15&deg;), and tilting (&plusmn;10&deg;) for a live human foot.
              Patient safety and comfort are maintained through physical mechanical hard stops, self-locking worm and
              leadscrew gears, low-velocity drive rates, ergonomic EVA foam padding, and dual Velcro restraint straps.
              This design provides an optimal foundation for academic submission, physical prototyping, and biomedical application.
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-print" onClick={handlePrint}>
            <Printer size={16} /> Print Full Assignment Report
          </button>
          <button className="btn-primary" onClick={onClose}>
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  )
}

/* =========================================================
   FOOTER
   ========================================================= */
function Footer({ onOpenReport }) {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="footer-logo">
            <Cog size={16} className="spin-slow" />
            <span>KINEMATIX.3DOF</span>
          </div>
          <p>Kinematic Synthesis &amp; Linkage Mechanism Design for a Live Human Foot</p>
        </div>

        <div className="footer-links">
          <a href="#motions">Motions</a>
          <a href="#viewer">3D Visualizer</a>
          <a href="#diagram">Kinematic Proof</a>
          <a href="#principle">Working Principle</a>
          <a href="#specs">Specifications</a>
          <button className="footer-link-btn" onClick={onOpenReport}>Academic Report</button>
        </div>
      </div>

      <div className="footer-divider" />

      <div className="footer-bottom">
        <span>Mechanical Engineering Design Project · Academic Kinematics</span>
        <span>© {new Date().getFullYear()} · 3-DOF Foot Mechanism Specification</span>
      </div>
    </footer>
  )
}

/* =========================================================
   ROOT APP COMPONENT
   ========================================================= */
export default function App() {
  const [reportOpen, setReportOpen] = useState(false)

  return (
    <div className="app-root">
      <Navbar onOpenReport={() => setReportOpen(true)} />
      <Hero onOpenReport={() => setReportOpen(true)} />
      <MotionCards />
      <InteractiveViewer />
      <KinematicDiagram />
      <WorkingPrinciple />
      <SafetySection />
      <SpecsTable />
      <ComponentList />
      <Footer onOpenReport={() => setReportOpen(true)} />
      <AssignmentModal isOpen={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  )
}
