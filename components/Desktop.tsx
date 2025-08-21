import React, { useState, useEffect, useCallback, createContext } from 'react';
import TopBar from './TopBar';
import Dock from './Dock';
import WindowComponent from './Window';
import { WindowInstance, AppDefinition, AppProps, Settings as AppSettingsType } from '../types';
import { APPS_CONFIG } from '../constants';


const DESKTOP_PADDING_TOP = 32; // Height of TopBar
const DESKTOP_PADDING_LEFT = 64; // Width of Dock
const SETTINGS_KEY = 'tails_os_simulator_settings'; // Same key as in SettingsApp
const DEFAULT_WALLPAPER = "https://picsum.photos/seed/tailsosbg/1920/1080";


export interface DesktopContextType {
  launchApp: (appDef: Pick<AppDefinition, 'id' | 'name' | 'icon' | 'component' | 'defaultWidth' | 'defaultHeight'>, initialData?: any) => void;
  activeSettings: AppSettingsType;
  triggerSettingsChange: (newSettings: AppSettingsType) => void;
}

export const DesktopContext = createContext<DesktopContextType>({
  launchApp: () => console.warn('launchApp called outside of DesktopContext'),
  activeSettings: { wallpaperUrl: DEFAULT_WALLPAPER, torStatus: 'disconnected' },
  triggerSettingsChange: () => console.warn('triggerSettingsChange called outside of DesktopContext'),
});


