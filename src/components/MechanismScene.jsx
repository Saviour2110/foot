import { useRef, useMemo } from 'react'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

// Helper for metal materials
function useMetal(color, metalness = 0.7, roughness = 0.3) {
  return useMemo(() => new THREE.MeshStandardMaterial({
    color,
    metalness,
    roughness,
  }), [color, metalness, roughness])
}

// Biomechanical Stylized Human Foot & Lower Leg
function HumanFootModel({ showFoot = true }) {
  const skinMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#e2b397',
    roughness: 0.6,
    metalness: 0.1,
  }), [])

  const sockMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#2563eb',
    roughness: 0.7,
    metalness: 0.05,
  }), [])

  const boneMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 0.4,
    metalness: 0.1,
    transparent: true,
    opacity: 0.85
  }), [])

  if (!showFoot) return null

  return (
    <group position={[0, 0.22, 0]}>
      {/* ===== LOWER LEG / TIBIA-FIBULA SEGMENT ===== */}
      <group position={[-0.32, 0.42, 0]}>
        {/* Calf / Lower leg cylinder */}
        <mesh material={skinMat} castShadow>
          <cylinderGeometry args={[0.13, 0.10, 0.7, 16]} />
        </mesh>

        {/* Compression sock / cuff */}
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

      {/* ===== MIDFOOT / ARCH (TARSAL & METATARSAL) ===== */}
      <mesh material={skinMat} position={[-0.05, 0.09, 0]} rotation={[0, 0, -0.06]} castShadow>
        <boxGeometry args={[0.62, 0.17, 0.32]} />
      </mesh>

      {/* ===== FOREFOOT / BALL OF FOOT ===== */}
      <mesh material={skinMat} position={[0.34, 0.07, 0]} castShadow>
        <boxGeometry args={[0.26, 0.13, 0.34]} />
      </mesh>

      {/* ===== TOES SEGMENT ===== */}
      <group position={[0.52, 0.055, 0]}>
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

      {/* ===== LIVE BIOMECHANICAL RETENTION STRAPS ===== */}
      {/* Forefoot strap */}
      <mesh position={[0.18, 0.12, 0]}>
        <boxGeometry args={[0.12, 0.18, 0.38]} />
        <meshStandardMaterial color="#0284c7" roughness={0.4} />
      </mesh>
      {/* Instep / Ankle strap */}
      <mesh position={[-0.22, 0.22, 0]} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[0.11, 0.22, 0.35]} />
        <meshStandardMaterial color="#0284c7" roughness={0.4} />
      </mesh>
    </group>
  )
}

