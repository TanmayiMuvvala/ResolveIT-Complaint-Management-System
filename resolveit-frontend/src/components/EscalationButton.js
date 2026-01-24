import { useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../services/api';
import { useUIState } from '../hooks/useUIState';
import UIStateMessage from './UIStateMessage';

export default function EscalationButton({ complaintId, onEscalated }) {
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');
  const uiState = useUIState();

  const handleEscalate = async () => {
    if (!reason.trim()) {
      uiState.setError('Please provide a reason for escalation');
      return;
    }

    uiState.setLoading();

    try {
      const res = await api.post(`/api/escalations/${complaintId}`, { reason });
      
      if (res.data.status === 'success') {
        uiState.setSuccess('Complaint escalated successfully!');
        setTimeout(() => {
          setShowModal(false);
          setReason('');
          uiState.reset();
          if (onEscalated) onEscalated();
        }, 2000);
      } else {
        uiState.setError(res.data.message);
      }
    } catch (err) {
      uiState.setError('Failed to escalate complaint. Please try again.');
    }
  };

  const handleRetry = () => {
    uiState.reset();
  };

  const handleCloseModal = () => {
    if (!uiState.isLoading) {
      setShowModal(false);
      setReason('');
      uiState.reset();
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          background: '#ff4444',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        ⚡ Escalate to Admin
      </button>

      {/* PORTAL MODAL - RENDERS OUTSIDE ALL COMPONENTS */}
      {showModal && createPortal(
        <>
          <div
            onClick={handleCloseModal}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.8)',
              zIndex: 2147483647,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            width: '400px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto',
            zIndex: 2147483647,
            boxShadow: '0 25px 100px rgba(0,0,0,0.8)',
            border: '3px solid #ff4444'
          }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#ff4444', textAlign: 'center' }}>
              ⚡ ESCALATE COMPLAINT
            </h2>

            <p style={{ margin: '0 0 20px 0', fontSize: '16px', textAlign: 'center' }}>
              Escalate to senior management. Provide reason:
            </p>

            <UIStateMessage 
              state={uiState.state} 
              message={uiState.message} 
              onRetry={handleRetry}
            />

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for escalation..."
              style={{
                width: '100%',
                height: '100px',
                padding: '12px',
                border: '2px solid #ff4444',
                borderRadius: '8px',
                fontSize: '16px',
                marginBottom: '25px',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                resize: 'none'
              }}
              disabled={uiState.isLoading || uiState.isSuccess}
            />

            <div style={{ 
              display: 'flex', 
              gap: '15px', 
              justifyContent: 'center'
            }}>
              <button
                onClick={handleCloseModal}
                disabled={uiState.isLoading}
                style={{
                  padding: '12px 24px',
                  background: uiState.isLoading ? '#ccc' : '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: uiState.isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                CANCEL
              </button>
              
              <button
                onClick={handleEscalate}
                disabled={uiState.isLoading || uiState.isSuccess}
                style={{
                  padding: '12px 24px',
                  background: (uiState.isLoading || uiState.isSuccess) ? '#ccc' : '#ff4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: (uiState.isLoading || uiState.isSuccess) ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  minWidth: '120px'
                }}
              >
                {uiState.isLoading ? 'ESCALATING...' : uiState.isSuccess ? '✅ ESCALATED!' : 'ESCALATE NOW'}
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}