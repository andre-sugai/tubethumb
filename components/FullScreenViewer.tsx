import React, { useEffect, useCallback, useState } from 'react';
import { ThumbnailData } from '../types';
import { X, ChevronLeft, ChevronRight, Download, Loader2 } from 'lucide-react';
import { generateThumbnailBlob } from '../utils/canvasGenerator';

interface FullScreenViewerProps {
  thumbnails: ThumbnailData[];
  initialIndex: number;
  onClose: () => void;
}

const FullScreenViewer: React.FC<FullScreenViewerProps> = ({
  thumbnails,
  initialIndex,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const data = thumbnails[currentIndex];

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % thumbnails.length);
  }, [thumbnails.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + thumbnails.length) % thumbnails.length);
  }, [thumbnails.length]);

  const handleDownload = async () => {
    const blob = await generateThumbnailBlob(data);
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.fileName || 'thumbnail'}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Generate canvas preview when index changes
  useEffect(() => {
    let isMounted = true;
    
    const generatePreview = async () => {
      setIsLoading(true);
      
      try {
        const blob = await generateThumbnailBlob(data);
        if (blob && isMounted) {
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
        }
      } catch (error) {
        console.error('Failed to generate preview:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    generatePreview();

    // Cleanup: revoke old blob URL when component unmounts or index changes
    return () => {
      isMounted = false;
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [currentIndex, data]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handleNext, handlePrev]);

  if (!data) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-black/50 hover:bg-white/20 text-white rounded-full transition z-50 group"
        >
          <X size={24} />
          <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 text-xs bg-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition">
            Fechar (Esc)
          </span>
        </button>

        {/* Navigation - Left */}
        <button 
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          className="absolute left-6 p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition z-50 hidden sm:block"
        >
          <ChevronLeft size={48} />
        </button>

        {/* Navigation - Right */}
        <button 
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          className="absolute right-6 p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition z-50 hidden sm:block"
        >
          <ChevronRight size={48} />
        </button>

        {/* Action Bar */}
        <div 
            className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-black/80 backdrop-blur border border-white/10 rounded-full flex items-center gap-6 z-50"
            onClick={(e) => e.stopPropagation()}
        >
           <div className="text-white text-sm font-medium">
             {currentIndex + 1} / {thumbnails.length}
           </div>
           
           <div className="w-px h-6 bg-white/20"></div>

           <button 
             onClick={handleDownload}
             className="flex items-center gap-2 text-white/80 hover:text-white transition"
           >
             <Download size={18} />
             <span className="text-sm">Baixar</span>
           </button>
        </div>

        {/* Canvas-Generated Preview */}
        <div 
             onClick={(e) => e.stopPropagation()}
             className="relative aspect-video w-full max-w-5xl bg-black shadow-2xl overflow-hidden select-none flex items-center justify-center"
             style={{ maxHeight: '80vh' }}
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-4 text-white/60">
              <Loader2 size={48} className="animate-spin" />
              <span className="text-sm">Gerando preview...</span>
            </div>
          ) : previewUrl ? (
            <img 
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-white/60 text-sm">
              Erro ao gerar preview
            </div>
          )}
        </div>
    </div>
  );
};

export default FullScreenViewer;
