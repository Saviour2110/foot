import { useState, useEffect, useRef, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import {
  RotateCw, ArrowUpDown, MoveVertical, Sliders,
  Play, Pause, RotateCcw,
  Eye, EyeOff, Compass,
  Layers, CheckCircle2, AlertTriangle,
  ChevronDown, ChevronUp, Maximize2, Sparkles
} from 'lucide-react'
import MechanismScene from './components/MechanismScene'
import './index.css'

/* =========================================================
   SIMPLE FOOT POSITIONS
   ========================================================= */
const MOTION_PRESETS = [
  { id: 'standing', name: 'Normal Standing', rot: 0, tilt: 0, h: 0 },
  { id: 'heel', name: 'Heel Down', rot: -2, tilt: 8, h: 12 },
  { id: 'flat', name: 'Flat Step', rot: 0, tilt: 0, h: 18 },
  { id: 'toe', name: 'Toe Push', rot: 4, tilt: -8, h: 28 },
  { id: 'tilt_r', name: 'Tilt Right', rot: 12, tilt: 2, h: 10 },
  { id: 'tilt_l', name: 'Tilt Left', rot: -12, tilt: -2, h: 10 }
]

/* =========================================================
   CAMERA VIEWS
   ========================================================= */
const CAMERA_VIEWS = [
  { id: '3d', label: '3D View' },
  { id: 'side', label: 'Side View' },
  { id: 'front', label: 'Front View' },
  { id: 'top', label: 'Top View' }
]

export default function App() {
  // Mechanism movement state
  const [rotation, setRotation] = useState(0) // Turn Left / Right (-15 to +15 deg)
  const [tilt, setTilt] = useState(0)         // Tilt Up / Down (-10 to +10 deg)
  const [height, setHeight] = useState(10)    // Height Lift (0 to 30 mm)

  // Visualization options
  const [showFoot, setShowFoot] = useState(true)
  const [showLabels, setShowLabels] = useState(false)

  // Foot morphology: Healthy Foot vs Flat Foot
  const [selectedFootType, setSelectedFootType] = useState('healthy')

  // Active preset ID
  const [activePreset, setActivePreset] = useState('standing')

  // Animation state
  const [autoAnimate, setAutoAnimate] = useState(false)
  const [animSpeed, setAnimSpeed] = useState(1)

  // Camera viewpoint state
  const [camView, setCamView] = useState('3d')
  const controlsRef = useRef()

  // HUD collapsed/expanded state
  const [hudOpen, setHudOpen] = useState(true)

  // Auto walking animation loop
  useEffect(() => {
    if (!autoAnimate) return

    let animFrameId
    let startTime = performance.now()

    const animateLoop = (now) => {
      const elapsed = (now - startTime) / 1000
      const cycleTime = 4 / animSpeed
      const phase = (elapsed % cycleTime) / cycleTime // 0 to 1

      // Biomechanical gait cycle curve
      const newHeight = 15 + 11 * Math.sin(phase * Math.PI * 2)
      const newTilt = 7 * Math.sin(phase * Math.PI * 2 + Math.PI / 4)
      const newRot = 5 * Math.cos(phase * Math.PI * 2)

      setHeight(parseFloat(newHeight.toFixed(1)))
      setTilt(parseFloat(newTilt.toFixed(1)))
      setRotation(parseFloat(newRot.toFixed(1)))

      animFrameId = requestAnimationFrame(animateLoop)
    }

    animFrameId = requestAnimationFrame(animateLoop)
    return () => cancelAnimationFrame(animFrameId)
  }, [autoAnimate, animSpeed])

  // Camera preset switcher with smooth coordinates
  const handleCameraChange = (view) => {
    setCamView(view)
    if (!controlsRef.current) return

    if (view === '3d') {
      controlsRef.current.object.position.set(3.8, 3.0, 3.8)
      controlsRef.current.target.set(0, 0.2, 0)
    } else if (view === 'side') {
      controlsRef.current.object.position.set(0.1, 1.35, 4.2)
      controlsRef.current.target.set(0, 0.3, 0)
    } else if (view === 'front') {
      controlsRef.current.object.position.set(4.4, 1.2, 0)
      controlsRef.current.target.set(0, 0.3, 0)
    } else if (view === 'top') {
      controlsRef.current.object.position.set(0.01, 5.2, 0.01)
      controlsRef.current.target.set(0, 0.2, 0)
    }
    controlsRef.current.update()
  }

  // Reset to default
  const resetAll = () => {
    setAutoAnimate(false)
    setActivePreset('standing')
    setRotation(0)
    setTilt(0)
    setHeight(10)
    handleCameraChange('3d')
  }

  return (
    <div className="single-page-app">
      {/* =========================================================
          TOP HEADER: PREMIUM SLEEK APP BAR
          ========================================================= */}
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-dot-pulse" />
          <h1 className="brand-title">Foot Mechanics</h1>
        </div>

        {/* Premium Segmented Switch: Healthy vs Flat Foot */}
        <div className="segmented-selector">
          <button
            className={`segmented-tab ${selectedFootType === 'healthy' ? 'active-healthy' : ''}`}
            onClick={() => {
              setSelectedFootType('healthy')
              setAutoAnimate(false)
              setRotation(0)
              setTilt(0)
              setHeight(10)
            }}
          >
            <span className="dot-indicator healthy" />
            <span>Healthy Foot</span>
          </button>

          <button
            className={`segmented-tab ${selectedFootType === 'flat_foot' ? 'active-flat' : ''}`}
            onClick={() => {
              setSelectedFootType('flat_foot')
              setAutoAnimate(false)
              setRotation(-4)
              setTilt(2)
              setHeight(12)
            }}
          >
            <span className="dot-indicator flat" />
            <span>Flat Foot</span>
          </button>
        </div>

        {/* Header Action Tools */}
        <div className="header-actions">
          <button
            className={`header-tool-btn ${showFoot ? 'active' : ''}`}
            onClick={() => setShowFoot(!showFoot)}
            title="Toggle Foot Visibility"
          >
            {showFoot ? <Eye size={14} /> : <EyeOff size={14} />}
            <span>Foot</span>
          </button>

          <button
            className={`header-tool-btn ${showLabels ? 'active' : ''}`}
            onClick={() => setShowLabels(!showLabels)}
            title="Toggle 3D Labels"
          >
            <Layers size={14} />
            <span>Labels</span>
          </button>

          <button className="header-tool-btn reset-btn" onClick={resetAll} title="Reset All">
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </header>

      {/* =========================================================
          MAIN 3D WORKSPACE
          ========================================================= */}
      <main className="workspace-main">
        {/* WebGL 3D Canvas */}
        <div className="canvas-container">
          <Canvas
            camera={{ position: [3.8, 3.0, 3.8], fov: 40 }}
            shadows
            dpr={[1, 2]}
            gl={{
              antialias: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.15
            }}
          >
            <color attach="background" args={['#080c14']} />
            <ambientLight intensity={0.45} />

            {/* High-definition studio key light */}
            <directionalLight
              position={[6, 10, 6]}
              intensity={1.7}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-bias={-0.0001}
            />

            {/* Soft cool fill light */}
            <directionalLight
              position={[-5, 6, -5]}
              intensity={0.65}
              color="#93c5fd"
            />

            {/* Crisp rim light for anatomical contours */}
            <directionalLight
              position={[0, 8, -8]}
              intensity={0.9}
              color="#e0e7ff"
            />

            {/* Warm arch bounce light */}
            <pointLight
              position={[0, 0.45, 0.65]}
              intensity={0.6}
              color="#fed7aa"
            />

            <Suspense fallback={null}>
              <MechanismScene
                rotation={rotation}
                tilt={tilt}
                height={height}
                showFoot={showFoot}
                showLabels={showLabels}
                footType={selectedFootType}
              />
              <ContactShadows
                position={[0, -0.44, 0]}
                opacity={0.5}
                scale={10}
                blur={2.2}
                far={4}
              />
              <Environment preset="city" />
            </Suspense>

            <OrbitControls
              ref={controlsRef}
              enablePan={false}
              minDistance={2.4}
              maxDistance={9.5}
              minPolarAngle={Math.PI / 10}
              maxPolarAngle={Math.PI / 2.05}
            />
            <gridHelper args={[12, 24, '#1b2436', '#0f172a']} />
          </Canvas>

          {/* Floating Anatomy Status Banner */}
          <div className="anatomy-status-pill">
            {selectedFootType === 'healthy' ? (
              <div className="status-content healthy-badge">
                <CheckCircle2 size={15} className="status-icon text-teal" />
                <div className="status-text">
                  <span className="status-title">Healthy Foot</span>
                  <span className="status-desc">Natural High Medial Arch &bull; Upright Vertical Ankle</span>
                </div>
              </div>
            ) : (
              <div className="status-content flat-badge">
                <AlertTriangle size={15} className="status-icon text-amber" />
                <div className="status-text">
                  <span className="status-title">Flat Foot</span>
                  <span className="status-desc">Fallen Medial Arch (Touching Plate) &bull; Inward Ankle Tilt (-7.5°)</span>
                </div>
              </div>
            )}
          </div>

          {/* Unified Floating Utility Bar (Camera & Foot Positions) */}
          <div className="floating-dock">
            {/* Camera Views Group */}
            <div className="dock-group">
              <span className="dock-label">
                <Compass size={12} /> Camera
              </span>
              <div className="dock-buttons">
                {CAMERA_VIEWS.map((v) => (
                  <button
                    key={v.id}
                    className={`dock-btn ${camView === v.id ? 'active' : ''}`}
                    onClick={() => handleCameraChange(v.id)}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="dock-divider" />

            {/* Position Presets Group */}
            <div className="dock-group">
              <span className="dock-label">
                <Sparkles size={12} /> Position
              </span>
              <div className="dock-buttons">
                {MOTION_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    className={`dock-btn ${activePreset === p.id && !autoAnimate ? 'active' : ''}`}
                    onClick={() => {
                      setAutoAnimate(false)
                      setActivePreset(p.id)
                      setRotation(p.rot)
                      setTilt(p.tilt)
                      setHeight(p.h)
                    }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            BOTTOM-LEFT: COLLAPSIBLE MOTION CONTROL HUD
            ========================================================= */}
        <div className={`motion-hud-wrapper ${hudOpen ? 'expanded' : 'collapsed'}`}>
          <div className="hud-card">
            {/* HUD Header */}
            <div className="hud-header">
              <div className="hud-title-group">
                <Sliders size={16} className="text-teal" />
                <span>Motion Controls</span>
              </div>
              <button
                className="hud-collapse-btn"
                onClick={() => setHudOpen(!hudOpen)}
                title={hudOpen ? 'Minimize Controls' : 'Expand Controls'}
              >
                {hudOpen ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
              </button>
            </div>

            {/* Collapsible Body */}
            {hudOpen && (
              <div className="hud-body">
                {/* Control 1: Turn Left / Right */}
                <div className="hud-slider-item">
                  <div className="slider-label-row">
                    <span className="slider-name">
                      <RotateCw size={13} className="text-indigo" />
                      Turn Left / Right
                    </span>
                    <span className="slider-value-pill text-indigo">{rotation.toFixed(1)}°</span>
                  </div>
                  <input
                    type="range"
                    className="custom-range slider-indigo"
                    min={-15}
                    max={15}
                    step={0.1}
                    value={rotation}
                    onChange={(e) => {
                      setAutoAnimate(false)
                      setActivePreset('')
                      setRotation(Number(e.target.value))
                    }}
                  />
                  <div className="slider-legend">
                    <span>-15° Left</span>
                    <span>0° Center</span>
                    <span>+15° Right</span>
                  </div>
                </div>

                {/* Control 2: Tilt Up / Down */}
                <div className="hud-slider-item">
                  <div className="slider-label-row">
                    <span className="slider-name">
                      <ArrowUpDown size={13} className="text-amber" />
                      Tilt Up / Down
                    </span>
                    <span className="slider-value-pill text-amber">{tilt.toFixed(1)}°</span>
                  </div>
                  <input
                    type="range"
                    className="custom-range slider-amber"
                    min={-10}
                    max={10}
                    step={0.1}
                    value={tilt}
                    onChange={(e) => {
                      setAutoAnimate(false)
                      setActivePreset('')
                      setTilt(Number(e.target.value))
                    }}
                  />
                  <div className="slider-legend">
                    <span>-10° Down</span>
                    <span>0° Flat</span>
                    <span>+10° Up</span>
                  </div>
                </div>

                {/* Control 3: Height Lift */}
                <div className="hud-slider-item">
                  <div className="slider-label-row">
                    <span className="slider-name">
                      <MoveVertical size={13} className="text-teal" />
                      Height Lift
                    </span>
                    <span className="slider-value-pill text-teal">{height.toFixed(1)} mm</span>
                  </div>
                  <input
                    type="range"
                    className="custom-range slider-teal"
                    min={0}
                    max={30}
                    step={0.1}
                    value={height}
                    onChange={(e) => {
                      setAutoAnimate(false)
                      setActivePreset('')
                      setHeight(Number(e.target.value))
                    }}
                  />
                  <div className="slider-legend">
                    <span>0 mm Lowest</span>
                    <span>15 mm Mid</span>
                    <span>30 mm Highest</span>
                  </div>
                </div>

                {/* Walking Motion Button & Speed Selector */}
                <div className="hud-footer-row">
                  <button
                    className={`walking-motion-btn ${autoAnimate ? 'active' : ''}`}
                    onClick={() => {
                      setAutoAnimate(!autoAnimate)
                      if (!autoAnimate) setActivePreset('')
                    }}
                  >
                    {autoAnimate ? <Pause size={15} /> : <Play size={15} />}
                    <span>{autoAnimate ? 'Stop Walking Motion' : 'Start Walking Motion'}</span>
                  </button>

                  <div className="speed-toggle-group">
                    {[0.5, 1, 1.5].map((speed) => (
                      <button
                        key={speed}
                        className={`speed-btn ${animSpeed === speed ? 'active' : ''}`}
                        onClick={() => setAnimSpeed(speed)}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
