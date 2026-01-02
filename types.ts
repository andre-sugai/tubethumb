export interface Position {
  x: number;
  y: number;
}

export interface ThumbnailData {
  id: string;
  fileName: string; // Nome do arquivo para salvar
  // Background
  bgImage: string | null;
  bgPos: Position;
  bgZoom: number;
  brightness: number;
  saturation: number;
  
  // Title
  title: string;
  titleColor: string;
  titlePos: Position;
  textAlign: 'left' | 'center' | 'right';
  fontSize: number;
  textWidth: number; // Largura máxima do texto em %
  
  // Advanced Text Styles
  textStrokeWidth?: number;
  textStrokeColor?: string;
  textShadowBlur?: number;
  textShadowColor?: string;
  textShadowOffsetX?: number;
  textShadowOffsetY?: number;
  
  // Logo
  logoImage: string | null;
  logoPos: Position;
  logoSize: number;
  
  // Tag
  tag: string;
}

export interface Preset {
  name: string;
  data: Omit<ThumbnailData, 'id' | 'bgImage' | 'title' | 'fileName'>; // Presets don't store unique content
}

export const DEFAULT_THUMBNAIL: Omit<ThumbnailData, 'id'> = {
  fileName: "thumbnail",
  bgImage: null,
  bgPos: { x: 50, y: 50 },
  bgZoom: 1,
  brightness: 100,
  saturation: 100,
  
  title: "SEU TÍTULO AQUI",
  titleColor: "#FFFF00", // Amarelo padrão de thumbnail
  titlePos: { x: 50, y: 85 }, // Posição inferior (85%)
  textAlign: 'center',
  fontSize: 80, // Fonte maior para impacto
  textWidth: 90, // 90% da largura
  
  // Default Advanced Styles
  textStrokeWidth: 0,
  textStrokeColor: '#000000',
  textShadowBlur: 0,
  textShadowColor: '#000000',
  textShadowOffsetX: 0,
  textShadowOffsetY: 0,
  
  logoImage: null,
  logoPos: { x: 4, y: 4 }, // Canto superior esquerdo com margem pequena
  logoSize: 20,
  
  // Tag
  tag: "",
};