import React, { useRef } from 'react';
import { ThumbnailData } from '../types';
import { Download, Upload, Trash2, Maximize2, Tag } from 'lucide-react';

interface ThumbnailPreviewProps {
  data: ThumbnailData;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<ThumbnailData>) => void;
  onDownload: () => void;
  onDelete: () => void;
  onOpenUploadModal: () => void;
  onMaximize: () => void;
}

const ThumbnailPreview: React.FC<ThumbnailPreviewProps> = ({ 
  data, 
  isSelected, 
  onSelect,
  onUpdate,
  onDownload,
  onDelete,
  onOpenUploadModal,
  onMaximize
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          onUpdate({ bgImage: ev.target.result as string });
          onSelect();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Helper to approximate stroke in CSS
  const strokeWidth = (data.fontSize / 3) * 0.15; // Rough approximation of canvas logic
  const textStroke = `${strokeWidth}px black`;

  return (
    <div className={`relative group ${isSelected ? 'ring-4 ring-blue-500 rounded-lg' : ''}`}>
      
      {/* Header / Toolbar */}
      <div className="flex justify-between items-center mb-2 px-1">
        <span className="text-xs font-mono text-gray-400 truncate max-w-[200px]" title={data.fileName}>
          {data.fileName || 'Sem nome'}
        </span>
        <div className="flex gap-1">
          <button 
            onClick={(e) => { 
                e.preventDefault();
                e.stopPropagation(); 
                onOpenUploadModal(); 
            }}
            className="p-1 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition"
            title="Trocar Imagem (Upload)"
          >
            <Upload size={16} />
          </button>
          
          <div className="relative group/tag" onClick={e => e.stopPropagation()}>
             <Tag size={16} className={`absolute left-2 top-1/2 -translate-y-1/2 ${data.tag ? 'text-blue-400' : 'text-gray-500'}`} />
             <input 
               type="text"
               value={data.tag || ''}
               onChange={(e) => onUpdate({ tag: e.target.value })}
               placeholder="Tag..."
               className="bg-gray-800 border border-gray-700 rounded pl-7 pr-2 py-1 text-xs text-white w-20 focus:w-32 transition-all outline-none focus:border-blue-500"
             />
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1 hover:bg-red-900/50 rounded text-gray-500 hover:text-red-500 transition"
            title="Excluir"
          >
            <Trash2 size={16} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDownload(); }}
            className="p-1 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition"
            title="Baixar JPG"
          >
            <Download size={16} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onMaximize(); }}
            className="p-1 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition"
            title="Expandir"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      {/* The "Canvas" DOM Representation */}
      <div 
        ref={containerRef}
        onClick={onSelect}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="relative w-full aspect-video bg-black overflow-hidden rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow border border-gray-800"
      >
        {/* Background Layer */}
        {data.bgImage ? (
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
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-gray-700 m-2 rounded">
             <Upload size={32} className="mb-2 opacity-50"/>
             <span className="text-xs">Arraste uma Imagem</span>
          </div>
        )}

        {/* Text Layer */}
        <div 
          className="absolute pointer-events-none flex flex-col"
          style={{
            top: `${data.titlePos.y}%`,
            left: `${data.titlePos.x}%`,
            width: `${data.textWidth || 90}%`, // Use the slider width
            transform: 'translate(-50%, -50%)', // Center the container on the point
            alignItems: data.textAlign === 'left' ? 'flex-start' : data.textAlign === 'right' ? 'flex-end' : 'center',
          }}
        >
          <h1 
            style={{
              color: data.titleColor,
              textAlign: data.textAlign,
              // Visual approximation of font size relative to container
              fontSize: `${data.fontSize / 3}px`, 
              lineHeight: 1.1,
              fontWeight: 900,
              whiteSpace: 'pre-wrap', // Allows wrapping
              wordWrap: 'break-word',
              
              // Advanced Styles
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

export default ThumbnailPreview;