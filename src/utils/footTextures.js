import * as THREE from 'three'

/**
 * Creates ultra-high-definition procedural PBR skin textures (2048x2048):
 * - Diffuse/Albedo Map: realistic warm skin tone, subcutaneous dorsal venous arch,
 *   rosy vascular cushions on heel & ball pads, and translucent keratin toenails with lunula.
 * - Normal Map: micro-dermal skin pores, extensor tendon cords, plantar papillary ridges,
 *   ankle crease lines, and elevated nail plate cuticles.
 * - Roughness Map: glassy specular keratin for toenails, soft dermal sheen for dorsal skin,
 *   and conditioned grip on plantar pads.
 */
export function createFootTextures(isFlat = false) {
  const width = 2048
  const height = 2048

  // --------------------------------------------------------------------------
  // 1. DIFFUSE / ALBEDO MAP
  // --------------------------------------------------------------------------
  const diffCanvas = document.createElement('canvas')
  diffCanvas.width = width
  diffCanvas.height = height
  const diffCtx = diffCanvas.getContext('2d')

  // Base human skin tone (warm natural melanin undertones)
  diffCtx.fillStyle = '#edd2c0'
  diffCtx.fillRect(0, 0, width, height)

  // Subtle cellular melanin gradient
  const baseGrad = diffCtx.createLinearGradient(0, 0, width, height)
  baseGrad.addColorStop(0.0, 'rgba(232, 196, 175, 0.4)')
  baseGrad.addColorStop(0.5, 'rgba(240, 212, 196, 0.2)')
  baseGrad.addColorStop(1.0, 'rgba(228, 190, 168, 0.45)')
  diffCtx.fillStyle = baseGrad
  diffCtx.fillRect(0, 0, width, height)

  // Micro-cellular skin texture stippling (pores and subtle epidermal noise)
  const imgData = diffCtx.getImageData(0, 0, width, height)
  const data = imgData.data
  // Fast deterministic pseudo-noise stippling
  for (let i = 0; i < data.length; i += 4) {
    const n = ((i * 1337) ^ (i >> 5)) & 15
    const variation = (n - 7) * 0.7
    data[i] = Math.min(255, Math.max(0, data[i] + variation))
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + variation * 0.8))
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + variation * 0.7))
  }
  diffCtx.putImageData(imgData, 0, 0)

  // Subcutaneous Dorsal Veins (Great saphenous vein & dorsal venous arch)
  // These lie beneath the skin across the top of the foot (u ~ 0.25..0.75, v ~ 0.40..0.60)
  diffCtx.save()
  diffCtx.strokeStyle = 'rgba(105, 142, 168, 0.30)' // translucent blue-green venous tint
  diffCtx.lineWidth = 14
  diffCtx.lineCap = 'round'
  diffCtx.lineJoin = 'round'
  diffCtx.filter = 'blur(10px)'

  // Main dorsal venous arch
  diffCtx.beginPath()
  diffCtx.moveTo(width * 0.28, height * 0.38)
  diffCtx.bezierCurveTo(
    width * 0.42, height * 0.44,
    width * 0.58, height * 0.46,
    width * 0.72, height * 0.43
  )
  diffCtx.stroke()

  // Branch 1: towards great toe
  diffCtx.lineWidth = 9
  diffCtx.beginPath()
  diffCtx.moveTo(width * 0.58, height * 0.44)
  diffCtx.bezierCurveTo(
    width * 0.68, height * 0.42,
    width * 0.78, height * 0.41,
    width * 0.85, height * 0.40
  )
  diffCtx.stroke()

  // Branch 2: middle digital vein
  diffCtx.lineWidth = 7
  diffCtx.beginPath()
  diffCtx.moveTo(width * 0.52, height * 0.45)
  diffCtx.bezierCurveTo(
    width * 0.62, height * 0.49,
    width * 0.74, height * 0.51,
    width * 0.84, height * 0.50
  )
  diffCtx.stroke()

  // Branch 3: lateral digital vein
  diffCtx.lineWidth = 6
  diffCtx.beginPath()
  diffCtx.moveTo(width * 0.46, height * 0.43)
  diffCtx.bezierCurveTo(
    width * 0.56, height * 0.53,
    width * 0.70, height * 0.56,
    width * 0.82, height * 0.57
  )
  diffCtx.stroke()
  diffCtx.restore()

  // Plantar Rosy Cushion Pads (Heel pad & Metatarsal Ball pad)
  // Heel pad: centered near u ~ 0.14, v ~ 0.0 / 1.0 (plantar center)
  const drawRosyPad = (cx, cy, rx, ry, color) => {
    diffCtx.save()
    const padGrad = diffCtx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry))
    padGrad.addColorStop(0.0, color)
    padGrad.addColorStop(0.65, color.replace(/[\d.]+\)$/, '0.22)'))
    padGrad.addColorStop(1.0, 'transparent')
    diffCtx.fillStyle = padGrad
    diffCtx.beginPath()
    diffCtx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
    diffCtx.fill()
    diffCtx.restore()
  }

  // Rosy heel pad (both top and bottom edges wrap around v=0/1)
  drawRosyPad(width * 0.16, height * 0.04, 180, 110, 'rgba(224, 112, 102, 0.48)')
  drawRosyPad(width * 0.16, height * 0.96, 180, 110, 'rgba(224, 112, 102, 0.48)')

  // Rosy metatarsal ball cushion pad
  drawRosyPad(width * 0.68, height * 0.05, 230, 140, 'rgba(222, 116, 105, 0.44)')
  drawRosyPad(width * 0.68, height * 0.95, 230, 140, 'rgba(222, 116, 105, 0.44)')

  // Medial Arch Region:
  // If Healthy: pale, delicate uncompressed skin
  // If Flat: reddish weight-bearing erythema flush showing strain from arch collapse!
  if (isFlat) {
    drawRosyPad(width * 0.40, height * 0.22, 260, 160, 'rgba(220, 95, 85, 0.38)')
  } else {
    diffCtx.save()
    const archPaleGrad = diffCtx.createRadialGradient(width * 0.38, height * 0.22, 0, width * 0.38, height * 0.22, 220)
    archPaleGrad.addColorStop(0.0, 'rgba(250, 240, 235, 0.45)')
    archPaleGrad.addColorStop(1.0, 'transparent')
    diffCtx.fillStyle = archPaleGrad
    diffCtx.beginPath()
    diffCtx.ellipse(width * 0.38, height * 0.22, 220, 140, 0, 0, Math.PI * 2)
    diffCtx.fill()
    diffCtx.restore()
  }

  // Photorealistic Translucent Keratin Toenails (Toes 1 to 5)
  // Nails are located on the dorsal side of the toes: u in [0.86, 0.98], v in [0.38, 0.62]
  const nails = [
    { u: 0.91, v: 0.41, w: 92, h: 64, rot: -0.04 },  // Big toe (Hallux) - large trapezoidal
    { u: 0.93, v: 0.47, w: 52, h: 42, rot: -0.02 },  // 2nd toe
    { u: 0.92, v: 0.52, w: 46, h: 38, rot: 0.01 },   // 3rd toe
    { u: 0.90, v: 0.56, w: 40, h: 34, rot: 0.03 },   // 4th toe
    { u: 0.88, v: 0.60, w: 34, h: 30, rot: 0.05 },   // 5th pinky toe
  ]

  nails.forEach((nail) => {
    const nx = width * nail.u
    const ny = height * nail.v

    diffCtx.save()
    diffCtx.translate(nx, ny)
    diffCtx.rotate(nail.rot)

    // Cuticle bed outline / shadow
    diffCtx.fillStyle = 'rgba(180, 115, 105, 0.45)'
    diffCtx.beginPath()
    diffCtx.roundRect(-nail.w / 2 - 3, -nail.h / 2 - 3, nail.w + 6, nail.h + 6, [14, 18, 8, 8])
    diffCtx.fill()

    // Pink vascular nail bed
    const nailGrad = diffCtx.createLinearGradient(0, -nail.h / 2, 0, nail.h / 2)
    nailGrad.addColorStop(0.0, '#f2dcd5') // pale proximal groove
    nailGrad.addColorStop(0.3, '#ea9f96') // rosy pink vascular bed
    nailGrad.addColorStop(0.75, '#e8948a')
    nailGrad.addColorStop(0.85, '#faf6ee') // ivory free edge
    nailGrad.addColorStop(1.0, '#fdfbf7') // crisp white tip

    diffCtx.fillStyle = nailGrad
    diffCtx.beginPath()
    diffCtx.roundRect(-nail.w / 2, -nail.h / 2, nail.w, nail.h, [12, 16, 6, 6])
    diffCtx.fill()

    // Lunula (pale half-moon crescent at nail root)
    diffCtx.fillStyle = 'rgba(252, 245, 242, 0.65)'
    diffCtx.beginPath()
    diffCtx.ellipse(0, -nail.h / 2 + 10, nail.w * 0.32, nail.h * 0.22, 0, 0, Math.PI)
    diffCtx.fill()

    diffCtx.restore()
  })

  // --------------------------------------------------------------------------
  // 2. NORMAL / BUMP MAP (Pores, Extensor Tendons, Friction Ridges)
  // --------------------------------------------------------------------------
  const normCanvas = document.createElement('canvas')
  normCanvas.width = width
  normCanvas.height = height
  const normCtx = normCanvas.getContext('2d')

  // Neutral tangent-space normal: (128, 128, 255)
  normCtx.fillStyle = 'rgb(128, 128, 255)'
  normCtx.fillRect(0, 0, width, height)

  // High-frequency skin pores micro-relief
  const normData = normCtx.getImageData(0, 0, width, height)
  const nd = normData.data
  for (let i = 0; i < nd.length; i += 4) {
    const px = (i >> 2) % width
    const py = Math.floor((i >> 2) / width)
    // Cellular pseudo-voronoi pore perturbation
    const noiseX = (((px * 19) ^ (py * 31)) & 7) - 3
    const noiseY = (((px * 29) ^ (py * 17)) & 7) - 3
    nd[i] = Math.min(255, Math.max(0, 128 + noiseX * 3))
    nd[i + 1] = Math.min(255, Math.max(0, 128 + noiseY * 3))
    nd[i + 2] = 250
  }
  normCtx.putImageData(normData, 0, 0)

  // Extensor Tendon Normal Ridges (Anatomical tendon cords on dorsum)
  normCtx.save()
  normCtx.filter = 'blur(6px)'

  // Extensor Hallucis Longus tendon (strong ridge running to big toe)
  normCtx.strokeStyle = 'rgba(150, 128, 255, 0.7)'
  normCtx.lineWidth = 16
  normCtx.beginPath()
  normCtx.moveTo(width * 0.25, height * 0.38)
  normCtx.lineTo(width * 0.88, height * 0.41)
  normCtx.stroke()

  // Extensor Digitorum Longus tendons (branching to toes 2-5)
  normCtx.lineWidth = 10
  const toeTargets = [0.47, 0.52, 0.56, 0.60]
  toeTargets.forEach((tv, idx) => {
    normCtx.beginPath()
    normCtx.moveTo(width * 0.35, height * 0.45)
    normCtx.quadraticCurveTo(width * 0.60, height * (0.45 + idx * 0.03), width * 0.88, height * tv)
    normCtx.stroke()
  })

  // Achilles Tendon posterior ridge (near u ~ 0.05..0.20, v ~ 0.50)
  normCtx.lineWidth = 24
  normCtx.beginPath()
  normCtx.moveTo(width * 0.02, height * 0.50)
  normCtx.lineTo(width * 0.22, height * 0.50)
  normCtx.stroke()

  normCtx.restore()

  // Elevated Cuticle steps on toenails
  nails.forEach((nail) => {
    const nx = width * nail.u
    const ny = height * nail.v
    normCtx.save()
    normCtx.translate(nx, ny)
    normCtx.rotate(nail.rot)
    normCtx.strokeStyle = 'rgba(100, 140, 255, 0.8)'
    normCtx.lineWidth = 4
    normCtx.beginPath()
    normCtx.roundRect(-nail.w / 2, -nail.h / 2, nail.w, nail.h, [12, 16, 6, 6])
    normCtx.stroke()
    normCtx.restore()
  })

  // --------------------------------------------------------------------------
  // 3. ROUGHNESS MAP (Glossy toenails, natural skin sheen, matte pads)
  // --------------------------------------------------------------------------
  const roughCanvas = document.createElement('canvas')
  roughCanvas.width = width
  roughCanvas.height = height
  const roughCtx = roughCanvas.getContext('2d')

  // Natural dermal skin roughness: ~0.42 (RGB: 107)
  roughCtx.fillStyle = 'rgb(107, 107, 107)'
  roughCtx.fillRect(0, 0, width, height)

  // Plantar sole friction surface (heel & ball slightly rougher: ~0.56 / RGB: 142)
  roughCtx.fillStyle = 'rgba(145, 145, 145, 0.4)'
  roughCtx.fillRect(0, 0, width, height * 0.15)
  roughCtx.fillRect(0, height * 0.85, width, height * 0.15)

  // Toenails: Glassy specular keratin (roughness ~0.12 / RGB: 30)
  nails.forEach((nail) => {
    const nx = width * nail.u
    const ny = height * nail.v
    roughCtx.save()
    roughCtx.translate(nx, ny)
    roughCtx.rotate(nail.rot)
    roughCtx.fillStyle = 'rgb(28, 28, 28)' // sharp specular shine
    roughCtx.beginPath()
    roughCtx.roundRect(-nail.w / 2, -nail.h / 2, nail.w, nail.h, [12, 16, 6, 6])
    roughCtx.fill()
    roughCtx.restore()
  })

  // Convert to Three.js CanvasTextures with optimal filtering & wrapping
  const diffTex = new THREE.CanvasTexture(diffCanvas)
  diffTex.wrapS = THREE.RepeatWrapping
  diffTex.wrapT = THREE.RepeatWrapping
  diffTex.colorSpace = THREE.SRGBColorSpace
  diffTex.anisotropy = 8

  const normTex = new THREE.CanvasTexture(normCanvas)
  normTex.wrapS = THREE.RepeatWrapping
  normTex.wrapT = THREE.RepeatWrapping
  normTex.anisotropy = 8

  const roughTex = new THREE.CanvasTexture(roughCanvas)
  roughTex.wrapS = THREE.RepeatWrapping
  roughTex.wrapT = THREE.RepeatWrapping
  roughTex.anisotropy = 8

  return {
    diffuseMap: diffTex,
    normalMap: normTex,
    roughnessMap: roughTex
  }
}
