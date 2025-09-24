import React, { useMemo, useEffect, useState, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const ConstellationNightSky = ({ onPolarisClick }) => {
  const { scene } = useThree()
  const [isHoveringPolaris, setIsHoveringPolaris] = useState(false)
  const polarisRef = useRef()
  const twinkleTime = useRef(0)
  
  const backgroundTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024
    const ctx = canvas.getContext('2d')
    
    // Night sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 1024)
    gradient.addColorStop(0, '#0a0a2e')
    gradient.addColorStop(0.7, '#16213e')
    gradient.addColorStop(1, '#0f3460')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 1024, 1024)
    
    // Add regular stars
    ctx.fillStyle = '#ffffff'
    for (let i = 0; i < 300; i++) {
      const x = Math.random() * 1024
      const y = Math.random() * 1024
      const size = Math.random() * 1.5
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }
    
    // Cassiopeia constellation (very far left, requires zoom out to see) - W shape
    const cassiopeia = [
      { x: 30, y: 450 },
      { x: 60, y: 400 },
      { x: 100, y: 430 },
      { x: 140, y: 370 },
      { x: 180, y: 410 }
    ]
    
    // Draw Cassiopeia stars
    ctx.fillStyle = '#ffff88'
    cassiopeia.forEach(star => {
      ctx.beginPath()
      ctx.arc(star.x, star.y, 3, 0, Math.PI * 2)
      ctx.fill()
    })
    
    // Draw Cassiopeia lines
    ctx.strokeStyle = 'rgba(255,255,136,0.1)'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    cassiopeia.forEach((star, i) => {
      if (i === 0) ctx.moveTo(star.x, star.y)
      else ctx.lineTo(star.x, star.y)
    })
    ctx.stroke()
    
    // Big Dipper constellation (right side, vertically centered) - proper ladle shape
    const bigDipper = [
      { x: 720, y: 400 }, // Bowl front left
      { x: 760, y: 390 }, // Bowl front right  
      { x: 780, y: 440 }, // Bowl back right
      { x: 740, y: 450 }, // Bowl back left
      { x: 810, y: 370 }, // Handle star 1
      { x: 840, y: 350 }, // Handle star 2
      { x: 870, y: 320 }  // Handle end
    ]
    
    // Draw Big Dipper stars
    ctx.fillStyle = '#ffff88'
    bigDipper.forEach(star => {
      ctx.beginPath()
      ctx.arc(star.x, star.y, 3, 0, Math.PI * 2)
      ctx.fill()
    })
    
    // Draw Big Dipper lines - proper ladle shape
    ctx.strokeStyle = 'rgba(255,255,136,0.1)'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    // Bowl (trapezoid shape)
    ctx.moveTo(bigDipper[0].x, bigDipper[0].y) // Front left
    ctx.lineTo(bigDipper[1].x, bigDipper[1].y) // Front right
    ctx.lineTo(bigDipper[2].x, bigDipper[2].y) // Back right
    ctx.lineTo(bigDipper[3].x, bigDipper[3].y) // Back left
    ctx.lineTo(bigDipper[0].x, bigDipper[0].y) // Close bowl
    // Handle extending from front right of bowl
    ctx.moveTo(bigDipper[1].x, bigDipper[1].y) // Start from front right
    ctx.lineTo(bigDipper[4].x, bigDipper[4].y) // Handle star 1
    ctx.lineTo(bigDipper[5].x, bigDipper[5].y) // Handle star 2  
    ctx.lineTo(bigDipper[6].x, bigDipper[6].y) // Handle end
    ctx.stroke()
    
    // Polaris will be rendered as a 3D object, not on the background texture
    
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.ClampToEdgeWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
    texture.magFilter = THREE.LinearFilter
    texture.minFilter = THREE.LinearFilter
    return texture
  }, [])

  useEffect(() => {
    if (scene && backgroundTexture) {
      scene.background = backgroundTexture
    }
  }, [scene, backgroundTexture])

  // Twinkling and rotation animation
  useFrame((state) => {
    twinkleTime.current += state.clock.elapsedTime * 0.001
    
    if (polarisRef.current) {
      // Much slower rotation
      polarisRef.current.rotation.z += 0.002
      
      // Twinkling opacity
      const twinkle = 0.7 + Math.sin(twinkleTime.current * 4) * 0.3
      polarisRef.current.children.forEach(child => {
        if (child.material) {
          child.material.opacity = isHoveringPolaris ? 1.0 : twinkle
        }
      })
    }
  })

  return (
    <>
      {/* Twinkling 4-Point Star Polaris */}
      <group 
        ref={polarisRef}
        position={[0, 20, -25]}
        onClick={(e) => {
          e.stopPropagation()
          onPolarisClick()
        }}
        onPointerEnter={(e) => {
          setIsHoveringPolaris(true)
          document.body.style.cursor = 'pointer'
          document.body.classList.add('polaris-hover')
        }}
        onPointerLeave={(e) => {
          setIsHoveringPolaris(false)
          document.body.style.cursor = 'grab'
          document.body.classList.remove('polaris-hover')
        }}
      >
        {/* 4-pointed star using properly oriented cones */}
        {/* Top point */}
        <mesh position={[0, 0.3, 0]} rotation={[0, 0, 0]}>
          <coneGeometry args={[0.08, 0.6, 6]} />
          <meshBasicMaterial 
            color="#ffffcc" 
            transparent 
            opacity={0.9}
          />
        </mesh>
        
        {/* Bottom point */}
        <mesh position={[0, -0.3, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.08, 0.6, 6]} />
          <meshBasicMaterial 
            color="#ffffcc" 
            transparent 
            opacity={0.9}
          />
        </mesh>
        
        {/* Left point */}
        <mesh position={[-0.3, 0, 0]} rotation={[0, 0, Math.PI/2]}>
          <coneGeometry args={[0.08, 0.6, 6]} />
          <meshBasicMaterial 
            color="#ffffcc" 
            transparent 
            opacity={0.9}
          />
        </mesh>
        
        {/* Right point */}
        <mesh position={[0.3, 0, 0]} rotation={[0, 0, -Math.PI/2]}>
          <coneGeometry args={[0.08, 0.6, 6]} />
          <meshBasicMaterial 
            color="#ffffcc" 
            transparent 
            opacity={0.9}
          />
        </mesh>

        {/* Center bright core */}
        <mesh>
          <sphereGeometry args={[0.15, 16, 12]} />
          <meshBasicMaterial 
            color="#ffffaa" 
            transparent 
            opacity={1.0}
          />
        </mesh>

        {/* Light halo */}
        <mesh>
          <sphereGeometry args={[0.4, 16, 12]} />
          <meshBasicMaterial 
            color="#ffffaa" 
            transparent 
            opacity={isHoveringPolaris ? 0.3 : 0.1}
          />
        </mesh>

        {/* Point light for illumination */}
        <pointLight
          intensity={isHoveringPolaris ? 4 : 2}
          distance={20}
          color="#ffffaa"
        />
      </group>
    </>
  )
}

export default ConstellationNightSky
