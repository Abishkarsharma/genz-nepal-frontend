import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container empty-state" style={{ marginTop: '4rem' }}>
          <h3>Something went wrong</h3>
          <p>Please refresh the page or try again later.</p>
          <button className="btn btn-primary" style={{ marginTop: '1.5rem' }}
            onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
