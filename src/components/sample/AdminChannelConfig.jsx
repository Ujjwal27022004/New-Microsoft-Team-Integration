import React, { useState, useEffect } from 'react';

const AdminChannelConfig = () => {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [channels, setChannels] = useState([]);
  const [defaultTeams, setDefaultTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [loadingDefaults, setLoadingDefaults] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('http://localhost:5000/teams');
        if (!response.ok) throw new Error('Failed to fetch teams');
        const data = await response.json();
        setTeams(data.value);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingTeams(false);
      }
    };

    fetchTeams();
  }, []);

  useEffect(() => {
    const fetchChannels = async () => {
      if (!selectedTeam) return;
      setLoadingChannels(true);
      try {
        const response = await fetch(`http://localhost:5000/channels/${selectedTeam}`);
        if (!response.ok) throw new Error('Failed to fetch channels');
        const data = await response.json();
        setChannels(data.channels || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingChannels(false);
      }
    };

    fetchChannels();
  }, [selectedTeam]);

  useEffect(() => {
    const fetchDefaults = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/team/config');
        if (!response.ok) throw new Error('Failed to fetch default schema');
        const data = await response.json();
        setDefaultTeams([data]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingDefaults(false);
      }
    };

    fetchDefaults();
  }, []);

  const handleTeamChange = (e) => {
    setSelectedTeam(e.target.value);
    setChannels([]);
  };

  if (loadingTeams || loadingDefaults) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="channel-config" style={{ fontFamily: 'Arial, sans-serif', padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <header className="header" style={{ marginBottom: '20px' }}>
        <div className="title-group">
          <h2 style={{ margin: '0 0 10px' }}>Channel Management</h2>
          <p style={{ color: '#666' }}>Select a team to manage its channels</p>
        </div>

        <div className="team-selector">
          <select 
            value={selectedTeam} 
            onChange={handleTeamChange} 
            disabled={loadingTeams} 
            style={{ padding: '8px', width: '100%', borderRadius: '5px', border: '1px solid #ccc' }}
          >
            <option value="">Select a Team</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.displayName}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="default-section" style={{ marginBottom: '20px' }}>
        <h3>Configured Teams & Users</h3>
        {defaultTeams.length > 0 ? (
          defaultTeams.map(team => (
            <div key={team.teamId} className="default-team" style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
              <h4>{team.teamName}</h4>
              <ul>
                {team.predefinedUsers.length > 0 ? (
                  team.predefinedUsers.map(user => (
                    <li key={user.userId}>{user.userEmail}</li>
                  ))
                ) : (
                  <p>No predefined users</p>
                )}
              </ul>
            </div>
          ))
        ) : (
          <p>No predefined teams available</p>
        )}
      </div>

      {selectedTeam && (
        <div className="channel-section">
          {loadingChannels ? (
            <div className="loading">Loading channels...</div>
          ) : (
            <>
              <div className="channel-list">
                {channels.map(channel => (
                  <div key={channel.id} className="channel-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #ddd' }}>
                    <label style={{ display: 'flex', alignItems: 'center' }}>
                      <input type="checkbox" checked={channel.isEnabled || false} style={{ marginRight: '10px' }} />
                      <span className="channel-name" style={{ fontWeight: 'bold' }}>{channel.displayName}</span>
                    </label>
                    <span className="channel-type" style={{ color: '#888' }}>{channel.description || 'No description'}</span>
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
    </div>
  );
};

export default AdminChannelConfig;
