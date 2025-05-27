import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export const ThemeSwitch = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="px-2 py-1 rounded border border-gray-500 text-sm"
    >
      Téma: {theme === 'dark' ? 'Sötét' : 'Világos'}
    </button>
  );
};
