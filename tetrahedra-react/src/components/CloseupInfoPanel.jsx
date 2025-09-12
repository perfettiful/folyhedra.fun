import React, { useState, useEffect } from 'react'

const CloseupInfoPanel = ({ tetraData, onDismiss }) => {
  const [rating, setRating] = useState(0)

  useEffect(() => {
    if (tetraData) {
      const stored = localStorage.getItem(`tetra-rating:${tetraData.canonical}`)
      setRating(stored ? parseInt(stored, 10) : 0)
    }
  }, [tetraData])

  const handleRating = (newRating) => {
    if (tetraData) {
      localStorage.setItem(`tetra-rating:${tetraData.canonical}`, String(newRating))
      setRating(newRating)
    }
  }

  if (!tetraData) return null

  const bits = (tetraData.mask >>> 0).toString(2).padStart(6, '0')
  const hex = '0x' + (tetraData.mask >>> 0).toString(16).toUpperCase().padStart(2, '0')

  return (
    <div className="closeup-info-panel">
      <div className="closeup-header">
        <h2>Figure #{tetraData.idx + 1} - Detailed View</h2>
        <button className="dismiss-btn" onClick={onDismiss}>×</button>
      </div>
      
      <div className="closeup-content">
        <div className="info-section">
          <h3>Basic Properties</h3>
          <div className="kv">
            <div><b>Mask:</b> {tetraData.mask} ({hex})</div>
            <div><b>Binary:</b> {bits}</div>
            <div><b>Edges:</b> {tetraData.edgeCount}</div>
            <div><b>Label:</b> {tetraData.label}</div>
          </div>
        </div>

        <div className="info-section">
          <h3>Graph Properties</h3>
          <div className="kv">
            <div><b>Connected:</b> {tetraData.connected ? 'Yes' : 'No'}</div>
            <div><b>Has Full Face:</b> {tetraData.hasFace ? 'Yes' : 'No'}</div>
            <div><b>Vertex Degrees:</b> [{tetraData.degrees.join(', ')}]</div>
          </div>
        </div>

        <div className="info-section">
          <h3>Symmetry</h3>
          <div className="kv">
            <div><b>Canonical Form:</b> {tetraData.canonical}</div>
            <div><b>Orbit Size:</b> {tetraData.orbitSize}</div>
            <div><b>Unique Rotations:</b> {tetraData.orbitSize} variants</div>
          </div>
        </div>

        <div className="info-section">
          <h3>Your Rating</h3>
          <div className="rating-large">
            {[1, 2, 3, 4, 5].map(star => (
              <span
                key={star}
                className={`star-large ${rating >= star ? 'on' : ''}`}
                onClick={() => handleRating(star)}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div className="closeup-controls-info">
          <h3>3D Controls</h3>
          <div>• Use the axis gizmo to rotate the shape</div>
          <div>• Mouse wheel to zoom in/out</div>
          <div>• Right-click drag to pan around</div>
          <div>• Click X or outside to exit closeup</div>
        </div>
      </div>
    </div>
  )
}

export default CloseupInfoPanel
