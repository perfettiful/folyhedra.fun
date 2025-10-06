import React, { useMemo, useEffect, useState } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import ConstellationNightSky from './ConstellationNightSky'

const BackgroundSelector = ({ background, onPolarisClick }) => {
  const { scene } = useThree()
  const [currentBackground, setCurrentBackground] = useState(background)
  
  const backgroundTexture = useMemo(() => {
    return currentBackground
  }, [currentBackground])

  const createBackgroundTexture = (bgType) => {
    // Handle solid colors first
    if (['white', 'black', 'blue'].includes(bgType)) {
      const colorMap = {
        'white': '#ffffff',
        'black': '#000000',
        'blue': '#4682B4'
      }
      return new THREE.Color(colorMap[bgType])
    }

    // Create canvas for procedural backgrounds
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024
    const ctx = canvas.getContext('2d')

    switch (bgType) {
      case 'night-sky':
        // Use the constellation night sky component instead
        return null
        
      case 'simple-night':
        // Deep night sky with stars
        const nightGradient = ctx.createLinearGradient(0, 0, 0, 1024)
        nightGradient.addColorStop(0, '#0a0a2e')
        nightGradient.addColorStop(0.7, '#16213e')
        nightGradient.addColorStop(1, '#0f3460')
        ctx.fillStyle = nightGradient
        ctx.fillRect(0, 0, 1024, 1024)
        
        // Add stars
        ctx.fillStyle = '#ffffff'
        for (let i = 0; i < 300; i++) {
          const x = Math.random() * 1024
          const y = Math.random() * 1024
          const size = Math.random() * 1.5
          ctx.beginPath()
          ctx.arc(x, y, size, 0, Math.PI * 2)
          ctx.fill()
        }
        
        // Add bright stars
        ctx.fillStyle = '#ffff88'
        for (let i = 0; i < 30; i++) {
          const x = Math.random() * 1024
          const y = Math.random() * 1024
          const size = Math.random() * 2 + 1
          ctx.beginPath()
          ctx.arc(x, y, size, 0, Math.PI * 2)
          ctx.fill()
        }
        break

      case 'removed-sunset':
        // Beautiful sunset gradient
        const sunsetGradient = ctx.createLinearGradient(0, 0, 0, 1024)
        sunsetGradient.addColorStop(0, '#FF4500')
        sunsetGradient.addColorStop(0.3, '#FF6347')
        sunsetGradient.addColorStop(0.6, '#FFD700')
        sunsetGradient.addColorStop(0.8, '#FF69B4')
        sunsetGradient.addColorStop(1, '#8B008B')
        ctx.fillStyle = sunsetGradient
        ctx.fillRect(0, 0, 1024, 1024)
        
        // Add sun
        ctx.fillStyle = '#FFFF00'
        ctx.beginPath()
        ctx.arc(800, 300, 80, 0, Math.PI * 2)
        ctx.fill()
        
        // Sun glow
        const sunGlow = ctx.createRadialGradient(800, 300, 80, 800, 300, 160)
        sunGlow.addColorStop(0, 'rgba(255,255,0,0.3)')
        sunGlow.addColorStop(1, 'rgba(255,255,0,0)')
        ctx.fillStyle = sunGlow
        ctx.beginPath()
        ctx.arc(800, 300, 160, 0, Math.PI * 2)
        ctx.fill()
        break

      case 'ocean':
        // Smooth sky to ocean to sand gradient
        const oceanGradient = ctx.createLinearGradient(0, 0, 0, 1024)
        oceanGradient.addColorStop(0, '#87CEEB')    // Sky blue at very top
        oceanGradient.addColorStop(0.1, '#4682B4')  // Steel blue
        oceanGradient.addColorStop(0.5, '#0066CC')  // Bright blue ocean dominates
        oceanGradient.addColorStop(0.8, '#004499')  // Deeper blue ocean
        oceanGradient.addColorStop(1, '#D2B48C')    // Tan sand (bottom)
        ctx.fillStyle = oceanGradient
        ctx.fillRect(0, 0, 1024, 1024)
        break

      case 'garden':
        // Garden with dark green almost to bottom
        const gardenGradient = ctx.createLinearGradient(0, 0, 0, 1024)
        gardenGradient.addColorStop(0, '#4682B4')    // Steel blue sky
        gardenGradient.addColorStop(0.2, '#1A3A1A')  // Very dark forest green
        gardenGradient.addColorStop(0.7, '#002200')  // Extremely dark green
        gardenGradient.addColorStop(0.9, '#001100')  // Even darker green
        gardenGradient.addColorStop(1, '#2F1B14')    // Very dark brown earth (thin strip)
        ctx.fillStyle = gardenGradient
        ctx.fillRect(0, 0, 1024, 1024)
        
        // Add puffy white clouds like nebula effect
        for (let i = 0; i < 3; i++) {
          const x = Math.random() * 1024
          const y = Math.random() * 200 + 20 // More spread in sky area
          const size = 30 + Math.random() * 50
          const cloudGradient = ctx.createRadialGradient(x, y, 0, x, y, size)
          cloudGradient.addColorStop(0, 'rgba(255,255,255,0.6)')
          cloudGradient.addColorStop(0.5, 'rgba(255,255,255,0.3)')
          cloudGradient.addColorStop(1, 'rgba(255,255,255,0)')
          ctx.fillStyle = cloudGradient
          ctx.beginPath()
          ctx.arc(x, y, size, 0, Math.PI * 2)
          ctx.fill()
        }
        break

      case 'space':
        // Deep space with nebula
        const spaceGradient = ctx.createRadialGradient(512, 512, 0, 512, 512, 700)
        spaceGradient.addColorStop(0, '#1a0033')
        spaceGradient.addColorStop(0.5, '#0d001a')
        spaceGradient.addColorStop(1, '#000000')
        ctx.fillStyle = spaceGradient
        ctx.fillRect(0, 0, 1024, 1024)
        
        // Add nebula clouds
        for (let i = 0; i < 15; i++) {
          const x = Math.random() * 1024
          const y = Math.random() * 1024
          const size = 50 + Math.random() * 150
          const nebula = ctx.createRadialGradient(x, y, 0, x, y, size)
          nebula.addColorStop(0, 'rgba(150,50,200,0.3)')
          nebula.addColorStop(0.5, 'rgba(100,30,150,0.1)')
          nebula.addColorStop(1, 'rgba(50,10,100,0)')
          ctx.fillStyle = nebula
          ctx.beginPath()
          ctx.arc(x, y, size, 0, Math.PI * 2)
          ctx.fill()
        }
        
        // Add stars
        ctx.fillStyle = '#ffffff'
        for (let i = 0; i < 500; i++) {
          const x = Math.random() * 1024
          const y = Math.random() * 1024
          const size = Math.random() * 1
          ctx.beginPath()
          ctx.arc(x, y, size, 0, Math.PI * 2)
          ctx.fill()
        }
        break

      default:
        return new THREE.Color('#000000')
    }

    // Create and configure texture
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.ClampToEdgeWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
    texture.magFilter = THREE.LinearFilter
    texture.minFilter = THREE.LinearFilter
    return texture
  }

  // Handle background transitions
  useEffect(() => {
    if (background !== currentBackground) {
      // Simple immediate switch for now
      setCurrentBackground(background)
    }
  }, [background, currentBackground])

  const currentTexture = useMemo(() => {
    return createBackgroundTexture(currentBackground)
  }, [currentBackground])

  useEffect(() => {
    if (scene && currentTexture) {
      scene.background = currentTexture
    }
  }, [scene, currentTexture])

  return (
    <>
      {currentBackground === 'night-sky' && (
        <ConstellationNightSky onPolarisClick={onPolarisClick} />
      )}
    </>
  )
}

export default BackgroundSelector