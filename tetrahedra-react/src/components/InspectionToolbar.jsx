import React, { useState } from 'react'

const InspectionToolbar = ({ onRotate, onReset, onToggleAutoRotate, onToggleWireframe, isAutoRotating, isWireframe }) => {
  const [activeButton, setActiveButton] = useState(null)
  const [showCopyAnimation, setShowCopyAnimation] = useState(false)

  const handleButtonPress = (action, direction = null) => {
    setActiveButton(direction || action)
    setTimeout(() => setActiveButton(null), 150)
    
    switch(action) {
      case 'rotate':
        onRotate(direction)
        break
      case 'reset':
        onReset()
        break
      case 'auto-rotate':
        onToggleAutoRotate()
        break
      case 'wireframe':
        onToggleWireframe()
        break
      case 'copy':
        setShowCopyAnimation(true)
        setTimeout(() => setShowCopyAnimation(false), 1000)
        navigator.clipboard?.writeText(`Tetrahedron mask: ${Math.random()}`)
        break
    }
  }

  return (
    <div className="inspection-toolbar">
      {/* View & Analysis Controls */}
      <div className="tool-section" title="View and analysis tools for detailed inspection">
        <h4>👁️ Controls</h4>
        <div className="tool-buttons-stacked">
          <div className="tool-row">
            <button 
              className={`tool-btn ${isAutoRotating ? 'active' : ''} ${activeButton === 'auto-rotate' ? 'pressed' : ''}`}
              onClick={() => handleButtonPress('auto-rotate')}
              title="Auto-Rotate: Smooth automatic rotation to view all angles"
            >
              {isAutoRotating ? '⏸️' : '🔄'}
            </button>
            <button 
              className={`tool-btn ${isWireframe ? 'active' : ''} ${activeButton === 'wireframe' ? 'pressed' : ''}`}
              onClick={() => handleButtonPress('wireframe')}
              title="Wireframe: Show geometric structure as lines only"
            >
              📐
            </button>
          </div>
          <div className="tool-row">
            <button 
              className={`tool-btn ${showCopyAnimation ? 'copy-success' : ''}`}
              onClick={() => handleButtonPress('copy')}
              title="Copy: Copy tetrahedron properties to clipboard"
            >
              {showCopyAnimation ? '✓' : '📋'}
            </button>
            <button 
              className="tool-btn"
              title="Measurements: Show edge lengths, angles, and distances"
            >
              📏
            </button>
          </div>
        </div>
      </div>

      {/* Circular D-Pad Compass */}
      <div className="tool-section" title="Precise rotation controls with 45° and 90° increments">
        <h4>🧭 Rotate</h4>
        <div className="circular-dpad">
          {/* 90° Cardinal directions */}
          <button 
            className={`dpad-btn dpad-north ${activeButton === 'up' ? 'active' : ''}`}
            onClick={() => handleButtonPress('rotate', 'up')}
            title="Pitch Up 90°: Rotate around X-axis upward"
          >
            ↑
          </button>
          
          {/* 45° Diagonal: Northeast */}
          <button 
            className={`dpad-btn dpad-northeast ${activeButton === 'up-right' ? 'active' : ''}`}
            onClick={() => handleButtonPress('rotate', 'up-right')}
            title="Diagonal Up-Right 45°: Combined X and Y rotation"
          >
            ↗
          </button>
          
          <button 
            className={`dpad-btn dpad-east ${activeButton === 'right' ? 'active' : ''}`}
            onClick={() => handleButtonPress('rotate', 'right')}
            title="Yaw Right 90°: Rotate around Y-axis clockwise"
          >
            →
          </button>
          
          {/* 45° Diagonal: Southeast */}
          <button 
            className={`dpad-btn dpad-southeast ${activeButton === 'down-right' ? 'active' : ''}`}
            onClick={() => handleButtonPress('rotate', 'down-right')}
            title="Diagonal Down-Right 45°: Combined X and Y rotation"
          >
            ↘
          </button>
          
          <button 
            className={`dpad-btn dpad-south ${activeButton === 'down' ? 'active' : ''}`}
            onClick={() => handleButtonPress('rotate', 'down')}
            title="Pitch Down 90°: Rotate around X-axis downward"
          >
            ↓
          </button>
          
          {/* 45° Diagonal: Southwest */}
          <button 
            className={`dpad-btn dpad-southwest ${activeButton === 'down-left' ? 'active' : ''}`}
            onClick={() => handleButtonPress('rotate', 'down-left')}
            title="Diagonal Down-Left 45°: Combined X and Y rotation"
          >
            ↙
          </button>
          
          <button 
            className={`dpad-btn dpad-west ${activeButton === 'left' ? 'active' : ''}`}
            onClick={() => handleButtonPress('rotate', 'left')}
            title="Yaw Left 90°: Rotate around Y-axis counter-clockwise"
          >
            ←
          </button>
          
          {/* 45° Diagonal: Northwest */}
          <button 
            className={`dpad-btn dpad-northwest ${activeButton === 'up-left' ? 'active' : ''}`}
            onClick={() => handleButtonPress('rotate', 'up-left')}
            title="Diagonal Up-Left 45°: Combined X and Y rotation"
          >
            ↖
          </button>
          
          {/* Center Reset */}
          <button 
            className={`dpad-btn dpad-center ${activeButton === 'reset' ? 'active' : ''}`}
            onClick={() => handleButtonPress('reset')}
            title="Reset: Return to original orientation (0°, 0°, 0°)"
          >
            🏠
          </button>
        </div>
      </div>
    </div>
  )
}

export default InspectionToolbar
