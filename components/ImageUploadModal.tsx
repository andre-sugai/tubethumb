import React, { useCallback, useEffect, useState } from 'react';
import { X, Upload, Image as ImageIcon, FileArchive } from 'lucide-react';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: FileList | null) => void;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [pastedImages, setPastedImages] = useState<File[]>([]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setPastedImages([]);
      setIsDragging(false);
    }
  }, [isOpen]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files);
      onClose();
    }
  }, [onUpload, onClose]);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (!isOpen) return;

    const items = e.clipboardData?.items;
    if (!items) return;

    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            if (file) files.push(file);
        }
    }

    if (files.length > 0) {
        // Create a DataTransfer to mimic FileList
        const dt = new DataTransfer();
        files.forEach(f => dt.items.add(f));
        onUpload(dt.files);
        onClose();
    }
  }, [isOpen, onUpload, onClose]);

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-lg p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition z-50"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white mb-2">Upload de Imagens</h2>
          <p className="text-gray-400 text-sm">
            Arraste, cole (Ctrl+V) ou selecione imagens
          </p>
        </div>

        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center gap-4 transition-colors cursor-pointer
            ${isDragging 
              ? 'border-blue-500 bg-blue-500/10' 
              : 'border-gray-700 hover:border-gray-500 hover:bg-gray-800'
            }
          `}
        >
            <input 
                type="file" 
                multiple 
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                        onUpload(e.target.files);
                        onClose();
                    }
                }}
            />
            <div className="bg-gray-800 p-4 rounded-full">
                <Upload size={32} className="text-blue-400" />
            </div>
            <div className="text-center space-y-1">
                <p className="font-medium text-white">Clique para selecionar</p>
                <p className="text-xs text-gray-500">ou arraste e solte aqui</p>
            </div>
        </div>

        <div className="mt-6 flex justify-center">
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700">
                <span className="kbd font-mono bg-gray-700 px-1 rounded text-gray-300">Ctrl</span>
                <span>+</span>
                <span className="kbd font-mono bg-gray-700 px-1 rounded text-gray-300">V</span>
                <span>para colar da área de transferência</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadModal;
