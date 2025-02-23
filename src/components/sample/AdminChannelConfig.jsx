import React, { useState, useEffect } from 'react';

const AdminChannelConfig = () => {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [channels, setChannels] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [error, setError] = useState('');

  // Fetch teams on component mount
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('http://localhost:5000/teams');
        if (!response.ok) throw new Error('Failed to fetch teams');
        const data = await response.json();
        setTeams(data.value);
        setLoadingTeams(false);
      } catch (err) {
        setError(err.message);
        setLoadingTeams(false);
      }
    };

    

    fetchTeams();
  }, []);

  // Fetch channels when team is selected
  useEffect(() => {
    const fetchChannels = async () => {
      if (!selectedTeam) return;
      
      setLoadingChannels(true);
      try {
        const response = await fetch(`http://localhost:5000/channels/${selectedTeam}`);
        if (!response.ok) throw new Error('Failed to fetch channels');
        const data = await response.json();
        setChannels(data.channels || []);
        setLoadingChannels(false);
      } catch (err) {
        setError(err.message);
        setLoadingChannels(false);
      }
    };

    fetchChannels();
  }, [selectedTeam]);

  const handleTeamChange = (e) => {
    setSelectedTeam(e.target.value);
    setChannels([]);
  };

  const handleChannelToggle = async (channelId, isEnabled) => {
    try {
      const response = await fetch(
        `http://localhost:5000/channels/${channelId}`, 
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isEnabled })
        }
      );

      if (!response.ok) throw new Error('Update failed');
      setChannels(channels.map(ch => 
        ch.id === channelId ? { ...ch, isEnabled } : ch
      ));
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loadingTeams) return <div className="loading">Loading teams...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="channel-config">
      <header className="header">
        <div className="title-group">
          <h2>Channel Management</h2>
          <p>Select a team to manage its channels</p>
        </div>
        
        <div className="team-selector">
          <select 
            value={selectedTeam} 
            onChange={handleTeamChange}
            disabled={loadingTeams}
          >
            <option value="">Select a Team</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>
                {team.displayName}
              </option>
            ))}
          </select>
        </div>
      </header>

      {selectedTeam && (
        <div className="channel-section">
          {loadingChannels ? (
            <div className="loading">Loading channels...</div>
          ) : (
            <>
              <div className="channel-list">
                {channels.map(channel => (
                  <div key={channel.id} className="channel-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={channel.isEnabled || false}
                        onChange={(e) => handleChannelToggle(channel.id, e.target.checked)}
                      />
                      <span className="channel-name">{channel.displayName}</span>
                    </label>
                    <span className="channel-type">
                      {channel.description || 'No description'}
                    </span>
                  </div>
                ))}
              </div>
              {channels.length === 0 && !loadingChannels && (
                <div className="no-channels">No channels found for this team</div>
              )}
            </>
          )}
        </div>
      )}

      {/* Keep the same styles as before */}
      <style jsx>{`
        .channel-config {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          max-width: 1000px;
          margin: 1rem auto;
          font-family: 'Inter', 'Segoe UI', sans-serif;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid #f0f2f5;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .title-group h2 {
          font-size: 1.5rem;
          color: #2d3748;
          margin-bottom: 0.5rem;
        }

        .title-group p {
          color: #718096;
          font-size: 0.95rem;
        }

        .team-selector select {
          padding: 0.8rem 1.5rem;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: white;
          font-size: 1rem;
          min-width: 300px;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 1em;
        }

        .team-selector select:focus {
          outline: none;
          border-color: #4a90e2;
          box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
        }

        .channel-section {
          margin-top: 1.5rem;
        }

        .channel-list {
          display: grid;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .channel-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-radius: 8px;
          background: white;
          border: 1px solid #e2e8f0;
          transition: all 0.2s ease;
        }

        .channel-item:hover {
          transform: translateX(4px);
          border-color: #c3dafe;
        }

        .channel-name {
          margin-left: 1rem;
          font-weight: 500;
          color: #2d3748;
        }

        .channel-type {
          color: #718096;
          font-size: 0.9em;
          max-width: 40%;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }

        input[type="checkbox"] {
          width: 20px;
          height: 20px;
          accent-color: #4a90e2;
          cursor: pointer;
        }

        .no-channels {
          text-align: center;
          padding: 2rem;
          color: #718096;
          border: 1px dashed #e2e8f0;
          border-radius: 8px;
          margin-top: 1.5rem;
        }

        .loading {
          text-align: center;
          padding: 2rem;
          color: #718096;
        }
      `}</style>
    </div>
  );
};

export default AdminChannelConfig;