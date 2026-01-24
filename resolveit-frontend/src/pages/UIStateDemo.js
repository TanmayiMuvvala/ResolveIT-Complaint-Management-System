import { useState } from 'react';
import { useUIState, UI_STATES } from '../hooks/useUIState';
import UIStateMessage from '../components/UIStateMessage';

export default function UIStateDemo() {
  const uiState = useUIState();
  const [demoMessage, setDemoMessage] = useState('');

  const handleStateChange = (state, message) => {
    switch (state) {
      case UI_STATES.IDLE:
        uiState.setIdle();
        break;
      case UI_STATES.LOADING:
        uiState.setLoading();
        break;
      case UI_STATES.SUCCESS:
        uiState.setSuccess(message || 'Operation completed successfully!');
        break;
      case UI_STATES.ERROR:
        uiState.setError(message || 'Something went wrong. Please try again.');
        break;
      default:
        break;
    }
  };

  const simulateAsyncOperation = async () => {
    uiState.setLoading();
    
    // Simulate API call
    setTimeout(() => {
      if (Math.random() > 0.5) {
        uiState.setSuccess('Async operation completed successfully!');
      } else {
        uiState.setError('Async operation failed. Please try again.');
      }
    }, 2000);
  };

  return (
    <div style={{ 
      padding: '40px', 
      maxWidth: '800px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
        UI State Management Demo
      </h1>
      
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '40px' }}>
        This demo showcases the four UI states: Idle, Loading, Success, and Error
      </p>

      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h2 style={{ marginBottom: '20px' }}>Current State Demo</h2>
        
        <UIStateMessage 
          state={uiState.state} 
          message={uiState.message} 
          onRetry={() => uiState.reset()}
        />

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '10px',
          marginTop: '20px'
        }}>
          <button
            onClick={() => handleStateChange(UI_STATES.IDLE)}
            style={{
              padding: '12px 20px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Set Idle
          </button>
          
          <button
            onClick={() => handleStateChange(UI_STATES.LOADING)}
            style={{
              padding: '12px 20px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Set Loading
          </button>
          
          <button
            onClick={() => handleStateChange(UI_STATES.SUCCESS, 'Great! Everything worked perfectly.')}
            style={{
              padding: '12px 20px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Set Success
          </button>
          
          <button
            onClick={() => handleStateChange(UI_STATES.ERROR, 'Oops! Something went wrong.')}
            style={{
              padding: '12px 20px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Set Error
          </button>
        </div>
      </div>

      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h2 style={{ marginBottom: '20px' }}>Async Operation Simulation</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Click the button below to simulate a real async operation (50% chance of success/failure)
        </p>
        
        <button
          onClick={simulateAsyncOperation}
          disabled={uiState.isLoading}
          style={{
            padding: '15px 30px',
            background: uiState.isLoading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: uiState.isLoading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '16px',
            width: '100%'
          }}
        >
          {uiState.isLoading ? 'Processing...' : 'Start Async Operation'}
        </button>
      </div>

      <div style={{
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h3 style={{ marginBottom: '15px' }}>Implementation Details</h3>
        <ul style={{ color: '#666', lineHeight: '1.6' }}>
          <li><strong>Idle State:</strong> Default state, no message shown, button enabled</li>
          <li><strong>Loading State:</strong> Shows spinner, disables form inputs and buttons</li>
          <li><strong>Success State:</strong> Shows success message with checkmark, button disabled briefly</li>
          <li><strong>Error State:</strong> Shows error message with retry button option</li>
        </ul>
      </div>
    </div>
  );
}