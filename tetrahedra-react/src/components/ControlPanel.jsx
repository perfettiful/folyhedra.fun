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
        <label>Filter:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="connected_noface">Connected + No Full Face (valid)</option>
          <option value="connected">Connected</option>
          <option value="all">All non-empty (no full)</option>
        </select>
      </div>
      
      <div className="control-group">
        <label className="checkbox-group">
          <input 
            type="checkbox" 
            checked={rotationUnique} 
            onChange={(e) => setRotationUnique(e.target.checked)}
          />
          Rotation-unique
        </label>
      </div>
      
      <div className="control-group">
        <label>Edge style:</label>
        <select value={edgeStyle} onChange={(e) => setEdgeStyle(e.target.value)}>
          <option value="solid">Solid</option>
          <option value="wire">Wireframe</option>
        </select>
      </div>
      
      <div className="control-group">
        <label>Background:</label>
        <select value={background} onChange={(e) => setBackground(e.target.value)}>
          <option value="night-sky">Night Sky</option>
          <option value="sunset">Sunset</option>
          <option value="ocean">Ocean</option>
          <option value="space">Deep Space</option>
          <option value="aurora">Aurora</option>
          <option value="black">Black</option>
          <option value="white">White</option>
          <option value="blue">Blue</option>
        </select>
      </div>
    </div>
  )
}

export default ControlPanel
