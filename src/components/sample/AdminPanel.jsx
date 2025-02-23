import React, { useState } from 'react';
import AdminConfig from './AdminConfig'; // Your existing component
import AdminChannelConfig from './AdminChannelConfig'; // New component you'll create

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('notification');

  return (
    <div className="admin-panel">
      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'notification' ? 'active' : ''}`}
          onClick={() => setActiveTab('notification')}
        >
          Notification Configuration
        </button>
        <button
          className={`tab-button ${activeTab === 'channel' ? 'active' : ''}`}
          onClick={() => setActiveTab('channel')}
        >
          Channel Configuration
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'notification' ? <AdminConfig /> : <AdminChannelConfig />}
      </div>

      <style jsx>{`
        .admin-panel {
          max-width: 1200px;
          padding: 1rem;
          font-family: 'Segoe UI', sans-serif;
        }

        .tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          border-bottom: 2px solid #eee;
          padding-bottom: 1rem;
        }

        .tab-button {
          padding: 0.8rem 2rem;
          border: none;
          background: none;
          cursor: pointer;
          border-radius: 6px;
          font-size: 1rem;
          transition: all 0.3s ease;
          color: #666;
        }

        .tab-button.active {
          background: #007bff;
          color: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .tab-button:hover:not(.active) {
          background: #f8f9fa;
        }

        .tab-content {
          padding: 1rem 0;
        }
      `}</style>
    </div>
  );
};

export default AdminPanel;