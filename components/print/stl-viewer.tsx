'use client'

import { Suspense, useEffect, useMemo } from 'react'
import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls, Bounds, Center, Environment } from '@react-three/drei'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import * as THREE from 'three'
import {
  bufferGeometryVolumeMm3,
  bufferGeometrySurfaceAreaMm2,
  object3DVolumeMm3,
  object3DSurfaceAreaMm2,
  type MeshStats,
} from '@/lib/print-estimate'

interface StlViewerProps {
  url: string
  format: 'stl' | 'obj'
  /** Hex color for the rendered model (default neutral grey). */
  color?: string
  /** Tailwind classes for the wrapper. */
  className?: string
  /**
   * Fired once the geometry has loaded with mesh stats (volume + surface area
   * in cm). Used by the configure page to compute a rough price estimate.
   * STL/OBJ files don't carry units; we assume mm (industry standard for FDM).
   */
  onMeshComputed?: (stats: MeshStats) => void
}

/**
 * Client-only 3D viewer for STL or OBJ files. Auto-centers and auto-frames the model.
 *
 * The parent page MUST import this with `next/dynamic` and `ssr: false` —
 * Three.js touches `window` at module load and will crash during SSR otherwise.
 */
export default function StlViewer({ url, format, color = '#8b8b8b', className, onMeshComputed }: StlViewerProps) {
  return (
    <div className={className ?? 'w-full h-[420px] rounded-lg bg-gradient-to-b from-gray-50 to-gray-100 border'}>
      <Canvas camera={{ position: [0, 0, 100], fov: 35 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.0} />
        <directionalLight position={[-10, -5, -10]} intensity={0.4} />
        <Suspense fallback={null}>
          <Bounds fit clip observe margin={1.2}>
            <Center>
              {format === 'stl'
                ? <StlMesh url={url} color={color} onMeshComputed={onMeshComputed} />
                : <ObjMesh url={url} color={color} onMeshComputed={onMeshComputed} />}
            </Center>
          </Bounds>
          <Environment preset="city" />
        </Suspense>
        <OrbitControls makeDefault enableDamping dampingFactor={0.08} />
      </Canvas>
    </div>
  )
}

function StlMesh({ url, color, onMeshComputed }: { url: string; color: string; onMeshComputed?: (s: MeshStats) => void }) {
  const geometry = useLoader(STLLoader, url) as THREE.BufferGeometry
  const cloned = useMemo(() => {
    const g = geometry.clone()
    g.computeVertexNormals()
    return g
  }, [geometry])

  // mm → cm conversion: volume mm³ / 1000 = cm³, area mm² / 100 = cm².
  const stats = useMemo<MeshStats>(() => ({
    volumeCm3: bufferGeometryVolumeMm3(geometry) / 1000,
    surfaceAreaCm2: bufferGeometrySurfaceAreaMm2(geometry) / 100,
  }), [geometry])
  useEffect(() => { onMeshComputed?.(stats) }, [stats, onMeshComputed])

  return (
    <mesh geometry={cloned} castShadow receiveShadow>
      <meshStandardMaterial color={color} metalness={0.05} roughness={0.65} />
    </mesh>
  )
}

function ObjMesh({ url, color, onMeshComputed }: { url: string; color: string; onMeshComputed?: (s: MeshStats) => void }) {
  const obj = useLoader(OBJLoader, url) as THREE.Group
  const themed = useMemo(() => {
    const g = obj.clone(true)
    g.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        ;(child as THREE.Mesh).material = new THREE.MeshStandardMaterial({
          color,
          metalness: 0.05,
          roughness: 0.65,
        })
      }
    })
    return g
  }, [obj, color])

  const stats = useMemo<MeshStats>(() => ({
    volumeCm3: object3DVolumeMm3(obj) / 1000,
    surfaceAreaCm2: object3DSurfaceAreaMm2(obj) / 100,
  }), [obj])
  useEffect(() => { onMeshComputed?.(stats) }, [stats, onMeshComputed])

  return <primitive object={themed} />
}
