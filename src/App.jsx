import { useState, useEffect, useRef, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RotateCw, ArrowUpDown, MoveVertical, Settings2,
  Play, Pause, RotateCcw, Activity, ShieldCheck,
  Eye, EyeOff, Sparkles, AlertCircle, Compass,
  Layers, CheckCircle, Info, Stethoscope, ChevronRight, Zap
} from 'lucide-react'
import MechanismScene from './components/MechanismScene'
import './index.css'

/* =========================================================
   FOOT TYPES & PATHOLOGY DATA
   ========================================================= */
const FOOT_PROFILES = {
  healthy: {
    id: 'healthy',
    name: 'Healthy Normal Foot',
    tag: 'Neutral Arch · Optimal Biomechanics',
    badgeColor: '#14b8a6',
    archIndex: '0.24 (Normal 0.21–0.26)',
    peakPressure: '145 kPa (Normal distribution)',
    pronationAngle: '0.0° Neutral',
    clearance: '30 mm (Safe)',
    description: 'Well-aligned medial longitudinal arch with uniform tripod plantar pressure distribution across calcaneus, 1st metatarsal, and 5th metatarsal heads.',
    pathologyDetails: 'Intact plantar fascia and tibialis posterior tendon maintain spring ligament tension. Normal shock absorption and dynamic energy return during gait cycle.',
    recommendedMotion: { rotation: 0, tilt: 0, height: 15 },
    therapyLabel: 'Maintain Neutral Mobilization'
  },
  flat_foot: {
    id: 'flat_foot',
    name: 'Flat Foot (Pes Planus)',
    tag: 'Collapsed Arch · Hyperpronation',
    badgeColor: '#f59e0b',
    archIndex: '0.36 (Elevated contact area)',
    peakPressure: '280 kPa (Medial midfoot stress)',
    pronationAngle: '+6.5° Medial Valgus',
    clearance: '18 mm (Reduced)',
    description: 'Medial longitudinal arch is collapsed flat against the platform bed. Accompanied by rearfoot valgus and midfoot abduction.',
    pathologyDetails: 'Excessive elongation or insufficiency of the posterior tibial tendon. The foot remains overly flexible during stance phase, diminishing propulsive lever efficiency.',
    recommendedMotion: { rotation: -6, tilt: 2, height: 18 },
    therapyLabel: 'Support Medial Arch & Eversion Control'
  },
  high_arch: {
    id: 'high_arch',
    name: 'High Arch (Pes Cavus)',
    tag: 'Rigid Cavus · Underpronation',
    badgeColor: '#a855f7',
    archIndex: '0.12 (Extremely reduced midfoot contact)',
    peakPressure: '420 kPa (Focal on heel & metatarsals)',
    pronationAngle: '-5.2° Lateral Supination',
    clearance: '28 mm (Normal clearance, poor shock)',
    description: 'Fixed elevation of the longitudinal arch with rigid tarsal joints and clawed toe contractures. Under-pronates during heel contact.',
    pathologyDetails: 'Severely impaired shock attenuation. Ground reaction forces transmit directly into the ankle and knee joints, precipitating metatarsalgia and plantar fasciitis.',
    recommendedMotion: { rotation: 4, tilt: -3, height: 12 },
    therapyLabel: 'Gentle De-loading & Joint Mobilization'
  },
  diabetic: {
    id: 'diabetic',
    name: 'Diabetic Neuropathic Foot',
    tag: 'Sensory Loss · High Ulcer Risk',
    badgeColor: '#ef4444',
    archIndex: '0.28 (Altered plantar morphology)',
    peakPressure: '390 kPa (Critical ulcer threshold >200)',
    pronationAngle: '+2.0° Stiff',
    clearance: '15 mm (Impaired proprioception)',
    description: 'Peripheral sensory neuropathy masks repetitive high-friction shear forces. Prominent bony prominences at 1st metatarsal and heel create ulceration hotspots.',
    pathologyDetails: 'Limited joint mobility (cheiroarthropathy) and dry autonomic skin increase shear stress. Requires active automated pressure redistribution.',
    recommendedMotion: { rotation: 0, tilt: 0, height: 10 },
    therapyLabel: 'Apply Offloading & Pressure Redistribution'
  },
  drop_foot: {
    id: 'drop_foot',
    name: 'Drop Foot (Peroneal Palsy)',
    tag: 'Flaccid Paralysis · Swing Drag',
    badgeColor: '#f97316',
    archIndex: '0.22 (Non-weight bearing sag)',
    peakPressure: '310 kPa (Early toe impact slap)',
    pronationAngle: '-3.0° Inversion bias',
    clearance: '5 mm (Critical Fall Hazard)',
    description: 'Weakness or paralysis of anterior compartment muscles (tibialis anterior). Inability to actively dorsiflex causes the toes to drag during swing phase.',
    pathologyDetails: 'Steppage gait compensation observed. The mechanism provides vertical Z-elevation and dorsiflexion pitch to restore functional toe clearance.',
    recommendedMotion: { rotation: 0, tilt: 8, height: 25 },
    therapyLabel: 'Assisted Dorsiflexion & Z-Clearance Lift'
  },
  plantar_fasciitis: {
    id: 'plantar_fasciitis',
    name: 'Plantar Fasciitis',
    tag: 'Aponeurosis Strain · Calcaneal Spur',
    badgeColor: '#0ea5e9',
    archIndex: '0.25 (Tense aponeurosis band)',
    peakPressure: '360 kPa (Calcaneal tuberosity peak)',
    pronationAngle: '+3.5° Pronation stress',
    clearance: '22 mm (Pain-induced antalgic gait)',
    description: 'Micro-tears and chronic inflammatory irritation at the medial calcaneal tuberosity where the thick plantar aponeurosis inserts.',
    pathologyDetails: 'Exacerbated by tight Achilles tendon and repetitive impact shock. Controlled passive dorsiflexion pitch helps stretch and relieve fascial band tension.',
    recommendedMotion: { rotation: 0, tilt: 6, height: 14 },
    therapyLabel: 'Controlled Fascial Dorsiflexion Stretch'
  }
}

