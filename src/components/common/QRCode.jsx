// src/components/common/QRCode.jsx
import { useEffect, useRef } from 'react';
import QRCodeLib from 'qrcode';

export default function QRCode({ value, size = 200, className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;
    QRCodeLib.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 2,
      color: {
        dark: '#FFFFFF',
        light: '#111827',
      },
    });
  }, [value, size]);

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        className="rounded-xl"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}
