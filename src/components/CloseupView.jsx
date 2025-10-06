import React, { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, TransformControls } from '@react-three/drei'
import * as THREE from 'three'
import { V, E } from '../utils/tetrahedronMath'

const CloseupView = ({ tetraData, edgeStyle, onDismiss }) => {
  const groupRef = useRef()
  const { camera, scene } = useThree()
  const originalCameraPosition = useRef()
  const originalCameraTarget = useRef()

  useEffect(() => {
    // Store original camera state
    originalCameraPosition.current = camera.position.clone()
    originalCameraTarget.current = new THREE.Vector3(0, 0.6, 0)

    // Animate camera to closeup position
    const targetPosition = new THREE.Vector3(0, 0, 3)
    const targetLookAt = new THREE.Vector3(0, 0, 0)

    // Simple animation using requestAnimationFrame
    let progress = 0
    const animate = () => {
      progress += 0.05
      if (progress >= 1) {
        camera.position.copy(targetPosition)
        camera.lookAt(targetLookAt)
        return
      }
      
      camera.position.lerpVectors(originalCameraPosition.current, targetPosition, progress)
      const currentTarget = new THREE.Vector3().lerpVectors(originalCameraTarget.current, targetLookAt, progress)
      camera.lookAt(currentTarget)
      
      requestAnimationFrame(animate)
    }
    animate()

    return () => {
      // Cleanup - animate back to original position
      let backProgress = 0
      const animateBack = () => {
        backProgress += 0.05
        if (backProgress >= 1) {
          camera.position.copy(originalCameraPosition.current)
          camera.lookAt(originalCameraTarget.current)
          return
        }
        
        camera.position.lerpVectors(targetPosition, originalCameraPosition.current, backProgress)
        const currentTarget = new THREE.Vector3().lerpVectors(targetLookAt, originalCameraTarget.current, backProgress)
        camera.lookAt(currentTarget)
        
        requestAnimationFrame(animateBack)
      }
      animateBack()
    }
  }, [camera])

  // Materials for closeup view
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
    opacity: 0.3 
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
    <>
      {/* Closeup tetrahedron at center */}
      <group ref={groupRef} position={[0, 0, 0]}>
        {/* Ghost edges (full frame) */}
        {E.map(([i, j], ei) => (
          <React.Fragment key={`ghost-${ei}`}>
            {createCylinder(V[i], V[j], 0.03, ghostMaterial)}
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
                  0.08, 
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
            <sphereGeometry args={[0.1, 16, 12]} />
          </mesh>
        ))}
      </group>

      {/* 3D Axis Helper */}
      <axesHelper args={[2]} />
      
      {/* Transform controls for 3D manipulation */}
      <TransformControls object={groupRef} mode="rotate" size={0.8} />
      
      {/* Closeup-specific lighting */}
      <directionalLight
        position={[2, 2, 2]}
        intensity={0.8}
        castShadow
      />
      <ambientLight intensity={0.6} />
    </>
  )
}

export default CloseupView