/* =========================================================
   MOTION PRESETS
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
  const [rotation, setRotation] = useState(0) // -15 to +15 deg
  const [tilt, setTilt] = useState(0)         // -10 to +10 deg
  const [height, setHeight] = useState(10)    // 0 to 30 mm

  // Visualization options
  const [showFoot, setShowFoot] = useState(true)
  const [showLabels, setShowLabels] = useState(true)
  const [showHotspots, setShowHotspots] = useState(true)

  // Foot morphology & clinical condition
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
      // Z-translation: rises to 26mm during push-off / swing, lowers to 4mm in midstance
      const newHeight = 15 + 11 * Math.sin(phase * Math.PI * 2)

      // Tilt (Pitch): dorsiflexion (+8°) at heel strike, plantarflexion (-8°) at push-off
      const newTilt = 7 * Math.sin(phase * Math.PI * 2 + Math.PI / 4)

      // Rotation (Yaw): slight internal/external tibial rotation (±6°)
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

  // Apply clinical therapy motion
  const applyTherapyMotion = (profile) => {
    setAutoAnimate(false)
    setRotation(profile.recommendedMotion.rotation)
    setTilt(profile.recommendedMotion.tilt)
    setHeight(profile.recommendedMotion.height)
  }

  const currentProfile = FOOT_PROFILES[selectedFootType] || FOOT_PROFILES.healthy

  return (
    <div className="single-page-app">
      {/* =========================================================
          TOP NAVIGATION & FOOT TYPE SELECTOR
          ========================================================= */}
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-icon">
            <Stethoscope size={20} className="icon-pulse" />
          </div>
          <div className="brand-text">
            <h1>Foot Mechanics</h1>
            <span className="brand-tag">3D Biomechanics &amp; Pathology Twin</span>
          </div>
        </div>

        {/* Foot Condition Selector Tabs */}
        <div className="foot-type-selector">
          {Object.values(FOOT_PROFILES).map((item) => {
            const isSelected = selectedFootType === item.id
            return (
              <button
                key={item.id}
                className={`foot-tab-btn ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  setSelectedFootType(item.id)
                  applyTherapyMotion(item)
                }}
                style={{
                  '--accent-color': item.badgeColor
                }}
              >
                <span
                  className="foot-tab-dot"
                  style={{ backgroundColor: item.badgeColor }}
                />
                <span className="foot-tab-title">{item.name}</span>
              </button>
            )
          })}
        </div>

        {/* Header Utilities */}
        <div className="header-actions">
          <button
            className={`header-tool-btn ${showFoot ? 'active' : ''}`}
            onClick={() => setShowFoot(!showFoot)}
            title="Toggle Foot Model"
          >
            {showFoot ? <Eye size={15} /> : <EyeOff size={15} />}
            <span>Foot</span>
          </button>

          <button
            className={`header-tool-btn ${showLabels ? 'active' : ''}`}
            onClick={() => setShowLabels(!showLabels)}
            title="Toggle 3D Labels"
          >
            <Layers size={15} />
            <span>Labels</span>
          </button>

          <button
            className={`header-tool-btn ${showHotspots ? 'active' : ''}`}
            onClick={() => setShowHotspots(!showHotspots)}
            title="Toggle Clinical Hotspots"
          >
            <Zap size={15} />
            <span>Hotspots</span>
          </button>

          <button className="header-tool-btn reset" onClick={resetAll} title="Reset All">
            <RotateCcw size={15} />
            <span>Reset</span>
          </button>
        </div>
      </header>

      {/* =========================================================
          MAIN 3D WORKSPACE
          ========================================================= */}
      <main className="workspace-main">
        {/* 3D WebGL Canvas */}
        <div className="canvas-container">
          <Canvas
            camera={{ position: [3.8, 3.0, 3.8], fov: 42 }}
            shadows
            dpr={[1, 2]}
          >
            <color attach="background" args={['#0b0f19']} />
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
                showHotspots={showHotspots}
              />
              <ContactShadows
                position={[0, -0.44, 0]}
                opacity={0.4}
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
            <gridHelper args={[12, 24, '#1e293b', '#111827']} />
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
              Sagittal Side (Arch)
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

          {/* Gait Motion Presets Strip */}
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
            BOTTOM LEFT: KINEMATIC MECHANISM CONTROLS HUD
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

        {/* =========================================================
            BOTTOM RIGHT: CLINICAL PATHOLOGY & TELEMETRY HUD
            ========================================================= */}
        <aside className="hud-panel hud-clinical">
          <div className="hud-header">
            <div className="hud-title">
              <Activity size={16} style={{ color: currentProfile.badgeColor }} />
              <span>Biomechanical Diagnosis</span>
            </div>
            <span
              className="clinical-badge"
              style={{
                color: currentProfile.badgeColor,
                borderColor: `${currentProfile.badgeColor}50`,
                backgroundColor: `${currentProfile.badgeColor}18`
              }}
            >
              {currentProfile.name}
            </span>
          </div>

          <div className="clinical-desc-box">
            <p className="clinical-desc-text">{currentProfile.description}</p>
            <div className="clinical-pathology-note">
              <AlertCircle size={14} style={{ color: currentProfile.badgeColor, flexShrink: 0 }} />
              <span>{currentProfile.pathologyDetails}</span>
            </div>
          </div>

          {/* Biomechanical Telemetry Metrics Grid */}
          <div className="telemetry-grid">
            <div className="tele-card">
              <span className="tele-metric-label">Arch Morphology</span>
              <span className="tele-metric-value">{currentProfile.archIndex}</span>
            </div>
            <div className="tele-card">
              <span className="tele-metric-label">Plantar Peak Stress</span>
              <span className="tele-metric-value" style={{ color: currentProfile.badgeColor }}>
                {currentProfile.peakPressure}
              </span>
            </div>
            <div className="tele-card">
              <span className="tele-metric-label">Dynamic Pronation</span>
              <span className="tele-metric-value">{currentProfile.pronationAngle}</span>
            </div>
            <div className="tele-card">
              <span className="tele-metric-label">Swing Clearance</span>
              <span className="tele-metric-value">{currentProfile.clearance}</span>
            </div>
          </div>

          {/* Clinical Therapeutic Preset Action */}
          <button
            className="therapy-action-btn"
            style={{
              '--btn-accent': currentProfile.badgeColor
            }}
            onClick={() => applyTherapyMotion(currentProfile)}
          >
            <Sparkles size={15} />
            <span>Apply Therapy Position: {currentProfile.therapyLabel}</span>
          </button>
        </aside>
      </main>
    </div>
  )
}
