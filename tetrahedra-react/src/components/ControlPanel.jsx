import React from 'react'

const ControlPanel = ({ 
  filter, setFilter, 
  rotationUnique, setRotationUnique, 
  edgeStyle, setEdgeStyle,
  background, setBackground 
}) => {
  return (
    <div className="control-panel">
      <div className="control-group">
        <label>Structure Type:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="connected_noface">🔺 Valid Incomplete (Recommended)</option>
          <option value="connected">🔗 All Connected Structures</option>
          <option value="all">📊 All Non-Empty Combinations</option>
        </select>
      </div>
      
      <div className="control-group">
        <label className="checkbox-group">
          <input 
            type="checkbox" 
            checked={rotationUnique} 
            onChange={(e) => setRotationUnique(e.target.checked)}
          />
          🔄 Show Canonical Forms Only
        </label>
      </div>
      
      
      <div className="control-group">
        <label>🎨 Scene Background:</label>
        <select value={background} onChange={(e) => setBackground(e.target.value)}>
          <option value="space">🚀 Deep Space</option>
          <option value="night-sky">🌌 Night Sky</option>
          <option value="ocean">🌊 Ocean</option>
          <option value="black">⚫ Black</option>
          <option value="blue">🔵 Blue</option>
        </select>
      </div>
    </div>
  )
}

export default ControlPanel
