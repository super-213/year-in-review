export const MAX_IMAGE_EDGE = 1600;
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export function imageDimensions(width, height, maxEdge = MAX_IMAGE_EDGE) {
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

const dataUrl = blob => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(new Error('图片读取失败，请重新选择。'));
  reader.readAsDataURL(blob);
});

export async function optimizeImage(blob) {
  if (!/^image\/(png|jpe?g|gif|webp|avif|bmp)$/i.test(blob.type) || blob.size > MAX_IMAGE_BYTES) {
    throw new Error('请选择不超过 10 MB 的 PNG、JPEG、GIF、WebP、AVIF 或 BMP 图片。');
  }
  // Keep animated formats intact; a canvas would silently discard their frames.
  const header = new Uint8Array(await blob.slice(0, 64).arrayBuffer());
  const signature = new TextDecoder('latin1').decode(header);
  const animatedWebp = blob.type === 'image/webp' && (signature.slice(12, 16) === 'VP8X' && (header[20] & 2));
  if (blob.type === 'image/gif' || animatedWebp || (blob.type === 'image/avif' && /avis/.test(signature))) return dataUrl(blob);
  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const size = imageDimensions(image.naturalWidth, image.naturalHeight);
    const resized = size.width !== image.naturalWidth || size.height !== image.naturalHeight;
    if (!resized && blob.type === 'image/webp') return dataUrl(blob);
    const canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('图片读取失败，请重新选择。');
    context.drawImage(image, 0, 0, size.width, size.height);
    const optimized = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', 0.82));
    return dataUrl(optimized && (resized || optimized.size < blob.size) ? optimized : blob);
  } finally {
    URL.revokeObjectURL(url);
  }
}
