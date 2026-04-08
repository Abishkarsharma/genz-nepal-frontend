import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../api';
import './BarcodeSearch.css';

const SCANNER_ID = 'barcode-scanner-container';

export default function BarcodeSearch() {
  const [barcode, setBarcode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
  const navigate = useNavigate();

  const searchBarcode = async (code) => {
    const trimmed = code.trim();
    if (!trimmed) { setError('Please enter a barcode'); return; }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/api/products?barcode=${encodeURIComponent(trimmed)}`);
      navigate(`/product/${data._id}`);
    } catch {
      setError('No product found for this barcode');
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    searchBarcode(barcode);
  };

  const startScanner = async () => {
    setError('');
    setScanning(true);
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {}
      scannerRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    if (!scanning) return;

    // Small delay to ensure DOM element is mounted
    const timer = setTimeout(async () => {
      try {
        const scanner = new Html5Qrcode(SCANNER_ID);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' }, // use back camera on mobile
          { fps: 10, qrbox: { width: 280, height: 140 } },
          async (decodedText) => {
            await stopScanner();
            setBarcode(decodedText);
            searchBarcode(decodedText);
          },
          () => {} // ignore per-frame errors
        );
      } catch (err) {
        setError('Camera access denied. Please allow camera permission in your browser settings.');
        setScanning(false);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        try { scannerRef.current.stop(); } catch {}
        scannerRef.current = null;
      }
    };
  }, [scanning]);

  return (
    <div className="barcode-wrap">
      <form onSubmit={handleSubmit} className="barcode-form">
        <span className="barcode-icon">▦</span>
        <input
          className="barcode-input"
          placeholder="Scan or enter barcode..."
          value={barcode}
          onChange={(e) => { setBarcode(e.target.value); setError(''); }}
        />
        <button
          type="button"
          className={`btn btn-sm ${scanning ? 'btn-danger' : 'btn-outline'}`}
          onClick={scanning ? stopScanner : startScanner}
        >
          {scanning ? '✕ Stop' : '📷 Camera'}
        </button>
        <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
          {loading ? '...' : 'Find'}
        </button>
      </form>

      {scanning && (
        <div className="barcode-camera-wrap">
          <div id={SCANNER_ID} className="barcode-scanner-box" />
          <p className="barcode-hint">📷 Point your camera at a barcode — it will scan automatically</p>
        </div>
      )}

      {error && <p className="barcode-error">{error}</p>}
    </div>
  );
}
