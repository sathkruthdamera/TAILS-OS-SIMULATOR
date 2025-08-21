
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { WindowInstance } from '../types';
import { MinimizeIcon, MaximizeIcon, RestoreIcon, CloseIcon } from '../constants';

interface WindowProps {
  instance: WindowInstance;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onFocus: (id: string) => void;
  onDrag: (id: string, newPos: { x: number; y: number }) => void;
  children: React.ReactNode;
  desktopSize: { width: number, height: number };
}

const WindowComponent: React.FC<WindowProps> = ({
  instance,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onDrag,
  children,
  desktopSize,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartOffset, setDragStartOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  const handleMouseDownOnTitle = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return; // Ignore clicks on buttons in title bar
    if (instance.isMaximized) return; // Do not drag if maximized
    onFocus(instance.id);
    setIsDragging(true);
    const windowRect = windowRef.current?.getBoundingClientRect();
    if (windowRect) {
      setDragStartOffset({
        x: e.clientX - windowRect.left,
        y: e.clientY - windowRect.top,
      });
    }
    e.preventDefault(); // Prevent text selection
  };
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || instance.isMaximized) return;
    let newX = e.clientX - dragStartOffset.x;
    let newY = e.clientY - dragStartOffset.y;

    // Constrain to desktop bounds (considering window size for right/bottom edges)
    // Dock width 64px, TopBar height 32px
    const effectiveWindowWidth = instance.width;
    const effectiveWindowHeight = instance.height;

    newX = Math.max(64, Math.min(newX, desktopSize.width - effectiveWindowWidth)); 
    newY = Math.max(32, Math.min(newY, desktopSize.height - effectiveWindowHeight)); 

    onDrag(instance.id, { x: newX, y: newY });
  }, [isDragging, dragStartOffset, onDrag, instance.id, instance.width, instance.height, instance.isMaximized, desktopSize]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);
  
  const windowStyle: React.CSSProperties = instance.isMaximized ? {
      top: '32px', // Below TopBar
      left: '64px', // Right of Dock
      width: `calc(100vw - 64px)`, // Full width minus dock
      height: `calc(100vh - 32px)`, // Full height minus top bar
      zIndex: instance.zIndex,
    } : {
      top: `${instance.y}px`,
      left: `${instance.x}px`,
      width: `${instance.width}px`,
      height: `${instance.height}px`,
      zIndex: instance.zIndex,
    };


  return (
    <div
      ref={windowRef}
      className={`absolute flex flex-col bg-slate-700 border border-slate-600 rounded-lg shadow-2xl overflow-hidden select-none
        ${instance.isMaximized ? '' : 'transition-all duration-100 ease-out'}
        ${isDragging && !instance.isMaximized ? 'opacity-80' : ''}
      `}
      style={windowStyle}
      onMouseDown={() => onFocus(instance.id)}
    >
      <div
        className={`h-8 bg-slate-800 text-gray-200 flex items-center justify-between px-2 ${instance.isMaximized ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
        onMouseDown={handleMouseDownOnTitle}
      >
        <div className="flex items-center space-x-2 truncate">
          <span className="w-5 h-5 flex items-center justify-center">{instance.icon}</span>
          <span className="text-sm font-medium truncate">{instance.title}</span>
        </div>
        <div className="flex items-center space-x-1">
          <button onClick={() => onMinimize(instance.id)} className="p-1 rounded hover:bg-slate-600 focus:outline-none">
            <MinimizeIcon className="w-4 h-4" />
          </button>
          <button onClick={() => onMaximize(instance.id)} className="p-1 rounded hover:bg-slate-600 focus:outline-none">
            {instance.isMaximized ? <RestoreIcon className="w-4 h-4" /> : <MaximizeIcon className="w-4 h-4" />}
          </button>
          <button onClick={() => onClose(instance.id)} className="p-1 rounded hover:bg-red-500 focus:outline-none">
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      {!instance.isMinimized && (
        <div className="flex-grow bg-slate-200 text-slate-800 overflow-auto">
          {children}
        </div>
      )}
      {instance.isMinimized && (
         <div className="flex-grow bg-slate-700 flex items-center justify-center text-slate-400 text-sm p-4">
            Minimized
          </div>
      )}
    </div>
  );
};

export default WindowComponent;
