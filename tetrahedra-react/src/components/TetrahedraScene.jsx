import React, { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { generateMasks, V, E, canonical, countBits, vertexDegrees, isConnected, hasFullFace, labelFor, ROT_EDGE_PERMS, rotateMask } from '../utils/tetrahedronMath'
import TetrahedronGroup from './TetrahedronGroup'
import CornerTetrahedron from './CornerTetrahedron'
import ReferenceTetrahedron from './ReferenceTetrahedron'

const TetrahedraScene = ({ filter, rotationUnique, edgeStyle, onSelectTetra, onCountUpdate, selectedTetra, isCloseupMode, onCameraUpdate }) => {
  const groupRef = useRef()
  const platformRef = useRef()
  const gridRef = useRef()
  const cornerRefs = useRef([])
  const lastInteractionTime = useRef(Date.now())
  const rotationEnabled = useRef(false)
  const [currentPlatformSize, setCurrentPlatformSize] = useState(12)
  const [targetPlatformSize, setTargetPlatformSize] = useState(12)
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  // Track user interactions to delay rotation
  React.useEffect(() => {
    const handleUserActivity = () => {
      lastInteractionTime.current = Date.now()
      rotationEnabled.current = false
    }

    // Listen for mouse and keyboard activity
    window.addEventListener('mousemove', handleUserActivity)
    window.addEventListener('mousedown', handleUserActivity)
    window.addEventListener('wheel', handleUserActivity)
    window.addEventListener('keydown', handleUserActivity)

    return () => {
      window.removeEventListener('mousemove', handleUserActivity)
      window.removeEventListener('mousedown', handleUserActivity)
      window.removeEventListener('wheel', handleUserActivity)
      window.removeEventListener('keydown', handleUserActivity)
    }
  }, [])
  
  // Add subtle rotation and platform animation
  useFrame((state, delta) => {
    if (groupRef.current && !isCloseupMode) {
      const timeSinceLastInteraction = Date.now() - lastInteractionTime.current
      
      // Enable rotation after 1 second of inactivity
      if (timeSinceLastInteraction > 1000) {
        rotationEnabled.current = true
      }
      
      if (rotationEnabled.current) {
        groupRef.current.rotation.y += 0.0002 // Very subtle baseline rotation
      }
    }
    
    // Smooth platform size animation
    if (Math.abs(currentPlatformSize - targetPlatformSize) > 0.1) {
      const newSize = THREE.MathUtils.lerp(currentPlatformSize, targetPlatformSize, delta * 3)
      setCurrentPlatformSize(newSize)
      
      // Update platform geometry
      if (platformRef.current) {
        platformRef.current.scale.x = newSize / 12
        platformRef.current.scale.z = newSize / 12
      }
      
      // Update grid
      if (gridRef.current) {
        gridRef.current.scale.x = newSize / 12
        gridRef.current.scale.z = newSize / 12
      }
      
      // Update corner positions to stay at corners
      cornerRefs.current.forEach((corner, idx) => {
        if (corner) {
          const halfSize = newSize / 2 - 0.5
          const positions = [
            [-halfSize, -0.2, -halfSize],
            [halfSize, -0.2, -halfSize],
            [-halfSize, -0.2, halfSize],
            [halfSize, -0.2, halfSize]
          ]
          corner.position.set(...positions[idx])
        }
      })
    }
  })

  const tetrahedra = useMemo(() => {
    const masks = generateMasks(filter, rotationUnique)
    const cols = Math.ceil(Math.sqrt(masks.length))
    const spacing = 2.5
    
    // Calculate optimal platform size based on layout
    const rows = Math.ceil(masks.length / cols)
    const layoutWidth = (cols - 1) * spacing + 4 // Add more margin
    const layoutDepth = (rows - 1) * spacing + 4 // Add more margin
    const optimalSize = Math.max(layoutWidth, layoutDepth, 10) // Minimum size of 10
    
    // Update target platform size
    setTargetPlatformSize(optimalSize)
    
    // Calculate optimal camera distance based on platform size
    const optimalCameraDistance = optimalSize * 1.2 + 8 // Scale factor + base distance
    if (onCameraUpdate) {
      onCameraUpdate(optimalCameraDistance)
    }

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

  // Add transition effect when tetrahedra change
  React.useEffect(() => {
    setIsTransitioning(true)
    const timer = setTimeout(() => setIsTransitioning(false), 200)
    return () => clearTimeout(timer)
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

      {/* Platform - animated size based on tetrahedra count */}
      <mesh ref={platformRef} position={[0, -1.0, 0]} receiveShadow>
        <boxGeometry args={[12, 0.1, 12]} />
        <meshStandardMaterial color="#555555" roughness={0.9} metalness={0.0} />
      </mesh>

      {/* Grid - animated size to match platform */}
      <gridHelper
        ref={gridRef}
        args={[12, 12, '#777777', '#666666']}
        position={[0, -0.94, 0]}
      />

      {/* Corner Monument Tetrahedra (complete, stone-like) */}
      <group ref={(el) => cornerRefs.current[0] = el} position={[-6, -0.2, -6]}>
        <CornerTetrahedron position={[0, 0, 0]} scale={0.4} />
      </group>
      <group ref={(el) => cornerRefs.current[1] = el} position={[6, -0.2, -6]}>
        <CornerTetrahedron position={[0, 0, 0]} scale={0.4} />
      </group>
      <group ref={(el) => cornerRefs.current[2] = el} position={[-6, -0.2, 6]}>
        <CornerTetrahedron position={[0, 0, 0]} scale={0.4} />
      </group>
      <group ref={(el) => cornerRefs.current[3] = el} position={[6, -0.2, 6]}>
        <CornerTetrahedron position={[0, 0, 0]} scale={0.4} />
      </group>


      {/* Interactive Tetrahedra */}
      <group opacity={isTransitioning ? 0.3 : 1.0}>
        {tetrahedra.map((tetra) => {
          // Hide the selected tetrahedron during closeup mode
          const isHidden = isCloseupMode && selectedTetra && tetra.idx === selectedTetra.idx
          
          return (
            <TetrahedronGroup
              key={`${filter}-${rotationUnique}-${tetra.idx}`}
              tetraData={tetra}
              edgeStyle={edgeStyle}
              onSelect={onSelectTetra}
              visible={!isHidden}
            />
          )
        })}
      </group>
    </group>
  )
}

export default TetrahedraScene
