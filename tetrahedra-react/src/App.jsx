import React, { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import './App.css'
import TetrahedraScene from './components/TetrahedraScene'
import ControlPanel from './components/ControlPanel'
import InfoPanel from './components/InfoPanel'
import CloseupView from './components/CloseupView'
import CloseupInfoPanel from './components/CloseupInfoPanel'
import BackgroundSelector from './components/BackgroundSelector'

function App() {
  const [filter, setFilter] = useState('connected_noface')
  const [rotationUnique, setRotationUnique] = useState(true)
  const [edgeStyle, setEdgeStyle] = useState('solid')
  const [background, setBackground] = useState('night-sky')
  const [selectedTetra, setSelectedTetra] = useState(null)
  const [isCloseupMode, setIsCloseupMode] = useState(false)
  const [tetrahedraCount, setTetrahedraCount] = useState(0)

  const handleSelectTetra = (tetra) => {
    setSelectedTetra(tetra)
    setIsCloseupMode(true)
  }

  const handleDismissCloseup = () => {
    setIsCloseupMode(false)
    setSelectedTetra(null)
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
        <CloseupInfoPanel 
          tetraData={selectedTetra} 
          onDismiss={handleDismissCloseup}
        />
      )}
      
      <div 
        className={`canvas-container ${isCloseupMode ? 'closeup-mode' : ''}`} 
        onClick={handleCanvasClick}
      >
        <Canvas
          camera={{ position: [4.5, 4.0, 7.0], fov: 50 }}
          shadows
        >
          <BackgroundSelector background={background} />
          
          {!isCloseupMode ? (
            <>
              <TetrahedraScene
                filter={filter}
                rotationUnique={rotationUnique}
                edgeStyle={edgeStyle}
                onSelectTetra={handleSelectTetra}
                onCountUpdate={setTetrahedraCount}
              />
              <OrbitControls
                enableDamping
                dampingFactor={0.06}
                minDistance={2.0}
                maxDistance={30.0}
                target={[0, 0.6, 0]}
                enableZoom={true}
                zoomSpeed={0.3}
              />
            </>
          ) : (
            <>
              <CloseupView
                tetraData={selectedTetra}
                edgeStyle={edgeStyle}
                onDismiss={handleDismissCloseup}
              />
              <OrbitControls
                enableDamping
                dampingFactor={0.03}
                minDistance={1.0}
                maxDistance={8.0}
                target={[0, 0, 0]}
                enableZoom={true}
                zoomSpeed={0.2}
              />
            </>
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
    </div>
  )
}

export default App