'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/src/components/ui/button';
import { ThemeSwitch } from '@/src/components/ui/theme_switch';
import { useRouter } from 'next/navigation';

export default function QRListPage() {
  const [qrList, setQrList] = useState<{ id: string; name: string }[]>([]);
  const router = useRouter();

  useEffect(() => {
    const keys = Object.keys(localStorage);
    const stored = keys.map((key) => {
      try {
        return { id: key, ...JSON.parse(localStorage.getItem(key) || '{}') };
      } catch {
        return null;
      }
    }).filter(Boolean) as typeof qrList;
    setQrList(stored);
  }, []);

  const handleDelete = (id: string) => {
    localStorage.removeItem(id);
    setQrList((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white">
      <nav className="w-full bg-gray-950 px-6 py-4 flex justify-between items-center border-b border-gray-800">
        <h1 className="text-xl font-bold">QR Sharer</h1>
        <div className="flex gap-4">
          <Button onClick={() => router.push('/create')} className='cursor-pointer'>Új QR</Button>
          <ThemeSwitch />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-xl font-semibold mb-4 text-center">Létrehozott QR kódok</h2>
        <ul className="flex flex-col gap-3">
          {qrList.map((item) => (
            <li key={item.id} className="flex justify-between items-center bg-gray-800 p-4 rounded">
              <span className='font-bold text-xl'>{item.name}</span>
              <div className="flex gap-2">
                <Button onClick={() => window.open(`/${item.id}`, '_blank')}>Megnyitás</Button>
                <Button onClick={() => router.push(`/edit/${item.id}`)}>Szerkesztés</Button>
                <Button color='bg-red-500' onClick={() => handleDelete(item.id)}>Törlés</Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
