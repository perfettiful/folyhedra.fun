import React, { useRef, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, TransformControls } from '@react-three/drei'
import * as THREE from 'three'
import { V, E } from '../utils/tetrahedronMath'

const AnimatedCloseupView = ({ tetraData, edgeStyle, onDismiss, originalPosition, onAnimationComplete, shouldExit }) => {
  const groupRef = useRef()
  const { camera } = useThree()
  const [animationState, setAnimationState] = useState('entering') // 'entering', 'active', 'exiting'
  const [animationProgress, setAnimationProgress] = useState(0)
  
  // Store original camera state
  const originalCameraPosition = useRef(new THREE.Vector3(8, 8, 8))
  const originalCameraTarget = useRef(new THREE.Vector3(0, -0.5, 0))
  
  // Target states for animation
  const targetCameraPosition = new THREE.Vector3(0, 0, 4)
  const targetCameraTarget = new THREE.Vector3(0, 0, 0)
  const targetObjectPosition = new THREE.Vector3(0, 0, 0)

  useEffect(() => {
    if (animationState === 'entering') {
      setAnimationProgress(0)
    }
  }, [animationState])

  // Handle external exit trigger
  useEffect(() => {
    if (shouldExit && animationState === 'active') {
      setAnimationState('exiting')
    }
  }, [shouldExit, animationState])

  // Smooth animation using useFrame
  useFrame((state, delta) => {
    if (animationState === 'entering' && animationProgress < 1) {
      const newProgress = Math.min(animationProgress + delta * 2, 1) // 0.5 second animation
      setAnimationProgress(newProgress)
      
      // Easing function for smooth animation
      const eased = 1 - Math.pow(1 - newProgress, 3) // Ease-out cubic
      
      // Animate camera
      camera.position.lerpVectors(originalCameraPosition.current, targetCameraPosition, eased)
      
      // Animate object position
      if (groupRef.current) {
        const startPos = new THREE.Vector3(...originalPosition)
        groupRef.current.position.lerpVectors(startPos, targetObjectPosition, eased)
      }
      
      // Update camera target
      const currentTarget = new THREE.Vector3().lerpVectors(originalCameraTarget.current, targetCameraTarget, eased)
      camera.lookAt(currentTarget)
      
      if (newProgress >= 1) {
        setAnimationState('active')
        if (onAnimationComplete) onAnimationComplete()
      }
    } else if (animationState === 'exiting' && animationProgress > 0) {
      const newProgress = Math.max(animationProgress - delta * 2.5, 0) // Slightly faster return
      setAnimationProgress(newProgress)
      
      // Easing function for smooth return
      const eased = 1 - Math.pow(1 - newProgress, 3)
      
      // Animate camera back
      camera.position.lerpVectors(originalCameraPosition.current, targetCameraPosition, eased)
      
      // Animate object back
      if (groupRef.current) {
        const startPos = new THREE.Vector3(...originalPosition)
        groupRef.current.position.lerpVectors(startPos, targetObjectPosition, eased)
      }
      
      // Update camera target back
      const currentTarget = new THREE.Vector3().lerpVectors(originalCameraTarget.current, targetCameraTarget, eased)
      camera.lookAt(currentTarget)
      
      if (newProgress <= 0) {
        onDismiss()
      }
    }
  })

  const handleDismiss = () => {
    if (animationState === 'active') {
      setAnimationState('exiting')
    }
  }

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
    opacity: 0.4 
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
      {/* Animated tetrahedron */}
      <group ref={groupRef} position={originalPosition}>
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

      {/* 3D Controls - only show when animation is complete */}
      {animationState === 'active' && (
        <>
          <axesHelper args={[1.5]} />
          <TransformControls object={groupRef} mode="rotate" size={0.6} />
        </>
      )}
      
      {/* Enhanced lighting for closeup */}
      <directionalLight
        position={[3, 3, 3]}
        intensity={0.8}
        castShadow
      />
      <ambientLight intensity={0.4} />
      
      {/* Closeup-specific controls */}
      {animationState === 'active' && (
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={2.0}
          maxDistance={6.0}
          target={[0, 0, 0]}
          enableZoom={true}
          zoomSpeed={0.15}
        />
      )}
      
      {/* Dismiss area - invisible plane for click-to-dismiss */}
      {animationState === 'active' && (
        <mesh
          position={[0, 0, -2]}
          onClick={handleDismiss}
          visible={false}
        >
          <planeGeometry args={[20, 20]} />
          <meshBasicMaterial />
        </mesh>
      )}
    </>
  )
}

export default AnimatedCloseupView