const Desktop: React.FC = () => {
  const [openWindows, setOpenWindows] = useState<WindowInstance[]>([]);
  const [nextZIndex, setNextZIndex] = useState(10);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [desktopSize, setDesktopSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [originalPositions, setOriginalPositions] = useState<Record<string, {x: number, y: number, width: number, height: number}>>({});
  const [currentSettings, setCurrentSettings] = useState<AppSettingsType>(() => {
    const storedSettings = localStorage.getItem(SETTINGS_KEY);
    return storedSettings ? JSON.parse(storedSettings) : { wallpaperUrl: DEFAULT_WALLPAPER, torStatus: 'connected' };
  });


  useEffect(() => {
    const handleResize = () => {
      setDesktopSize({ width: window.innerWidth, height: window.innerHeight });
      setOpenWindows(prev => prev.map(win => {
        if (win.isMaximized) {
          return {...win}; 
        }
        return win;
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const handleSettingsChange = useCallback((newSettings: AppSettingsType) => {
    setCurrentSettings(newSettings);
    // localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings)); // SettingsApp handles its own saving
  }, []);


  const bringToFront = useCallback((id: string) => {
    setOpenWindows(prev =>
      prev.map(win =>
        win.id === id ? { ...win, zIndex: nextZIndex } : win
      )
    );
    setActiveWindowId(id);
    setNextZIndex(prev => prev + 1);
  }, [nextZIndex]);

  const launchApp = useCallback((
      appDefInput: Pick<AppDefinition, 'id' | 'name' | 'icon' | 'component' | 'defaultWidth' | 'defaultHeight'>, 
      initialData?: any
    ) => {
    // Find full AppDefinition from APPS_CONFIG based on id
    const appDef = APPS_CONFIG.find(app => app.id === appDefInput.id);
    if (!appDef) {
        console.error(`App with id "${appDefInput.id}" not found in APPS_CONFIG.`);
        return;
    }

    const existingWindow = openWindows.find(win => win.appId === appDef.id);
    
    if (existingWindow) {
      if (existingWindow.isMinimized) {
         setOpenWindows(prev => prev.map(win => win.id === existingWindow.id ? {...win, isMinimized: false, zIndex: nextZIndex, initialData} : win));
         setActiveWindowId(existingWindow.id);
         setNextZIndex(prev => prev + 1);
      } else {
        // If app can handle new data while open (e.g. text editor opening another file)
        // We might need a more robust way to send new initialData to an existing window.
        // For now, just bring to front. If initialData is different, TextEditor will handle it with its own useEffect.
        setOpenWindows(prev => prev.map(win => win.id === existingWindow.id ? {...win, zIndex: nextZIndex, initialData } : win))
        bringToFront(existingWindow.id);
      }
      return;
    }

    const newWindowId = `${appDef.id}_${Date.now()}`;
    const initialX = DESKTOP_PADDING_LEFT + 50 + (openWindows.length % 10) * 20;
    const initialY = DESKTOP_PADDING_TOP + 50 + (openWindows.length % 10) * 20;

    const newWindow: WindowInstance = {
      id: newWindowId,
      appId: appDef.id,
      title: appDef.name,
      icon: appDef.icon,
      x: Math.min(initialX, desktopSize.width - appDef.defaultWidth - DESKTOP_PADDING_LEFT - 20),
      y: Math.min(initialY, desktopSize.height - appDef.defaultHeight - DESKTOP_PADDING_TOP - 20),
      width: appDef.defaultWidth,
      height: appDef.defaultHeight,
      zIndex: nextZIndex,
      isMinimized: false,
      isMaximized: false,
      component: appDef.component,
      initialData: initialData,
    };
    setOpenWindows(prev => [...prev, newWindow]);
    setActiveWindowId(newWindowId);
    setNextZIndex(prev => prev + 1);
    setOriginalPositions(prev => ({...prev, [newWindowId]: {x: newWindow.x, y: newWindow.y, width: newWindow.width, height: newWindow.height}}));
  }, [openWindows, nextZIndex, desktopSize, bringToFront]);


  const closeWindow = (id: string) => {
    setOpenWindows(prev => prev.filter(win => win.id !== id));
    setOriginalPositions(prev => {
      const updated = {...prev};
      delete updated[id];
      return updated;
    });
    if (activeWindowId === id) {
      const remainingWindows = openWindows.filter(win => win.id !== id && !win.isMinimized);
      if (remainingWindows.length > 0) {
        const topWindow = remainingWindows.sort((a,b) => b.zIndex - a.zIndex)[0];
        setActiveWindowId(topWindow.id);
      } else {
        setActiveWindowId(null);
      }
    }
  };

  const minimizeWindow = (id: string) => {
    setOpenWindows(prev =>
      prev.map(win => {
        if (win.id === id) {
          const isNowMinimized = !win.isMinimized;
          if (isNowMinimized && win.isMaximized) { 
            return { ...win, isMinimized: true, isMaximized: false };
          }
          return { ...win, isMinimized: isNowMinimized, isMaximized: false };
        }
        return win;
      })
    );

    const windowBeingToggled = openWindows.find(w => w.id === id);
    if (windowBeingToggled && !windowBeingToggled.isMinimized) {
       bringToFront(id);
    } else if (activeWindowId === id) { 
      const otherWindows = openWindows.filter(win => win.id !== id && !win.isMinimized).sort((a,b) => b.zIndex - a.zIndex);
      setActiveWindowId(otherWindows.length > 0 ? otherWindows[0].id : null);
    }
  };

  const maximizeWindow = (id: string) => {
    setOpenWindows(prev =>
      prev.map(win => {
        if (win.id === id) {
          const isNowMaximized = !win.isMaximized;
          if (isNowMaximized) {
            if (!originalPositions[id] || (originalPositions[id].x !== win.x || originalPositions[id].y !== win.y )) {
               setOriginalPositions(prevPos => ({...prevPos, [id]: {x: win.x, y: win.y, width: win.width, height: win.height}}));
            }
          }
          const newPosSize = isNowMaximized ? {} : (originalPositions[id] || {x: win.x, y: win.y, width: win.width, height: win.height});

          return {
            ...win,
            ...newPosSize,
            isMaximized: isNowMaximized,
            isMinimized: false, 
          };
        }
        return win;
      })
    );
    bringToFront(id);
  };
  
  const handleWindowDrag = (id: string, newPos: { x: number; y: number }) => {
    setOpenWindows(prev =>
      prev.map(win => (win.id === id ? { ...win, x: newPos.x, y: newPos.y, isMaximized: false } : win)) 
    );
  };

  const activeWindowDetails = openWindows.find(win => win.id === activeWindowId && !win.isMinimized);
  const desktopStyle = {
    backgroundImage: `url('${currentSettings.wallpaperUrl}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <DesktopContext.Provider value={{ launchApp, activeSettings: currentSettings, triggerSettingsChange: handleSettingsChange }}>
      <div className="h-full w-full flex flex-col bg-slate-800" style={desktopStyle}>
        <TopBar activeWindowName={activeWindowDetails?.title} torStatus={currentSettings.torStatus} />
        <div className="flex-grow relative overflow-hidden">
          <Dock onAppLaunch={launchApp} />
          <div id="desktop-area" className="absolute" style={{top: `0px`, left: `0px`, width: `100%`, height: `100%`}}>
            {openWindows.map(winInstance => {
              const AppToRender = winInstance.component;
              return (
                <WindowComponent
                  key={winInstance.id}
                  instance={winInstance}
                  onClose={closeWindow}
                  onMinimize={minimizeWindow}
                  onMaximize={maximizeWindow}
                  onFocus={bringToFront}
                  onDrag={handleWindowDrag}
                  desktopSize={desktopSize}
                >
                  <AppToRender
                    windowId={winInstance.id}
                    onClose={closeWindow} 
                    bringToFront={bringToFront}
                    initialData={winInstance.initialData}
                  />
                </WindowComponent>
              );
            })}
          </div>
        </div>
      </div>
    </DesktopContext.Provider>
  );
};

export default Desktop;
