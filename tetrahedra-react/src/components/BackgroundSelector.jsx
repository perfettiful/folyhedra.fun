import React, { useMemo, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

const BackgroundSelector = ({ background }) => {
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

      case 'sunset':
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
        // Deep ocean gradient
        const oceanGradient = ctx.createLinearGradient(0, 0, 0, 1024)
        oceanGradient.addColorStop(0, '#87CEEB')
        oceanGradient.addColorStop(0.3, '#4682B4')
        oceanGradient.addColorStop(0.7, '#1E90FF')
        oceanGradient.addColorStop(1, '#000080')
        ctx.fillStyle = oceanGradient
        ctx.fillRect(0, 0, 1024, 1024)
        
        // Add wave patterns
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'
        ctx.lineWidth = 2
        for (let y = 200; y < 1000; y += 60) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          for (let x = 0; x < 1024; x += 30) {
            ctx.lineTo(x, y + Math.sin(x * 0.05 + y * 0.01) * 12)
          }
          ctx.stroke()
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

      case 'aurora':
        // Aurora borealis
        const auroraGradient = ctx.createLinearGradient(0, 0, 0, 1024)
        auroraGradient.addColorStop(0, '#001122')
        auroraGradient.addColorStop(0.5, '#003344')
        auroraGradient.addColorStop(1, '#000011')
        ctx.fillStyle = auroraGradient
        ctx.fillRect(0, 0, 1024, 1024)
        
        // Add aurora waves
        for (let i = 0; i < 8; i++) {
          const gradient = ctx.createLinearGradient(0, 200 + i * 100, 0, 300 + i * 100)
          gradient.addColorStop(0, `rgba(0,255,150,${0.1 + Math.random() * 0.2})`)
          gradient.addColorStop(0.5, `rgba(100,255,200,${0.2 + Math.random() * 0.3})`)
          gradient.addColorStop(1, `rgba(0,200,255,${0.1 + Math.random() * 0.2})`)
          ctx.fillStyle = gradient
          
          ctx.beginPath()
          ctx.moveTo(0, 200 + i * 100)
          for (let x = 0; x < 1024; x += 20) {
            const y = 200 + i * 100 + Math.sin(x * 0.02 + i) * 30
            ctx.lineTo(x, y)
          }
          ctx.lineTo(1024, 300 + i * 100)
          ctx.lineTo(0, 300 + i * 100)
          ctx.closePath()
          ctx.fill()
        }
        
        // Add stars
        ctx.fillStyle = '#ffffff'
        for (let i = 0; i < 150; i++) {
          const x = Math.random() * 1024
          const y = Math.random() * 400
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

  return null
}

export default BackgroundSelector