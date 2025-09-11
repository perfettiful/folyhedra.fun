import React, { useState, useEffect } from 'react'

const InfoPanel = ({ selectedTetra }) => {
  const [rating, setRating] = useState(0)

  useEffect(() => {
    if (selectedTetra) {
      const stored = localStorage.getItem(`tetra-rating:${selectedTetra.canonical}`)
      setRating(stored ? parseInt(stored, 10) : 0)
    }
  }, [selectedTetra])

  const handleRating = (newRating) => {
    if (selectedTetra) {
      localStorage.setItem(`tetra-rating:${selectedTetra.canonical}`, String(newRating))
      setRating(newRating)
    }
  }

  if (!selectedTetra) {
    return (
      <div className="info-panel">
        <h2>Select a figure</h2>
        <div className="kv">
          Click a tetra to see details.
        </div>
        <div style={{ marginTop: '8px' }}>
          <span style={{ fontSize: '12px', opacity: 0.9 }}>Rate:</span>
          <div className="rating"></div>
        </div>
        <div className="controls-info">
          Controls: drag to orbit · wheel to zoom · right-drag to pan · drag a shape to move it.<br/>
          Three.js <a href="https://threejs.org/" target="_blank" rel="noreferrer">docs</a>
        </div>
      </div>
    )
  }

  const bits = (selectedTetra.mask >>> 0).toString(2).padStart(6, '0')
  const hex = '0x' + (selectedTetra.mask >>> 0).toString(16).toUpperCase().padStart(2, '0')

  return (
    <div className="info-panel">
      <h2>Figure #{selectedTetra.idx + 1}</h2>
      <div className="kv">
        <b>Mask:</b> {selectedTetra.mask} ({hex}, bits {bits})<br/>
        <b>Edges:</b> {selectedTetra.edgeCount} &nbsp; <b>Degrees:</b> [{selectedTetra.degrees.join(', ')}]<br/>
        <b>Connected:</b> {selectedTetra.connected ? 'Yes' : 'No'} &nbsp; <b>Full face:</b> {selectedTetra.hasFace ? 'Yes' : 'No'}<br/>
        <b>Canonical:</b> {selectedTetra.canonical} &nbsp; <b>Orbit size:</b> {selectedTetra.orbitSize}<br/>
        <b>Label:</b> {selectedTetra.label}
      </div>
      
      <div style={{ marginTop: '8px' }}>
        <span style={{ fontSize: '12px', opacity: 0.9 }}>Rate:</span>
        <div className="rating">
          {[1, 2, 3, 4, 5].map(star => (
            <span
              key={star}
              className={`star ${rating >= star ? 'on' : ''}`}
              onClick={() => handleRating(star)}
            >
              ★
            </span>
          ))}
        </div>
      </div>
      
      <div className="controls-info">
        Controls: drag to orbit · wheel to zoom · right-drag to pan · drag a shape to move it.<br/>
        Three.js <a href="https://threejs.org/" target="_blank" rel="noreferrer">docs</a>
      </div>
    </div>
  )
}

export default InfoPanel
