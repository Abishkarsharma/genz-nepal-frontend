import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrowserMultiFormatReader } from '@zxing/browser';
import api from '../api';
import './BarcodeSearch.css';

export default function BarcodeSearch() {
  const [barcode, setBarcode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const navigate = useNavigate();

  const searchBarcode = async (code) => {
    if (!code.trim()) { setError('Please enter a barcode'); return; }
    setLoading(true); setError('');
    try {
      const { data } = await api.get(`/api/products?barcode=${encodeURIComponent(code.trim())}`);
      navigate(`/product/${data._id}`);
    } catch {
      setError('No product found for this barcode');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    searchBarcode(barcode);
  };

  const startCamera = async () => {
    setError('');
    setScanning(true);
  };

  const stopCamera = () => {
    if (readerRef.current) {
      try { readerRef.current.reset(); } catch {}
      readerRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    if (!scanning || !videoRef.current) return;
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    reader.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
      if (result) {
        const code = result.getText();
        stopCamera();
        setBarcode(code);
        searchBarcode(code);
      }
    }).catch(() => {
      setError('Camera access denied. Please allow camera permission.');
      setScanning(false);
    });

    return () => {
      try { reader.reset(); } catch {}
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
        <button type="button" className="btn btn-outline btn-sm" onClick={scanning ? stopCamera : startCamera}>
          {scanning ? '✕ Stop' : '📷 Scan'}
        </button>
        <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
          {loading ? '...' : 'Find'}
        </button>
      </form>

      {scanning && (
        <div className="barcode-camera">
          <video ref={videoRef} className="barcode-video" autoPlay muted playsInline />
          <p className="barcode-camera-hint">Point camera at barcode</p>
        </div>
      )}

      {error && <p className="barcode-error">{error}</p>}
    </div>
  );
}
