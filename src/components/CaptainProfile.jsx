import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaMotorcycle, FaPhone, FaEnvelope, FaIdCard, FaStar, FaShieldAlt } from 'react-icons/fa';

const CaptainProfile = () => {
  const { user } = useContext(AuthContext);

  if (!user) return <div className="cdl-loading">Loading profile...</div>;

  const fields = [
    { label: 'Full Name',      value: user.name,          icon: <FaIdCard /> },
    { label: 'Phone',          value: user.phone,         icon: <FaPhone /> },
    { label: 'Email',          value: user.email,         icon: <FaEnvelope /> },
    { label: 'Vehicle Type',   value: user.vehicleType,   icon: <FaMotorcycle /> },
    { label: 'Vehicle Number', value: user.vehicleNumber, icon: <FaIdCard /> },
    { label: 'Rating',         value: user.rating || '5.0', icon: <FaStar /> },
    { label: 'Captain ID',     value: user.customId,      icon: <FaShieldAlt /> },
  ];

  return (
    <div>
      <div className="cdl-profile-card">
        {/* Top */}
        <div className="cdl-profile-top">
          <div className="cdl-profile-av">{user.name?.[0]?.toUpperCase()}</div>
          <div>
            <div className="cdl-profile-name">{user.name}</div>
            <div className="cdl-profile-id">{user.customId}</div>
            <div>
              <span className={`cdl-approval-chip ${user.approvalStatus}`}>
                {user.approvalStatus === 'approved' ? '✅' : user.approvalStatus === 'pending' ? '⏳' : '❌'} {user.approvalStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Fields */}
        <div className="cdl-profile-grid">
          {fields.map((f, i) => (
            <div key={i} className="cdl-profile-field">
              <div className="cdl-profile-field-lbl">{f.label}</div>
              <div className="cdl-profile-field-val" style={{ textTransform: f.label === 'Vehicle Type' ? 'capitalize' : 'none' }}>
                {f.value || '—'}
              </div>
            </div>
          ))}
        </div>

        {/* Photos */}
        {(user.photo || user.vehiclePhoto) && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #1E1E1E', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {user.photo && (
              <div>
                <div className="cdl-profile-field-lbl" style={{ marginBottom: '0.75rem' }}>Profile Photo</div>
                <img src={user.photo} alt="Captain" style={{ width: 90, height: 90, borderRadius: '12px', objectFit: 'cover', border: '2px solid #1E1E1E' }} />
              </div>
            )}
            {user.vehiclePhoto && (
              <div>
                <div className="cdl-profile-field-lbl" style={{ marginBottom: '0.75rem' }}>Vehicle Photo</div>
                <img src={user.vehiclePhoto} alt="Vehicle" style={{ width: 140, height: 90, borderRadius: '12px', objectFit: 'cover', border: '2px solid #1E1E1E' }} />
              </div>
            )}
          </div>
        )}

        {/* Note */}
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#1A1A1A', borderRadius: '12px', border: '1px solid #222' }}>
          <div style={{ fontSize: '0.72rem', color: '#555', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.4rem' }}>Note</div>
          <div style={{ fontSize: '0.82rem', color: '#666', lineHeight: 1.6 }}>
            To update your profile details or vehicle information, please contact support or visit the nearest TaxiNova service center.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaptainProfile;
