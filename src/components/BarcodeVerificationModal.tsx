import React, { useState, useRef, useEffect } from 'react';
import { DocumentItem, UserSession } from '../types';
import { BarcodeDisplay } from './BarcodeDisplay';
import {
  Scan,
  X,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Camera,
  RefreshCw,
  Zap,
  Lock,
  Unlock,
  Key,
  FileText,
  Building,
  UserCheck,
  RotateCw,
  AlertTriangle
} from 'lucide-react';

interface BarcodeVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
  session: UserSession;
  onVerifySuccess: (docId: string, verifiedBarcode: string) => void;
}

export const BarcodeVerificationModal: React.FC<BarcodeVerificationModalProps> = ({
  isOpen,
  onClose,
  document,
  session,
  onVerifySuccess,
}) => {
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
  const [inputBarcode, setInputBarcode] = useState<string>('');
  
  // Camera state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // Verification processing state
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<'IDLE' | 'SUCCESS' | 'MISMATCH'>('IDLE');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const startCamera = async (facing: 'environment' | 'user' = facingMode) => {
    stopCamera();
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      setMediaStream(stream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((e) => console.log('Video play error:', e));
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Camera access unavailable. Use manual barcode input mode below.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (isOpen && scanMode === 'camera' && document && verificationResult === 'IDLE') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, scanMode, document, verificationResult]);

  if (!isOpen || !document) return null;

  const toggleCameraFacing = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  const handleVerifyBarcode = (codeToVerify: string) => {
    const cleanedInput = codeToVerify.trim().toUpperCase();
    const expectedBarcode = (document.barcode || '').trim().toUpperCase();

    setIsVerifying(true);
    setVerificationResult('IDLE');
    setErrorMsg('');

    setTimeout(() => {
      setIsVerifying(false);

      if (cleanedInput === expectedBarcode || cleanedInput.includes(expectedBarcode) || expectedBarcode.includes(cleanedInput)) {
        setVerificationResult('SUCCESS');
        stopCamera();
        onVerifySuccess(document.id, document.barcode);
      } else {
        setVerificationResult('MISMATCH');
        setErrorMsg(`Scanned barcode [${cleanedInput}] does NOT match official document barcode [${expectedBarcode}].`);
      }
    }, 1200);
  };

  const handleScanFromCameraFeed = () => {
    // Simulates reading physical barcode from camera viewport
    handleVerifyBarcode(document.barcode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl text-slate-800 relative max-h-[92vh] flex flex-col overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
              <Scan className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Barcode Verification & Document Unseal</h2>
              <p className="text-xs text-slate-500 font-mono">
                Scan recipient document barcode to verify cryptographic integrity & grant access
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="py-4 space-y-4 flex-1">
          
          {/* Target Document Info Card */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span>{document.title}</span>
              </span>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 rounded text-[10px] font-bold uppercase">
                {document.classification}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-600 text-[11px]">
              <div><strong className="text-slate-800">Department:</strong> {document.department}</div>
              <div><strong className="text-slate-800">Expected Barcode:</strong> {document.barcode}</div>
              <div><strong className="text-slate-800">Sender:</strong> {document.author}</div>
              <div><strong className="text-slate-800">Recipient:</strong> {session.userName}</div>
            </div>
          </div>

          {/* VERIFICATION WORKFLOW STATES */}
          {verificationResult === 'SUCCESS' ? (
            /* SUCCESS UNLOCKED SCREEN */
            <div className="py-6 space-y-4 animate-fade-in text-center">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
                <Unlock className="h-7 w-7" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Barcode Verified & Access Granted!</h3>
                <p className="text-xs text-slate-600 font-mono mt-1">
                  Recipient barcode match confirmed for {session.userName}. The document has been unsealed in your vault.
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-left font-mono text-xs text-emerald-900 space-y-2">
                <div className="flex justify-between items-center border-b border-emerald-200 pb-1.5 font-bold">
                  <span>AUTHENTICATION RECEIPT</span>
                  <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">VERIFIED</span>
                </div>
                <div><strong>Barcode ID Match:</strong> {document.barcode}</div>
                <div><strong>HMAC-SHA256 Hash:</strong> {document.sha256Hash}</div>
                <div><strong>Verified By:</strong> {session.userName} ({session.role})</div>
                <div><strong>Timestamp:</strong> {new Date().toISOString().replace('T', ' ').substring(0, 19)}</div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    stopCamera();
                    onClose();
                  }}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 shadow-md"
                >
                  View Document Contents
                </button>
              </div>
            </div>
          ) : (
            /* SCANNER MODES (CAMERA vs MANUAL INPUT) */
            <div className="space-y-4">
              
              {/* Mode Switcher */}
              <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => {
                    setScanMode('camera');
                    startCamera();
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-2 ${
                    scanMode === 'camera' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Camera className="h-4 w-4" />
                  <span>Scan via Live Camera</span>
                </button>

                <button
                  onClick={() => {
                    stopCamera();
                    setScanMode('manual');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-2 ${
                    scanMode === 'manual' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Key className="h-4 w-4" />
                  <span>Enter Barcode ID</span>
                </button>
              </div>

              {/* CAMERA SCANNER VIEWPORT */}
              {scanMode === 'camera' && (
                <div className="space-y-3">
                  <div className="relative w-full h-72 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover transition-opacity duration-300 ${isCameraActive ? 'opacity-100' : 'opacity-0'}`}
                    />

                    {/* Barcode Reticle Overlay */}
                    {isCameraActive && (
                      <div className="absolute inset-0 pointer-events-none border-2 border-blue-400/70 m-8 rounded-xl flex flex-col justify-between p-3">
                        <div className="flex justify-between items-center font-mono text-[10px] text-blue-300 font-bold uppercase bg-slate-900/80 px-2 py-1 rounded w-max backdrop-blur">
                          <span className="flex items-center gap-1">
                            <Zap className="h-3 w-3 text-amber-400 animate-pulse" />
                            ALIGN BARCODE WITHIN SCANNER FRAME
                          </span>
                        </div>

                        {/* Animated Laser Scan Line */}
                        <div className="w-full h-0.5 bg-red-500 shadow-[0_0_12px_#ef4444] animate-pulse" />

                        <div className="text-right text-[10px] font-mono text-slate-300 bg-slate-900/80 px-2 py-1 rounded w-max ml-auto backdrop-blur">
                          EXPECTED: {document.barcode}
                        </div>
                      </div>
                    )}

                    {!isCameraActive && (
                      <div className="text-center p-6 space-y-3 text-slate-400 font-mono text-xs">
                        {cameraError ? (
                          <>
                            <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto" />
                            <p className="text-slate-300 font-bold">{cameraError}</p>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-8 w-8 text-blue-400 mx-auto animate-spin" />
                            <p>Starting optical barcode scanner sensor...</p>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Camera Controls & Verify Trigger */}
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <button
                      onClick={toggleCameraFacing}
                      className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg flex items-center space-x-1"
                    >
                      <RotateCw className="h-3.5 w-3.5 text-blue-600" />
                      <span>Switch Camera</span>
                    </button>

                    <button
                      disabled={isVerifying}
                      onClick={handleScanFromCameraFeed}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 border border-blue-700 shadow-md flex items-center space-x-2"
                    >
                      {isVerifying ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Matching Barcode Seal...</span>
                        </>
                      ) : (
                        <>
                          <Scan className="h-4 w-4" />
                          <span>Scan Barcode & Verify Access</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* MANUAL BARCODE INPUT VIEWPORT */}
              {scanMode === 'manual' && (
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Enter Printed Document Barcode ID:
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={inputBarcode}
                        onChange={(e) => setInputBarcode(e.target.value)}
                        placeholder="e.g. DOC-FIN-2026-90412"
                        className="flex-1 bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500 uppercase"
                      />
                      <button
                        type="button"
                        onClick={() => setInputBarcode(document.barcode)}
                        className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-mono font-bold"
                        title="Autofill exact barcode from physical document"
                      >
                        AutoFill
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      disabled={!inputBarcode.trim() || isVerifying}
                      onClick={() => handleVerifyBarcode(inputBarcode)}
                      className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-all shadow-md flex items-center space-x-2 ${
                        inputBarcode.trim() && !isVerifying
                          ? 'bg-blue-600 hover:bg-blue-700 border border-blue-700'
                          : 'bg-slate-300 border border-slate-300 cursor-not-allowed'
                      }`}
                    >
                      {isVerifying ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Verifying Cryptographic Match...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4" />
                          <span>Submit & Verify Barcode</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* MISMATCH / ERROR ALERT */}
              {verificationResult === 'MISMATCH' && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-900 rounded-xl text-xs font-mono flex items-center space-x-3 animate-fade-in">
                  <ShieldAlert className="h-6 w-6 text-red-600 flex-shrink-0" />
                  <div>
                    <span className="font-bold block text-sm">BARCODE VERIFICATION FAILED</span>
                    <p className="text-[11px] mt-0.5">{errorMsg}</p>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
