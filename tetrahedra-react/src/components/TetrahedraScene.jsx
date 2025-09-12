import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { generateMasks, V, E, canonical, countBits, vertexDegrees, isConnected, hasFullFace, labelFor, ROT_EDGE_PERMS, rotateMask } from '../utils/tetrahedronMath'
import TetrahedronGroup from './TetrahedronGroup'
import CornerTetrahedron from './CornerTetrahedron'

const TetrahedraScene = ({ filter, rotationUnique, edgeStyle, onSelectTetra, onCountUpdate }) => {
  const groupRef = useRef()

  const tetrahedra = useMemo(() => {
    const masks = generateMasks(filter, rotationUnique)
    const cols = Math.ceil(Math.sqrt(masks.length))
    const spacing = 2.5

    return masks.map((mask, idx) => {
      const row = Math.floor(idx / cols)
      const col = idx % cols
      const x = (col - (cols - 1) / 2) * spacing
      const z = (row - Math.ceil(masks.length / cols - 1) / 2) * spacing

      const userData = {
        mask,
        canonical: canonical(mask),
        orbitSize: new Set(ROT_EDGE_PERMS.map(p => rotateMask(mask, p))).size,
        edgeCount: countBits(mask),
        degrees: vertexDegrees(mask),
        connected: isConnected(mask),
        hasFace: hasFullFace(mask),
        idx,
      }
      userData.label = labelFor(userData)

      return {
        ...userData,
        position: [x, -0.35, z], // Position ABOVE platform so they just touch it
      }
    })
  }, [filter, rotationUnique])

  // Update count when tetrahedra change
  React.useEffect(() => {
    if (onCountUpdate) {
      onCountUpdate(tetrahedra.length)
    }
  }, [tetrahedra.length, onCountUpdate])

  return (
    <group ref={groupRef}>
      {/* Lights */}
      <hemisphereLight args={['#ffffff', '#666666', 0.8]} />
      <directionalLight
        position={[5, 8, 4]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* Platform - thinner and positioned for vertex contact */}
      <mesh position={[0, -1.0, 0]} receiveShadow>
        <boxGeometry args={[12, 0.1, 12]} />
        <meshStandardMaterial color="#555555" roughness={0.9} metalness={0.0} />
      </mesh>

      {/* Grid */}
      <gridHelper
        args={[12, 12, '#777777', '#666666']}
        position={[0, -0.94, 0]}
      />

      {/* Corner Monument Tetrahedra (complete, stone-like) */}
      <CornerTetrahedron position={[-5.5, -0.2, -5.5]} scale={0.4} />
      <CornerTetrahedron position={[5.5, -0.2, -5.5]} scale={0.4} />
      <CornerTetrahedron position={[-5.5, -0.2, 5.5]} scale={0.4} />
      <CornerTetrahedron position={[5.5, -0.2, 5.5]} scale={0.4} />

      {/* Interactive Tetrahedra */}
      {tetrahedra.map((tetra) => (
        <TetrahedronGroup
          key={tetra.idx}
          tetraData={tetra}
          edgeStyle={edgeStyle}
          onSelect={onSelectTetra}
        />
      ))}
    </group>
  )
}

export default TetrahedraScene
