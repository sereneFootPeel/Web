import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { columnStrength, idleWave, settlingWave } from '../rhine/motion'
import { onDenied } from '../archiveTone'

const COLUMN_SPACING = 5.2
const ROW_SPACING = 0.62
const LANES = Array.from({ length: 13 }, (_, index) => index - 3)
const ROW_START = -24
const ROW_END = 44

// 开场镜头在 shot = 29.1、detail = 0 时已经停稳：
// yaw 59°、elevation 19°、距离 140、垂直跨度 7.33。
const AIM = new THREE.Vector3(-1.091, -0.045, 0.481)
const DISTANCE = 140
const BASE_SPAN = 7.33
const YAW = THREE.MathUtils.degToRad(59)
const ELEVATION = THREE.MathUtils.degToRad(19)

const KEY_LENGTH = 5
const KEY_HEIGHT = 3.7
const KEY_DEPTH = 0.4
const KEY_HEAD = 1.85
const KEY_TAIL_DEPTH = 0.22

function createKeyGeometry(inset = 0) {
  const straight = KEY_DEPTH / 2 - inset
  const steppedHead = -KEY_DEPTH / 2 + inset
  const steppedTail = KEY_DEPTH / 2 - KEY_TAIL_DEPTH + inset
  const front = -KEY_LENGTH / 2 + inset
  const back = KEY_LENGTH / 2 - inset
  const step = -KEY_LENGTH / 2 + KEY_HEAD
  const shape = new THREE.Shape()
  shape.moveTo(front, steppedHead)
  shape.lineTo(inset > 0 ? step - inset : step, steppedHead)
  shape.lineTo(inset > 0 ? step + inset : step, steppedTail)
  shape.lineTo(back, steppedTail)
  shape.lineTo(back, straight)
  shape.lineTo(front, straight)
  shape.closePath()
  const lift = inset > 0 ? inset : 0
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: KEY_HEIGHT - lift * 2,
    bevelEnabled: inset === 0,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 1,
  })
  geometry.rotateX(-Math.PI / 2)
  geometry.translate(0, lift, 0.04)
  return geometry
}

function tintByHeight(material: THREE.Material) {
  material.onBeforeCompile = (shader: {
    vertexShader: string
    fragmentShader: string
    uniforms: Record<string, { value: unknown }>
  }) => {
    shader.vertexShader = `varying float vPanelHeight;\n${shader.vertexShader}`
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      '#include <begin_vertex>\nvPanelHeight = position.y / 3.7;',
    )
    shader.fragmentShader = `varying float vPanelHeight;\n${shader.fragmentShader}`
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <color_fragment>',
      '#include <color_fragment>\ndiffuseColor.rgb *= mix(vec3(0.68, 0.56, 0.44), vec3(1.0, 0.98, 0.94), smoothstep(0.1, 1.0, vPanelHeight));',
    )
  }
}

const IDLE_AMP = 0.22
const ACTIVE_AMP = 1.85
const IDLE_SPEED = 0.42
const ACTIVE_SPEED = 1.9 * (10 / 9)

function restHeight(row: number, lane: number, time: number) {
  return settlingWave(row - 12, 26.56) * columnStrength(lane, 2) + idleWave(row, lane, time)
}

/** 连续的浪。phase 只往前走，幅度变化不会把档案盒瞬移到新位置。 */
function waveShape(row: number, lane: number, phase: number) {
  const primary = Math.sin(row * 0.36 + lane * 0.2 + phase)
  const secondary = Math.sin(row * 0.2 - lane * 0.14 + phase * 0.65 + 0.8)
  return primary * 0.8 + secondary * 0.2
}

/** 镜头里越靠右，这个值越大。由画面投影粗略拟合。 */
function screenRight(row: number, lane: number) {
  return row * 0.086 + lane * 0.44
}

const HOLD_SECONDS = 2.1
const SPREAD_SECONDS = 0.85
const EDGE_FRACTION = 0.2
const START_MASK = 0.72

type Cover = {
  phase: number
  surge: number
  surgeTarget: number
  holdUntil: number
  spread: number
}

function verticalSpan(width: number, height: number) {
  const aspect = width / Math.max(1, height)
  if (aspect < 1.05) return Math.max(BASE_SPAN, 8.4 / aspect)
  return Math.max(BASE_SPAN, (BASE_SPAN * 16) / 9 / aspect)
}

/**
 * 其他页面的背景：一排排白色琴键，尺寸沿用原来的档案册。
 * 平时小幅慢慢走。每次点击、输入，或从页头切换页面，波动都从画面右侧开始，再逐渐向左蔓延。
 */
