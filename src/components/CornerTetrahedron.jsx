import React from 'react'
import * as THREE from 'three'
import { V, E } from '../utils/tetrahedronMath'

const CornerTetrahedron = ({ position, scale = 0.8 }) => {
  // Light stone materials for better shadows
  const stoneMaterial = new THREE.MeshStandardMaterial({ 
    color: '#9A9A9A', // Light gray stone
    roughness: 0.9, 
    metalness: 0.1 
  })
  const stoneVertexMaterial = new THREE.MeshStandardMaterial({ 
    color: '#AAAAAA', // Lighter gray
    roughness: 0.8, 
    metalness: 0.1 
  })

  const createCylinder = (start, end, radius) => {
    const direction = new THREE.Vector3().subVectors(end, start)
    const length = direction.length()
    const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)
    
    return (
      <mesh
        position={midpoint.multiplyScalar(scale)}
        quaternion={new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          direction.clone().normalize()
        )}
        material={stoneMaterial}
        castShadow
      >
        <cylinderGeometry args={[radius * scale, radius * scale, length * scale, 12, 1, false]} />
      </mesh>
    )
  }

  return (
    <group 
      position={position}
      rotation={[Math.PI, 0, 0]} // Flip so single vertex points DOWN to platform
    >
      {/* All edges (complete tetrahedron) */}
      {E.map(([i, j], ei) => (
        <React.Fragment key={`stone-edge-${ei}`}>
          {createCylinder(V[i], V[j], 0.04)}
        </React.Fragment>
      ))}

      {/* All vertex spheres */}
      {V.map((vertex, vi) => (
        <mesh
          key={`stone-vertex-${vi}`}
          position={vertex.clone().multiplyScalar(scale)}
          material={stoneVertexMaterial}
          castShadow
        >
          <sphereGeometry args={[0.08 * scale, 12, 8]} />
        </mesh>
      ))}
    </group>
  )
}

export default CornerTetrahedron
