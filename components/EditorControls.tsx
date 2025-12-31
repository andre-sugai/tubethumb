import React from 'react';
import { ThumbnailData, Preset, DEFAULT_THUMBNAIL } from '../types';
import { Settings, Type, Image as ImageIcon, Layers, FileText, ArrowLeftRight, Upload, Save, Trash2, RotateCcw } from 'lucide-react';

interface EditorControlsProps {
  data: ThumbnailData;
  onUpdate: (updates: Partial<ThumbnailData>) => void;
  onSavePreset: () => void;
  presets: Preset[];
  onLoadPreset: (preset: Preset) => void;
  onDeletePreset: (index: number) => void;
  isApplyToAll: boolean;
  onToggleApplyToAll: () => void;
}

interface SliderControlProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min: number;
  max: number;
  step?: number;
  accentColor?: string;
  suffix?: string;
}

const SliderControl: React.FC<SliderControlProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  accentColor = 'blue-500',
  suffix = ''
}) => {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <label className="text-xs text-gray-500">{label}</label>
        <div className="flex items-center gap-1 bg-gray-800 rounded px-1 border border-gray-700 focus-within:border-blue-500 transition">
          <input
            type="number"
            value={value}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) onChange(val);
            }}
            className="w-12 bg-transparent text-[10px] text-right text-gray-300 outline-none"
            step={step}
          />
          <span className="text-[10px] text-gray-500 select-none">{suffix}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`w-full accent-${accentColor} cursor-pointer`}
      />
    </div>
  );
};

