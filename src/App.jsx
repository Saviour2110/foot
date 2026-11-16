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
   GAIT MOTION PRESETS
   ========================================================= */
const GAIT_PRESETS = [
  { name: 'Neutral Stance', rot: 0, tilt: 0, h: 0 },
  { name: 'Heel Strike', rot: -2, tilt: 8, h: 12 },
  { name: 'Midstance Flat', rot: 0, tilt: 0, h: 18 },
  { name: 'Terminal Push-Off', rot: 4, tilt: -8, h: 28 },
  { name: 'Lateral Eversion', rot: 12, tilt: 2, h: 10 },
  { name: 'Medial Inversion', rot: -12, tilt: -2, h: 10 }
]

export default function App() {
  // Mechanism degrees of freedom state
  const [rotation, setRotation] = useState(0) // -15 to +15 deg (Yaw)
  const [tilt, setTilt] = useState(0)         // -10 to +10 deg (Pitch)
  const [height, setHeight] = useState(10)    // 0 to 30 mm (Z-elevation)

  // Visualization options (Labels OFF by default)
  const [showFoot, setShowFoot] = useState(true)
  const [showLabels, setShowLabels] = useState(false)

  // Foot morphology: Healthy Foot vs Flat Foot
  const [selectedFootType, setSelectedFootType] = useState('healthy')

  // Animation state
  const [autoAnimate, setAutoAnimate] = useState(false)
  const [animSpeed, setAnimSpeed] = useState(1)

  // Camera viewpoint state
  const [camView, setCamView] = useState('iso') // 'iso', 'side', 'front', 'top'
  const controlsRef = useRef()

  // Auto animation loop for synchronized gait kinematics
  useEffect(() => {
    if (!autoAnimate) return

    let animFrameId
    let startTime = performance.now()

    const animateLoop = (now) => {
      const elapsed = (now - startTime) / 1000
      const cycleTime = 4 / animSpeed
      const phase = (elapsed % cycleTime) / cycleTime // 0 to 1

      // Biomechanical gait cycle approximation
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

  // Camera preset switcher
  const handleCameraChange = (view) => {
    setCamView(view)
    if (!controlsRef.current) return

    if (view === 'iso') {
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

  // Reset all kinematic joints
  const resetAll = () => {
    setAutoAnimate(false)
    setRotation(0)
    setTilt(0)
    setHeight(10)
    handleCameraChange('iso')
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

        {/* Foot Condition Segmented Selector: Healthy Foot & Flat Foot */}
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

        {/* Clean Header Utilities */}
        <div className="header-actions">
          <button
            className={`header-tool-btn ${showFoot ? 'active' : ''}`}
            onClick={() => setShowFoot(!showFoot)}
            title="Toggle Foot Visibility"
          >
            {showFoot ? <Eye size={14} /> : <EyeOff size={14} />}
            <span>Foot: {showFoot ? 'ON' : 'OFF'}</span>
          </button>

          <button
            className={`header-tool-btn ${showLabels ? 'active' : ''}`}
            onClick={() => setShowLabels(!showLabels)}
            title="Toggle 3D Mechanical Labels (Default OFF)"
          >
            <Layers size={14} />
            <span>Labels: {showLabels ? 'ON' : 'OFF'}</span>
          </button>

          <button className="header-tool-btn reset-btn" onClick={resetAll} title="Reset to Neutral Position">
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

          {/* Camera View Switcher Overlay */}
          <div className="camera-view-strip">
            <span className="camera-label">
              <Compass size={13} /> View:
            </span>
            <button
              className={`view-btn ${camView === 'iso' ? 'active' : ''}`}
              onClick={() => handleCameraChange('iso')}
            >
              Perspective 3D
            </button>
            <button
              className={`view-btn ${camView === 'side' ? 'active' : ''}`}
              onClick={() => handleCameraChange('side')}
            >
              Sagittal Arch
            </button>
            <button
              className={`view-btn ${camView === 'front' ? 'active' : ''}`}
              onClick={() => handleCameraChange('front')}
            >
              Coronal Front
            </button>
            <button
              className={`view-btn ${camView === 'top' ? 'active' : ''}`}
              onClick={() => handleCameraChange('top')}
            >
              Plantar Top
            </button>
          </div>

          {/* Gait Motion Presets Overlay */}
          <div className="motion-presets-strip">
            <span className="preset-label">Gait Phase:</span>
            {GAIT_PRESETS.map((p) => (
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
            BOTTOM LEFT: KINEMATIC ACTUATION HUD
            ========================================================= */}
        <aside className="hud-panel hud-kinematics">
          <div className="hud-header">
            <div className="hud-title">
              <Settings2 size={16} className="text-teal" />
              <span>3 DOF Mechanism Actuation</span>
            </div>
            <span className="status-badge">
              <span className="status-dot" /> Online
            </span>
          </div>

          {/* Joint 1: Axial Yaw Slider */}
          <div className="control-slider-block">
            <div className="slider-header">
              <span>
                <RotateCw size={13} className="text-indigo" />
                Axial Rotation (Yaw)
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
              <span>-15° Lateral</span>
              <span>0° Neutral</span>
              <span>+15° Medial</span>
            </div>
          </div>

          {/* Joint 2: Sagittal Tilt Slider */}
          <div className="control-slider-block">
            <div className="slider-header">
              <span>
                <ArrowUpDown size={13} className="text-amber" />
                Sagittal Tilt (Pitch)
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
              <span>-10° Plantar</span>
              <span>0° Level</span>
              <span>+10° Dorsi</span>
            </div>
          </div>

          {/* Joint 3: Vertical Stroke Slider */}
          <div className="control-slider-block">
            <div className="slider-header">
              <span>
                <MoveVertical size={13} className="text-teal" />
                Vertical Stroke (Z)
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
              <span>0 mm Base</span>
              <span>15 mm Mid</span>
              <span>30 mm Peak</span>
            </div>
          </div>

          {/* Auto Gait Cycle Play / Pause */}
          <div className="auto-cycle-row">
            <button
              className={`cycle-btn ${autoAnimate ? 'active' : ''}`}
              onClick={() => setAutoAnimate(!autoAnimate)}
            >
              {autoAnimate ? <Pause size={15} /> : <Play size={15} />}
              <span>{autoAnimate ? 'Pause Gait Cycle' : 'Simulate Gait Cycle'}</span>
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
