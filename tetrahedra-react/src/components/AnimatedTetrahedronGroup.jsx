import React, { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import TetrahedronGroup from './TetrahedronGroup'

const AnimatedTetrahedronGroup = ({ tetraData, edgeStyle, onSelect, visible, isNew }) => {
  const groupRef = useRef()
  const [opacity, setOpacity] = useState(isNew ? 0 : 1)
  const [shouldRemove, setShouldRemove] = useState(false)

  useEffect(() => {
    if (visible && isNew) {
      // Fade in new tetrahedra
      setOpacity(0)
      const timer = setTimeout(() => setOpacity(1), 50)
      return () => clearTimeout(timer)
    } else if (!visible && !isNew) {
      // Fade out existing tetrahedra
      setOpacity(0)
      const timer = setTimeout(() => setShouldRemove(true), 300)
      return () => clearTimeout(timer)
    }
  }, [visible, isNew])

  // Smooth opacity animation
  useFrame((state, delta) => {
    if (groupRef.current) {
      const targetOpacity = visible ? 1 : 0
      const currentOpacity = groupRef.current.children[0]?.material?.opacity || opacity
      
      if (Math.abs(currentOpacity - targetOpacity) > 0.01) {
        const newOpacity = THREE.MathUtils.lerp(currentOpacity, targetOpacity, delta * 8)
        
        // Update all materials in the group
        groupRef.current.traverse((child) => {
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                if (mat.transparent !== undefined) {
                  mat.transparent = true
                  mat.opacity = newOpacity
                }
              })
            } else if (child.material.transparent !== undefined) {
              child.material.transparent = true
              child.material.opacity = newOpacity
            }
          }
        })
        
        setOpacity(newOpacity)
      }
    }
  })

  if (shouldRemove) return null

  return (
    <group ref={groupRef}>
      <TetrahedronGroup
        tetraData={tetraData}
        edgeStyle={edgeStyle}
        onSelect={onSelect}
        visible={true}
      />
    </group>
  )
}

export default AnimatedTetrahedronGroup
