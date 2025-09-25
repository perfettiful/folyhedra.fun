import React, { useState, useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import './App.css'
import TetrahedraScene from './components/TetrahedraScene'
import ControlPanel from './components/ControlPanel'
import InfoPanel from './components/InfoPanel'
import AnimatedCloseupView from './components/AnimatedCloseupView'
import CloseupInfoPanel from './components/CloseupInfoPanel'
import BackgroundSelector from './components/BackgroundSelector'
import RetroTextbox from './components/RetroTextbox'
import InspectionToolbar from './components/InspectionToolbar'

function App() {
  const [filter, setFilter] = useState('connected_noface')
  const [rotationUnique, setRotationUnique] = useState(true)
  const [edgeStyle, setEdgeStyle] = useState('solid')
  const [background, setBackground] = useState('space')
  const [selectedTetra, setSelectedTetra] = useState(null)
  const [isCloseupMode, setIsCloseupMode] = useState(false)
  const [tetrahedraCount, setTetrahedraCount] = useState(0)
  const [originalPosition, setOriginalPosition] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [shouldExit, setShouldExit] = useState(false)
  const [isRetroTextboxOpen, setIsRetroTextboxOpen] = useState(false)
  const [inspectionControls, setInspectionControls] = useState({
    isAutoRotating: false,
    isWireframe: false
  })
  const rotationCommandRef = useRef(null)


  const handleSelectTetra = (tetra) => {
    setOriginalPosition(tetra.position)
    setSelectedTetra(tetra)
    setIsCloseupMode(true)
    setIsAnimating(true)
  }

  const handleDismissCloseup = () => {
    setShouldExit(true)
  }

  const handleAnimationComplete = () => {
    setIsAnimating(false)
  }

  const handleActualDismiss = () => {
    setIsCloseupMode(false)
    setSelectedTetra(null)
    setOriginalPosition(null)
    setIsAnimating(false)
    setShouldExit(false)
  }

  const handleCanvasClick = (event) => {
    // Dismiss closeup when clicking on empty space
    if (isCloseupMode && event.target === event.currentTarget) {
      handleDismissCloseup()
    }
  }

  return (
    <div className="app">
      {!isCloseupMode && (
        <ControlPanel
          filter={filter}
          setFilter={setFilter}
          rotationUnique={rotationUnique}
          setRotationUnique={setRotationUnique}
          edgeStyle={edgeStyle}
          setEdgeStyle={setEdgeStyle}
          background={background}
          setBackground={setBackground}
        />
      )}
      
      {!isCloseupMode && <InfoPanel selectedTetra={selectedTetra} />}
      
      {isCloseupMode && (
        <>
          <CloseupInfoPanel 
            tetraData={selectedTetra} 
            onDismiss={handleDismissCloseup}
          />
          <InspectionToolbar 
            onRotate={(direction) => {
              rotationCommandRef.current = direction
            }}
            onReset={() => {
              rotationCommandRef.current = 'reset'
            }}
            onToggleAutoRotate={() => setInspectionControls(prev => ({...prev, isAutoRotating: !prev.isAutoRotating}))}
            onToggleWireframe={() => setInspectionControls(prev => ({...prev, isWireframe: !prev.isWireframe}))}
            isAutoRotating={inspectionControls.isAutoRotating}
            isWireframe={inspectionControls.isWireframe}
          />
        </>
      )}
      
      <div 
        className={`canvas-container ${isCloseupMode ? 'closeup-mode' : ''}`} 
        onClick={handleCanvasClick}
      >
        <Canvas
          camera={{ position: [8, 8, 8], fov: 45 }}
          shadows
        >
          <BackgroundSelector 
            background={background} 
            onPolarisClick={() => setIsRetroTextboxOpen(true)}
          />
          
          {!isCloseupMode ? (
            <>
              <TetrahedraScene
                filter={filter}
                rotationUnique={rotationUnique}
                edgeStyle={edgeStyle}
                onSelectTetra={handleSelectTetra}
                onCountUpdate={setTetrahedraCount}
                selectedTetra={selectedTetra}
                isCloseupMode={isCloseupMode}
              />
              <OrbitControls
                enableDamping
                dampingFactor={0.06}
                minDistance={8.0}
                maxDistance={40.0}
                target={[0, -0.5, 0]}
                enableZoom={true}
                zoomSpeed={0.5}
                enablePan={true}
                panSpeed={0.8}
                makeDefault
              />
            </>
          ) : (
            <AnimatedCloseupView
              tetraData={selectedTetra}
              edgeStyle={edgeStyle}
              originalPosition={originalPosition}
              onDismiss={handleActualDismiss}
              onAnimationComplete={handleAnimationComplete}
              shouldExit={shouldExit}
              inspectionControls={inspectionControls}
              rotationCommandRef={rotationCommandRef}
            />
          )}
        </Canvas>
      </div>
      
      {!isCloseupMode && (
        <div className="dynamic-hint">
          <div className="hint-content">
            <span className="hint-icon">💡</span>
            <span>
              {filter === 'connected_noface' 
                ? `Showing ${tetrahedraCount} valid incomplete tetrahedra (connected, no full faces)`
                : filter === 'connected'
                ? `Showing ${tetrahedraCount} connected structures`
                : `Showing ${tetrahedraCount} non-empty structures`
              }
              {rotationUnique ? ' • Canonical forms only' : ' • All rotational variants'}
            </span>
          </div>
          <div className="hint-secondary">
            Click any tetrahedron to inspect it in 3D • Use filters to explore different types
          </div>
        </div>
      )}
      
      {isCloseupMode && (
        <div className="closeup-hint">
          <span className="hint-icon">🔍</span>
          <span>Use the rotation gizmo to examine the structure • Click X or outside to return</span>
        </div>
      )}
      
      <RetroTextbox 
        isOpen={isRetroTextboxOpen}
        onClose={() => setIsRetroTextboxOpen(false)}
      />
    </div>
  )
}

export default App