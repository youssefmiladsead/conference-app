import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function QRScanner({ onScan }) {
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
        onScan?.(decodedText);
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, []);

  return <div id="qr-reader" />;
}