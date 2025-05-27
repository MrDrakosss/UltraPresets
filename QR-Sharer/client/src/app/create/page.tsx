'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Switch } from '@/src/components/ui/switch';
import { ThemeSwitch } from '@/src/components/ui/theme_switch';

export default function CreatePage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [theme, setTheme] = useState('');
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [backgroundMode, setBackgroundMode] = useState<'gradient' | 'image'>('gradient');

  const gradientOptions = [
    'from-black to-gray-800',
    'from-purple-700 to-pink-500',
    'from-blue-700 to-cyan-500',
    'from-green-700 to-lime-500',
    'from-yellow-600 to-red-500',
    'from-fuchsia-700 to-rose-400',
    'from-sky-700 to-indigo-600'
  ];

  const normalizeId = (text: string) =>
    text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '_').toLowerCase();

  const handleCreate = () => {
    if (!name || !url) return;
    const id = normalizeId(name);
    const data = {
      name,
      url,
      theme: backgroundMode === 'gradient' ? theme : '',
      customImage: backgroundMode === 'image' ? customImage : null,
      isPrivate
    };
    localStorage.setItem(id, JSON.stringify(data));
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* NAVBAR */}
      <nav className="w-full bg-gray-950 px-6 py-4 flex justify-between items-center border-b border-gray-800">
        <h1 className="text-xl font-bold">QR Sharer</h1>
        <div className="flex gap-4">
          <Button onClick={() => router.push('/')}>Vissza</Button>
          <ThemeSwitch />
        </div>
      </nav>

      <div className="flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-xl space-y-4">
          <h1 className="text-3xl font-bold text-center">Új QR kód létrehozása</h1>

          <div>
            <label className="block text-sm mb-1">Név</label>
            <Input placeholder="Név" className="w-full" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm mb-1">QR kód linkje</label>
            <Input placeholder="Link" className="w-full" value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm mb-1">Privát QR-kód</label>
            <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
          </div>

          {/* Háttér típusa */}
          <div>
            <label className="block text-sm mb-1">Háttér típusa</label>
            <div className="flex gap-4">
              <Button
                variant={backgroundMode === 'gradient' ? 'default' : 'outline'}
                onClick={() => setBackgroundMode('gradient')}
              >
                Gradient
              </Button>
              <Button
                variant={backgroundMode === 'image' ? 'default' : 'outline'}
                onClick={() => {
                  setBackgroundMode('image');
                  setTheme('');
                }}
              >
                Fénykép
              </Button>
            </div>
          </div>

          {/* Gradient opciók */}
          {backgroundMode === 'gradient' && (
            <div>
              <label className="block text-sm mb-1 mt-4">Gradient háttér</label>
              <div className="grid grid-cols-3 gap-2">
                {gradientOptions.map((grad) => (
                  <button
                    key={grad}
                    onClick={() => setTheme(grad)}
                    className={`h-10 rounded bg-gradient-to-br ${grad} ${theme === grad ? 'ring-2 ring-white' : ''}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Kép feltöltés + előnézet */}
          {backgroundMode === 'image' && (
            <div className="mt-4">
              <label className="block text-sm mb-1">Háttérkép</label>

              <label className="cursor-pointer bg-gray-800 px-4 py-2 rounded inline-block mb-2">
                <span>Fájl kiválasztása</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === 'string') {
                          setCustomImage(reader.result);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>

              {customImage ? (
                <img
                  src={customImage}
                  alt="Előnézet"
                  className="rounded shadow max-h-48 object-cover border border-gray-700"
                />
              ) : (
                <div className="w-full h-48 flex items-center justify-center border border-dashed border-gray-600 text-gray-500 rounded">
                  Nincs háttérkép
                </div>
              )}
            </div>
          )}

          <Button onClick={handleCreate} className="w-full">Létrehozás</Button>
        </div>
      </div>
    </div>
  );
}
