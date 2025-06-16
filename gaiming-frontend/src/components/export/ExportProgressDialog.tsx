import React, { useEffect, useState } from 'react';
import { X, Download, AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react';
import { ExportProgress } from '../../services/exportService';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface ExportProgressDialogProps {
  isOpen: boolean;
  onClose: () => void;
  progress: ExportProgress | null;
  onCancel?: () => void;
}

const ExportProgressDialog: React.FC<ExportProgressDialogProps> = ({
  isOpen,
  onClose,
  progress,
  onCancel,
}) => {
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    if (!isOpen || !progress || progress.stage === 'completed' || progress.stage === 'error') {
      return;
    }

    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, progress]);

  useEffect(() => {
    if (isOpen && progress?.stage === 'preparing') {
      setTimeElapsed(0);
    }
  }, [isOpen, progress?.stage]);

  if (!isOpen || !progress) return null;

  const getStageIcon = () => {
    switch (progress.stage) {
      case 'preparing':
      case 'processing':
      case 'generating':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'downloading':
        return <Download className="h-5 w-5 text-blue-500 animate-bounce" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStageColor = () => {
    switch (progress.stage) {
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatETA = (ms?: number) => {
    if (!ms) return 'Calculating...';
    const seconds = Math.round(ms / 1000);
    if (seconds < 60) return `${seconds}s remaining`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s remaining`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {getStageIcon()}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Exporting Data
              </h3>
            </div>
            {progress.stage !== 'completed' && progress.stage !== 'error' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Progress</span>
              <span>{progress.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getStageColor()}`}
                style={{ width: `${progress.progress}%` }}
              />
            </div>
          </div>

          {/* Status Message */}
          <div className="mb-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              {progress.message}
            </p>
            
            {progress.stage === 'processing' && (
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <div className="flex justify-between">
                  <span>Records processed:</span>
                  <span>{progress.processedRecords.toLocaleString()} / {progress.totalRecords.toLocaleString()}</span>
                </div>
                {progress.estimatedTimeRemaining && (
                  <div className="flex justify-between">
                    <span>Estimated time remaining:</span>
                    <span>{formatETA(progress.estimatedTimeRemaining)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Time elapsed:</span>
                  <span>{formatTime(timeElapsed)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            {progress.stage === 'completed' && (
              <Button variant="primary" onClick={onClose}>
                Done
              </Button>
            )}
            
            {progress.stage === 'error' && (
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            )}
            
            {(progress.stage === 'preparing' || progress.stage === 'processing' || progress.stage === 'generating') && onCancel && (
              <>
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button variant="ghost" onClick={onClose}>
                  Hide
                </Button>
              </>
            )}
            
            {progress.stage === 'downloading' && (
              <Button variant="ghost" onClick={onClose}>
                Hide
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ExportProgressDialog;
