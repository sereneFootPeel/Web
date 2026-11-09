import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

const VERT = `
varying vec3 vNormal;
varying vec3 vView;
varying vec3 vLocal;
uniform float uTime;
uniform vec3 uHit;
uniform float uAmount;

void main() {
  vec3 n = normalize(normal);
  // 棱上的顶点在每个面各有一份。位移只能跟位置走，不能跟各自的法线走，否则两面会撕开。
  vec3 outward = normalize(position);
  float axis = max(abs(n.x), max(abs(n.y), abs(n.z)));
  float edge = smoothstep(0.05, 0.22, 1.0 - axis);
  float wave = sin(position.x * 9.0 + uTime * 1.6)
    * sin(position.y * 8.0 - uTime * 1.15)
    * sin(position.z * 7.0 + uTime);
  float travel = sin(position.x * 15.0 + position.z * 12.0 + uTime * 2.1)
    * cos(position.y * 14.0 - uTime * 1.5);
  float dist = length(position - uHit);
  float influence = exp(-(dist * dist) / 0.05);
  vec3 pos = position + outward * (wave * 0.012 + edge * travel * 0.04 + influence * uAmount * 0.07);
  vec4 world = modelMatrix * vec4(pos, 1.0);
  vec4 viewPos = viewMatrix * world;
  vLocal = pos;
  vNormal = normalize(mat3(modelMatrix) * n);
  vView = -viewPos.xyz;
  gl_Position = projectionMatrix * viewPos;
}
`

const FRAG = `
precision highp float;
varying vec3 vNormal;
varying vec3 vView;
varying vec3 vLocal;
uniform float uPass;
uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uBackground;

void main() {
  vec3 n = normalize(vNormal);
  vec3 viewDir = normalize(vView);
  if (dot(n, viewDir) < 0.0) n = -n;

  float ripple = sin(vLocal.x * 26.0 + uTime * 2.1) * sin(vLocal.y * 22.0 - uTime * 1.6);
  vec2 flow = vec2(
    sin(vLocal.y * 16.0 + uTime * 1.4),
    cos(vLocal.x * 14.0 - uTime * 1.2)
  );
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 offset = n.xy * mix(0.045, 0.016, uPass) + flow * (0.01 + ripple * 0.006);
  vec3 bg = texture2D(uBackground, uv + offset).rgb;

  float fresnel = pow(1.0 - clamp(dot(n, viewDir), 0.0, 1.0), 1.35);
  vec3 light = normalize(vec3(0.25, 0.9, 0.45));
  float spec = pow(max(dot(n, normalize(light + viewDir)), 0.0), 120.0);

  if (uPass < 0.5) {
    vec3 color = mix(bg, vec3(1.0), 0.04 + fresnel * 0.1);
    gl_FragColor = vec4(color, 1.0);
  } else {
    float alpha = fresnel * 0.34 + spec * 0.5;
    gl_FragColor = vec4(vec3(1.0), clamp(alpha, 0.0, 0.88));
  }
}
`

/**
 * 首页中央的透明白水立方体。缓慢转动，指针靠近时表面轻轻鼓起。
 */
export function WaterScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const navigate = useNavigate()
  const navigateRef = useRef(navigate)
  navigateRef.current = navigate

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
    })
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    renderer.outputColorSpace = THREE.SRGBColorSpace

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20)
    camera.position.set(0.2, 0.16, 3.25)
    camera.lookAt(0, 0, 0)

    const geometry = new RoundedBoxGeometry(1, 1, 1, 8, 0.12)
    const background = new THREE.Texture()
    background.colorSpace = THREE.NoColorSpace
    background.minFilter = THREE.LinearFilter
    background.magFilter = THREE.LinearFilter
    background.generateMipmaps = false
    const uniforms = {
      uTime: { value: 0 },
      uHit: { value: new THREE.Vector3(0, 0, 0.5) },
      uAmount: { value: 0 },
      uPass: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uBackground: { value: background },
    }
    const backMaterial = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
    })
    const frontMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: uniforms.uTime,
        uHit: uniforms.uHit,
        uAmount: uniforms.uAmount,
        uPass: { value: 1 },
        uResolution: uniforms.uResolution,
        uBackground: uniforms.uBackground,
      },
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      side: THREE.FrontSide,
    })

    const group = new THREE.Group()
    const back = new THREE.Mesh(geometry, backMaterial)
    const front = new THREE.Mesh(geometry, frontMaterial)
    back.renderOrder = 0
    front.renderOrder = 1
    group.add(back, front)
    group.scale.setScalar(0.64)
    group.rotation.set(0.62, 0.48, 0)
    scene.add(group)

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    const hitPoint = new THREE.Vector3()
    let cssW = 1
    let cssH = 1
    let hover = false
    let amount = 0
    let lastTime = performance.now()
    let animationId = 0
    let running = true

    const resize = () => {
      cssW = Math.max(1, window.innerWidth)
      cssH = Math.max(1, window.innerHeight)
      renderer.setSize(cssW, cssH, false)
      camera.aspect = cssW / cssH
      camera.updateProjectionMatrix()
      uniforms.uResolution.value.set(canvas.width, canvas.height)
    }

    const pick = (clientX: number, clientY: number) => {
      pointer.x = (clientX / cssW) * 2 - 1
      pointer.y = 1 - (clientY / cssH) * 2
      raycaster.setFromCamera(pointer, camera)
      const hits = raycaster.intersectObject(front, false)
      return hits[0] ?? null
    }

    const draw = (now: number) => {
      const dt = Math.min(0.033, (now - lastTime) / 1000)
      lastTime = now
      group.rotation.x += dt * 0.12
      group.rotation.y += dt * 0.16
      const target = hover ? 1 : 0
      amount += (target - amount) * (1 - Math.exp(-dt * 8))
      uniforms.uTime.value = now / 1000
      uniforms.uAmount.value = amount
      const archive = document.querySelector('canvas:not(.home-cube)')
      if (archive instanceof HTMLCanvasElement && archive.width > 0) {
        background.image = archive
        background.needsUpdate = true
      }
      renderer.render(scene, camera)
    }

    const frame = (now: number) => {
      if (!running) return
      animationId = requestAnimationFrame(frame)
      draw(now)
    }

    const onPointerMove = (event: PointerEvent) => {
      const hit = pick(event.clientX, event.clientY)
      if (!hit) {
        hover = false
        document.documentElement.style.cursor = ''
        return
      }
      hitPoint.copy(hit.point)
      front.worldToLocal(hitPoint)
      uniforms.uHit.value.copy(hitPoint)
      hover = true
      document.documentElement.style.cursor = 'pointer'
    }

    const onPointerLeave = () => {
      hover = false
      document.documentElement.style.cursor = ''
    }

    const onClick = (event: MouseEvent) => {
      if (!pick(event.clientX, event.clientY)) return
      navigateRef.current('/philosophers')
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerleave', onPointerLeave)
    window.addEventListener('click', onClick)
    draw(performance.now())
    animationId = requestAnimationFrame(frame)

    return () => {
      running = false
      cancelAnimationFrame(animationId)
      document.documentElement.style.cursor = ''
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('click', onClick)
      geometry.dispose()
      backMaterial.dispose()
      frontMaterial.dispose()
      background.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="home-cube pointer-events-none fixed inset-0 z-[1] block h-full w-full"
    />
  )
}
