import { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function QRScanner({ onScan }) {
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: 250,
        rememberLastUsedCamera: true,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        console.log("QR DETECTED:", decodedText);

        if (onScanRef.current) {
          onScanRef.current(decodedText.trim());
        }
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, []);

  return <div id="qr-reader" />;
}