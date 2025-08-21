import React, { useState, useEffect, useContext } from 'react';
import { AppProps, Settings as AppSettingsType } from '../../types';
import { DesktopContext } from '../Desktop'; // Import context

const SETTINGS_KEY = 'tails_os_simulator_settings';

const defaultSettings: AppSettingsType = {
  wallpaperUrl: "https://picsum.photos/seed/tailsosbg/1920/1080", // Default wallpaper
  torStatus: 'connected',
};

const availableWallpapers = [
  { name: "Default Abstract", url: "https://picsum.photos/seed/tailsosbg/1920/1080" },
  { name: "Mountains", url: "https://picsum.photos/seed/mountains/1920/1080" },
  { name: "Forest", url: "https://picsum.photos/seed/forest/1920/1080" },
  { name: "City Night", url: "https://picsum.photos/seed/citynight/1920/1080" },
  { name: "Ocean", url: "https://picsum.photos/seed/oceanview/1920/1080" },
  { name: "Custom URL", url: "custom" },
];

const SettingsApp: React.FC<AppProps> = () => {
  const [settings, setSettings] = useState<AppSettingsType>(() => {
    const storedSettings = localStorage.getItem(SETTINGS_KEY);
    return storedSettings ? JSON.parse(storedSettings) : defaultSettings;
  });
  const [customUrl, setCustomUrl] = useState(
    availableWallpapers.find(w => w.url === settings.wallpaperUrl) ? "" : settings.wallpaperUrl
  );
  const { triggerSettingsChange } = useContext(DesktopContext);


  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    triggerSettingsChange(settings); // Notify Desktop context of changes
  }, [settings, triggerSettingsChange]);

  const handleWallpaperChange = (url: string) => {
    if (url === "custom") {
      const newCustomUrl = prompt("Enter custom wallpaper URL:", customUrl || "https://picsum.photos/1920/1080");
      if (newCustomUrl) {
        setCustomUrl(newCustomUrl);
        setSettings(s => ({ ...s, wallpaperUrl: newCustomUrl }));
      }
    } else {
      setSettings(s => ({ ...s, wallpaperUrl: url }));
      if (availableWallpapers.find(w => w.url === url)) setCustomUrl(""); // Clear custom if selecting predefined
    }
  };

  const handleTorStatusChange = (newStatus: AppSettingsType['torStatus']) => {
    setSettings(s => ({ ...s, torStatus: newStatus }));
  };

  return (
    <div className="h-full flex flex-col bg-slate-100 text-slate-800 p-4 space-y-6 overflow-y-auto">
      <div>
        <h2 className="text-xl font-semibold mb-3 text-slate-700">Desktop Settings</h2>
        <div className="space-y-2">
          <label htmlFor="wallpaper-select" className="block text-sm font-medium text-slate-600">Wallpaper:</label>
          <select
            id="wallpaper-select"
            value={availableWallpapers.find(w => w.url === settings.wallpaperUrl) ? settings.wallpaperUrl : "custom"}
            onChange={(e) => handleWallpaperChange(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            {availableWallpapers.map(wp => (
              <option key={wp.url} value={wp.url}>{wp.name}</option>
            ))}
          </select>
          { (settings.wallpaperUrl === customUrl || !availableWallpapers.find(w => w.url === settings.wallpaperUrl)) && (
             <input 
                type="text" 
                placeholder="Enter custom URL here if selected"
                value={customUrl}
                onChange={(e) => {
                    setCustomUrl(e.target.value);
                    if (settings.wallpaperUrl !== "" && !availableWallpapers.find(w => w.url === settings.wallpaperUrl)) { // if current is custom
                         setSettings(s => ({ ...s, wallpaperUrl: e.target.value }));
                    }
                }}
                className="w-full mt-1 p-2 border border-slate-300 rounded-md text-sm"
             />
          )}
          <div className="mt-2">
            <p className="text-xs text-slate-500">Current Background:</p>
            <img src={settings.wallpaperUrl} onError={(e) => e.currentTarget.src = "https://picsum.photos/seed/error/200/100"} alt="Wallpaper preview" className="w-full h-32 object-cover rounded border border-slate-300 mt-1"/>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3 text-slate-700">Network Settings (Simulated)</h2>
        <div className="space-y-2">
          <p className="text-sm text-slate-600">Tor Connection Status:</p>
          <div className={`p-3 rounded-md text-sm font-medium flex items-center
            ${settings.torStatus === 'connected' ? 'bg-green-100 text-green-700' : 
              settings.torStatus === 'connecting' ? 'bg-yellow-100 text-yellow-700' : 
              'bg-red-100 text-red-700'}`}
          >
            <span className={`mr-2 h-3 w-3 rounded-full inline-block ${
                settings.torStatus === 'connected' ? 'bg-green-500' : 
                settings.torStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 
                'bg-red-500'}`}>
            </span>
            {settings.torStatus === 'connected' ? 'Connected to Tor network (Simulated)' :
             settings.torStatus === 'connecting' ? 'Connecting to Tor network... (Simulated)' :
             'Disconnected from Tor network (Simulated)'}
          </div>
          <div className="flex space-x-2 mt-2">
            <button 
                onClick={() => handleTorStatusChange('connecting')} 
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={settings.torStatus === 'connecting' || settings.torStatus === 'connected'}>
                Connect
            </button>
             <button 
                onClick={() => handleTorStatusChange('disconnected')} 
                className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                disabled={settings.torStatus === 'disconnected'}>
                Disconnect
            </button>
          </div>
           <p className="text-xs text-slate-500 mt-1">This is a simulation. Your actual network traffic is not affected.</p>
        </div>
      </div>
       <p className="text-xs text-slate-400 text-center mt-auto pt-4">Settings are saved automatically in your browser.</p>
    </div>
  );
};

export default SettingsApp;
