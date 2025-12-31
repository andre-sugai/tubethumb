import React, { useState, useEffect, useCallback } from 'react';
import { ThumbnailData, DEFAULT_THUMBNAIL, Preset } from './types';
import EditorControls from './components/EditorControls';
import ThumbnailPreview from './components/ThumbnailPreview';
import { generateThumbnailBlob } from './utils/canvasGenerator';
import OrganicBackground from './components/OrganicBackground';
import ImageUploadModal from './components/ImageUploadModal';
import FullScreenViewer from './components/FullScreenViewer';
import { Grid, Layers, Download, Plus, Trash2, Upload, Image as ImageIcon, ArrowLeftRight, PanelRightClose, PanelRightOpen, Sidebar } from 'lucide-react';

function App() {
  const [mode, setMode] = useState<'setup' | 'editor'>('editor');
  
  // Initialize with 3 default thumbnails
  const [thumbnails, setThumbnails] = useState<ThumbnailData[]>(() => {
    return Array.from({ length: 3 }).map((_, i) => ({
      ...DEFAULT_THUMBNAIL,
      id: crypto.randomUUID(),
      title: `TÍTULO DO VÍDEO ${i + 1}`,
      fileName: `thumbnail-${i + 1}`,
    }));
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Effect to ensure selection on mount
  useEffect(() => {
    if (thumbnails.length > 0 && !selectedId) {
        setSelectedId(thumbnails[0].id);
    }
  }, [thumbnails, selectedId]);
  
  const [isApplyToAll, setIsApplyToAll] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);
  const [viewingIndex, setViewingIndex] = useState<number | null>(null);
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

  const deletePreset = (index: number) => {
    if (window.confirm("Tem certeza que deseja excluir este preset?")) {
      const updated = presets.filter((_, i) => i !== index);
      setPresets(updated);
      localStorage.setItem('tubeThumbPresets', JSON.stringify(updated));
    }
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

  // Helper to add more thumbnails
  const handleAddThumbnail = () => {
      const newThumb = {
        ...DEFAULT_THUMBNAIL,
        id: crypto.randomUUID(),
        title: `NOVO VÍDEO`,
        fileName: `thumbnail-${thumbnails.length + 1}`,
      };
      setThumbnails(prev => [...prev, newThumb]);
      setSelectedId(newThumb.id);
  };

  const handleApplyToAll = () => {
    const current = thumbnails.find(t => t.id === selectedId);
    if (!current) return;
    
    // Extract style data, preserving unique content per thumbnail
    const { id, bgImage, title, fileName, ...styleData } = current;
    
    setThumbnails(prev => prev.map(t => t.id === id ? t : { ...t, ...styleData }));
    alert("Estilo aplicado a todas as thumbnails!");
  };

  const handleBulkUpload = (files: FileList | null, append: boolean = false) => {
    if (!files || files.length === 0) return;
    
    const fileArray = Array.from(files);
    
    // If we have a target ID, we are replacing the background of a specific thumbnail
    if (uploadTargetId) {
       const file = fileArray[0];
       if (!file) return;
       
       const reader = new FileReader();
       reader.onload = (e) => {
          if (e.target?.result) {
            setThumbnails(prev => prev.map(t => t.id === uploadTargetId ? { ...t, bgImage: e.target?.result as string } : t));
            setSelectedId(uploadTargetId);
            setUploadTargetId(null); // Reset target
          }
       };
       reader.readAsDataURL(file);
       return;
    }

    // Otherwise, bulk add new thumbnails
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

  const handleDeleteThumbnail = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta thumbnail?")) {
      setThumbnails(prev => {
        const newThumbs = prev.filter(t => t.id !== id);
        if (selectedId === id) {
           setSelectedId(newThumbs.length > 0 ? newThumbs[0].id : null);
        }
        return newThumbs;
      });
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



  const selectedThumb = thumbnails.find(t => t.id === selectedId) || thumbnails[0];

  return (
    <div className="h-screen flex flex-col bg-transparent overflow-hidden relative">
      <OrganicBackground />
      <div className="relative z-10 flex flex-col h-full w-full">
        {/* Header */}
        <header className="flex justify-between items-center p-4 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
           <div className="flex items-center gap-3">
             <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-900/20">
               <Layers className="text-white" size={24} />
             </div>
             <div>
               <h1 className="text-xl font-bold text-white tracking-tight">TubeThumb</h1>
               <p className="text-[10px] text-gray-400 font-medium">CRIADOR EM MASSA</p>
             </div>
           </div>
           
           <div className="flex gap-3">
              <button onClick={handleAddThumbnail} className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 transition">
                <Plus size={18} />
                <span className="hidden sm:inline">Adicionar</span>
              </button>
              <button 
                onClick={() => {
                  setUploadTargetId(null);
                  setIsUploadModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 transition"
              >
                <Upload size={18} />
                <span className="hidden sm:inline">Upload</span>
              </button>
              <button 
                onClick={handleApplyToAll}
                className="flex items-center gap-2 px-4 py-2 bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 border border-blue-800 rounded-lg transition"
                title="Aplicar estilo da selecionada para todas"
              >
                <ArrowLeftRight size={18} />
                <span className="hidden sm:inline">Sincronizar Estilos</span>
              </button>
              <button 
                onClick={handleDownloadAll}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg shadow-lg shadow-green-900/20 transition font-medium"
              >
                <Download size={18} />
              </button>
              
              <div className="h-6 w-px bg-gray-700 mx-1"></div>
              
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`p-2 rounded-lg border transition ${isSidebarOpen ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'}`}
                title={isSidebarOpen ? "Fechar Editor" : "Abrir Editor"}
              >
                {isSidebarOpen ? <PanelRightOpen size={18} /> : <PanelRightClose size={18} />}
              </button>
           </div>
        </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {thumbnails.map((thumb, index) => (
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
                onDelete={() => handleDeleteThumbnail(thumb.id)}
                onOpenUploadModal={() => {
                  setUploadTargetId(thumb.id);
                  setIsUploadModalOpen(true);
                }}
                onMaximize={() => setViewingIndex(index)}
              />
            ))}
            
            <div 
              onClick={handleAddThumbnail}
              className="relative group cursor-pointer aspect-video border-2 border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:text-blue-500 hover:border-blue-500 hover:bg-black/40 transition gap-2 overflow-hidden bg-black/20 backdrop-blur-sm"
            >
              <Plus size={32} />
              <span className="font-medium text-sm">Adicionar Mais</span>
            </div>
          </div>
        </div>

        {selectedThumb && isSidebarOpen && (
          <EditorControls 
            data={selectedThumb}
            onUpdate={handleUpdate}
            presets={presets}
            onSavePreset={savePreset}
            onLoadPreset={loadPreset}
            onDeletePreset={deletePreset}
            isApplyToAll={isApplyToAll}
            onToggleApplyToAll={() => setIsApplyToAll(!isApplyToAll)}
          />
        )}
      </div>
      
      <ImageUploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => {
           setIsUploadModalOpen(false);
           setUploadTargetId(null);
        }}
        onUpload={(files) => handleBulkUpload(files, true)}
      />

      {viewingIndex !== null && (
        <FullScreenViewer
          thumbnails={thumbnails}
          initialIndex={viewingIndex}
          onClose={() => setViewingIndex(null)}
        />
      )}

      </div>
    </div>
  );
}

export default App;