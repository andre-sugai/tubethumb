import React, { useState, useEffect, useCallback } from 'react';
import { ThumbnailData, DEFAULT_THUMBNAIL, Preset } from './types';
import EditorControls from './components/EditorControls';
import ThumbnailPreview from './components/ThumbnailPreview';
import { generateThumbnailBlob } from './utils/canvasGenerator';
import { Grid, Layers, Download, Plus, Trash2, Upload, Image as ImageIcon } from 'lucide-react';

function App() {
  const [mode, setMode] = useState<'setup' | 'editor'>('setup');
  const [countInput, setCountInput] = useState<number>(3);
  
  const [thumbnails, setThumbnails] = useState<ThumbnailData[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const [isApplyToAll, setIsApplyToAll] = useState<boolean>(false);
  const [presets, setPresets] = useState<Preset[]>([]);

  // Load presets from storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('tubeThumbPresets');
    if (saved) {
      try {
        setPresets(JSON.parse(saved));
      } catch (e) { 
        console.error('Error loading presets', e); 
        setPresets([]);
      }
    }
  }, []);

  // Save presets
  const savePreset = () => {
    // Tenta encontrar pelo ID selecionado ou pega a primeira disponível se estiver no editor
    const current = thumbnails.find(t => t.id === selectedId) || thumbnails[0];
    
    if (!current) {
      alert("Crie ou selecione uma thumbnail primeiro.");
      return;
    }

    const name = prompt("Dê um nome para este preset (estilo de texto, cores e posição):");
    if (!name) return;

    // Extrai apenas os dados de estilo, omitindo conteúdo único
    const { 
      id, bgImage, title, fileName, 
      ...presetStyleData 
    } = current;

    const newPreset: Preset = { 
      name: name.trim(), 
      data: presetStyleData 
    };
    
    const updated = [...presets, newPreset];
    setPresets(updated);
    localStorage.setItem('tubeThumbPresets', JSON.stringify(updated));
    alert(`Preset "${name}" salvo com sucesso!`);
  };

  const loadPreset = (preset: Preset) => {
    if (!selectedId && !isApplyToAll && thumbnails.length > 0) {
      // Se não houver ID mas houver thumbnails, seleciona a primeira
      setSelectedId(thumbnails[0].id);
    }
    
    const updateFn = (t: ThumbnailData) => ({
      ...t,
      ...preset.data
    });

    if (isApplyToAll) {
      setThumbnails(prev => prev.map(updateFn));
    } else {
      setThumbnails(prev => {
        const targetId = selectedId || (prev.length > 0 ? prev[0].id : null);
        return prev.map(t => t.id === targetId ? updateFn(t) : t);
      });
    }
  };

  // Setup Generator
  const generateThumbnails = () => {
    const newThumbs: ThumbnailData[] = Array.from({ length: countInput }).map((_, i) => ({
      ...DEFAULT_THUMBNAIL,
      id: crypto.randomUUID(),
      title: `TÍTULO DO VÍDEO ${i + 1}`,
      fileName: `thumbnail-${i + 1}`,
    }));
    setThumbnails(newThumbs);
    if (newThumbs.length > 0) setSelectedId(newThumbs[0].id);
    setMode('editor');
  };

  const handleBulkUpload = (files: FileList | null, append: boolean = false) => {
    if (!files || files.length === 0) return;
    
    const fileArray = Array.from(files);
    const readers = fileArray.map((file) => {
      return new Promise<ThumbnailData>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
          const cleanTitle = nameWithoutExt.replace(/[-_]/g, " ").toUpperCase();
          
          resolve({
            ...DEFAULT_THUMBNAIL,
            id: crypto.randomUUID(),
            title: cleanTitle,
            fileName: nameWithoutExt,
            bgImage: e.target?.result as string
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((results) => {
      if (append) {
        setThumbnails(prev => {
          const newState = [...prev, ...results];
          return newState;
        });
        if (results.length > 0) setSelectedId(results[0].id);
      } else {
        setThumbnails(results);
        if (results.length > 0) setSelectedId(results[0].id);
        setMode('editor');
      }
    });
  };

  // Update Logic
  const handleUpdate = (updates: Partial<ThumbnailData>) => {
    if (isApplyToAll) {
      setThumbnails(prev => prev.map(t => ({ ...t, ...updates })));
    } else {
      const targetId = selectedId || (thumbnails.length > 0 ? thumbnails[0].id : null);
      if (!targetId) return;
      setThumbnails(prev => prev.map(t => t.id === targetId ? { ...t, ...updates } : t));
    }
  };

  const handleDownloadSingle = async (data: ThumbnailData) => {
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

  const handleDownloadAll = async () => {
    for (const thumb of thumbnails) {
      await handleDownloadSingle(thumb);
      await new Promise(r => setTimeout(r, 500));
    }
  };

  // Render Setup Screen
  if (mode === 'setup') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl max-w-lg w-full text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/50">
              <Layers size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">TubeThumb Criador em Massa</h1>
          <p className="text-gray-400 mb-8">Crie thumbnails consistentes e de alta qualidade em massa.</p>
          
          <div className="space-y-8">
            <div className="group relative">
               <input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  onChange={(e) => handleBulkUpload(e.target.files, false)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
               />
               <div className="border-2 border-dashed border-white/10 group-hover:border-blue-500 group-hover:bg-blue-900/30 rounded-xl p-8 transition-all duration-300">
                  <div className="flex flex-col items-center gap-3">
                     <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-blue-500 group-hover:scale-110 transition">
                        <Upload size={24} />
                     </div>
                     <div>
                       <h3 className="text-lg font-semibold text-white group-hover:text-blue-400">Enviar Imagens</h3>
                       <p className="text-sm text-gray-500">Selecione as fotos dos seus vídeos</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="relative flex items-center justify-center">
               <hr className="w-full border-white/5" />
               <span className="absolute bg-black px-3 text-xs text-gray-500 uppercase tracking-widest backdrop-blur-md">OU</span>
            </div>

            <div className="bg-gray-900/60 p-4 rounded-xl border border-white/5">
               <label className="block text-sm font-medium text-gray-400 mb-3">
                 Quantidade de modelos
               </label>
               <div className="flex items-center gap-3 justify-center">
                  <button onClick={() => setCountInput(Math.max(1, countInput - 1))} className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 text-white transition"><Trash2 size={18}/></button>
                  <input 
                    type="number" 
                    min="1" 
                    max="50"
                    value={countInput}
                    onChange={(e) => setCountInput(parseInt(e.target.value) || 1)}
                    className="w-24 text-center bg-black border border-white/10 rounded-lg py-2 text-xl font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button onClick={() => setCountInput(countInput + 1)} className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 text-white transition"><Plus size={18}/></button>
                  
                  <button 
                    onClick={generateThumbnails}
                    className="ml-4 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg transition transform active:scale-95 flex items-center gap-2"
                  >
                    Gerar <Grid size={18} />
                  </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const selectedThumb = thumbnails.find(t => t.id === selectedId) || thumbnails[0];

  return (
    <div className="h-screen flex flex-col bg-transparent overflow-hidden">
      <header className="h-16 bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <Layers className="text-blue-500" />
          <span className="font-bold text-lg tracking-tight text-white">TubeThumb</span>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="text-sm text-gray-400">
             {thumbnails.length} Itens
           </div>
           
           <button 
             onClick={() => setMode('setup')}
             className="px-4 py-2 text-sm text-gray-400 hover:text-white transition"
           >
             Reiniciar
           </button>

           <button 
             onClick={handleDownloadAll}
             className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-green-900/20 transition active:scale-95"
           >
             <Download size={16} /> Baixar Todas
           </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {thumbnails.map(thumb => (
              <ThumbnailPreview 
                key={thumb.id}
                data={thumb}
                isSelected={selectedId === thumb.id}
                onSelect={() => setSelectedId(thumb.id)}
                onUpdate={(updates) => {
                  setSelectedId(thumb.id);
                  setThumbnails(prev => prev.map(t => t.id === thumb.id ? { ...t, ...updates } : t));
                }}
                onDownload={() => handleDownloadSingle(thumb)}
              />
            ))}
            
            <div className="relative group cursor-pointer aspect-video border-2 border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:text-blue-500 hover:border-blue-500 hover:bg-black/40 transition gap-2 overflow-hidden bg-black/20 backdrop-blur-sm">
              <input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  onChange={(e) => handleBulkUpload(e.target.files, true)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <Plus size={32} />
              <span className="font-medium text-sm">Adicionar Mais</span>
            </div>
          </div>
        </div>

        {selectedThumb && (
          <EditorControls 
            data={selectedThumb}
            onUpdate={handleUpdate}
            presets={presets}
            onSavePreset={savePreset}
            onLoadPreset={loadPreset}
            isApplyToAll={isApplyToAll}
            onToggleApplyToAll={() => setIsApplyToAll(!isApplyToAll)}
          />
        )}
      </div>
    </div>
  );
}

export default App;