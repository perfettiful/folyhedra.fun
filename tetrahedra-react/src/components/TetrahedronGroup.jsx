import React, { useRef } from 'react'
import * as THREE from 'three'
import { V, E } from '../utils/tetrahedronMath'

const TetrahedronGroup = ({ tetraData, edgeStyle, onSelect, isSelected }) => {
  const groupRef = useRef()

  const handleClick = (event) => {
    event.stopPropagation()
    onSelect(tetraData)
  }

  // Materials
  const edgeMaterial = new THREE.MeshStandardMaterial({ 
    color: '#00ff88', 
    metalness: 0.2, 
    roughness: 0.3 
  })
  const edgeWireMaterial = new THREE.MeshStandardMaterial({ 
    color: '#00ff88', 
    metalness: 0.0, 
    roughness: 0.8, 
    wireframe: true 
  })
  const ghostMaterial = new THREE.MeshStandardMaterial({ 
    color: '#cccccc', 
    metalness: 0.0, 
    roughness: 1.0, 
    transparent: true, 
    opacity: 0.15 
  })
  const vertexMaterial = new THREE.MeshStandardMaterial({ 
    color: '#00ff88', 
    metalness: 0.1, 
    roughness: 0.35 
  })

  const createCylinder = (start, end, radius, material) => {
    const direction = new THREE.Vector3().subVectors(end, start)
    const length = direction.length()
    const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)
    
    return (
      <mesh
        position={midpoint}
        quaternion={new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          direction.clone().normalize()
        )}
        material={material}
        castShadow
      >
        <cylinderGeometry args={[radius, radius, length, 16, 1, false]} />
      </mesh>
    )
  }

  // Get used vertices
  const usedVertices = new Set()
  for (let ei = 0; ei < 6; ei++) {
    if ((tetraData.mask >> ei) & 1) {
      usedVertices.add(E[ei][0])
      usedVertices.add(E[ei][1])
    }
  }

  return (
    <group
      ref={groupRef}
      position={tetraData.position}
      rotation={[Math.PI, 0, 0]} // Flip so single vertex points DOWN to platform
      onClick={handleClick}
    >
      {/* Ghost edges (full frame) */}
      {E.map(([i, j], ei) => (
        <React.Fragment key={`ghost-${ei}`}>
          {createCylinder(V[i], V[j], 0.02, ghostMaterial)}
        </React.Fragment>
      ))}

      {/* Selected edges */}
      {E.map(([i, j], ei) => {
        if ((tetraData.mask >> ei) & 1) {
          return (
            <React.Fragment key={`edge-${ei}`}>
              {createCylinder(
                V[i], 
                V[j], 
                0.05, 
                edgeStyle === 'wire' ? edgeWireMaterial : edgeMaterial
              )}
            </React.Fragment>
          )
        }
        return null
      })}

      {/* Vertex spheres */}
      {Array.from(usedVertices).map((vi) => (
        <mesh
          key={`vertex-${vi}`}
          position={V[vi]}
          material={vertexMaterial}
          castShadow
        >
          <sphereGeometry args={[0.06, 16, 12]} />
        </mesh>
      ))}

      {/* Clickable area */}
      <mesh visible={false}>
        <sphereGeometry args={[0.8, 8, 8]} />
        <meshBasicMaterial />
      </mesh>
    </group>
  )
}

export default TetrahedronGroup