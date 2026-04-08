import React from 'react';
import './OrderTracker.css';

const STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'];

export default function OrderTracker({ status }) {
  if (status === 'cancelled') {
    return <span className="cancelled-badge">✕ Cancelled</span>;
  }

  const currentIndex = STEPS.findIndex((s) => s.toLowerCase() === status?.toLowerCase());

  return (
    <div className="order-tracker">
      {STEPS.map((step, i) => (
        <React.Fragment key={step}>
          <div className={`tracker-step ${i < currentIndex ? 'completed' : i === currentIndex ? 'active' : 'upcoming'}`}>
            <div className="step-circle">
              {i < currentIndex ? '✓' : i + 1}
            </div>
            <p className="step-label">{step}</p>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`tracker-line ${i < currentIndex ? 'filled' : ''}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
