import { useState } from 'react';

// UI States: idle, loading, success, error
export const UI_STATES = {
  IDLE: 'idle',
  LOADING: 'loading', 
  SUCCESS: 'success',
  ERROR: 'error'
};

export function useUIState(initialState = UI_STATES.IDLE) {
  const [state, setState] = useState(initialState);
  const [message, setMessage] = useState('');

  const setIdle = () => {
    setState(UI_STATES.IDLE);
    setMessage('');
  };

  const setLoading = () => {
    setState(UI_STATES.LOADING);
    setMessage('');
  };

  const setSuccess = (successMessage = 'Operation completed successfully!') => {
    setState(UI_STATES.SUCCESS);
    setMessage(successMessage);
  };

  const setError = (errorMessage = 'Something went wrong. Please try again.') => {
    setState(UI_STATES.ERROR);
    setMessage(errorMessage);
  };

  const reset = () => setIdle();

  return {
    state,
    message,
    isIdle: state === UI_STATES.IDLE,
    isLoading: state === UI_STATES.LOADING,
    isSuccess: state === UI_STATES.SUCCESS,
    isError: state === UI_STATES.ERROR,
    setIdle,
    setLoading,
    setSuccess,
    setError,
    reset
  };
}