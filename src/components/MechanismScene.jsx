import { useRef, useMemo } from 'react'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

// Helper for realistic metallic materials
function useMetal(color, metalness = 0.7, roughness = 0.3) {
  return useMemo(() => new THREE.MeshStandardMaterial({
    color,
    metalness,
    roughness,
  }), [color, metalness, roughness])
}

// 3D Callout Label
function Label({ position, text, color = '#14b8a6', subtext = '' }) {
  return (
    <Html position={position} center distanceFactor={6.8}>
      <div style={{
        background: 'rgba(11, 15, 23, 0.92)',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${color}70`,
        boxShadow: `0 4px 16px ${color}25`,
        borderRadius: 6,
        padding: '3px 8px',
        fontSize: 9.5,
        fontFamily: "'JetBrains Mono', monospace",
        color: '#f8fafc',
        whiteSpace: 'nowrap',
        letterSpacing: '0.04em',
        pointerEvents: 'none',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1
      }}>
        <div style={{ color, fontWeight: 700 }}>{text}</div>
        {subtext && <div style={{ fontSize: 7.5, color: '#94a3b8' }}>{subtext}</div>}
      </div>
    </Html>
  )
}

// Biomechanical Stylized Human Foot with Multi-Type Morphology Support
function HumanFootModel({ showFoot = true, footType = 'healthy', showHotspots = true }) {
  // Color palette for skin according to condition
  const skinColor = useMemo(() => {
    switch (footType) {
      case 'diabetic': return '#d6a68f' // slightly pale
      case 'drop_foot': return '#d0a492' // slightly hypotonic
      case 'plantar_fasciitis': return '#e0b298'
      case 'flat_foot': return '#e2b397'
      case 'high_arch': return '#dcb095'
      default: return '#e4b69c' // healthy warm skin
    }
  }, [footType])

  const skinMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: skinColor,
    roughness: 0.62,
    metalness: 0.08,
  }), [skinColor])

  const sockMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0f766e', // clean medical teal compression sleeve
    roughness: 0.7,
    metalness: 0.1,
  }), [])

  // Ulcer risk hotspot material (for Diabetic foot)
  const ulcerMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#ef4444',
  }), [])

  // Plantar fascia inflammation material
  const fasciaMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#f97316',
  }), [])

  if (!showFoot) return null

  // Morphology deformations based on foot type:
  // 1. Healthy: balanced arch
  // 2. Flat foot (Pes Planus): collapsed arch, wider contact, medial pronation roll
  // 3. High arch (Pes Cavus): elevated arch, clawed toes, hollow under midfoot
  // 4. Drop foot: pronounced equinus drop (toes sag down)
  // 5. Diabetic: normal shape with distinct high-pressure ulcer warning discs
  // 6. Plantar fasciitis: normal shape with glowing inflamed calcaneal cord

  const isFlat = footType === 'flat_foot'
  const isHigh = footType === 'high_arch'
  const isDrop = footType === 'drop_foot'
  const isDiabetic = footType === 'diabetic'
  const isFascia = footType === 'plantar_fasciitis'

  // Midfoot arch coordinates & rotations
  const midfootY = isFlat ? 0.045 : (isHigh ? 0.165 : 0.09)
  const midfootRotZ = isFlat ? -0.01 : (isHigh ? -0.17 : (isDrop ? -0.18 : -0.06))
  const midfootScaleY = isFlat ? 0.6 : (isHigh ? 1.35 : 1.0)
  const midfootScaleZ = isFlat ? 1.18 : (isHigh ? 0.92 : 1.0)
  const footRollX = isFlat ? 0.08 : (isHigh ? -0.06 : 0) // pronation vs supination
  const dropSagZ = isDrop ? -0.22 : 0 // toe droop

  return (
    <group position={[0, 0.22, 0]} rotation={[footRollX, 0, dropSagZ]}>
      {/* ===== LOWER LEG / TIBIA-FIBULA SEGMENT ===== */}
      <group position={[-0.32, 0.42, 0]}>
        {/* Calf / Lower leg cylinder */}
        <mesh material={skinMat} castShadow>
          <cylinderGeometry args={[0.13, 0.10, 0.7, 16]} />
        </mesh>

        {/* Compression medical sleeve */}
        <mesh material={sockMat} position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.135, 0.115, 0.45, 16]} />
        </mesh>

        {/* Medial & Lateral Malleolus (Ankle bones) */}
        <mesh material={skinMat} position={[0, -0.28, 0.11]}>
          <sphereGeometry args={[0.045, 12, 12]} />
        </mesh>
        <mesh material={skinMat} position={[0, -0.26, -0.11]}>
          <sphereGeometry args={[0.042, 12, 12]} />
        </mesh>
      </group>

      {/* ===== HEEL (CALCANEUS) ===== */}
      <mesh material={skinMat} position={[-0.42, 0.08, 0]} castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
      </mesh>

      {/* Plantar Fasciitis: Inflamed Calcaneal Attachment Glow */}
      {isFascia && showHotspots && (
        <group position={[-0.34, 0.02, 0]}>
          <mesh material={fasciaMat}>
            <sphereGeometry args={[0.06, 12, 12]} />
          </mesh>
          {/* Tension band extending to ball of foot */}
          <mesh position={[0.22, 0.01, 0]} rotation={[0, 0, -0.03]} material={fasciaMat}>
            <boxGeometry args={[0.42, 0.015, 0.12]} />
          </mesh>
        </group>
      )}

      {/* Diabetic Neuropathy: Heel Ulcer Risk Spot */}
      {isDiabetic && showHotspots && (
        <mesh position={[-0.42, 0.01, 0]} material={ulcerMat}>
          <cylinderGeometry args={[0.065, 0.065, 0.012, 16]} />
        </mesh>
      )}

      {/* ===== MIDFOOT / ARCH (TARSAL & METATARSAL) ===== */}
      <mesh
        material={skinMat}
        position={[-0.05, midfootY, 0]}
        rotation={[0, 0, midfootRotZ]}
        scale={[1, midfootScaleY, midfootScaleZ]}
        castShadow
      >
        <boxGeometry args={[0.62, 0.17, 0.32]} />
      </mesh>

      {/* ===== FOREFOOT / BALL OF FOOT ===== */}
      <mesh material={skinMat} position={[0.34, 0.07, 0]} castShadow>
        <boxGeometry args={[0.26, 0.13, 0.34]} />
      </mesh>

      {/* Diabetic Neuropathy: 1st Metatarsal Head Ulcer Hotspot */}
      {isDiabetic && showHotspots && (
        <group position={[0.34, 0.01, 0.09]}>
          <mesh material={ulcerMat}>
            <cylinderGeometry args={[0.055, 0.055, 0.012, 16]} />
          </mesh>
        </group>
      )}

      {/* ===== TOES SEGMENT ===== */}
      <group
        position={[0.52, 0.055, 0]}
        rotation={isHigh ? [0, 0, -0.24] : [0, 0, 0]} // claw toes for high arch
      >
        {/* Big toe */}
        <mesh material={skinMat} position={[0, 0, 0.11]} castShadow>
          <capsuleGeometry args={[0.042, 0.10, 8, 12]} />
        </mesh>
        {/* Second toe */}
        <mesh material={skinMat} position={[0.015, 0, 0.04]} castShadow>
          <capsuleGeometry args={[0.036, 0.09, 8, 12]} />
        </mesh>
        {/* Third toe */}
        <mesh material={skinMat} position={[0.005, 0, -0.03]} castShadow>
          <capsuleGeometry args={[0.033, 0.08, 8, 12]} />
        </mesh>
        {/* Fourth toe */}
        <mesh material={skinMat} position={[-0.01, 0, -0.09]} castShadow>
          <capsuleGeometry args={[0.03, 0.07, 8, 12]} />
        </mesh>
        {/* Little toe */}
        <mesh material={skinMat} position={[-0.025, 0, -0.14]} castShadow>
          <capsuleGeometry args={[0.027, 0.06, 8, 12]} />
        </mesh>
      </group>

      {/* ===== ERGONOMIC BIO-RETENTION STRAPS ===== */}
      {/* Forefoot strap */}
      <mesh position={[0.18, 0.12, 0]}>
        <boxGeometry args={[0.12, 0.18, 0.38]} />
        <meshStandardMaterial color="#0d9488" roughness={0.4} />
      </mesh>
      {/* Instep / Ankle strap */}
      <mesh position={[-0.22, 0.22, 0]} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[0.11, 0.22, 0.35]} />
        <meshStandardMaterial color="#0d9488" roughness={0.4} />
      </mesh>
    </group>
  )
}

export default function MechanismScene({
  rotation = 0,
  tilt = 0,
  height = 0,
  showFoot = true,
  showLabels = true,
  footType = 'healthy',
  showHotspots = true
}) {
  const groupRef = useRef()

  // Convert degrees to radians and normalize height stroke
  const rotRad = THREE.MathUtils.degToRad(rotation)
  const tiltRad = THREE.MathUtils.degToRad(tilt)
  const heightNorm = height / 30 // 0 to 1 -> maps to 0.0 to 0.55 in scene units
  const verticalOffset = heightNorm * 0.55

  // Clean, high-end materials with modern titanium and medical accents
  const baseMat = useMetal('#111827', 0.85, 0.35)
  const railMat = useMetal('#e2e8f0', 0.95, 0.15)
  const leadScrewMat = useMetal('#94a3b8', 0.9, 0.25)
  const carriageMat = useMetal('#1e293b', 0.8, 0.3)
  const motorMat = useMetal('#0f172a', 0.7, 0.4)
  const ringMat = useMetal('#d97706', 0.9, 0.2) // Bronze worm gear
  const hingeMat = useMetal('#cbd5e1', 0.92, 0.18) // Precision stainless steel
  const platformMat = useMetal('#1e293b', 0.75, 0.35)
  const padMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0f766e', // medical teal footbed cushion
    roughness: 0.85,
    metalness: 0.05
  }), [])
  const linkMat = useMetal('#475569', 0.85, 0.25)
  const accentTealMat = useMetal('#14b8a6', 0.75, 0.25)
  const accentIndigoMat = useMetal('#6366f1', 0.75, 0.25)
  const accentAmberMat = useMetal('#f59e0b', 0.75, 0.25)
  const limitStopMat = useMetal('#ef4444', 0.8, 0.2)

  return (
    <group ref={groupRef} position={[0, -0.32, 0]}>
      {/* =========================================================
          STAGE 1: BASE FRAME & GROUND (Rigid Link 1)
          ========================================================= */}
      <mesh material={baseMat} position={[0, -0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.12, 1.5]} />
      </mesh>

      {/* Damper isolation foot pads */}
      {[-1.1, 1.1].map(x =>
        [-0.6, 0.6].map(z => (
          <mesh key={`foot-${x}-${z}`} position={[x, -0.14, z]} castShadow>
            <cylinderGeometry args={[0.07, 0.08, 0.05, 16]} />
            <meshStandardMaterial color="#020617" roughness={0.9} />
          </mesh>
        ))
      )}

      {/* Perimeter accent trim */}
      <mesh material={accentTealMat} position={[0, 0.01, 0]}>
        <boxGeometry args={[2.52, 0.01, 1.52]} />
      </mesh>

      {/* Vertical Stepper Motor */}
      <group position={[0, 0.12, -0.55]}>
        <mesh material={motorMat} castShadow>
          <boxGeometry args={[0.22, 0.24, 0.22]} />
        </mesh>
        <mesh material={accentTealMat} position={[0, 0.14, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.06, 12]} />
        </mesh>
      </group>

      {/* Center Lead Screw for Z-Translation */}
      <mesh material={leadScrewMat} position={[0, 0.45, -0.55]} castShadow>
        <cylinderGeometry args={[0.022, 0.022, 0.8, 16]} />
      </mesh>

      {/* Dual Precision Guide Rails */}
      <mesh material={railMat} position={[-0.9, 0.52, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 1.05, 16]} />
      </mesh>
      <mesh material={railMat} position={[0.9, 0.52, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 1.05, 16]} />
      </mesh>

      {/* Guide Rail Mounts */}
      {[-0.9, 0.9].map(x => (
        <mesh key={`top-block-${x}`} material={carriageMat} position={[x, 1.04, 0]} castShadow>
          <boxGeometry args={[0.14, 0.05, 0.14]} />
        </mesh>
      ))}
      {[-0.9, 0.9].map(x => (
        <mesh key={`bot-block-${x}`} material={carriageMat} position={[x, 0.02, 0]} castShadow>
          <boxGeometry args={[0.15, 0.05, 0.15]} />
        </mesh>
      ))}

      {showLabels && (
        <Label
          position={[0, -0.22, 0.95]}
          text="LINK 1: BASE FRAME"
          subtext="Rigid Medical-Grade Bed"
          color="#94a3b8"
        />
      )}

      {showLabels && (
        <Label
          position={[-1.22, 0.52, 0]}
          text="JOINT 1: PRISMATIC (Z)"
          subtext="0–30 mm Linear Stroke"
          color="#14b8a6"
        />
      )}

      {/* =========================================================
          STAGE 2: VERTICAL SLIDER CARRIAGE (Rigid Link 2)
          ========================================================= */}
      <group position={[0, 0.16 + verticalOffset, 0]}>
        {/* Carriage Bed */}
        <mesh material={carriageMat} castShadow receiveShadow>
          <boxGeometry args={[1.96, 0.09, 1.2]} />
        </mesh>

        {/* Linear Bushings */}
        {[-0.9, 0.9].map(x => (
          <mesh key={`bushing-${x}`} material={hingeMat} position={[x, 0, 0]} castShadow>
            <cylinderGeometry args={[0.065, 0.065, 0.14, 16]} />
          </mesh>
        ))}

        {/* Lead Screw Anti-Backlash Drive Nut */}
        <mesh material={ringMat} position={[0, 0, -0.55]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.1, 16]} />
        </mesh>

        {/* Carriage Elevation Indicators */}
        <mesh material={accentTealMat} position={[1.05, 0, 0]}>
          <coneGeometry args={[0.045, 0.09, 8]} />
        </mesh>
        <mesh material={accentTealMat} position={[1.05, -0.12, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.045, 0.09, 8]} />
        </mesh>

        {/* =========================================================
            STAGE 3: REVOLUTE TURNTABLE (Joint 2 - Axial Yaw)
            ========================================================= */}
        <group rotation={[0, rotRad, 0]}>
          {/* Turntable Bearing Ring */}
          <mesh material={ringMat} position={[0, 0.08, 0]} castShadow>
            <torusGeometry args={[0.38, 0.042, 16, 36]} />
          </mesh>

          {/* Turntable Core Hub */}
          <mesh material={carriageMat} position={[0, 0.09, 0]} castShadow>
            <cylinderGeometry args={[0.35, 0.35, 0.05, 32]} />
          </mesh>

          {/* Kingpin Pivot Axle */}
          <mesh material={hingeMat} position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.12, 16]} />
          </mesh>

          {/* Safety Limit Stops at ±15° */}
          <mesh material={limitStopMat} position={[-0.38 * Math.cos(Math.PI / 12), 0.1, -0.38 * Math.sin(Math.PI / 12)]}>
            <boxGeometry args={[0.04, 0.05, 0.04]} />
          </mesh>
          <mesh material={limitStopMat} position={[-0.38 * Math.cos(Math.PI / 12), 0.1, 0.38 * Math.sin(Math.PI / 12)]}>
            <boxGeometry args={[0.04, 0.05, 0.04]} />
          </mesh>

          {showLabels && (
            <Label
              position={[0.68, 0.12, 0]}
              text="JOINT 2: REVOLUTE (YAW)"
              subtext="±15° Inversion / Eversion"
              color="#6366f1"
            />
          )}

          {/* Stanchion Supports */}
          <mesh material={linkMat} position={[-0.26, 0.24, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.26, 12]} />
          </mesh>
          <mesh material={linkMat} position={[0.26, 0.24, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.26, 12]} />
          </mesh>

          {/* =========================================================
              STAGE 4: HORIZONTAL HINGE JOINT (Joint 3 - Pitch)
              ========================================================= */}
          <group position={[0, 0.38, 0]}>
            {/* Hinge Pin Axle */}
            <mesh material={hingeMat} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.026, 0.026, 0.64, 16]} />
            </mesh>

            {/* Pillow Block Bearings */}
            {[-0.26, 0.26].map(x => (
              <mesh key={`hinge-block-${x}`} material={carriageMat} position={[x, 0, 0]} castShadow>
                <boxGeometry args={[0.08, 0.09, 0.11]} />
              </mesh>
            ))}

            {/* Hinge Ring Accents */}
            {[-0.26, 0.26].map(x => (
              <mesh key={`hinge-ring-${x}`} material={accentAmberMat} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <torusGeometry args={[0.044, 0.009, 12, 20]} />
              </mesh>
            ))}

            {showLabels && (
              <Label
                position={[0.62, 0, 0]}
                text="JOINT 3: HINGE (PITCH)"
                subtext="±10° Dorsi / Plantarflexion"
                color="#f59e0b"
              />
            )}

            {/* =========================================================
                STAGE 5: TILTING FOOT PLATFORM (Rigid Link 4)
                ========================================================= */}
            <group rotation={[tiltRad, 0, 0]}>
              {/* Twin Transfer Struts */}
              {[-0.18, 0.18].map(x => (
                <mesh key={`link-strut-${x}`} material={linkMat} position={[x, 0.09, 0]} castShadow>
                  <cylinderGeometry args={[0.016, 0.016, 0.14, 12]} />
                </mesh>
              ))}

              {/* Main Structural Foot Platform Bed */}
              <mesh material={platformMat} position={[0, 0.17, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.72, 0.065, 0.92]} />
              </mesh>

              {/* Ergonomic Cushion Pad */}
              <mesh material={padMat} position={[0, 0.205, 0]} receiveShadow>
                <boxGeometry args={[1.65, 0.012, 0.85]} />
              </mesh>

              {/* Platform Trim Accent */}
              <mesh material={accentTealMat} position={[0, 0.198, 0]}>
                <boxGeometry args={[1.73, 0.004, 0.93]} />
              </mesh>

              {/* Heel Cup Guard */}
              <mesh material={carriageMat} position={[-0.72, 0.27, 0]} castShadow>
                <boxGeometry args={[0.08, 0.14, 0.52]} />
              </mesh>

              {/* Restraint Strap Anchor Mounts */}
              {[-0.5, 0.2].map(x =>
                [-0.43, 0.43].map(z => (
                  <mesh key={`buckle-${x}-${z}`} material={hingeMat} position={[x, 0.22, z]} castShadow>
                    <boxGeometry args={[0.08, 0.04, 0.04]} />
                  </mesh>
                ))
              )}

              {/* Stylized Human Foot Model with Morphology Support */}
              <HumanFootModel
                showFoot={showFoot}
                footType={footType}
                showHotspots={showHotspots}
              />

              {showLabels && (
                <Label
                  position={[0, 0.56, 0]}
                  text="LINK 4: FOOT PLATFORM"
                  subtext="Ergonomic Multi-Axis Support"
                  color="#14b8a6"
                />
              )}
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}
