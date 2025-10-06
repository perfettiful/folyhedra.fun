import React, { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const CameraController = ({ targetDistance, isCloseupMode }) => {
  const { camera, gl } = useThree()
  const currentDistance = useRef(15)
  const isAnimating = useRef(false)

  useEffect(() => {
    if (!isCloseupMode && Math.abs(currentDistance.current - targetDistance) > 0.5) {
      isAnimating.current = true
    }
  }, [targetDistance, isCloseupMode])

  useFrame((state, delta) => {
    if (!isCloseupMode && isAnimating.current) {
      // Smooth camera distance animation
      const newDistance = THREE.MathUtils.lerp(currentDistance.current, targetDistance, delta * 2)
      currentDistance.current = newDistance
      
      // Calculate new camera position maintaining isometric angle
      const angle = Math.PI / 4 // 45 degrees for isometric
      const height = newDistance * Math.sin(angle)
      const horizontal = newDistance * Math.cos(angle)
      
      // Update camera position
      camera.position.set(horizontal, height, horizontal)
      
      // Stop animating when close enough
      if (Math.abs(newDistance - targetDistance) < 0.1) {
        isAnimating.current = false
        currentDistance.current = targetDistance
        
        // Reset any cached positions in camera controls
        camera.updateProjectionMatrix()
      }
    }
  })

  return null
}

export default CameraController
