import { useState, useEffect } from 'react';
import { Copy, Check, Download, Image as ImageIcon, Settings2, Monitor, Smartphone, Layout, Plus, Trash2 } from 'lucide-react';

const INITIAL_PRESETS = [
  { id: '1', name: 'Hero', width: 2100, height: 1200, iconType: 'monitor' },
  { id: '2', name: 'Mobile', width: 700, height: 900, iconType: 'smartphone' },
  { id: '3', name: 'Square', width: 1080, height: 1080, iconType: 'layout' },
  { id: '4', name: 'Landscape', width: 1920, height: 1080, iconType: 'monitor' },
  { id: '5', name: 'Portrait', width: 1080, height: 1920, iconType: 'smartphone' },
  { id: '6', name: 'Banner', width: 1200, height: 600, iconType: 'layout' },
];

const renderIcon = (type: string, className: string) => {
  if (type === 'monitor') return <Monitor className={className} />;
  if (type === 'smartphone') return <Smartphone className={className} />;
  return <Layout className={className} />;
};

export default function App() {
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(600);
  const [bgColor, setBgColor] = useState('cccccc');
  const [textColor, setTextColor] = useState('666666');
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  // Presets state
  const [presets, setPresets] = useState(() => {
    const saved = localStorage.getItem('dummyimg-presets');
    return saved ? JSON.parse(saved) : INITIAL_PRESETS;
  });
  const [isAddingPreset, setIsAddingPreset] = useState(false);
  const [newPreset, setNewPreset] = useState({ name: '', width: 1200, height: 600 });

  useEffect(() => {
    localStorage.setItem('dummyimg-presets', JSON.stringify(presets));
  }, [presets]);

  const handleAddPreset = () => {
    if (!newPreset.name) return;
    const preset = {
      id: Date.now().toString(),
      name: newPreset.name,
      width: newPreset.width,
      height: newPreset.height,
      iconType: newPreset.width > newPreset.height ? 'monitor' : (newPreset.width < newPreset.height ? 'smartphone' : 'layout')
    };
    setPresets([...presets, preset]);
    setIsAddingPreset(false);
    setNewPreset({ name: '', width: 1200, height: 600 });
  };

  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPresets(presets.filter((p: any) => p.id !== id));
  };

  // Derive the URL
  const baseUrl = window.location.origin;
  const params = new URLSearchParams();
  if (bgColor !== 'cccccc') params.append('bg', bgColor.replace('#', ''));
  if (textColor !== '666666') params.append('color', textColor.replace('#', ''));
  if (text) params.append('text', text);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  const imageUrl = `${baseUrl}/api/img/${width}x${height}.svg${queryString}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">DummyImg Gen</h1>
          </div>
          <div className="text-sm text-zinc-500 font-medium">
            Fast, simple placeholder images
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Controls Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
              <div className="flex items-center gap-2 mb-6">
                <Settings2 className="w-5 h-5 text-zinc-400" />
                <h2 className="text-lg font-medium">Configuration</h2>
              </div>

              {/* Dimensions */}
              <div className="space-y-4 mb-8">
                <h3 className="text-sm font-medium text-zinc-900">Dimensions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wider font-semibold">Width (px)</label>
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wider font-semibold">Height (px)</label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Presets */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-zinc-900">Presets</h3>
                  <button
                    onClick={() => setIsAddingPreset(!isAddingPreset)}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>

                {isAddingPreset && (
                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-3 mb-3">
                    <input
                      type="text"
                      placeholder="Preset Name"
                      value={newPreset.name}
                      onChange={e => setNewPreset({ ...newPreset, name: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border border-zinc-200 rounded-md outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Width"
                        value={newPreset.width}
                        onChange={e => setNewPreset({ ...newPreset, width: parseInt(e.target.value) || 1 })}
                        className="w-full px-2 py-1.5 text-sm border border-zinc-200 rounded-md outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                      <input
                        type="number"
                        placeholder="Height"
                        value={newPreset.height}
                        onChange={e => setNewPreset({ ...newPreset, height: parseInt(e.target.value) || 1 })}
                        className="w-full px-2 py-1.5 text-sm border border-zinc-200 rounded-md outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleAddPreset}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-1.5 rounded-md font-medium transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsAddingPreset(false)}
                        className="flex-1 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 text-xs py-1.5 rounded-md font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  {presets.map((preset: any) => (
                    <div key={preset.id} className="relative group">
                      <button
                        onClick={() => {
                          setWidth(preset.width);
                          setHeight(preset.height);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg transition-colors text-left"
                      >
                        {renderIcon(preset.iconType, "w-4 h-4 text-zinc-400 shrink-0")}
                        <div className="truncate pr-4">
                          <div className="font-medium text-zinc-900 truncate">{preset.name}</div>
                          <div className="text-xs text-zinc-500">{preset.width}x{preset.height}</div>
                        </div>
                      </button>
                      <button
                        onClick={(e) => handleDeletePreset(preset.id, e)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity rounded"
                        title="Delete preset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="space-y-4 mb-8">
                <h3 className="text-sm font-medium text-zinc-900">Colors</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wider font-semibold">Background</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={`#${bgColor}`}
                        onChange={(e) => setBgColor(e.target.value.replace('#', ''))}
                        className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                      />
                      <input
                        type="text"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value.replace('#', ''))}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none font-mono text-sm uppercase"
                        maxLength={6}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wider font-semibold">Text Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={`#${textColor}`}
                        onChange={(e) => setTextColor(e.target.value.replace('#', ''))}
                        className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                      />
                      <input
                        type="text"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value.replace('#', ''))}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none font-mono text-sm uppercase"
                        maxLength={6}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom Text */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-zinc-900">Custom Text</h3>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wider font-semibold">Additional Text (Optional)</label>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="E.g. Hero Section"
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none"
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    This will appear below the dimensions.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Preview Area */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* URL Output */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 overflow-hidden">
                  <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wider font-semibold">Image URL</label>
                  <div className="font-mono text-sm text-zinc-800 truncate bg-zinc-50 p-2 rounded border border-zinc-100">
                    {imageUrl}
                  </div>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shrink-0 mt-5"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  {copied ? 'Copied!' : 'Copy URL'}
                </button>
              </div>

              {baseUrl.includes('run.app') && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                  <strong className="font-semibold">Nota importante:</strong> Estás en un entorno de desarrollo privado. Esta URL está protegida por tu cuenta de Google, por lo que <strong>WordPress/Elementor no podrá verla</strong> directamente. Para usarla en tus webs, deberás alojar esta aplicación en un servidor público (como Vercel, Render o un VPS).
                </div>
              )}
            </div>

            {/* Visual Preview */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 flex-1 flex flex-col min-h-[500px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Preview</h2>
                <div className="text-sm text-zinc-500">
                  {width} &times; {height}
                </div>
              </div>

              <div className="flex-1 bg-zinc-100 rounded-xl border border-zinc-200 overflow-hidden flex items-center justify-center relative p-4 checkerboard-bg">
                {/* We use an img tag to actually test the generated URL */}
                <div className="max-w-full max-h-full flex items-center justify-center overflow-hidden shadow-sm rounded">
                  <img
                    src={imageUrl}
                    alt="Dummy placeholder preview"
                    className="max-w-full max-h-full object-contain"
                    style={{
                      // This ensures the image scales down to fit the preview area,
                      // but doesn't scale up past its actual size unless needed
                      width: 'auto',
                      height: 'auto',
                    }}
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Add a tiny bit of custom CSS for the checkerboard background */}
      <style>{`
        .checkerboard-bg {
          background-image: linear-gradient(45deg, #e4e4e7 25%, transparent 25%), 
                            linear-gradient(-45deg, #e4e4e7 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #e4e4e7 75%), 
                            linear-gradient(-45deg, transparent 75%, #e4e4e7 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }
      `}</style>
    </div>
  );
}