// 3D Callout Label
function Label({ position, text, color = '#9ca3af', subtext = '' }) {
  return (
    <Html position={position} center distanceFactor={6.5}>
      <div style={{
        background: 'rgba(10, 15, 29, 0.88)',
        backdropFilter: 'blur(8px)',
        border: `1px solid ${color}60`,
        boxShadow: `0 0 14px ${color}25`,
        borderRadius: 6,
        padding: '3px 8px',
        fontSize: 9,
        fontFamily: "'JetBrains Mono', monospace",
        color: '#f3f4f6',
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

export default function MechanismScene({
  rotation = 0,
  tilt = 0,
  height = 0,
  showFoot = true,
  showLabels = true
}) {
  const groupRef = useRef()

  // Convert props to radians / units
  const rotRad = THREE.MathUtils.degToRad(rotation)
  const tiltRad = THREE.MathUtils.degToRad(tilt)
  const heightNorm = height / 30 // 0-1, maps to 0.0 to 0.55 in scene units
  const verticalOffset = heightNorm * 0.55

  // Materials
  const baseMat = useMetal('#181e29', 0.85, 0.35)
  const railMat = useMetal('#cbd5e1', 0.95, 0.15)
  const leadScrewMat = useMetal('#94a3b8', 0.9, 0.25)
  const carriageMat = useMetal('#334155', 0.75, 0.3)
  const motorMat = useMetal('#0f172a', 0.6, 0.4)
  const ringMat = useMetal('#d97706', 0.9, 0.2) // Bronze worm wheel
  const hingeMat = useMetal('#94a3b8', 0.92, 0.18) // Steel hinge
  const platformMat = useMetal('#1e293b', 0.7, 0.4)
  const padMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0f766e',
    roughness: 0.85,
    metalness: 0.1
  }), [])
  const linkMat = useMetal('#64748b', 0.85, 0.2)
  const accentBlueMat = useMetal('#38bdf8', 0.7, 0.3)
  const accentGreenMat = useMetal('#10b981', 0.7, 0.3)
  const accentPurpleMat = useMetal('#a855f7', 0.7, 0.3)
  const limitStopMat = useMetal('#ef4444', 0.8, 0.2)

  return (
    <group ref={groupRef} position={[0, -0.32, 0]}>
      {/* =========================================================
          STAGE 1: BASE FRAME & GROUND (Rigid Link 1)
          ========================================================= */}
      <mesh material={baseMat} position={[0, -0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.12, 1.5]} />
      </mesh>
      {/* Base mounting brackets & rubber damper feet */}
      {[-1.1, 1.1].map(x =>
        [-0.6, 0.6].map(z => (
          <mesh key={`foot-${x}-${z}`} position={[x, -0.14, z]} castShadow>
            <cylinderGeometry args={[0.07, 0.08, 0.05, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
        ))
      )}
      {/* Base perimeter bevel accent */}
      <mesh material={accentBlueMat} position={[0, 0.01, 0]}>
        <boxGeometry args={[2.52, 0.01, 1.52]} />
      </mesh>

      {/* Stepper Motor for Vertical Lead Screw */}
      <group position={[0, 0.12, -0.55]}>
        <mesh material={motorMat} castShadow>
          <boxGeometry args={[0.22, 0.24, 0.22]} />
        </mesh>
        <mesh material={accentBlueMat} position={[0, 0.14, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.06, 12]} />
        </mesh>
      </group>

      {/* Center Lead Screw for Vertical Prismatic Drive */}
      <mesh material={leadScrewMat} position={[0, 0.45, -0.55]} castShadow>
        <cylinderGeometry args={[0.022, 0.022, 0.8, 16]} />
      </mesh>

      {/* Dual Precision Guide Rails (Linear Rods) */}
      <mesh material={railMat} position={[-0.9, 0.52, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 1.05, 16]} />
      </mesh>
      <mesh material={railMat} position={[0.9, 0.52, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 1.05, 16]} />
      </mesh>

      {/* Rail Support Blocks at Top */}
      {[-0.9, 0.9].map(x => (
        <mesh key={`top-block-${x}`} material={carriageMat} position={[x, 1.04, 0]} castShadow>
          <boxGeometry args={[0.14, 0.05, 0.14]} />
        </mesh>
      ))}

      {/* Rail Support Blocks at Bottom */}
      {[-0.9, 0.9].map(x => (
        <mesh key={`bot-block-${x}`} material={carriageMat} position={[x, 0.02, 0]} castShadow>
          <boxGeometry args={[0.15, 0.05, 0.15]} />
        </mesh>
      ))}

      {showLabels && (
        <Label
          position={[0, -0.22, 0.95]}
          text="LINK 1: GROUND BASE FRAME"
          subtext="Rigid cast structural platform"
          color="#94a3b8"
        />
      )}

      {showLabels && (
        <Label
          position={[-1.22, 0.52, 0]}
          text="JOINT 1: PRISMATIC PAIR (P)"
          subtext="Stroke 0–30 mm (Z-translation)"
          color="#38bdf8"
        />
      )}

      {/* =========================================================
          STAGE 2: VERTICAL SLIDER CARRIAGE (Rigid Link 2)
          ========================================================= */}
      <group position={[0, 0.16 + verticalOffset, 0]}>
        {/* Main Carriage Solid Plate */}
        <mesh material={carriageMat} castShadow receiveShadow>
          <boxGeometry args={[1.96, 0.09, 1.2]} />
        </mesh>

        {/* Linear Ball Bushings on Rails */}
        {[-0.9, 0.9].map(x => (
          <mesh key={`bushing-${x}`} material={hingeMat} position={[x, 0, 0]} castShadow>
            <cylinderGeometry args={[0.065, 0.065, 0.14, 16]} />
          </mesh>
        ))}

        {/* Lead Screw Anti-Backlash Drive Nut */}
        <mesh material={ringMat} position={[0, 0, -0.55]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.1, 16]} />
        </mesh>

        {/* Carriage Elevation Scale Indicator */}
        <mesh material={accentBlueMat} position={[1.05, 0, 0]}>
          <coneGeometry args={[0.045, 0.09, 8]} />
        </mesh>
        <mesh material={accentBlueMat} position={[1.05, -0.12, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.045, 0.09, 8]} />
        </mesh>

        {/* =========================================================
            STAGE 3: REVOLUTE TURNTABLE & WORM DRIVE (Joint 2)
            ========================================================= */}
        <group rotation={[0, rotRad, 0]}>
          {/* Bronze Turntable Ring (Revolute Pair R) */}
          <mesh material={ringMat} position={[0, 0.08, 0]} castShadow>
            <torusGeometry args={[0.38, 0.042, 16, 36]} />
          </mesh>

          {/* Turntable Solid Hub */}
          <mesh material={carriageMat} position={[0, 0.09, 0]} castShadow>
            <cylinderGeometry args={[0.35, 0.35, 0.05, 32]} />
          </mesh>

          {/* Central Kingpin / Pivot Shaft */}
          <mesh material={hingeMat} position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.12, 16]} />
          </mesh>

          {/* Mechanical Hard Limit Stops at ±15° for Safety */}
          <mesh material={limitStopMat} position={[-0.38 * Math.cos(Math.PI / 12), 0.1, -0.38 * Math.sin(Math.PI / 12)]}>
            <boxGeometry args={[0.04, 0.05, 0.04]} />
          </mesh>
          <mesh material={limitStopMat} position={[-0.38 * Math.cos(Math.PI / 12), 0.1, 0.38 * Math.sin(Math.PI / 12)]}>
            <boxGeometry args={[0.04, 0.05, 0.04]} />
          </mesh>

          {showLabels && (
            <Label
              position={[0.68, 0.12, 0]}
              text="JOINT 2: REVOLUTE PAIR (R)"
              subtext="Rotation ±15° (Ankle Yaw)"
              color="#10b981"
            />
          )}

          {/* Turntable to Hinge Stanchion Links (Link 3) */}
          <mesh material={linkMat} position={[-0.26, 0.24, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.26, 12]} />
          </mesh>
          <mesh material={linkMat} position={[0.26, 0.24, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.26, 12]} />
          </mesh>

          {/* =========================================================
              STAGE 4: HORIZONTAL HINGE JOINT (Joint 3)
              ========================================================= */}
          <group position={[0, 0.38, 0]}>
            {/* Horizontal Hinge Axle (Pin Joint H) */}
            <mesh material={hingeMat} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.026, 0.026, 0.64, 16]} />
            </mesh>

            {/* Hinge Pivot Pillow Blocks */}
            {[-0.26, 0.26].map(x => (
              <mesh key={`hinge-block-${x}`} material={carriageMat} position={[x, 0, 0]} castShadow>
                <boxGeometry args={[0.08, 0.09, 0.11]} />
              </mesh>
            ))}

            {/* Hinge Joint Visual Accents */}
            {[-0.26, 0.26].map(x => (
              <mesh key={`hinge-ring-${x}`} material={accentPurpleMat} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <torusGeometry args={[0.044, 0.009, 12, 20]} />
              </mesh>
            ))}

            {showLabels && (
              <Label
                position={[0.62, 0, 0]}
                text="JOINT 3: HINGE PAIR (H)"
                subtext="Tilting ±10° (Dorsi/Plantarflexion)"
                color="#a855f7"
              />
            )}

            {/* =========================================================
                STAGE 5: TILTING FOOT PLATFORM (Rigid Link 4)
                ========================================================= */}
            <group rotation={[tiltRad, 0, 0]}>
              {/* Twin Transfer Struts from Hinge to Platform */}
              {[-0.18, 0.18].map(x => (
                <mesh key={`link-strut-${x}`} material={linkMat} position={[x, 0.09, 0]} castShadow>
                  <cylinderGeometry args={[0.016, 0.016, 0.14, 12]} />
                </mesh>
              ))}

              {/* Main Structural Foot Platform Bed */}
              <mesh material={platformMat} position={[0, 0.17, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.72, 0.065, 0.92]} />
              </mesh>

              {/* High-Friction Ergonomic Footbed Cushion Pad */}
              <mesh material={padMat} position={[0, 0.205, 0]} receiveShadow>
                <boxGeometry args={[1.65, 0.012, 0.85]} />
              </mesh>

              {/* Platform Outline Trim */}
              <mesh material={accentPurpleMat} position={[0, 0.198, 0]}>
                <boxGeometry args={[1.73, 0.004, 0.93]} />
              </mesh>

              {/* Heel Cup Guard / Rear Lateral Supports */}
              <mesh material={carriageMat} position={[-0.72, 0.27, 0]} castShadow>
                <boxGeometry args={[0.08, 0.14, 0.52]} />
              </mesh>

              {/* Platform Strap Buckles / Anchors */}
              {[-0.5, 0.2].map(x =>
                [-0.43, 0.43].map(z => (
                  <mesh key={`buckle-${x}-${z}`} material={hingeMat} position={[x, 0.22, z]} castShadow>
                    <boxGeometry args={[0.08, 0.04, 0.04]} />
                  </mesh>
                ))
              )}

              {/* Realistic Biomechanical Human Foot on Platform */}
              <HumanFootModel showFoot={showFoot} />

              {showLabels && (
                <Label
                  position={[0, 0.56, 0]}
                  text="LINK 4: FOOT PLATFORM"
                  subtext="Ergonomic support with restraint straps"
                  color="#f59e0b"
                />
              )}
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}
