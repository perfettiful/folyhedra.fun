import React from 'react'

const PolarisModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="polaris-modal-overlay" onClick={onClose}>
      <div className="polaris-modal" onClick={(e) => e.stopPropagation()}>
        <div className="polaris-header">
          <h2>⭐ Polaris - The North Star</h2>
          <button className="dismiss-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="polaris-content">
          <div className="polaris-section">
            <h3>🧭 Navigation</h3>
            <p>
              Polaris has been humanity's guiding star for thousands of years. 
              Located almost exactly at the North Celestial Pole, it appears stationary 
              while all other stars rotate around it.
            </p>
          </div>

          <div className="polaris-section">
            <h3>🔺 Mathematical Connection</h3>
            <p>
              Just as Polaris is the fixed point around which the heavens turn, 
              the tetrahedron is a fundamental shape in geometry - the simplest 
              3D polyhedron, with perfect symmetry and minimal complexity.
            </p>
          </div>

          <div className="polaris-section">
            <h3>✨ Easter Egg</h3>
            <p>
              You found the hidden constellation easter egg! Look around the night sky 
              to spot <strong>Cassiopeia</strong> (the W-shaped constellation on the left) 
              and the <strong>Big Dipper</strong> (the ladle shape on the right).
            </p>
          </div>

          <div className="polaris-section">
            <h3>🎯 About This Project</h3>
            <p>
              This explorer examines all possible ways to connect the vertices of a 
              tetrahedron with edges, creating incomplete tetrahedral structures. 
              Each represents a different subgraph of the complete tetrahedral graph K₄.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PolarisModal
