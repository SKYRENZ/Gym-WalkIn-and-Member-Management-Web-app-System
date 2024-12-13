
import PropTypes from 'prop-types';

export const Spinner = ({ message }) => (
  <div className="loading-container">
    <div className="spinner"></div>
    <p>{message}</p>
  </div>
);

export const ErrorMessage = ({ message }) => (
  <div className="error-container">
    <h2>Error Occurred</h2>
    <p>{message}</p>
    <button onClick={() => window.location.reload()}>Retry</button>
  </div>
);

Spinner.propTypes = {
  message: PropTypes.string
};

ErrorMessage.propTypes = {
  message: PropTypes.string
};