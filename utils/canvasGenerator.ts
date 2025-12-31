import { ThumbnailData } from '../types';

/**
 * Generates a Blob for the thumbnail using HTML5 Canvas.
 * Returns a Promise that resolves to a Blob.
 */
export const generateThumbnailBlob = async (data: ThumbnailData): Promise<Blob | null> => {
  const canvas = document.createElement('canvas');
  // Alpha: false otimiza a performance e renderização
  const ctx = canvas.getContext('2d', { alpha: false });
  
  // Aumentado para Full HD (1920x1080) para eliminar serrilhados e melhorar qualidade
  const WIDTH = 1920;
  const HEIGHT = 1080;
  
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  
  if (!ctx) return null;

  // Configurações de Alta Qualidade
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. Draw Background (Black base)
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // 2. Draw Background Image
  if (data.bgImage) {
    try {
      const img = await loadImage(data.bgImage);
      
      // Calculate scaling to cover
      const scale = Math.max(WIDTH / img.width, HEIGHT / img.height) * data.bgZoom;
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;

      // Position logic: data.bgPos is percentage (0-100)
      // Center point calculation
      const x = (WIDTH - scaledWidth) * (data.bgPos.x / 100);
      const y = (HEIGHT - scaledHeight) * (data.bgPos.y / 100);

      // Apply filters
      ctx.filter = `brightness(${data.brightness}%) saturate(${data.saturation}%)`;
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
      ctx.filter = 'none'; // Reset filter
    } catch (e) {
      console.error("Failed to load background image", e);
    }
  }

  // 3. Draw Logo
  if (data.logoImage) {
    try {
      const logo = await loadImage(data.logoImage);
      
      // Calculate size based on percentage of height
      const logoHeight = (HEIGHT * data.logoSize) / 100;
      const aspectRatio = logo.width / logo.height;
      const logoWidth = logoHeight * aspectRatio;

      const lx = (WIDTH * data.logoPos.x) / 100;
      const ly = (HEIGHT * data.logoPos.y) / 100;

      // Add a subtle drop shadow to logo for separation
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;

      ctx.drawImage(logo, lx, ly, logoWidth, logoHeight);
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    } catch (e) {
      console.error("Failed to load logo", e);
    }
  }

  // 4. Draw Text
  if (data.title) {
    // Basic Text Config
    ctx.fillStyle = data.titleColor;
    ctx.textAlign = data.textAlign;
    ctx.textBaseline = 'middle';
    
    // Font setup
    // Multiplicador ajustado para a nova resolução de 1080p
    // Anteriormente era 1.5 para 720p. 
    // 1080p é 1.5x maior que 720p, então 1.5 * 1.5 = 2.25
    const scaledFontSize = data.fontSize * 2.25; 
    ctx.font = `900 ${scaledFontSize}px Inter, Roboto, sans-serif`;
    
    // Stroke Setup (Outline)
    // Reduzimos ligeiramente a proporção do stroke para ficar mais nítido em alta resolução
    ctx.lineWidth = scaledFontSize * 0.15; 
    ctx.strokeStyle = 'black';
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;

    const tx = (WIDTH * data.titlePos.x) / 100;
    const ty = (HEIGHT * data.titlePos.y) / 100;

    // Calculate Max Width based on percentage (uses new WIDTH)
    const maxTextWidth = (WIDTH * (data.textWidth || 90)) / 100;

    // Process Text Wrapping
    const rawLines = data.title.split('\n');
    const finalLines: string[] = [];

    rawLines.forEach((paragraph) => {
      const words = paragraph.toUpperCase().split(' ');
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxTextWidth) {
          currentLine += " " + word;
        } else {
          finalLines.push(currentLine);
          currentLine = word;
        }
      }
      finalLines.push(currentLine);
    });

    const lineHeight = scaledFontSize * 1.1;
    const totalHeight = finalLines.length * lineHeight;
    
    // Adjust start Y to center the block of text around the point
    let currentY = ty - (totalHeight / 2) + (lineHeight / 2);

    finalLines.forEach(line => {
      // Draw Stroke first
      ctx.strokeText(line, tx, currentY);
      // Draw Fill on top
      ctx.fillText(line, tx, currentY);
      currentY += lineHeight;
    });
  }

  // 5. Export with Size Limit Check (Max 1.9MB)
  // Ajustado para 1.9MB para garantir margem de segurança para upload no YouTube (limite de 2MB)
  const MAX_SIZE_BYTES = 1.9 * 1024 * 1024; 
  let quality = 1.0; // Começa com qualidade máxima
  let step = 0.05;

  const getBlob = (q: number) => new Promise<Blob | null>(r => canvas.toBlob(r, 'image/jpeg', q));

  let blob = await getBlob(quality);

  // Loop para reduzir qualidade se for maior que o limite
  while (blob && blob.size > MAX_SIZE_BYTES && quality > 0.5) {
    quality -= step;
    blob = await getBlob(quality);
  }

  return blob;
};

// Helper to load image
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};