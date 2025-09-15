import React from 'react'
import * as THREE from 'three'
import { V, E } from '../utils/tetrahedronMath'

const ReferenceTetrahedron = ({ position, mask, label, scale = 1.0 }) => {
  // Grayed-out reference materials
  const refEdgeMaterial = new THREE.MeshStandardMaterial({ 
    color: '#666666', 
    metalness: 0.1, 
    roughness: 0.8,
    transparent: true,
    opacity: 0.6
  })
  const refGhostMaterial = new THREE.MeshStandardMaterial({ 
    color: '#444444', 
    metalness: 0.0, 
    roughness: 1.0, 
    transparent: true, 
    opacity: 0.3 
  })
  const refVertexMaterial = new THREE.MeshStandardMaterial({ 
    color: '#777777', 
    metalness: 0.1, 
    roughness: 0.8,
    transparent: true,
    opacity: 0.7
  })

  const createCylinder = (start, end, radius, material) => {
    const direction = new THREE.Vector3().subVectors(end, start)
    const length = direction.length()
    const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)
    
    return (
      <mesh
        position={midpoint.clone().multiplyScalar(scale)}
        quaternion={new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          direction.clone().normalize()
        )}
        material={material}
        castShadow
      >
        <cylinderGeometry args={[radius * scale, radius * scale, length * scale, 16, 1, false]} />
      </mesh>
    )
  }

  // Get used vertices for this mask
  const usedVertices = new Set()
  if (mask > 0) { // Only if not empty
    for (let ei = 0; ei < 6; ei++) {
      if ((mask >> ei) & 1) {
        usedVertices.add(E[ei][0])
        usedVertices.add(E[ei][1])
      }
    }
  }

  return (
    <group position={position} rotation={[Math.PI, 0, 0]}>
      {/* Ghost edges (full frame) - always show for reference */}
      {E.map(([i, j], ei) => (
        <React.Fragment key={`ref-ghost-${ei}`}>
          {createCylinder(V[i], V[j], 0.02, refGhostMaterial)}
        </React.Fragment>
      ))}

      {/* Selected edges based on mask */}
      {mask > 0 && E.map(([i, j], ei) => {
        if ((mask >> ei) & 1) {
          return (
            <React.Fragment key={`ref-edge-${ei}`}>
              {createCylinder(V[i], V[j], 0.05, refEdgeMaterial)}
            </React.Fragment>
          )
        }
        return null
      })}

      {/* Vertex spheres */}
      {mask > 0 && Array.from(usedVertices).map((vi) => (
        <mesh
          key={`ref-vertex-${vi}`}
          position={V[vi].clone().multiplyScalar(scale)}
          material={refVertexMaterial}
          castShadow
        >
          <sphereGeometry args={[0.06 * scale, 16, 12]} />
        </mesh>
      ))}

      {/* Label text */}
      <group position={[0, -1.2 * scale, 0]}>
        <mesh>
          <planeGeometry args={[2 * scale, 0.3 * scale]} />
          <meshBasicMaterial 
            color="#333333" 
            transparent 
            opacity={0.8}
          />
        </mesh>
        {/* We'll add text rendering later if needed */}
      </group>
    </group>
  )
}

export default ReferenceTetrahedron
