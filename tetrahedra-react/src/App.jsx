import React, { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import './App.css'
import TetrahedraScene from './components/TetrahedraScene'
import ControlPanel from './components/ControlPanel'
import InfoPanel from './components/InfoPanel'
import BackgroundSelector from './components/BackgroundSelector'

function App() {
  const [filter, setFilter] = useState('connected_noface')
  const [rotationUnique, setRotationUnique] = useState(true)
  const [edgeStyle, setEdgeStyle] = useState('solid')
  const [background, setBackground] = useState('night-sky')
  const [selectedTetra, setSelectedTetra] = useState(null)

  return (
    <div className="app">
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
      
      <InfoPanel selectedTetra={selectedTetra} />
      
      <div className="canvas-container">
        <Canvas
          camera={{ position: [4.5, 4.0, 7.0], fov: 50 }}
          shadows
        >
          <BackgroundSelector background={background} />
          <TetrahedraScene
            filter={filter}
            rotationUnique={rotationUnique}
            edgeStyle={edgeStyle}
            onSelectTetra={setSelectedTetra}
          />
          <OrbitControls
            enableDamping
            dampingFactor={0.06}
            minDistance={2.0}
            maxDistance={30.0}
            target={[0, 0.6, 0]}
          />
        </Canvas>
      </div>
      
      <div className="hint">
        Tip: toggle "Rotation-unique" to see canonical reps vs. all variants.
      </div>
    </div>
  )
}

export default App