'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import '../globals.css';

export default function QRPage() {
  const { id } = useParams();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [data, setData] = useState<{
    name: string;
    url: string;
    theme: string;
    customImage?: string;
    isPrivate?: boolean;
  } | null>(null);
  const [qrColor, setQrColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('text-white');
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    if (!id) return;
    const stored = localStorage.getItem(id.toString());
    if (stored) {
      const parsed = JSON.parse(stored);
      setData(parsed);
    }
  }, [id]);

  useEffect(() => {
    if (data?.isPrivate) return;
    if (data?.customImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = data.customImage;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let r = 0, g = 0, b = 0;
        const pixels = imageData.data;
        const total = pixels.length / 4;
        for (let i = 0; i < pixels.length; i += 4) {
          r += pixels[i];
          g += pixels[i + 1];
          b += pixels[i + 2];
        }
        r /= total;
        g /= total;
        b /= total;
        const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        setQrColor(luminance > 180 ? '#000000' : '#ffffff');
        setTextColor(luminance > 180 ? 'text-black' : 'text-white');
        setCalculating(true)
      };
    } else if (data?.theme) {
      // fallback simple theme luminance logic
      const isLight = data.theme.includes('lime') ||
        data.theme.includes('pink') ||
        data.theme.includes('black') ||
        data.theme.includes('gray') ||
        data.theme.includes('yellow') ||
        data.theme.includes('fuchsia') ||
        data.theme.includes('sky') ||
        data.theme.includes('cyan');
      setQrColor(isLight ? '#ffffff' : '#000000');
      setTextColor(isLight ? 'text-white' : 'text-black');
      setCalculating(true)
    }
  }, [data]);

  if (!data || !calculating) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <h1 className='font-bold text-2xl'>QR kód betöltése...</h1>
      </div>
    );
  }

  if (data.isPrivate) {
    return (
      <div className="h-screen w-screen flex items-center justify-center text-center bg-black text-white text-4xl font-bold">
        Privát QR kód – nincs jogosultság a megtekintéshez.
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center relative overflow-hidden select-none">
      {data.customImage ? (
        <img
          src={data.customImage}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover z-0 blur"
        />
      ) : (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${data.theme} animate-gradient z-0`}
        />
      )}

      <div className="relative z-10 w-full max-w-[90vmin] aspect-square py-12">
        <h1 className={`text-2xl md:text-3xl font-black uppercase ${textColor} mb-12 text-center mix-blend-difference`}>
          {data.name}
        </h1>
        <QRCodeSVG
          value={data.url}
          fgColor={qrColor}
          bgColor="transparent"
          className="w-full h-full"
        />
      </div>
    </div>
  );
}