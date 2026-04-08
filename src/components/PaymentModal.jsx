import React, { useState } from 'react';
import './PaymentModal.css';

const PROVIDERS = {
  'eSewa': { color: '#60BB46', emoji: '💚', label: 'eSewa Digital Wallet', prefix: 'ESW' },
  'Khalti': { color: '#5C2D91', emoji: '💜', label: 'Khalti Digital Wallet', prefix: 'KHL' },
  'Bank Transfer': { color: '#1a56db', emoji: '🏦', label: 'Bank Transfer', prefix: 'BNK' },
};

export default function PaymentModal({ method, amount, onConfirm, onClose }) {
  const provider = PROVIDERS[method];
  const [ref] = useState(`${provider.prefix}-${Date.now()}`);
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = () => {
    setConfirming(true);
    setTimeout(() => {
      onConfirm(ref);
    }, 800);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ background: provider.color }}>
          <span className="modal-emoji">{provider.emoji}</span>
          <h2>{provider.label}</h2>
        </div>
        <div className="modal-body">
          <p className="modal-amount">NPR {amount?.toLocaleString()}</p>
          <div className="modal-ref">
            <p className="ref-label">Reference Number</p>
            <p className="ref-value">{ref}</p>
          </div>
          <p className="modal-note">This is a simulated payment. No real transaction will occur.</p>
          <div className="modal-actions">
            <button className="btn btn-primary" onClick={handleConfirm} disabled={confirming}
              style={{ flex: 1, justifyContent: 'center' }}>
              {confirming ? 'Processing...' : 'Confirm Payment'}
            </button>
            <button className="btn btn-outline" onClick={onClose} disabled={confirming}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
