import { useRef, useMemo, Suspense } from 'react'
import { useLoader } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import * as THREE from 'three'

// Preload both real scanned models for instant switching
useLoader.preload(STLLoader, '/models/human_foot.stl')
useLoader.preload(STLLoader, '/models/human_foot_flat.stl')

// Helper for photorealistic PBR metals
function useMetal(color, metalness = 0.88, roughness = 0.22) {
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
        background: 'rgba(9, 13, 22, 0.94)',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${color}80`,
        boxShadow: `0 4px 16px ${color}30`,
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

// Clean, Organic, Natural Human Foot & Leg (Smooth Biological Shading)
function AnatomicalFootMesh({ footType = 'healthy' }) {
  const isFlat = footType === 'flat_foot'
  const modelUrl = isFlat ? '/models/human_foot_flat.stl' : '/models/human_foot.stl'

  // Load clean organic human foot geometry
  const rawGeometry = useLoader(STLLoader, modelUrl)

  // Compute smooth, organic anatomical vertex colors (natural warm skin, rosy pads, keratin nails)
  const geometry = useMemo(() => {
    const geom = rawGeometry.clone()
    geom.computeVertexNormals() // Buttery smooth normals, no faceted triangles

    const pos = geom.attributes.position
    const count = pos.count
    const colors = new Float32Array(count * 3)

    // Base warm natural human skin tone (warm Caucasian / healthy melanin undertone)
    const baseR = 0.85, baseG = 0.66, baseB = 0.55

    for (let i = 0; i < count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const z = pos.getZ(i)

      let r = baseR
      let g = baseG
      let b = baseB

      // 1. Toenails: Translucent keratin plates with healthy vascular pink nail bed & ivory edge
      if (x > 0.69 && y > 0.235 && y < 0.34) {
        // Big toe nail
        if (z > 0.11 && z < 0.26) {
          r = 0.96; g = 0.82; b = 0.78
        }
        // 2nd toe nail
        else if (z > 0.02 && z <= 0.11 && x > 0.72) {
          r = 0.95; g = 0.81; b = 0.77
        }
        // 3rd toe nail
        else if (z > -0.06 && z <= 0.02 && x > 0.71) {
          r = 0.95; g = 0.81; b = 0.77
        }
        // 4th toe nail
        else if (z > -0.15 && z <= -0.06 && x > 0.69) {
          r = 0.94; g = 0.80; b = 0.76
        }
        // Little toe nail
        else if (z > -0.25 && z <= -0.15 && x > 0.67) {
          r = 0.93; g = 0.79; b = 0.75
        }
      }
      // 2. Rosy Plantar Heel Cushion Pad (warm vascularized calcaneus fat pad)
      else if (x < -0.20 && y < 0.29) {
        const factor = Math.min(1, Math.max(0, (0.29 - y) / 0.08))
        r = THREE.MathUtils.lerp(r, 0.90, factor * 0.6)
        g = THREE.MathUtils.lerp(g, 0.54, factor * 0.6)
        b = THREE.MathUtils.lerp(b, 0.49, factor * 0.6)
      }
      // 3. Rosy Metatarsal Ball Cushion Pad (forefoot weight-bearing cushion)
      else if (x > 0.38 && x < 0.72 && y < 0.29) {
        const factor = Math.min(1, Math.max(0, (0.29 - y) / 0.08))
        r = THREE.MathUtils.lerp(r, 0.89, factor * 0.55)
        g = THREE.MathUtils.lerp(g, 0.56, factor * 0.55)
        b = THREE.MathUtils.lerp(b, 0.50, factor * 0.55)
      }
      // 4. Medial Longitudinal Arch / Navicular Border
      else if (x > -0.22 && x < 0.36 && z > 0.03 && y < 0.40) {
        if (isFlat) {
          // Collapsed flat arch: subtle warm weight-bearing erythema
          const factor = Math.min(1, Math.max(0, z / 0.20))
          r = THREE.MathUtils.lerp(r, 0.88, factor * 0.45)
          g = THREE.MathUtils.lerp(g, 0.58, factor * 0.45)
          b = THREE.MathUtils.lerp(b, 0.51, factor * 0.45)
        } else {
          // High athletic arch: delicate paler skin tone
          const factor = Math.min(1, Math.max(0, z / 0.20))
          r = THREE.MathUtils.lerp(r, 0.89, factor * 0.35)
          g = THREE.MathUtils.lerp(g, 0.73, factor * 0.35)
          b = THREE.MathUtils.lerp(b, 0.64, factor * 0.35)
        }
      }
      // 5. Achilles Tendon Ridge (rear calcaneal vertical tendon highlight)
      else if (x < -0.36 && y > 0.32 && Math.abs(z) < 0.06) {
        r = THREE.MathUtils.lerp(r, 0.88, 0.25)
        g = THREE.MathUtils.lerp(g, 0.72, 0.25)
        b = THREE.MathUtils.lerp(b, 0.63, 0.25)
      }

      colors[i * 3] = r
      colors[i * 3 + 1] = g
      colors[i * 3 + 2] = b
    }

    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geom
  }, [rawGeometry, isFlat])

  // Natural living human skin material (soft organic diffuseness, subtle hydration sheen)
  const skinMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      roughness: 0.52,          // Natural matte biological skin (no glossy plastic/wax)
      metalness: 0.0,
      clearcoat: 0.06,          // Subtle natural skin hydration
      clearcoatRoughness: 0.35,
      sheen: 0.32,              // Delicate subcutaneous peach-fuzz rim glow
      sheenColor: new THREE.Color(isFlat ? '#fca5a5' : '#fed7aa'),
      sheenRoughness: 0.40,
    })
  }, [isFlat])

  return (
    <group position={[0, 0, 0]}>
      {/* Real anatomical foot mesh with buttery smooth organic normals */}
      <mesh
        geometry={geometry}
        material={skinMaterial}
        castShadow
        receiveShadow
      />
    </group>
  )
}

export default function MechanismScene({
  rotation = 0,
  tilt = 0,
  height = 0,
  showFoot = true,
  showLabels = false,
  footType = 'healthy'
}) {
  const groupRef = useRef()

  // Convert degrees to radians and normalize height stroke
  const rotRad = THREE.MathUtils.degToRad(rotation)
  const tiltRad = THREE.MathUtils.degToRad(tilt)
  const heightNorm = height / 30 // 0 to 1 -> maps to 0.0 to 0.55 in scene units
  const verticalOffset = heightNorm * 0.55

  // Precision Industrial & Aerospace Materials
  const baseMat = useMetal('#0b1120', 0.88, 0.26)          // Heavy anodized black tooling base
  const chromeMat = useMetal('#f8fafc', 0.98, 0.08)        // Mirror hard-chrome ground rods
  const leadScrewMat = useMetal('#e2e8f0', 0.92, 0.18)     // Ground ball screw
  const carriageMat = useMetal('#1e293b', 0.84, 0.24)      // CNC machined aluminum carriage
  const motorMat = useMetal('#090d16', 0.70, 0.32)         // Stepper motor body
  const motorFaceMat = useMetal('#64748b', 0.92, 0.18)     // Machined motor face
  const couplerMat = useMetal('#0ea5e9', 0.88, 0.18)       // Blue anodized flexible beam coupler
  const bronzeMat = useMetal('#d97706', 0.92, 0.16)        // Precision bronze worm wheel
  const steelMat = useMetal('#94a3b8', 0.95, 0.14)         // Ground pivot pins & bolts
  const rubberMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#05080f',
    roughness: 0.92,
    metalness: 0.05
  }), [])
  const footbedPadMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0d9488',
    roughness: 0.72,
    metalness: 0.06
  }), [])
  const trimTeal = useMetal('#14b8a6', 0.75, 0.22)
  const trimAmber = useMetal('#f59e0b', 0.75, 0.22)
  const limitStopMat = useMetal('#ef4444', 0.85, 0.2)

  return (
    <group ref={groupRef} position={[0, -0.32, 0]}>
      {/* =========================================================
          STAGE 1: PRECISION TOOLING BASE FRAME (Rigid Link 1)
          ========================================================= */}
      {/* Heavy Anodized Base Tooling Bed */}
      <mesh material={baseMat} position={[0, -0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.12, 1.5]} />
      </mesh>

      {/* Perimeter CNC chamfer trim */}
      <mesh material={trimTeal} position={[0, 0.005, 0]}>
        <boxGeometry args={[2.52, 0.012, 1.52]} />
      </mesh>

      {/* Front Precision Telemetry Display Panel on Tooling Chassis */}
      <group position={[0, -0.06, 0.76]}>
        <mesh>
          <boxGeometry args={[1.3, 0.07, 0.012]} />
          <meshStandardMaterial color="#05070d" metalness={0.92} roughness={0.15} />
        </mesh>
        <Html position={[0, 0, 0.015]} center transform distanceFactor={5.5}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 7.2,
            color: '#94a3b8',
            letterSpacing: '0.06em',
            whiteSpace: 'nowrap',
            padding: '2px 8px',
            pointerEvents: 'none',
            userSelect: 'none'
          }}>
            <span style={{ color: footType === 'healthy' ? '#14b8a6' : '#f59e0b', fontWeight: 700 }}>
              {footType === 'healthy' ? '● ARCH: HEALTHY (HIGH VAULT)' : '▲ ARCH: COLLAPSED (PES PLANUS)'}
            </span>
            <span>ROT: {rotation >= 0 ? `+${rotation.toFixed(1)}°` : `${rotation.toFixed(1)}°`}</span>
            <span>TILT: {tilt >= 0 ? `+${tilt.toFixed(1)}°` : `${tilt.toFixed(1)}°`}</span>
            <span>LIFT: {height.toFixed(1)}mm</span>
          </div>
        </Html>
      </group>

      {/* Corner Counterbore Socket Head Cap Screws */}
      {[-1.15, 1.15].map(x =>
        [-0.65, 0.65].map(z => (
          <group key={`screw-${x}-${z}`} position={[x, 0.01, z]}>
            <mesh material={steelMat}>
              <cylinderGeometry args={[0.024, 0.024, 0.015, 16]} />
            </mesh>
            <mesh material={motorMat} position={[0, 0.008, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.006, 6]} />
            </mesh>
          </group>
        ))
      )}

      {/* Heavy-Duty Industrial Leveling Damper Mounts */}
      {[-1.1, 1.1].map(x =>
        [-0.6, 0.6].map(z => (
          <group key={`leveler-${x}-${z}`} position={[x, -0.14, z]}>
            {/* Rubber shock pad */}
            <mesh material={rubberMat} castShadow>
              <cylinderGeometry args={[0.08, 0.09, 0.05, 20]} />
            </mesh>
            {/* Knurled leveling steel nut */}
            <mesh material={steelMat} position={[0, 0.035, 0]}>
              <cylinderGeometry args={[0.045, 0.045, 0.025, 16]} />
            </mesh>
          </group>
        ))
      )}

      {/* Stepper Motor Drive for Vertical Actuation */}
      <group position={[0, 0.12, -0.55]}>
        {/* Motor square body with heatsink fins */}
        <mesh material={motorMat} castShadow>
          <boxGeometry args={[0.24, 0.24, 0.24]} />
        </mesh>
        {/* Front aluminum mounting flange */}
        <mesh material={motorFaceMat} position={[0, 0.125, 0]}>
          <boxGeometry args={[0.245, 0.01, 0.245]} />
        </mesh>
        {/* Blue flexible helical shaft coupler */}
        <mesh material={couplerMat} position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.032, 0.032, 0.08, 16]} />
        </mesh>
      </group>

      {/* Center Precision Ground Ball Screw */}
      <mesh material={leadScrewMat} position={[0, 0.48, -0.55]} castShadow>
        <cylinderGeometry args={[0.022, 0.022, 0.82, 20]} />
      </mesh>

      {/* Dual Mirror Chrome Guide Shafts */}
      <mesh material={chromeMat} position={[-0.9, 0.52, 0]} castShadow>
        <cylinderGeometry args={[0.036, 0.036, 1.05, 24]} />
      </mesh>
      <mesh material={chromeMat} position={[0.9, 0.52, 0]} castShadow>
        <cylinderGeometry args={[0.036, 0.036, 1.05, 24]} />
      </mesh>

      {/* Top Shaft Clamping Blocks */}
      {[-0.9, 0.9].map(x => (
        <group key={`top-block-${x}`} position={[x, 1.04, 0]}>
          <mesh material={carriageMat} castShadow>
            <boxGeometry args={[0.15, 0.05, 0.15]} />
          </mesh>
          <mesh material={steelMat} position={[0, 0.028, 0]}>
            <cylinderGeometry args={[0.016, 0.016, 0.01, 12]} />
          </mesh>
        </group>
      ))}

      {/* Bottom Shaft Flange Blocks */}
      {[-0.9, 0.9].map(x => (
        <mesh key={`bot-block-${x}`} material={carriageMat} position={[x, 0.02, 0]} castShadow>
          <boxGeometry args={[0.16, 0.05, 0.16]} />
        </mesh>
      ))}

      {showLabels && (
        <Label
          position={[0, -0.22, 0.95]}
          text="BASE STAND"
          subtext="Solid metal foundation plate"
          color="#94a3b8"
        />
      )}

      {showLabels && (
        <Label
          position={[-1.24, 0.52, 0]}
          text="HEIGHT LIFT MOTOR"
          subtext="Moves up & down (0–30 mm)"
          color="#14b8a6"
        />
      )}

      {/* =========================================================
          STAGE 2: VERTICAL SLIDER CARRIAGE (Rigid Link 2)
          ========================================================= */}
      <group position={[0, 0.16 + verticalOffset, 0]}>
        {/* Solid CNC Carriage Bed */}
        <mesh material={carriageMat} castShadow receiveShadow>
          <boxGeometry args={[1.96, 0.09, 1.2]} />
        </mesh>

        {/* Linear Ball Bushing Pillow Blocks with Dust Seals */}
        {[-0.9, 0.9].map(x => (
          <group key={`bushing-${x}`} position={[x, 0, 0]}>
            <mesh material={carriageMat} castShadow>
              <boxGeometry args={[0.16, 0.12, 0.18]} />
            </mesh>
            <mesh material={rubberMat} position={[0, 0.065, 0]}>
              <cylinderGeometry args={[0.045, 0.045, 0.015, 16]} />
            </mesh>
            <mesh material={rubberMat} position={[0, -0.065, 0]}>
              <cylinderGeometry args={[0.045, 0.045, 0.015, 16]} />
            </mesh>
          </group>
        ))}

        {/* Lead Screw Anti-Backlash Drive Nut Housing */}
        <group position={[0, 0, -0.55]}>
          <mesh material={bronzeMat} castShadow>
            <cylinderGeometry args={[0.052, 0.052, 0.11, 20]} />
          </mesh>
          <mesh material={steelMat} position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.015, 16]} />
          </mesh>
        </group>

        {/* Elevation Scale Pointer */}
        <mesh material={trimTeal} position={[1.04, 0, 0]}>
          <coneGeometry args={[0.04, 0.08, 8]} />
        </mesh>

        {/* =========================================================
            STAGE 3: REVOLUTE TURNTABLE & WORM DRIVE (Joint 2 - Yaw)
            ========================================================= */}
        <group rotation={[0, rotRad, 0]}>
          {/* Precision Bronze Worm Gear Wheel with Beveled Teeth Rim */}
          <mesh material={bronzeMat} position={[0, 0.08, 0]} castShadow>
            <cylinderGeometry args={[0.38, 0.38, 0.04, 36]} />
          </mesh>

          {/* Turntable Core Pivot Hub */}
          <mesh material={carriageMat} position={[0, 0.095, 0]} castShadow>
            <cylinderGeometry args={[0.34, 0.34, 0.05, 32]} />
          </mesh>

          {/* Central Kingpin Shaft */}
          <mesh material={steelMat} position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.036, 0.036, 0.12, 20]} />
          </mesh>

          {/* Mechanical Hard Travel Safety Stops at ±15° */}
          <mesh material={limitStopMat} position={[-0.38 * Math.cos(Math.PI / 12), 0.1, -0.38 * Math.sin(Math.PI / 12)]}>
            <boxGeometry args={[0.04, 0.05, 0.04]} />
          </mesh>
          <mesh material={limitStopMat} position={[-0.38 * Math.cos(Math.PI / 12), 0.1, 0.38 * Math.sin(Math.PI / 12)]}>
            <boxGeometry args={[0.04, 0.05, 0.04]} />
          </mesh>

          {showLabels && (
            <Label
              position={[0.68, 0.12, 0]}
              text="ROTATION MOTOR"
              subtext="Turns left & right (±15°)"
              color="#6366f1"
            />
          )}

          {/* Stanchion Support Pillars */}
          {[-0.26, 0.26].map(x => (
            <mesh key={`stanchion-${x}`} material={carriageMat} position={[x, 0.24, 0]} castShadow>
              <boxGeometry args={[0.08, 0.26, 0.09]} />
            </mesh>
          ))}

          {/* =========================================================
              STAGE 4: HORIZONTAL HINGE JOINT (Joint 3 - Pitch)
              ========================================================= */}
          <group position={[0, 0.38, 0]}>
            {/* Precision Ground Hinge Pin Axle */}
            <mesh material={steelMat} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.026, 0.026, 0.66, 20]} />
            </mesh>

            {/* Pillow Block Bearings with Lubrication Grease Nipples */}
            {[-0.26, 0.26].map(x => (
              <group key={`hinge-bearing-${x}`} position={[x, 0, 0]}>
                <mesh material={carriageMat} castShadow>
                  <boxGeometry args={[0.09, 0.10, 0.12]} />
                </mesh>
                <mesh material={bronzeMat} position={[0, 0.055, 0]}>
                  <cylinderGeometry args={[0.008, 0.008, 0.015, 8]} />
                </mesh>
              </group>
            ))}

            {/* Hinge Joint Accents */}
            {[-0.26, 0.26].map(x => (
              <mesh key={`hinge-ring-${x}`} material={trimAmber} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <torusGeometry args={[0.042, 0.008, 12, 24]} />
              </mesh>
            ))}

            {showLabels && (
              <Label
                position={[0.62, 0, 0]}
                text="TILT HINGE"
                subtext="Tilts foot up & down (±10°)"
                color="#f59e0b"
              />
            )}

            {/* =========================================================
                STAGE 5: TILTING FOOTBED PLATFORM (Rigid Link 4)
                ========================================================= */}
            <group rotation={[tiltRad, 0, 0]}>
              {/* Twin Transfer Struts */}
              {[-0.18, 0.18].map(x => (
                <mesh key={`link-strut-${x}`} material={steelMat} position={[x, 0.09, 0]} castShadow>
                  <cylinderGeometry args={[0.016, 0.016, 0.14, 16]} />
                </mesh>
              ))}

              {/* Main Structural Foot Platform Bed */}
              <mesh material={carriageMat} position={[0, 0.17, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.72, 0.065, 0.92]} />
              </mesh>

              {/* Silicone High-Traction Ergonomic Footbed Pad */}
              <mesh material={footbedPadMat} position={[0, 0.205, 0]} receiveShadow>
                <boxGeometry args={[1.65, 0.012, 0.85]} />
              </mesh>

              {/* Clean Biomechanical Plantar Pressure Contact Silhouette (No Z-fighting) */}
              <group position={[0, 0.213, 0]}>
                {footType === 'healthy' ? (
                  <>
                    {/* Calcaneus Heel Contact Pad (Isolated) */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.28, 0, 0.02]}>
                      <circleGeometry args={[0.12, 48]} />
                      <meshBasicMaterial color="#14b8a6" transparent opacity={0.35} depthWrite={false} />
                    </mesh>
                    {/* Metatarsal Ball & Toes Contact Pad (Isolated) */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.45, 0, 0.04]}>
                      <circleGeometry args={[0.18, 48]} />
                      <meshBasicMaterial color="#14b8a6" transparent opacity={0.35} depthWrite={false} />
                    </mesh>
                    {/* Narrow Lateral Edge Band */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.08, 0, -0.10]}>
                      <planeGeometry args={[0.42, 0.07]} />
                      <meshBasicMaterial color="#0d9488" transparent opacity={0.25} depthWrite={false} />
                    </mesh>
                  </>
                ) : (
                  <>
                    {/* Full Continuous Fallen Arch Contact Map (Amber/Warning) */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.08, 0, 0.03]}>
                      <planeGeometry args={[0.88, 0.32]} />
                      <meshBasicMaterial color="#f59e0b" transparent opacity={0.30} depthWrite={false} />
                    </mesh>
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.26, 0, 0.02]}>
                      <circleGeometry args={[0.14, 48]} />
                      <meshBasicMaterial color="#d97706" transparent opacity={0.40} depthWrite={false} />
                    </mesh>
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.45, 0, 0.05]}>
                      <circleGeometry args={[0.18, 48]} />
                      <meshBasicMaterial color="#d97706" transparent opacity={0.40} depthWrite={false} />
                    </mesh>
                  </>
                )}
              </group>

              {/* Platform Bevel Perimeter Trim */}
              <mesh material={trimTeal} position={[0, 0.198, 0]}>
                <boxGeometry args={[1.73, 0.004, 0.93]} />
              </mesh>

              {/* Anatomical Heel Stop Guard */}
              <mesh material={carriageMat} position={[-0.72, 0.28, 0]} castShadow>
                <boxGeometry args={[0.08, 0.15, 0.52]} />
              </mesh>
              <mesh material={rubberMat} position={[-0.675, 0.28, 0]}>
                <boxGeometry args={[0.015, 0.13, 0.48]} />
              </mesh>

              {/* Stainless Steel Strap Anchor Buckles */}
              {[-0.5, 0.2].map(x =>
                [-0.43, 0.43].map(z => (
                  <mesh key={`buckle-${x}-${z}`} material={steelMat} position={[x, 0.22, z]} castShadow>
                    <boxGeometry args={[0.08, 0.04, 0.04]} />
                  </mesh>
                ))
              )}

              {/* REALISTIC SCANNED ANATOMICAL HUMAN FOOT MODEL */}
              {showFoot && (
                <Suspense fallback={null}>
                  <AnatomicalFootMesh key={footType} footType={footType} />
                </Suspense>
              )}

              {showLabels && (
                <>
                  <Label
                    position={[0, 0.58, 0]}
                    text="FOOT REST PLATFORM"
                    subtext="Padded base with safety straps"
                    color="#14b8a6"
                  />
                  {footType === 'healthy' ? (
                    <>
                      <Label
                        position={[0.08, 0.42, 0.24]}
                        text="HIGH MEDIAL ARCH"
                        subtext="Natural shock absorption gap (0.12m clearance)"
                        color="#14b8a6"
                      />
                      <Label
                        position={[-0.25, 0.65, 0]}
                        text="NEUTRAL ANKLE"
                        subtext="Upright vertical alignment (0°)"
                        color="#14b8a6"
                      />
                    </>
                  ) : (
                    <>
                      <Label
                        position={[0.08, 0.28, 0.32]}
                        text="FALLEN MEDIAL ARCH"
                        subtext="Complete floor contact & navicular sag"
                        color="#f59e0b"
                      />
                      <Label
                        position={[-0.25, 0.65, -0.06]}
                        text="PRONATED ANKLE (VALGUS)"
                        subtext="Inward eversion tilt (-8.5°)"
                        color="#f59e0b"
                      />
                    </>
                  )}
                </>
              )}
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}
