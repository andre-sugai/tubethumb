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
      
      // CSS transform order: translate(x%, y%) scale(zoom)
      // This means: translate is applied to ORIGINAL size, then scale is applied
      
      // Step 1: Calculate base scale to cover (without zoom)
      const baseScale = Math.max(WIDTH / img.width, HEIGHT / img.height);
      const baseWidth = img.width * baseScale;
      const baseHeight = img.height * baseScale;
      
      // Step 2: Apply translation on the base (unzoomed) dimensions
      // This matches CSS translate(x-50%, y-50%) which operates on original element size
      const baseCenterX = (WIDTH - baseWidth) / 2;
      const baseCenterY = (HEIGHT - baseHeight) / 2;
      const translateX = (baseWidth * (data.bgPos.x - 50) / 100);
      const translateY = (baseHeight * (data.bgPos.y - 50) / 100);
      
      // Step 3: Apply zoom to get final dimensions
      const finalScale = baseScale * data.bgZoom;
      const finalWidth = img.width * finalScale;
      const finalHeight = img.height * finalScale;
      
      // Step 4: Calculate final position
      // The zoom scales from the center, so we need to adjust position accordingly
      const zoomOffset = (data.bgZoom - 1) / 2;
      const x = baseCenterX + translateX - (baseWidth * zoomOffset);
      const y = baseCenterY + translateY - (baseHeight * zoomOffset);

      // Apply filters
      ctx.filter = `brightness(${data.brightness}%) saturate(${data.saturation}%)`;
      ctx.drawImage(img, x, y, finalWidth, finalHeight);
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

      // Center logo on the position point (matching preview transform: translate(-50%, -50%))
      const lx = (WIDTH * data.logoPos.x) / 100 - (logoWidth / 2);
      const ly = (HEIGHT * data.logoPos.y) / 100 - (logoHeight / 2);

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
    // Font setup first (needed for measurements)
    // Multiplicador ajustado para a nova resolução de 1080p
    const scaledFontSize = data.fontSize * 2.25; 
    ctx.font = `900 ${scaledFontSize}px Inter, Roboto, sans-serif`;
    
    // Calculate Max Width based on percentage
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

    // Calculate text container dimensions
    const lineHeight = scaledFontSize * 1.1;
    const totalHeight = finalLines.length * lineHeight;
    
    // Find the widest line to determine container width
    let maxLineWidth = 0;
    finalLines.forEach(line => {
      const lineWidth = ctx.measureText(line).width;
      if (lineWidth > maxLineWidth) maxLineWidth = lineWidth;
    });
    
    // Position of the text container center point (matching preview's titlePos)
    const containerCenterX = (WIDTH * data.titlePos.x) / 100;
    const containerCenterY = (HEIGHT * data.titlePos.y) / 100;
    
    // Calculate container bounds (matching preview's transform: translate(-50%, -50%))
    // The container width is maxTextWidth, centered at containerCenterX
    const containerLeft = containerCenterX - (maxTextWidth / 2);
    const containerTop = containerCenterY - (totalHeight / 2);
    
    // Calculate text X position based on alignment within the container
    let textX: number;
    if (data.textAlign === 'left') {
      textX = containerLeft;
    } else if (data.textAlign === 'right') {
      textX = containerLeft + maxTextWidth;
    } else { // center
      textX = containerCenterX;
    }
    
    // Text rendering config
    ctx.fillStyle = data.titleColor;
    ctx.textAlign = data.textAlign;
    ctx.textBaseline = 'middle';
    
    // Stroke Setup (Outline)
    ctx.lineWidth = scaledFontSize * 0.15; 
    ctx.strokeStyle = 'black';
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    
    // Draw each line
    let currentY = containerTop + (lineHeight / 2);
    finalLines.forEach(line => {
      // Draw Stroke first
      ctx.strokeText(line, textX, currentY);
      // Draw Fill on top
      ctx.fillText(line, textX, currentY);
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