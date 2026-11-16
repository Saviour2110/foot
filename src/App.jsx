import { useState, useEffect, useRef, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import {
  RotateCw, ArrowUpDown, MoveVertical, Settings2,
  Play, Pause, RotateCcw,
  Eye, EyeOff, Compass,
  Layers
} from 'lucide-react'
import MechanismScene from './components/MechanismScene'
import './index.css'

/* =========================================================
   SIMPLE PRESET POSITIONS (LAYMAN TERMS)
   ========================================================= */
const MOTION_PRESETS = [
  { name: 'Normal Standing', rot: 0, tilt: 0, h: 0 },
  { name: 'Heel Down', rot: -2, tilt: 8, h: 12 },
  { name: 'Flat Step', rot: 0, tilt: 0, h: 18 },
  { name: 'Toe Push', rot: 4, tilt: -8, h: 28 },
  { name: 'Tilt Right', rot: 12, tilt: 2, h: 10 },
  { name: 'Tilt Left', rot: -12, tilt: -2, h: 10 }
]

export default function App() {
  // Mechanism movement state
  const [rotation, setRotation] = useState(0) // Turn Left / Right (-15 to +15 deg)
  const [tilt, setTilt] = useState(0)         // Tilt Up / Down (-10 to +10 deg)
  const [height, setHeight] = useState(10)    // Height Lift (0 to 30 mm)

  // Visualization options (Labels OFF by default)
  const [showFoot, setShowFoot] = useState(true)
  const [showLabels, setShowLabels] = useState(false)

  // Foot morphology: Healthy Foot vs Flat Foot
  const [selectedFootType, setSelectedFootType] = useState('healthy')

  // Animation state
  const [autoAnimate, setAutoAnimate] = useState(false)
  const [animSpeed, setAnimSpeed] = useState(1)

  // Camera viewpoint state
  const [camView, setCamView] = useState('3d') // '3d', 'side', 'front', 'top'
  const controlsRef = useRef()

  // Auto walking animation loop
  useEffect(() => {
    if (!autoAnimate) return

    let animFrameId
    let startTime = performance.now()

    const animateLoop = (now) => {
      const elapsed = (now - startTime) / 1000
      const cycleTime = 4 / animSpeed
      const phase = (elapsed % cycleTime) / cycleTime // 0 to 1

      // Smooth realistic walking motion
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

  // Simple Camera View Switcher
  const handleCameraChange = (view) => {
    setCamView(view)
    if (!controlsRef.current) return

    if (view === '3d') {
      controlsRef.current.object.position.set(3.8, 3.0, 3.8)
      controlsRef.current.target.set(0, 0.2, 0)
    } else if (view === 'side') {
      controlsRef.current.object.position.set(0.1, 1.4, 4.2)
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
    setRotation(0)
    setTilt(0)
    setHeight(10)
    handleCameraChange('3d')
  }

  return (
    <div className="single-page-app">
      {/* =========================================================
          TOP HEADER
          ========================================================= */}
      <header className="app-header">
        <div className="header-brand">
          <h1 className="brand-title">Foot Mechanics</h1>
        </div>

        {/* Foot Condition Selector: Healthy Foot & Flat Foot */}
        <div className="foot-type-selector">
          <button
            className={`foot-tab-btn ${selectedFootType === 'healthy' ? 'active' : ''}`}
            onClick={() => {
              setSelectedFootType('healthy')
              setAutoAnimate(false)
              setRotation(0)
              setTilt(0)
              setHeight(10)
            }}
          >
            <span className="foot-tab-dot healthy" />
            <span className="foot-tab-title">Healthy Foot</span>
          </button>

          <button
            className={`foot-tab-btn ${selectedFootType === 'flat_foot' ? 'active' : ''}`}
            onClick={() => {
              setSelectedFootType('flat_foot')
              setAutoAnimate(false)
              setRotation(-4)
              setTilt(2)
              setHeight(12)
            }}
          >
            <span className="foot-tab-dot flat" />
            <span className="foot-tab-title">Flat Foot</span>
          </button>
        </div>

        {/* Simple Utilities */}
        <div className="header-actions">
          <button
            className={`header-tool-btn ${showFoot ? 'active' : ''}`}
            onClick={() => setShowFoot(!showFoot)}
            title="Show or Hide the Foot"
          >
            {showFoot ? <Eye size={14} /> : <EyeOff size={14} />}
            <span>Foot: {showFoot ? 'ON' : 'OFF'}</span>
          </button>

          <button
            className={`header-tool-btn ${showLabels ? 'active' : ''}`}
            onClick={() => setShowLabels(!showLabels)}
            title="Show or Hide Part Names"
          >
            <Layers size={14} />
            <span>Labels: {showLabels ? 'ON' : 'OFF'}</span>
          </button>

          <button className="header-tool-btn reset-btn" onClick={resetAll} title="Reset to Start">
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </header>

      {/* =========================================================
          MAIN 3D VIEWPORT
          ========================================================= */}
      <main className="workspace-main">
        {/* 3D WebGL Canvas */}
        <div className="canvas-container">
          <Canvas
            camera={{ position: [3.8, 3.0, 3.8], fov: 42 }}
            shadows
            dpr={[1, 2]}
          >
            <color attach="background" args={['#090d16']} />
            <ambientLight intensity={0.55} />
            <directionalLight position={[6, 9, 6]} intensity={1.4} castShadow />
            <directionalLight position={[-5, 7, -5]} intensity={0.4} />
            <pointLight position={[0, 2.5, 0]} intensity={0.7} color="#14b8a6" />

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
                opacity={0.42}
                scale={9}
                blur={2.4}
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

          {/* Simple Camera View Switcher */}
          <div className="camera-view-strip">
            <span className="camera-label">
              <Compass size={13} /> View:
            </span>
            <button
              className={`view-btn ${camView === '3d' ? 'active' : ''}`}
              onClick={() => handleCameraChange('3d')}
            >
              3D View
            </button>
            <button
              className={`view-btn ${camView === 'side' ? 'active' : ''}`}
              onClick={() => handleCameraChange('side')}
            >
              Side View
            </button>
            <button
              className={`view-btn ${camView === 'front' ? 'active' : ''}`}
              onClick={() => handleCameraChange('front')}
            >
              Front View
            </button>
            <button
              className={`view-btn ${camView === 'top' ? 'active' : ''}`}
              onClick={() => handleCameraChange('top')}
            >
              Top View
            </button>
          </div>

          {/* Simple Foot Position Presets */}
          <div className="motion-presets-strip">
            <span className="preset-label">Position:</span>
            {MOTION_PRESETS.map((p) => (
              <button
                key={p.name}
                className="preset-btn"
                onClick={() => {
                  setAutoAnimate(false)
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

        {/* =========================================================
            BOTTOM LEFT: SIMPLE MOTION CONTROLS
            ========================================================= */}
        <aside className="hud-panel hud-kinematics">
          <div className="hud-header">
            <div className="hud-title">
              <Settings2 size={16} className="text-teal" />
              <span>Motion Controls</span>
            </div>
            <span className="status-badge">
              <span className="status-dot" /> Ready
            </span>
          </div>

          {/* Control 1: Turn Left / Right */}
          <div className="control-slider-block">
            <div className="slider-header">
              <span>
                <RotateCw size={13} className="text-indigo" />
                Turn Left / Right
              </span>
              <span className="slider-val text-indigo">{rotation.toFixed(1)}°</span>
            </div>
            <input
              type="range"
              className="range-input slider-indigo"
              min={-15}
              max={15}
              step={0.1}
              value={rotation}
              onChange={(e) => {
                setAutoAnimate(false)
                setRotation(Number(e.target.value))
              }}
            />
            <div className="slider-ticks">
              <span>-15° Left</span>
              <span>0° Center</span>
              <span>+15° Right</span>
            </div>
          </div>

          {/* Control 2: Tilt Up / Down */}
          <div className="control-slider-block">
            <div className="slider-header">
              <span>
                <ArrowUpDown size={13} className="text-amber" />
                Tilt Up / Down
              </span>
              <span className="slider-val text-amber">{tilt.toFixed(1)}°</span>
            </div>
            <input
              type="range"
              className="range-input slider-amber"
              min={-10}
              max={10}
              step={0.1}
              value={tilt}
              onChange={(e) => {
                setAutoAnimate(false)
                setTilt(Number(e.target.value))
              }}
            />
            <div className="slider-ticks">
              <span>-10° Down</span>
              <span>0° Level</span>
              <span>+10° Up</span>
            </div>
          </div>

          {/* Control 3: Lift Height */}
          <div className="control-slider-block">
            <div className="slider-header">
              <span>
                <MoveVertical size={13} className="text-teal" />
                Height Lift
              </span>
              <span className="slider-val text-teal">{height.toFixed(1)} mm</span>
            </div>
            <input
              type="range"
              className="range-input slider-teal"
              min={0}
              max={30}
              step={0.1}
              value={height}
              onChange={(e) => {
                setAutoAnimate(false)
                setHeight(Number(e.target.value))
              }}
            />
            <div className="slider-ticks">
              <span>0 mm Bottom</span>
              <span>15 mm Mid</span>
              <span>30 mm Top</span>
            </div>
          </div>

          {/* Walking Animation Button */}
          <div className="auto-cycle-row">
            <button
              className={`cycle-btn ${autoAnimate ? 'active' : ''}`}
              onClick={() => setAutoAnimate(!autoAnimate)}
            >
              {autoAnimate ? <Pause size={15} /> : <Play size={15} />}
              <span>{autoAnimate ? 'Stop Walking Motion' : 'Start Walking Motion'}</span>
            </button>

            <div className="speed-pills">
              {[0.5, 1, 1.5].map((speed) => (
                <button
                  key={speed}
                  className={`speed-pill ${animSpeed === speed ? 'active' : ''}`}
                  onClick={() => setAnimSpeed(speed)}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}