const EditorControls: React.FC<EditorControlsProps> = ({ 
  data, 
  onUpdate, 
  onSavePreset, 
  presets, 
  onLoadPreset,
  onDeletePreset,
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
              <div key={idx} className="flex gap-1 group">
                <button 
                  onClick={() => onLoadPreset(preset)}
                  className="flex-1 text-[11px] bg-gray-800 hover:bg-gray-700 border border-white/5 text-gray-300 text-left p-2 rounded truncate transition active:scale-95"
                  title={`Aplicar ${preset.name}`}
                >
                  {preset.name}
                </button>
                <button
                  onClick={() => onDeletePreset(idx)}
                  className="bg-red-900/30 hover:bg-red-600 text-red-500 hover:text-white border border-red-900/50 rounded px-2 transition flex items-center justify-center opacity-0 group-hover:opacity-100"
                  title="Excluir preset"
                >
                  <Trash2 size={12} />
                </button>
              </div>
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
          <div className="flex items-center justify-between pb-2 border-b border-gray-800">
             <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
               <Type size={14} />
               Configurações de Texto
             </h3>
             <button 
                onClick={() => onUpdate({
                   titlePos: DEFAULT_THUMBNAIL.titlePos,
                   fontSize: DEFAULT_THUMBNAIL.fontSize,
                   textWidth: DEFAULT_THUMBNAIL.textWidth,
                   titleColor: DEFAULT_THUMBNAIL.titleColor,
                   textAlign: DEFAULT_THUMBNAIL.textAlign as any
                })}
                className="p-1 hover:bg-gray-800 rounded text-gray-500 hover:text-white transition"
                title="Resetar Texto"
             >
                <RotateCcw size={12} />
             </button>
          </div>
          
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Conteúdo</label>
            <textarea
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm focus:border-blue-500 outline-none transition resize-none custom-scrollbar"
              rows={3}
              value={data.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
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
          <div className="flex gap-2">
             <div className="flex-1">
               <SliderControl 
                  label="Posição X (%)"
                  min={-100} max={200}
                  value={data.titlePos.x}
                  onChange={(v) => onUpdate({ titlePos: { ...data.titlePos, x: v } })}
                  accentColor="blue-500"
               />
             </div>
             <div className="flex-1">
               <SliderControl 
                  label="Posição Y (%)"
                  min={-100} max={200}
                  value={data.titlePos.y}
                  onChange={(v) => onUpdate({ titlePos: { ...data.titlePos, y: v } })}
                  accentColor="blue-500"
               />
             </div>
          </div>
          </div>
           <SliderControl 
              label="Tamanho da Fonte"
              min={20} max={150}
              value={data.fontSize}
              onChange={(v) => onUpdate({ fontSize: v })}
              accentColor="blue-500"
              suffix="px"
           />

           <SliderControl 
              label="Largura do Bloco"
              min={10} max={100}
              value={data.textWidth || 90}
              onChange={(v) => onUpdate({ textWidth: v })}
              accentColor="blue-500"
              suffix="%"
           />
        </div>

        <hr className="border-gray-800" />

        {/* Background Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-800">
             <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon size={14} />
                Imagem de Fundo
             </h3>
             <button 
                onClick={() => onUpdate({
                   bgPos: DEFAULT_THUMBNAIL.bgPos,
                   bgZoom: DEFAULT_THUMBNAIL.bgZoom,
                   brightness: DEFAULT_THUMBNAIL.brightness,
                   saturation: DEFAULT_THUMBNAIL.saturation
                })}
                className="p-1 hover:bg-gray-800 rounded text-gray-500 hover:text-white transition"
                title="Resetar Fundo"
             >
                <RotateCcw size={12} />
             </button>
          </div>
          
          <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-xs px-3 py-2 rounded flex items-center gap-2 w-full justify-center transition active:scale-95">
            <Upload size={14} />
            Mudar Imagem
            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'bgImage')} />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <SliderControl 
              label="Brilho"
              min={0} max={200}
              value={data.brightness}
              onChange={(v) => onUpdate({ brightness: v })}
              accentColor="green-500"
              suffix="%"
            />
            <SliderControl 
              label="Saturação"
              min={0} max={200}
              value={data.saturation}
              onChange={(v) => onUpdate({ saturation: v })}
              accentColor="green-500"
              suffix="%"
            />
          </div>

           <div className="flex gap-2">
              <div className="flex-1">
                <SliderControl 
                    label="Posição X (%)"
                    min={-100} max={200}
                    value={data.bgPos.x}
                    onChange={(v) => onUpdate({ bgPos: { ...data.bgPos, x: v } })}
                    accentColor="green-500"
                />
              </div>
              <div className="flex-1">
                <SliderControl 
                    label="Posição Y (%)"
                    min={-100} max={200}
                    value={data.bgPos.y}
                    onChange={(v) => onUpdate({ bgPos: { ...data.bgPos, y: v } })}
                    accentColor="green-500"
                />
              </div>
          </div>
          
           <SliderControl 
              label="Zoom"
              min={1} max={3} step={0.1}
              value={data.bgZoom}
              onChange={(v) => onUpdate({ bgZoom: v })}
              accentColor="green-500"
              suffix="x"
           />
        </div>

        <hr className="border-gray-800" />

        {/* Logo Section */}
        <div className="space-y-4 pb-8">
          <div className="flex items-center justify-between pb-2 border-b border-gray-800">
             <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Layers size={14} />
                Logo
             </h3>
             <button 
                onClick={() => onUpdate({
                   logoPos: DEFAULT_THUMBNAIL.logoPos,
                   logoSize: DEFAULT_THUMBNAIL.logoSize
                })}
                className="p-1 hover:bg-gray-800 rounded text-gray-500 hover:text-white transition"
                title="Resetar Logo"
             >
                <RotateCcw size={12} />
             </button>
          </div>

          <div>
             <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 border border-gray-700 border-dashed rounded-lg p-3 flex items-center justify-center gap-2 transition mb-3">
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

          <div className="flex gap-2">
             <div className="flex-1">
               <SliderControl 
                  label="Posição X (%)"
                  min={-100} max={200}
                  value={data.logoPos.x}
                  onChange={(v) => onUpdate({ logoPos: { ...data.logoPos, x: v } })}
                  accentColor="purple-500"
               />
             </div>
             <div className="flex-1">
               <SliderControl 
                  label="Posição Y (%)"
                  min={-100} max={200}
                  value={data.logoPos.y}
                  onChange={(v) => onUpdate({ logoPos: { ...data.logoPos, y: v } })}
                  accentColor="purple-500"
               />
             </div>
          </div>
          
           <SliderControl 
              label="Tamanho da Logo"
              min={5} max={50}
              value={data.logoSize}
              onChange={(v) => onUpdate({ logoSize: v })}
              accentColor="purple-500"
              suffix="%"
           />
        </div>

      </div>
    </div>
  );
};

export default EditorControls;