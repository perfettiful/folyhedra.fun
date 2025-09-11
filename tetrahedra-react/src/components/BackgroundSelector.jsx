import React, { useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

const BackgroundSelector = ({ background }) => {
  const { scene } = useThree()
  
  const backgroundTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024
    const ctx = canvas.getContext('2d')

    switch (background) {
      case 'white':
        return new THREE.Color('#ffffff')
      case 'black':
        return new THREE.Color('#000000')
      case 'blue':
        return new THREE.Color('#4682B4')
      case 'green':
        return new THREE.Color('#228B22')
      case 'purple':
        return new THREE.Color('#8B008B')
      
      case 'gray-gradient':
        const grayGradient = ctx.createLinearGradient(0, 0, 0, 1024)
        grayGradient.addColorStop(0, '#f5f5f5')
        grayGradient.addColorStop(1, '#888888')
        ctx.fillStyle = grayGradient
        ctx.fillRect(0, 0, 1024, 1024)
        break

      case 'night-sky':
        const nightGradient = ctx.createLinearGradient(0, 0, 0, 1024)
        nightGradient.addColorStop(0, '#0a0a2e')
        nightGradient.addColorStop(0.7, '#16213e')
        nightGradient.addColorStop(1, '#0f3460')
        ctx.fillStyle = nightGradient
        ctx.fillRect(0, 0, 1024, 1024)
        
        // Add stars
        ctx.fillStyle = '#ffffff'
        for (let i = 0; i < 400; i++) {
          const x = Math.random() * 1024
          const y = Math.random() * 1024
          const size = Math.random() * 2
          ctx.beginPath()
          ctx.arc(x, y, size, 0, Math.PI * 2)
          ctx.fill()
        }
        
        // Add bright stars
        ctx.fillStyle = '#ffff88'
        for (let i = 0; i < 40; i++) {
          const x = Math.random() * 1024
          const y = Math.random() * 1024
          const size = Math.random() * 3 + 1
          ctx.beginPath()
          ctx.arc(x, y, size, 0, Math.PI * 2)
          ctx.fill()
        }
        break

      case 'meadow':
        const skyGradient = ctx.createLinearGradient(0, 0, 0, 600)
        skyGradient.addColorStop(0, '#87CEEB')
        skyGradient.addColorStop(1, '#98FB98')
        ctx.fillStyle = skyGradient
        ctx.fillRect(0, 0, 1024, 600)
        
        const grassGradient = ctx.createLinearGradient(0, 600, 0, 1024)
        grassGradient.addColorStop(0, '#90EE90')
        grassGradient.addColorStop(1, '#228B22')
        ctx.fillStyle = grassGradient
        ctx.fillRect(0, 600, 1024, 424)
        
        // Flowers
        for (let i = 0; i < 60; i++) {
          const x = Math.random() * 1024
          const y = 600 + Math.random() * 300
          ctx.fillStyle = ['#FF69B4', '#FFB6C1', '#FFA500', '#FFFF00'][Math.floor(Math.random() * 4)]
          ctx.beginPath()
          ctx.arc(x, y, Math.random() * 4 + 2, 0, Math.PI * 2)
          ctx.fill()
        }
        break

      case '90s-theme':
        const radicalGradient = ctx.createLinearGradient(0, 0, 1024, 1024)
        radicalGradient.addColorStop(0, '#8B4B9C')
        radicalGradient.addColorStop(0.25, '#5B8BA3')
        radicalGradient.addColorStop(0.5, '#7BA35B')
        radicalGradient.addColorStop(0.75, '#A3855B')
        radicalGradient.addColorStop(1, '#A35B7B')
        ctx.fillStyle = radicalGradient
        ctx.fillRect(0, 0, 1024, 1024)
        
        // Subtle shapes
        const shapes = ['triangle', 'square', 'circle']
        const colors = ['rgba(255,255,255,0.1)', 'rgba(0,0,0,0.05)', 'rgba(200,200,255,0.08)', 'rgba(255,200,200,0.08)']
        
        for (let i = 0; i < 25; i++) {
          const shape = shapes[Math.floor(Math.random() * shapes.length)]
          const color = colors[Math.floor(Math.random() * colors.length)]
          const x = Math.random() * 1024
          const y = Math.random() * 1024
          const size = 30 + Math.random() * 80
          
          ctx.fillStyle = color
          
          if (shape === 'triangle') {
            ctx.beginPath()
            ctx.moveTo(x, y - size/2)
            ctx.lineTo(x - size/2, y + size/2)
            ctx.lineTo(x + size/2, y + size/2)
            ctx.closePath()
            ctx.fill()
          } else if (shape === 'square') {
            ctx.fillRect(x - size/2, y - size/2, size, size)
          } else if (shape === 'circle') {
            ctx.beginPath()
            ctx.arc(x, y, size/2, 0, Math.PI * 2)
            ctx.fill()
          }
        }
        break

      default:
        return new THREE.Color('#f5f5f5')
    }

    if (background !== 'white' && background !== 'black' && background !== 'blue' && 
        background !== 'green' && background !== 'purple') {
      const texture = new THREE.CanvasTexture(canvas)
      texture.wrapS = THREE.ClampToEdgeWrapping
      texture.wrapT = THREE.ClampToEdgeWrapping
      texture.magFilter = THREE.LinearFilter
      texture.minFilter = THREE.LinearFilter
      return texture
    }
  }, [background])

  React.useEffect(() => {
    scene.background = backgroundTexture
  }, [scene, backgroundTexture])

  return null
}

export default BackgroundSelector
