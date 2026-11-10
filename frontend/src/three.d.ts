declare module 'three' {
  export const MathUtils: {
    degToRad(degrees: number): number
    radToDeg(radians: number): number
  }
  export const ACESFilmicToneMapping: unknown
  export const SRGBColorSpace: unknown
  export const PCFSoftShadowMap: unknown
  export const NoColorSpace: unknown
  export const LinearFilter: unknown
  export const BackSide: unknown
  export const FrontSide: unknown
  export const DoubleSide: unknown
  export const AdditiveBlending: unknown

  class Loose {
    constructor(...args: any[])
    [key: string]: any
  }

  export class Vector2 extends Loose {}
  export class Vector3 extends Loose {}
  export class Color extends Loose {}
  export class WebGLRenderer extends Loose {}
  export class Scene extends Loose {}
  export class Fog extends Loose {}
  export class PMREMGenerator extends Loose {}
  export class HemisphereLight extends Loose {}
  export class DirectionalLight extends Loose {}
  export class PlaneGeometry extends Loose {}
  export class Shape extends Loose {}
  export class ExtrudeGeometry extends Loose {}
  export class MeshBasicMaterial extends Loose {}
  export class MeshStandardMaterial extends Loose {}
  export class MeshPhysicalMaterial extends Loose {}
  export class Mesh extends Loose {}
  export class PerspectiveCamera extends Loose {}
  export class Object3D extends Loose {}
  export class InstancedMesh extends Loose {}
  export class BufferGeometry extends Loose {}
  export class Material extends Loose {}
  export class Texture extends Loose {}
  export class ShaderMaterial extends Loose {}
  export class Group extends Loose {}
  export class Raycaster extends Loose {}
}

declare module 'three/addons/environments/RoomEnvironment.js' {
  export class RoomEnvironment {
    constructor()
    dispose(): void
  }
}

declare module 'three/addons/loaders/GLTFLoader.js' {
  export class GLTFLoader {
    load(
      url: string,
      onLoad: (gltf: { scene: import('three').Object3D }) => void,
      onProgress?: unknown,
      onError?: (error: unknown) => void,
    ): void
  }
}

declare module 'three/addons/geometries/RoundedBoxGeometry.js' {
  export class RoundedBoxGeometry {
    constructor(width: number, height: number, depth: number, segments: number, radius: number)
    dispose(): void
  }
}
