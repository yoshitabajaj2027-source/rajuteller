// On-device person cutout + illustrated destination composite.
// MediaPipe Selfie Segmentation runs fully in the browser.
// The photo never leaves the visitor's device.

declare global {
  interface Window {
    SelfieSegmentation?: new (opts: { locateFile: (f: string) => string }) => SegInstance;
  }
}

type SegInstance = {
  setOptions(o: { modelSelection: number }): void;
  onResults(cb: (r: { segmentationMask: CanvasImageSource }) => void): void;
  send(input: { image: HTMLImageElement }): Promise<void>;
};

let segPromise: Promise<SegInstance> | null = null;

function loadSegmenter(): Promise<SegInstance> {
  if (!segPromise) {
    segPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = '/mediapipe/selfie_segmentation.js';
      s.onload = () => {
        try {
          if (!window.SelfieSegmentation) throw new Error('SelfieSegmentation missing');
          const seg = new window.SelfieSegmentation({ locateFile: (f) => `/mediapipe/${f}` });
          seg.setOptions({ modelSelection: 1 });
          resolve(seg);
        } catch (e) {
          reject(e);
        }
      };
      s.onerror = () => reject(new Error('segmenter script failed to load'));
      document.head.appendChild(s);
    });
    segPromise.catch(() => {
      segPromise = null; // allow a retry on failure
    });
  }
  return segPromise;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => rej(new Error('destination image failed'));
    i.src = src;
  });
}

export async function compositeTrip(photo: HTMLImageElement, destFile: string): Promise<string> {
  const seg = await loadSegmenter();
  const W = Math.min(1024, photo.naturalWidth || 1024);
  const H = Math.max(1, Math.round((photo.naturalHeight || 1024) * (W / (photo.naturalWidth || 1024))));

  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = W;
  maskCanvas.height = H;
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('segmentation timed out')), 20000);
    seg.onResults((r) => {
      clearTimeout(timer);
      const mc = maskCanvas.getContext('2d')!;
      try {
        mc.filter = 'blur(2px)';
      } catch {
        /* older browsers: skip soft edge */
      }
      mc.drawImage(r.segmentationMask, 0, 0, W, H);
      resolve();
    });
    seg.send({ image: photo }).catch((e) => {
      clearTimeout(timer);
      reject(e);
    });
  });

  // Cut the people out of the photo.
  const person = document.createElement('canvas');
  person.width = W;
  person.height = H;
  const pc = person.getContext('2d')!;
  pc.drawImage(photo, 0, 0, W, H);
  pc.globalCompositeOperation = 'destination-in';
  pc.drawImage(maskCanvas, 0, 0);

  // Sanity check: if the model found no person, bail instead of
  // showing an empty backdrop with a caption about the couple.
  const sample = pc.getImageData(0, 0, W, H).data;
  let personPixels = 0;
  for (let i = 3; i < sample.length; i += 4 * 97) {
    if (sample[i] > 40) personPixels++;
  }
  if (personPixels < 20) throw new Error('no person found in photo');

  // Place them on the illustrated backdrop, feet at the bottom edge.
  const dest = await loadImage(destFile);
  const out = document.createElement('canvas');
  out.width = dest.naturalWidth;
  out.height = dest.naturalHeight;
  const oc = out.getContext('2d')!;
  oc.drawImage(dest, 0, 0);
  const scale = Math.min((out.height * 0.9) / H, (out.width * 0.94) / W);
  const dw = W * scale;
  const dh = H * scale;
  oc.drawImage(person, (out.width - dw) / 2, out.height - dh, dw, dh);
  return out.toDataURL('image/png');
}
