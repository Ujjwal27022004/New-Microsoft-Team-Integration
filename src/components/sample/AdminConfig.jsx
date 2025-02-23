import React, { useState, useEffect } from 'react';
import './AdminConfig.css'; // Create this CSS file


const AdminConfig = () => {
  const [configTree, setConfigTree] = useState({});
  const [configStates, setConfigStates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch configurations from API
  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/schema');
        if (!response.ok) throw new Error('Failed to fetch configurations');
        
        const data = await response.json();
        const validConfigs = data.filter(item => item.fieldName);
        
        // Initialize state and build configuration tree
        const states = {};
        const tree = { children: {} };
        
        validConfigs.forEach(config => {
          states[config._id] = config.isEnabled;
          buildConfigTree(tree, config);
        });

        setConfigStates(states);
        setConfigTree(tree);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchConfigs();
  }, []);

  // Build hierarchical configuration tree
  const buildConfigTree = (root, config) => {
    const parts = config.fieldName.split('.');
    let currentNode = root;
    
    parts.forEach((part, index) => {
      if (!currentNode.children[part]) {
        currentNode.children[part] = {
          name: part,
          children: {},
          config: index === parts.length - 1 ? config : null
        };
      }
      currentNode = currentNode.children[part];
    });
  };

  // Handle checkbox toggle
  const handleToggle = (configId) => {
    setConfigStates(prev => ({
      ...prev,
      [configId]: !prev[configId]
    }));
  };

  // Save all configuration changes
  const handleSave = async () => {
    const updates = Object.entries(configStates).map(([id, isEnabled]) => ({
      id,
      isEnabled
    }));

    try {
      const response = await fetch('http://localhost:5000/api/schema/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      });

      if (!response.ok) throw new Error('Update failed');
      alert('Configurations updated successfully!');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Recursive component to render configuration tree
  const ConfigNode = ({ node, depth = 0 }) => (
    <div className="config-node" style={{ marginLeft: `${depth * 32}px` }}>
      {node.config ? (
        <label className="config-item">
          <input
            type="checkbox"
            checked={configStates[node.config._id]}
            onChange={() => handleToggle(node.config._id)}
          />
          <span>{node.name}</span>
        </label>
      ) : (
        <div className="config-group">{node.name}</div>
      )}
      {Object.values(node.children).map(child => (
        <ConfigNode key={child.name} node={child} depth={depth + 1} />
      ))}
    </div>
  );

  if (loading) return <div className="loading">Loading configurations...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="admin-config">
      <header className="header">
        <h1>Admin Notification Configuration</h1>
        <button className="save-button" onClick={handleSave}>
          Update Configurations
        </button>
      </header>

      <div className="config-tree">
        {Object.values(configTree.children).map(node => (
          <ConfigNode key={node.name} node={node} />
        ))}
      </div>
    </div>
  );
};

export default AdminConfig;

// Add CSS for styling
