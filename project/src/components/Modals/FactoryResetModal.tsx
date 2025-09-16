import React, { useState } from 'react';
import { AlertTriangle, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface FactoryResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<{ success: boolean; message: string; steps: string[]; duration: number }>;
}

const FactoryResetModal: React.FC<FactoryResetModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [confirmText, setConfirmText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; steps: string[]; duration: number } | null>(null);

  const CONFIRM_TEXT = 'FACTORY RESET';
  const isConfirmValid = confirmText === CONFIRM_TEXT;

  const handleConfirm = async () => {
    if (!isConfirmValid) return;

    setIsProcessing(true);
    try {
      const resetResult = await onConfirm();
      setResult(resetResult);
    } catch (error) {
      setResult({
        success: false,
        message: `Reset failed: ${error}`,
        steps: [],
        duration: 0
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setConfirmText('');
      setResult(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
        {!result ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Factory Reset
                  </h3>
                  <p className="text-sm text-gray-600">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  This will permanently delete:
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• All Chart of Accounts data</li>
                  <li>• All Forecast databases</li>
                  <li>• All Actual data records</li>
                  <li>• All KPI and budget information</li>
                  <li>• All import history</li>
                  <li>• All cached and computed data</li>
                </ul>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <span className="font-mono bg-gray-100 px-1 rounded">{CONFIRM_TEXT}</span> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Type here to confirm..."
                  disabled={isProcessing}
                />
              </div>

              {isProcessing && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Loader2 className="h-5 w-5 text-blue-500 animate-spin mr-3" />
                    <span className="text-sm text-blue-700">
                      Performing factory reset...
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end space-x-3">
              <button
                onClick={handleClose}
                disabled={isProcessing}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!isConfirmValid || isProcessing}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Resetting...
                  </>
                ) : (
                  'Factory Reset'
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Result Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {result.success ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-500" />
                  )}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {result.success ? 'Reset Complete' : 'Reset Failed'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {result.success 
                      ? `Completed in ${result.duration}ms`
                      : 'An error occurred during reset'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Result Content */}
            <div className="p-6">
              <div className="mb-4">
                <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                  {result.message}
                </p>
              </div>

              {result.steps.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Execution Steps:
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                    <ul className="text-xs text-gray-600 space-y-1">
                      {result.steps.map((step, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-gray-400 mr-2">{index + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Result Footer */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FactoryResetModal;