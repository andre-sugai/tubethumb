import React, { useEffect, useCallback } from 'react';
import { ThumbnailData } from '../types';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
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
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
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

        {/* Canvas - Scaled Up */}
        <div 
             onClick={(e) => e.stopPropagation()}
             className="relative aspect-video w-full max-w-5xl bg-black shadow-2xl overflow-hidden select-none"
             style={{ maxHeight: '80vh' }}
        >
                {/* Background Layer */}
                {data.bgImage && (
                  <img 
                    src={data.bgImage}
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                       objectPosition: 'center', 
                       transform: `translate(${data.bgPos.x - 50}%, ${data.bgPos.y - 50}%) scale(${data.bgZoom})`,
                       filter: `brightness(${data.brightness}%) saturate(${data.saturation}%)`
                    }}
                  />
                )}
        
                {/* Text Layer - Scaled for View */}
                <div 
                  className="absolute pointer-events-none flex flex-col"
                  style={{
                    top: `${data.titlePos.y}%`,
                    left: `${data.titlePos.x}%`,
                    width: `${data.textWidth || 90}%`,
                    transform: 'translate(-50%, -50%)',
                    alignItems: data.textAlign === 'left' ? 'flex-start' : data.textAlign === 'right' ? 'flex-end' : 'center',
                  }}
                >
                  <h1 
                    style={{
                      color: data.titleColor,
                      textAlign: data.textAlign,
                      // We use relative units (vw) or large pixel values for the preview. 
                      // Since this container changes size, let's stick to the ratio approach used in ThumbnailPreview but simpler scale.
                      fontSize: `clamp(20px, ${data.fontSize / 1.5}px, 10vw)`, 
                      lineHeight: 1.1,
                      fontWeight: 900,
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      
                      textShadow: data.textShadowBlur ? `${data.textShadowOffsetX || 0}px ${data.textShadowOffsetY || 0}px ${data.textShadowBlur}px ${data.textShadowColor}` : 'none',
                      WebkitTextStroke: data.textStrokeWidth ? `${data.textStrokeWidth}px ${data.textStrokeColor}` : 'none',
                      paintOrder: 'stroke fill',
                      
                      width: '100%',
                      fontFamily: 'Inter, sans-serif',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {data.title.toUpperCase()}
                  </h1>
                </div>
        
                {/* Logo Layer */}
                {data.logoImage && (
                  <img 
                    src={data.logoImage}
                    alt="Logo"
                    className="absolute object-contain pointer-events-none drop-shadow-md"
                    style={{
                      left: `${data.logoPos.x}%`,
                      top: `${data.logoPos.y}%`,
                      height: `${data.logoSize}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                )}
        </div>
    </div>
  );
};

export default FullScreenViewer;
