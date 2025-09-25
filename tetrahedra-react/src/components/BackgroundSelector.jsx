import React, { useMemo, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import ConstellationNightSky from './ConstellationNightSky'

const BackgroundSelector = ({ background, onPolarisClick }) => {
  const { scene } = useThree()
  
  const backgroundTexture = useMemo(() => {
    // Handle solid colors first
    if (['white', 'black', 'blue'].includes(background)) {
      const colorMap = {
        'white': '#ffffff',
        'black': '#000000',
        'blue': '#4682B4'
      }
      return new THREE.Color(colorMap[background])
    }

    // Create canvas for procedural backgrounds
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024
    const ctx = canvas.getContext('2d')

    switch (background) {
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
        // Sand and sunny sky gradient
        const sandSkyGradient = ctx.createLinearGradient(0, 0, 0, 1024)
        sandSkyGradient.addColorStop(0, '#87CEEB')  // Light sky blue
        sandSkyGradient.addColorStop(0.3, '#B0E0E6') // Powder blue
        sandSkyGradient.addColorStop(0.6, '#F0E68C')  // Khaki (sand transition)
        sandSkyGradient.addColorStop(0.8, '#DEB887')  // Burlywood (sand)
        sandSkyGradient.addColorStop(1, '#D2B48C')   // Tan (sand)
        ctx.fillStyle = sandSkyGradient
        ctx.fillRect(0, 0, 1024, 1024)
        
        // Add sun
        ctx.fillStyle = '#FFFF00'
        ctx.beginPath()
        ctx.arc(800, 150, 60, 0, Math.PI * 2)
        ctx.fill()
        
        // Sun glow
        const beachSunGlow = ctx.createRadialGradient(800, 150, 60, 800, 150, 120)
        beachSunGlow.addColorStop(0, 'rgba(255,255,100,0.4)')
        beachSunGlow.addColorStop(1, 'rgba(255,255,100,0)')
        ctx.fillStyle = beachSunGlow
        ctx.beginPath()
        ctx.arc(800, 150, 120, 0, Math.PI * 2)
        ctx.fill()
        
        // Add fewer, subtle sand dunes instead of water mines
        ctx.fillStyle = 'rgba(218,165,32,0.3)'
        for (let i = 0; i < 5; i++) {
          const x = Math.random() * 1024
          const y = 600 + Math.random() * 300
          const width = 80 + Math.random() * 120
          const height = 20 + Math.random() * 40
          ctx.beginPath()
          ctx.ellipse(x, y, width, height, 0, 0, Math.PI * 2)
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
  }, [background])

  useEffect(() => {
    if (scene && backgroundTexture) {
      scene.background = backgroundTexture
    }
  }, [scene, backgroundTexture])

  return (
    <>
      {background === 'night-sky' && (
        <ConstellationNightSky onPolarisClick={onPolarisClick} />
      )}
    </>
  )
}

export default BackgroundSelector