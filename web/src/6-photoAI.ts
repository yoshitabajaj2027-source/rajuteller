// On-device photo scan. Uses face-api.js (open source) with small models
// served from this same site. The photo never leaves the visitor's device.
// face-api.js (with tfjs) is heavy, so it loads lazily only when needed.
import type { PhotoSignals } from './fortunes';

type FaceApi = typeof import('face-api.js');
let faceapi: FaceApi | null = null;
let loading: Promise<boolean> | null = null;

export function loadModels(): Promise<boolean> {
  if (!loading) {
    loading = (async () => {
      try {
        faceapi = await import('face-api.js');
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        ]);
        return true;
      } catch {
        return false;
      }
    })();
  }
  return loading;
}

export async function analyzePhoto(img: HTMLImageElement): Promise<PhotoSignals | null> {
  try {
    const ok = await loadModels();

    // Draw to a small canvas for brightness sampling and faster detection.
    const naturalW = img.naturalWidth || 512;
    const naturalH = img.naturalHeight || 512;
    const w = Math.min(512, naturalW);
    const h = Math.max(1, Math.round(naturalH * (w / naturalW)));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, w, h);

    let brightness = 0.6;
    try {
      const data = ctx.getImageData(0, 0, w, h).data;
      const step = 16;
      let sum = 0;
      let n = 0;
      for (let i = 0; i < data.length; i += 4 * step) {
        sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        n++;
      }
      brightness = n ? sum / n / 255 : 0.6;
    } catch {
      /* keep default */
    }

    if (!ok) return { faces: -1, happiness: -1, brightness };

    if (!faceapi) return { faces: -1, happiness: -1, brightness };
    const results = await faceapi
      .detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.3 }))
      .withFaceExpressions();
    const happiness = results.length
      ? results.reduce((s, r) => s + (r.expressions.happy || 0), 0) / results.length
      : 0;
    return { faces: results.length, happiness, brightness };
  } catch {
    return null;
  }
}
