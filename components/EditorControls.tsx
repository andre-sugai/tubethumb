import React from 'react';
import { ThumbnailData, Preset } from '../types';
import { Settings, Type, Image as ImageIcon, Layers, FileText, ArrowLeftRight, Upload, Save } from 'lucide-react';

interface EditorControlsProps {
  data: ThumbnailData;
  onUpdate: (updates: Partial<ThumbnailData>) => void;
  onSavePreset: () => void;
  presets: Preset[];
  onLoadPreset: (preset: Preset) => void;
  isApplyToAll: boolean;
  onToggleApplyToAll: () => void;
}

const EditorControls: React.FC<EditorControlsProps> = ({ 
  data, 
  onUpdate, 
  onSavePreset, 
  presets, 
  onLoadPreset,
  isApplyToAll,
  onToggleApplyToAll
}) => {

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'bgImage' | 'logoImage') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUpdate({ [field]: event.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const alignMap = {
    left: 'Esq',
    center: 'Centro',
    right: 'Dir'
  };

  return (
    <div className="w-96 bg-gray-900 border-l border-gray-700 h-full overflow-y-auto flex flex-col shadow-xl z-10 custom-scrollbar">
      
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-gray-900 sticky top-0 z-10">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings size={20} className="text-blue-500" />
          Configurações
        </h2>
        
        <div className="mt-4 flex items-center gap-2">
           <input 
              type="checkbox" 
              id="applyAll" 
              checked={isApplyToAll}
              onChange={onToggleApplyToAll}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 bg-gray-700 border-gray-600 cursor-pointer"
            />
            <label htmlFor="applyAll" className="text-sm text-gray-300 select-none cursor-pointer hover:text-white transition">
              Aplicar em TODAS
            </label>
        </div>
      </div>

      <div className="p-4 space-y-6">

        {/* File Name Section */}
        <div className="space-y-2">
          <label className="text-xs text-gray-400 flex items-center gap-1">
             <FileText size={12} />
             Nome do Arquivo
          </label>
          <input
            type="text"
            className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm focus:border-blue-500 outline-none transition"
            value={data.fileName}
            onChange={(e) => onUpdate({ fileName: e.target.value })}
            placeholder="Ex: thumb-video-1"
          />
        </div>
        
        {/* Presets Section */}
        <div className="space-y-3 p-3 bg-gray-800/50 border border-white/5 rounded-lg">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Estilos (Presets)</h3>
            <button 
              onClick={onSavePreset} 
              className="text-[10px] bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded flex items-center gap-1 transition active:scale-95"
            >
              <Save size={10} /> Salvar Atual
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
            {presets.map((preset, idx) => (
              <button 
                key={idx}
                onClick={() => onLoadPreset(preset)}
                className="text-[11px] bg-gray-800 hover:bg-gray-700 border border-white/5 text-gray-300 text-left p-2 rounded truncate transition active:scale-95"
                title={`Aplicar ${preset.name}`}
              >
                {preset.name}
              </button>
            ))}
            {presets.length === 0 && (
              <span className="text-[10px] text-gray-600 italic col-span-2 py-2 text-center">
                Salve um estilo para reutilizar depois
              </span>
            )}
          </div>
        </div>

        {/* Text Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Type size={16} /> Texto do Título
          </h3>
          
          <div className="space-y-2">
            <textarea
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm focus:border-blue-500 outline-none resize-none"
              rows={2}
              value={data.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Digite o título..."
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
             <div className="space-y-1">
                <label className="text-xs text-gray-500">Cor</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={data.titleColor}
                    onChange={(e) => onUpdate({ titleColor: e.target.value })}
                    className="h-8 w-8 rounded cursor-pointer bg-transparent border-none overflow-hidden"
                  />
                  <input 
                    type="text"
                    value={data.titleColor}
                    onChange={(e) => onUpdate({ titleColor: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-[10px] text-white uppercase outline-none focus:border-blue-500"
                  />
                </div>
             </div>
             <div className="space-y-1">
               <label className="text-xs text-gray-500">Alinhamento</label>
               <div className="flex bg-gray-800 rounded border border-gray-700 p-0.5">
                 {(['left', 'center', 'right'] as const).map((align) => (
                   <button
                    key={align}
                    className={`flex-1 py-1 text-[10px] rounded ${data.textAlign === align ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                    onClick={() => onUpdate({ textAlign: align })}
                   >
                     {alignMap[align]}
                   </button>
                 ))}
               </div>
             </div>
          </div>
          
          <div className="space-y-1">
             <div className="flex justify-between">
                <label className="text-xs text-gray-500">Posição X/Y</label>
                <span className="text-[10px] text-gray-600">{data.titlePos.x}% / {data.titlePos.y}%</span>
             </div>
             <div className="flex gap-2">
                <input 
                  type="range" min="0" max="100" 
                  value={data.titlePos.x} 
                  onChange={(e) => onUpdate({ titlePos: { ...data.titlePos, x: Number(e.target.value) } })}
                  className="flex-1 accent-blue-500"
                />
                <input 
                  type="range" min="0" max="100" 
                  value={data.titlePos.y} 
                  onChange={(e) => onUpdate({ titlePos: { ...data.titlePos, y: Number(e.target.value) } })}
                  className="flex-1 accent-blue-500"
                />
             </div>
          </div>
           <div className="space-y-1">
             <div className="flex justify-between">
                <label className="text-xs text-gray-500">Tamanho da Fonte</label>
                <span className="text-[10px] text-gray-600">{data.fontSize}px</span>
             </div>
             <input 
               type="range" min="20" max="150" 
               value={data.fontSize} 
               onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
               className="w-full accent-blue-500"
             />
           </div>

           <div className="space-y-1">
             <div className="flex justify-between">
                <label className="text-xs text-gray-500">Largura do Bloco</label>
                <span className="text-[10px] text-gray-600">{data.textWidth}%</span>
             </div>
             <input 
               type="range" min="10" max="100" 
               value={data.textWidth || 90} 
               onChange={(e) => onUpdate({ textWidth: Number(e.target.value) })}
               className="w-full accent-blue-500"
             />
           </div>
        </div>

        <hr className="border-gray-800" />

        {/* Background Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <ImageIcon size={16} /> Fundo
          </h3>
          
          <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-xs px-3 py-2 rounded flex items-center gap-2 w-full justify-center transition active:scale-95">
            <Upload size={14} />
            Mudar Imagem
            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'bgImage')} />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Brilho</label>
              <input 
                type="range" min="0" max="200" 
                value={data.brightness} 
                onChange={(e) => onUpdate({ brightness: Number(e.target.value) })}
                className="w-full accent-green-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Saturação</label>
              <input 
                type="range" min="0" max="200" 
                value={data.saturation} 
                onChange={(e) => onUpdate({ saturation: Number(e.target.value) })}
                className="w-full accent-green-500"
              />
            </div>
          </div>

           <div className="space-y-1">
             <label className="text-xs text-gray-500">Enquadramento X/Y</label>
             <div className="flex gap-2">
                <input 
                  type="range" min="0" max="100" 
                  value={data.bgPos.x} 
                  onChange={(e) => onUpdate({ bgPos: { ...data.bgPos, x: Number(e.target.value) } })}
                  className="flex-1 accent-green-500"
                />
                <input 
                  type="range" min="0" max="100" 
                  value={data.bgPos.y} 
                  onChange={(e) => onUpdate({ bgPos: { ...data.bgPos, y: Number(e.target.value) } })}
                  className="flex-1 accent-green-500"
                />
             </div>
          </div>
          <div className="space-y-1">
             <div className="flex justify-between">
                <label className="text-xs text-gray-500">Zoom</label>
                <span className="text-[10px] text-gray-600">{data.bgZoom.toFixed(1)}x</span>
             </div>
             <input 
               type="range" min="1" max="3" step="0.1"
               value={data.bgZoom} 
               onChange={(e) => onUpdate({ bgZoom: Number(e.target.value) })}
               className="w-full accent-green-500"
             />
          </div>
        </div>

        <hr className="border-gray-800" />

        {/* Logo Section */}
        <div className="space-y-4 pb-8">
           <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Layers size={16} /> Logotipo
          </h3>
          
          <div className="flex flex-col gap-2">
             <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-xs px-3 py-2 rounded flex items-center gap-2 w-full justify-center transition active:scale-95">
               <Upload size={14} />
               Enviar Logo
               <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'logoImage')} />
             </label>
             {data.logoImage && (
                <button 
                  onClick={() => onUpdate({ logoImage: null })} 
                  className="text-[10px] text-red-500 hover:text-red-400 transition underline"
                >
                  Remover Logotipo
                </button>
             )}
          </div>

          <div className="space-y-1">
             <label className="text-xs text-gray-500">Posição da Logo X/Y</label>
             <div className="flex gap-2">
                <input 
                  type="range" min="0" max="100" 
                  value={data.logoPos.x} 
                  onChange={(e) => onUpdate({ logoPos: { ...data.logoPos, x: Number(e.target.value) } })}
                  className="flex-1 accent-purple-500"
                />
                <input 
                  type="range" min="0" max="100" 
                  value={data.logoPos.y} 
                  onChange={(e) => onUpdate({ logoPos: { ...data.logoPos, y: Number(e.target.value) } })}
                  className="flex-1 accent-purple-500"
                />
             </div>
          </div>
          <div className="space-y-1">
             <div className="flex justify-between">
                <label className="text-xs text-gray-500">Tamanho da Logo</label>
                <span className="text-[10px] text-gray-600">{data.logoSize}%</span>
             </div>
             <input 
               type="range" min="5" max="50" 
               value={data.logoSize} 
               onChange={(e) => onUpdate({ logoSize: Number(e.target.value) })}
               className="w-full accent-purple-500"
             />
          </div>
        </div>

      </div>
    </div>
  );
};

export default EditorControls;