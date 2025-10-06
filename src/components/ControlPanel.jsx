import React from 'react'

const ControlPanel = ({ 
  filter, setFilter, 
  rotationUnique, setRotationUnique, 
  edgeStyle, setEdgeStyle,
  background, setBackground 
}) => {
  const getFilterDescription = (filterValue) => {
    switch(filterValue) {
      case 'connected_noface':
        return 'Connected structures with no complete triangular faces - true "incomplete" tetrahedra.'
      case 'connected':
        return 'All connected structures, including those with complete faces.'
      case 'all':
        return 'Every possible non-empty edge combination between 4 vertices.'
      default:
        return ''
    }
  }

  return (
    <div className="control-panel">
      {/* Structure Filters Section */}
      <div className="panel-section">
        <div className="section-header">
          <h3>🔍 Structure Filters</h3>
        </div>
        
        <div className="filter-group">
          <div className="filter-options">
            <div 
              className={`filter-card ${filter === 'connected_noface' ? 'selected' : ''}`}
              onClick={() => setFilter('connected_noface')}
            >
              <div className="filter-title">
                🔺 Valid Incomplete 
                <span className="filter-badge">Recommended</span>
              </div>
            </div>
            
            <div 
              className={`filter-card ${filter === 'connected' ? 'selected' : ''}`}
              onClick={() => setFilter('connected')}
            >
              <div className="filter-title">🔗 All Connected</div>
            </div>
            
            <div 
              className={`filter-card ${filter === 'all' ? 'selected' : ''}`}
              onClick={() => setFilter('all')}
            >
              <div className="filter-title">📊 All Combinations</div>
            </div>
          </div>
          
          <div className="filter-description">
            {getFilterDescription(filter)}
          </div>
        </div>
        
        <div className="control-group">
          <label className="checkbox-container">
            <div className="checkbox-row">
              <input 
                type="checkbox" 
                checked={rotationUnique} 
                onChange={(e) => setRotationUnique(e.target.checked)}
              />
              <span className="checkbox-label">Show Canonical Forms Only</span>
            </div>
            <div className="checkbox-description">
              Shows one representative from each rotationally equivalent group
            </div>
          </label>
        </div>
      </div>
      
      {/* Environment Section */}
      <div className="panel-section environment-section">
        <div className="section-header">
          <h3>🎨 Environment</h3>
        </div>
        
        <div className="background-grid">
          <div 
            className={`bg-option ${background === 'space' ? 'selected' : ''}`}
            onClick={() => setBackground('space')}
          >
            <div className="bg-preview space-preview"></div>
            <span>Space</span>
          </div>
          
          <div 
            className={`bg-option ${background === 'night-sky' ? 'selected' : ''}`}
            onClick={() => setBackground('night-sky')}
          >
            <div className="bg-preview night-preview"></div>
            <span>Night</span>
          </div>
          
          <div 
            className={`bg-option ${background === 'ocean' ? 'selected' : ''}`}
            onClick={() => setBackground('ocean')}
          >
            <div className="bg-preview ocean-preview"></div>
            <span>Ocean</span>
          </div>
          
          <div 
            className={`bg-option ${background === 'garden' ? 'selected' : ''}`}
            onClick={() => setBackground('garden')}
          >
            <div className="bg-preview garden-preview"></div>
            <span>Garden</span>
          </div>
          
          <div 
            className={`bg-option ${background === 'black' ? 'selected' : ''}`}
            onClick={() => setBackground('black')}
          >
            <div className="bg-preview black-preview"></div>
            <span>Black</span>
          </div>
          
          <div 
            className={`bg-option ${background === 'blue' ? 'selected' : ''}`}
            onClick={() => setBackground('blue')}
          >
            <div className="bg-preview blue-preview"></div>
            <span>Blue</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ControlPanel
