import { useState } from 'react';
import HomePage from './pages/Homepage';
import MemorizeGemsPage from './pages/MemorizeGemsPage';
import { MemorizeMode } from './types/cards';
import './index.css';

export default function App() {
  const [mode, setMode] = useState<MemorizeMode | null>(null);

  if (!mode) {
    return <HomePage onPickMode={setMode} />;
  }

  return <MemorizeGemsPage mode={mode} onBack={() => setMode(null)} />;
}