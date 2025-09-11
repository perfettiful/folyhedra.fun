import React, { useRef, useState } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { V, E } from '../utils/tetrahedronMath'

const TetrahedronGroup = ({ tetraData, edgeStyle, onSelect }) => {
  const groupRef = useRef()
  const { controls } = useThree()
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, z: 0 })
  const [hasMovedDuringDrag, setHasMovedDuringDrag] = useState(false)

  const handleClick = (event) => {
    if (!hasMovedDuringDrag) {
      event.stopPropagation()
      onSelect(tetraData)
    }
  }

  const handlePointerDown = (event) => {
    setIsDragging(true)
    setHasMovedDuringDrag(false)
    setDragStart({
      x: event.point.x - tetraData.position[0],
      z: event.point.z - tetraData.position[2]
    })
    // Disable camera controls during drag
    if (controls) {
      controls.enabled = false
    }
    event.stopPropagation()
  }

  const handlePointerMove = (event) => {
    if (isDragging && groupRef.current) {
      setHasMovedDuringDrag(true)
      const newX = event.point.x - dragStart.x
      const newZ = event.point.z - dragStart.z
      groupRef.current.position.set(newX, -0.4, newZ)
      event.stopPropagation()
    }
  }

  const handlePointerUp = (event) => {
    setIsDragging(false)
    // Re-enable camera controls
    if (controls) {
      controls.enabled = true
    }
    if (groupRef.current) {
      // Update tetraData position for future reference
      tetraData.position[0] = groupRef.current.position.x
      tetraData.position[2] = groupRef.current.position.z
      // Ensure it stays above the platform
      groupRef.current.position.y = Math.max(groupRef.current.position.y, -0.4)
    }
    event.stopPropagation()
    
    // Small delay before allowing clicks again
    setTimeout(() => setHasMovedDuringDrag(false), 100)
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
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
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

      {/* Invisible clickable area */}
      <mesh visible={false}>
        <sphereGeometry args={[0.8, 8, 8]} />
        <meshBasicMaterial />
      </mesh>
    </group>
  )
}

export default TetrahedronGroup