export function ArchiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#eae5e1')
    const fog = new THREE.Fog('#eae5e1', DISTANCE + 5, DISTANCE + 25)
    scene.fog = fog

    const pmrem = new THREE.PMREMGenerator(renderer)
    const room = new RoomEnvironment()
    scene.environment = pmrem.fromScene(room, 0.04).texture
    scene.environmentIntensity = 0.48
    room.dispose()
    pmrem.dispose()

    const hemi = new THREE.HemisphereLight('#fffaf5', '#b4a18c', 0.65)
    scene.add(hemi)
    const shadeUniform = { value: 0 }
    const restBackground = new THREE.Color('#eae5e1')
    const darkBackground = new THREE.Color('#100e0d')
    const restFloor = new THREE.Color('#d8c9b9')
    const darkFloor = new THREE.Color('#161412')
    const restShell = new THREE.Color('#fff7ed')
    const darkShell = new THREE.Color('#2a2826')
    const restCore = new THREE.Color('#f6eee4')
    const darkCore = new THREE.Color('#161412')
    let shade = 0
    let darkUntil = -1
    let shellMaterial: THREE.MeshPhysicalMaterial | null = null
    let innerMaterial: THREE.MeshStandardMaterial | null = null
    const key = new THREE.DirectionalLight('#fff7ed', 1.4)
    key.position.set(-6, 14, -5)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    key.shadow.camera.near = 0.1
    key.shadow.camera.far = 60
    key.shadow.camera.left = -28
    key.shadow.camera.right = 28
    key.shadow.camera.top = 20
    key.shadow.camera.bottom = -20
    key.shadow.bias = -0.0003
    key.shadow.normalBias = 0.035
    const fill = new THREE.DirectionalLight('#ffffff', 0.6)
    fill.position.set(7, 8, -10)
    const redLight = new THREE.DirectionalLight('#ff1a12', 0)
    redLight.position.set(AIM.x - 8, -12, AIM.z + 6)
    redLight.target.position.set(AIM.x, -1.2, AIM.z)
    scene.add(key, fill, redLight, redLight.target)

    const floorGeometry = new THREE.PlaneGeometry(200, 200)
    const floorMaterial = new THREE.MeshStandardMaterial({ color: '#d8c9b9', roughness: 0.95 })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -4.63
    floor.receiveShadow = true
    scene.add(floor)

    const view = new THREE.Vector3(
      -Math.sin(YAW) * Math.cos(ELEVATION),
      Math.sin(ELEVATION),
      Math.cos(YAW) * Math.cos(ELEVATION),
    )
    const camera = new THREE.PerspectiveCamera(3, 1, 5, 300)
    camera.position.copy(AIM).addScaledVector(view, DISTANCE)
    camera.lookAt(AIM)

    const cells: Array<{ lane: number; row: number }> = []
    for (const lane of LANES) {
      for (let row = ROW_START; row <= ROW_END; row++) cells.push({ lane, row })
    }

    const instances: THREE.InstancedMesh[] = []
    const geometries: THREE.BufferGeometry[] = []
    const materials: THREE.Material[] = []
    const dummy = new THREE.Object3D()
    const rayNear = new THREE.Vector3()
    const rayFar = new THREE.Vector3()
    let viewRight = 4
    let viewLeft = 1
    let idlePhase = 0
    let originPhase = 0
    const covers: Cover[] = []
    let lastFrame = performance.now()
    let running = true
    let animationId = 0
    const started = performance.now()
    const ampOf = (amount: number) => IDLE_AMP + (ACTIVE_AMP - IDLE_AMP) * amount
    const speedOf = (amount: number) => IDLE_SPEED + (ACTIVE_SPEED - IDLE_SPEED) * amount

    const triggerWave = () => {
      if (covers.length === 0) originPhase = idlePhase
      covers.push({
        phase: originPhase,
        surge: 1,
        surgeTarget: 1,
        holdUntil: -1,
        spread: 0,
      })
      if (covers.length > 6) covers.shift()
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      if (target.closest('button, [role="button"], input[type="button"], input[type="submit"], input[type="reset"], header a')) {
        triggerWave()
      }
    }

    const onInput = (event: Event) => {
      const target = event.target
      if (target instanceof HTMLTextAreaElement) {
        triggerWave()
        return
      }
      if (target instanceof HTMLInputElement) {
        const kind = target.type
        if (kind === 'button' || kind === 'submit' || kind === 'reset' || kind === 'checkbox' || kind === 'radio' || kind === 'file' || kind === 'range' || kind === 'color') return
        triggerWave()
        return
      }
      if (target instanceof HTMLElement && target.isContentEditable) triggerWave()
    }

    const resize = () => {
      const width = Math.max(1, window.innerWidth)
      const height = Math.max(1, window.innerHeight)
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(verticalSpan(width, height) / (2 * DISTANCE)))
      camera.updateProjectionMatrix()
      measureView()
    }

    const planeRight = (ndcX: number, ndcY: number) => {
      rayNear.set(ndcX, ndcY, 0).unproject(camera)
      rayFar.set(ndcX, ndcY, 1).unproject(camera)
      const dirY = rayFar.y - rayNear.y
      if (Math.abs(dirY) < 1e-5) return null
      const t = (-4.6 - rayNear.y) / dirY
      if (t < 0) return null
      const x = rayNear.x + (rayFar.x - rayNear.x) * t
      const z = rayNear.z + (rayFar.z - rayNear.z) * t
      return screenRight(z / ROW_SPACING + 15.5, x / COLUMN_SPACING + 2)
    }

    const measureView = () => {
      camera.updateMatrixWorld()
      let right = -Infinity
      let left = Infinity
      for (const ndcY of [-0.85, 0, 0.85]) {
        const atRight = planeRight(1, ndcY)
        const atLeft = planeRight(-1, ndcY)
        if (atRight !== null) right = Math.max(right, atRight)
        if (atLeft !== null) left = Math.min(left, atLeft)
      }
      if (right > left && Number.isFinite(right) && Number.isFinite(left)) {
        viewRight = right
        viewLeft = left
      }
    }

    const stepSurge = (current: number, target: number, dt: number) => {
      const rate = target > current ? 2.4 : 1.25
      return current + (target - current) * (1 - Math.exp(-rate * dt))
    }

    const combinedOffset = (row: number, lane: number) => {
      let offset = waveShape(row, lane, idlePhase) * IDLE_AMP
      const right = screenRight(row, lane)
      const edge = Math.max(0.25, (viewRight - viewLeft) * EDGE_FRACTION)
      const span = viewRight - viewLeft + edge
      for (const cover of covers) {
        const front = viewRight - edge * START_MASK - cover.spread * span
        const mask = Math.max(0, Math.min(1, (right - front) / edge))
        if (mask <= 0) continue
        const amount = cover.spread < 1 ? 1 : cover.surge
        const over = waveShape(row, lane, cover.phase) * ampOf(amount)
        offset = offset * (1 - mask) + over * mask
      }
      return offset
    }

    const place = (time: number) => {
      if (instances.length === 0) return
      for (let index = 0; index < cells.length; index++) {
        const { lane, row } = cells[index]
        const height = restHeight(row, lane, time) + combinedOffset(row, lane)
        const ahead = restHeight(row + 1, lane, time) + combinedOffset(row + 1, lane)
        dummy.position.set((lane - 2) * COLUMN_SPACING, -4.6 + height, (row - 15.5) * ROW_SPACING)
        dummy.rotation.set((ahead - height) * 0.024, 0, 0)
        dummy.updateMatrix()
        for (const mesh of instances) mesh.setMatrixAt(index, dummy.matrix)
      }
      for (const mesh of instances) mesh.instanceMatrix.needsUpdate = true
    }

    const frame = (now: number) => {
      if (!running) return
      animationId = requestAnimationFrame(frame)
      const time = (now - started) / 1000
      const dt = Math.min(0.05, (now - lastFrame) / 1000)
      lastFrame = now
      measureView()
      idlePhase += IDLE_SPEED * dt
      for (let index = covers.length - 1; index >= 0; index--) {
        const cover = covers[index]
        if (cover.spread < 1) {
          cover.spread = Math.min(1, cover.spread + dt / SPREAD_SECONDS)
          cover.surge = 1
          cover.surgeTarget = 1
          cover.phase += speedOf(1) * dt
          if (cover.spread >= 1) cover.holdUntil = time + HOLD_SECONDS
        } else {
          if (cover.holdUntil >= 0 && time > cover.holdUntil) cover.surgeTarget = 0
          cover.surge = stepSurge(cover.surge, cover.surgeTarget, dt)
          cover.phase += speedOf(cover.surge) * dt
        }
        if (cover.spread >= 1 && cover.surgeTarget === 0 && cover.surge < 0.02) {
          if (index === covers.length - 1) idlePhase = cover.phase
          covers.splice(index, 1)
        }
      }
      const newest = covers[covers.length - 1]
      if (newest && newest.spread >= 1 && covers.length > 1) covers.splice(0, covers.length - 1)
      place(time)
      const wantDark = time < darkUntil ? 1 : 0
      const shadeRate = wantDark > shade ? 2.8 : 1.35
      shade += (wantDark - shade) * (1 - Math.exp(-shadeRate * dt))
      shadeUniform.value = shade
      const background = scene.background as THREE.Color
      background.copy(restBackground).lerp(darkBackground, shade)
      fog.color.copy(background)
      renderer.toneMappingExposure = 1.05 - 0.22 * shade
      scene.environmentIntensity = 0.48 - 0.26 * shade
      hemi.intensity = 0.65 - 0.28 * shade
      key.intensity = 1.4 - 0.62 * shade
      fill.intensity = 0.6 - 0.28 * shade
      floorMaterial.color.copy(restFloor).lerp(darkFloor, shade)
      redLight.intensity = shade * 2.8
      if (shellMaterial && innerMaterial) {
        shellMaterial.color.copy(restShell).lerp(darkShell, shade)
        shellMaterial.transmission = 0.78 * (1 - shade) + 0.02 * shade
        shellMaterial.envMapIntensity = 0.6 * (1 - shade) + 0.08 * shade
        innerMaterial.color.copy(restCore).lerp(darkCore, shade)
        innerMaterial.envMapIntensity = 0.45 * (1 - shade) + 0.05 * shade
      }
      renderer.render(scene, camera)
    }

    const stopDenied = onDenied(() => {
      darkUntil = (performance.now() - started) / 1000 + 3.2
    })

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('click', onClick, true)
    window.addEventListener('input', onInput, true)

    const shellInset = 0.045
    const coreGeometry = createKeyGeometry(shellInset)
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: '#f6eee4',
      roughness: 0.55,
      metalness: 0,
      envMapIntensity: 0.45,
    })
    innerMaterial = coreMaterial
    tintByHeight(coreMaterial)
    const core = new THREE.InstancedMesh(coreGeometry, coreMaterial, cells.length)
    core.frustumCulled = false
    core.castShadow = false
    core.receiveShadow = true
    instances.push(core)
    geometries.push(coreGeometry)
    materials.push(coreMaterial)
    scene.add(core)

    const keyGeometry = createKeyGeometry()
    const keyMaterial = new THREE.MeshPhysicalMaterial({
      color: '#fff7ed',
      roughness: 0.28,
      metalness: 0,
      transmission: 0.78,
      thickness: 0.12,
      ior: 1.46,
      attenuationColor: '#eee6df',
      attenuationDistance: 2,
      transparent: false,
      clearcoat: 0.3,
      clearcoatRoughness: 0.25,
      envMapIntensity: 0.6,
    })
    shellMaterial = keyMaterial
    tintByHeight(keyMaterial)

    const glowHeight = 3.2
    const laneSpan = (LANES[LANES.length - 1] - LANES[0]) * COLUMN_SPACING + KEY_LENGTH
    const laneCenter = ((LANES[0] + LANES[LANES.length - 1]) / 2 - 2) * COLUMN_SPACING
    const glowGeometry = new THREE.PlaneGeometry(laneSpan, glowHeight)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: '#ff2416',
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    })
    glowMaterial.onBeforeCompile = (shader: {
      vertexShader: string
      fragmentShader: string
      uniforms: Record<string, { value: unknown }>
    }) => {
      shader.uniforms.uShade = shadeUniform
      shader.vertexShader = `varying float vGlow;\n${shader.vertexShader}`
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>\nvGlow = clamp(0.5 - position.y / ${glowHeight.toFixed(2)}, 0.0, 1.0);`,
      )
      shader.fragmentShader = `uniform float uShade;\nvarying float vGlow;\n${shader.fragmentShader}`
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <color_fragment>',
        '#include <color_fragment>\ndiffuseColor.a *= uShade * vGlow;',
      )
    }
    const gapCount = ROW_END - ROW_START
    const glow = new THREE.InstancedMesh(glowGeometry, glowMaterial, gapCount)
    glow.frustumCulled = false
    glow.renderOrder = 2
    const glowDummy = new THREE.Object3D()
    for (let row = ROW_START; row < ROW_END; row++) {
      glowDummy.position.set(laneCenter, -4.6 + glowHeight / 2, (row - 15.5) * ROW_SPACING + 0.35)
      glowDummy.updateMatrix()
      glow.setMatrixAt(row - ROW_START, glowDummy.matrix)
    }
    glow.instanceMatrix.needsUpdate = true
    scene.add(glow)
    const keys = new THREE.InstancedMesh(keyGeometry, keyMaterial, cells.length)
    keys.frustumCulled = false
    keys.castShadow = true
    keys.receiveShadow = true
    instances.push(keys)
    geometries.push(keyGeometry)
    materials.push(keyMaterial)
    scene.add(keys)
    place(0)
    animationId = requestAnimationFrame(frame)

    return () => {
      running = false
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('click', onClick, true)
      window.removeEventListener('input', onInput, true)
      stopDenied()
      for (const geometry of geometries) geometry.dispose()
      for (const material of materials) material.dispose()
      floorGeometry.dispose()
      floorMaterial.dispose()
      glowGeometry.dispose()
      glowMaterial.dispose()
      scene.environment?.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 block h-full w-full"
    />
  )
}
