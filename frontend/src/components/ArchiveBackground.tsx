import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { columnStrength, idleWave, settlingWave } from '../rhine/motion'

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

const ARRAY_SURFACES = new Set([
  'Frosted_Polymer',
  'Ivory_Edges',
  'Titanium_Fasteners',
  'Index_Inlay',
  'Optical_Diffuser',
])

const IDLE_AMP = 0.22
const ACTIVE_AMP = 1.85
const IDLE_SPEED = 0.42
const ACTIVE_SPEED = 1.9 * (10 / 9)

function restHeight(row: number, lane: number, time: number) {
  return settlingWave(row - 12, 26.56) * columnStrength(lane, 2) + idleWave(row, lane, time)
}

/** 连续的浪。phase 只往前走，幅度变化不会把档案盒瞬移到新位置。 */
function waveOffset(row: number, lane: number, phase: number, amplitude: number) {
  const primary = Math.sin(row * 0.36 + lane * 0.2 + phase)
  const secondary = Math.sin(row * 0.2 - lane * 0.14 + phase * 0.65 + 0.8)
  return amplitude * (primary * 0.8 + secondary * 0.2)
}

function verticalSpan(width: number, height: number) {
  const aspect = width / Math.max(1, height)
  if (aspect < 1.05) return Math.max(BASE_SPAN, 8.4 / aspect)
  return Math.max(BASE_SPAN, (BASE_SPAN * 16) / 9 / aspect)
}

function styleArrayMaterial(name: string, mat: THREE.MeshPhysicalMaterial) {
  mat.envMapIntensity = 0.6
  if (name === 'Frosted_Polymer') {
    mat.transmission = 0.78
    mat.thickness = 0.12
    mat.roughness = 0.28
    mat.ior = 1.46
    mat.attenuationColor = new THREE.Color('#eee6df')
    mat.attenuationDistance = 2
    mat.transparent = false
    mat.color.set('#fff7ed')
    mat.clearcoat = 0.3
    mat.clearcoatRoughness = 0.25
    mat.onBeforeCompile = (shader: { vertexShader: string; fragmentShader: string }) => {
      shader.vertexShader = `varying float vPanelHeight;\n${shader.vertexShader}`
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvPanelHeight = position.y / 3.7;',
      )
      shader.fragmentShader = `varying float vPanelHeight;\n${shader.fragmentShader}`
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <color_fragment>',
        '#include <color_fragment>\ndiffuseColor.rgb *= mix(vec3(0.40, 0.30, 0.20), vec3(1.0, 0.98, 0.94), smoothstep(0.1, 1.0, vPanelHeight));',
      )
    }
  }
  if (name === 'Ivory_Edges') {
    mat.transmission = 0
    mat.color.set('#fff5e9')
    mat.roughness = 0.38
  }
  if (name === 'Optical_Diffuser') mat.color.set('#806447')
  if (name === 'Index_Inlay') {
    mat.color.set('#e4d6c5')
    mat.metalness = 0.05
  }
}

/**
 * 其他页面的背景：莱茵生命终端里那片磨砂档案阵列。
 * 平时小幅慢慢走。点击或输入后幅度和速度从当前相位缓缓加大，再缓缓收回。
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

    scene.add(new THREE.HemisphereLight('#fffaf5', '#b4a18c', 0.65))
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
    scene.add(key, fill)

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
    let phase = 0
    let surge = 0
    let surgeTarget = 0
    let holdUntil = -1
    let lastFrame = performance.now()
    let running = true
    let animationId = 0
    const started = performance.now()
    const nowSeconds = () => (performance.now() - started) / 1000

    const triggerWave = () => {
      surgeTarget = 1
      holdUntil = nowSeconds() + 2.1
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      if (target.closest('button, [role="button"], input[type="button"], input[type="submit"], input[type="reset"]')) {
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
    }

    const place = (time: number, wavePhase: number, amplitude: number) => {
      if (instances.length === 0) return
      for (let index = 0; index < cells.length; index++) {
        const { lane, row } = cells[index]
        const height = restHeight(row, lane, time) + waveOffset(row, lane, wavePhase, amplitude)
        const ahead = restHeight(row + 1, lane, time) + waveOffset(row + 1, lane, wavePhase, amplitude)
        dummy.position.set((lane - 2) * COLUMN_SPACING, -4.6 + height, (row - 15.5) * ROW_SPACING)
        dummy.rotation.set((ahead - height) * 0.024, 0, 0)
        dummy.updateMatrix()
        instances[0].setMatrixAt(index, dummy.matrix)
      }
      instances[0].instanceMatrix.needsUpdate = true
    }

    const frame = (now: number) => {
      if (!running) return
      animationId = requestAnimationFrame(frame)
      const time = (now - started) / 1000
      const dt = Math.min(0.05, (now - lastFrame) / 1000)
      lastFrame = now
      if (holdUntil >= 0 && time > holdUntil) surgeTarget = 0
      const rate = surgeTarget > surge ? 2.4 : 1.25
      surge += (surgeTarget - surge) * (1 - Math.exp(-rate * dt))
      phase += (IDLE_SPEED + (ACTIVE_SPEED - IDLE_SPEED) * surge) * dt
      const amplitude = IDLE_AMP + (ACTIVE_AMP - IDLE_AMP) * surge
      place(time, phase, amplitude)
      renderer.render(scene, camera)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('click', onClick, true)
    window.addEventListener('input', onInput, true)
    animationId = requestAnimationFrame(frame)

    const loader = new GLTFLoader()
    loader.load(
      '/archive-cassette.glb',
      (gltf: { scene: THREE.Object3D }) => {
        gltf.scene.updateMatrixWorld(true)
        const meshes: THREE.Mesh[] = []
        gltf.scene.traverse((object: THREE.Object3D) => {
          if (object instanceof THREE.Mesh) meshes.push(object)
        })
        for (const mesh of meshes) {
          const source = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material
          const name = source.name.replace(/\.\d+$/, '')
          if (!ARRAY_SURFACES.has(name) || !(source instanceof THREE.MeshPhysicalMaterial || source instanceof THREE.MeshStandardMaterial)) {
            mesh.geometry.dispose()
            continue
          }
          const geometry = mesh.geometry.clone().applyMatrix4(mesh.matrixWorld)
          const material = source.clone() as THREE.MeshPhysicalMaterial
          styleArrayMaterial(name, material)
          mesh.geometry.dispose()
          if (!running) {
            geometry.dispose()
            material.dispose()
            continue
          }
          const instanced = new THREE.InstancedMesh(geometry, material, cells.length)
          instanced.frustumCulled = false
          instanced.castShadow = name === 'Frosted_Polymer' || name === 'Ivory_Edges'
          instanced.receiveShadow = true
          if (instances.length > 0) instanced.instanceMatrix = instances[0].instanceMatrix
          instances.push(instanced)
          geometries.push(geometry)
          materials.push(material)
          scene.add(instanced)
        }
        place(0, 0, IDLE_AMP)
      },
      undefined,
      (error: unknown) => {
        console.error(error)
      },
    )

    return () => {
      running = false
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('click', onClick, true)
      window.removeEventListener('input', onInput, true)
      for (const geometry of geometries) geometry.dispose()
      for (const material of materials) material.dispose()
      floorGeometry.dispose()
      floorMaterial.dispose()
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
