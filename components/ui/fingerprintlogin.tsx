import { useState } from 'react';
import { Fingerprint } from 'lucide-react';

const FingerprintLogin = () => {
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async () => {
    setIsScanning(true);
    // Simulating fingerprint scan
    try {
      // In a real application, this would interface with fingerprint hardware
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // Redirect to dashboard on success
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Fingerprint scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-8">NSC Exam Portal Access</h1>

        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleScan}
            disabled={isScanning}
            className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
              isScanning ? 'bg-blue-100' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            <Fingerprint
              size={64}
              className={`${isScanning ? 'text-blue-500 animate-pulse' : 'text-white'}`}
            />
          </button>

          <p className="text-gray-600 text-center">
            {isScanning ? 'Scanning...' : 'Place your finger on the scanner'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FingerprintLogin;
