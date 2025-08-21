import React from 'react';
import { AppDefinition } from './types';
import TorBrowserApp from './components/apps/TorBrowserApp';
import TextEditorApp from './components/apps/TextEditorApp';
import TerminalApp from './components/apps/TerminalApp';
import FilesApp from './components/apps/FilesApp';
import HelpAssistantApp from './components/apps/HelpAssistantApp';
import SettingsApp from './components/apps/SettingsApp';
import KeePassXCApp from './components/apps/KeePassXCApp';

// SVG Icons
export const TorBrowserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    <path d="M12 4c-2.9 0-5.45 1.54-6.9 3.87.47-.07.95-.12 1.45-.12 2.39 0 4.48.88 6.07 2.34.36-.61.63-1.26.8-1.93C15.99 5.79 14.12 4 12 4zm0 13c-2.42 0-4.5.83-6.04 2.2.22.55.49 1.07.8 1.55C8.56 19.02 10.2 18.5 12 18.5c1.82 0 3.47.54 4.82 1.47.3-.48.57-.99.78-1.52C16.44 17.79 14.39 17 12 17zm5.33-6.47c-.38-.91-.98-1.7-1.73-2.33.85.73 1.48 1.68 1.87 2.74-.4.08-.8.12-1.2.12-.4 0-.79-.04-1.18-.12.39-1.06.12-2.24-.69-3.05-1.07-1.07-2.58-1.45-4.03-.92-.49 1.11-.72 2.31-.68 3.52H12c2.21 0 4 1.79 4 4 0 .45-.08.88-.22 1.29.7-.15 1.36-.42 1.95-.79.51-.32.96-.71 1.35-1.15.49-.55.86-1.18 1.09-1.86-.04-.01-.07-.02-.11-.03-.16-.05-.32-.1-.49-.15zM7.86 13.12c.81.81 1.98 1.19 3.05.69 1.07-.5 1.76-1.55 1.76-2.74s-.69-2.24-1.76-2.74c-1.07-.5-2.24-.12-3.05.69-.81.81-1.19 1.98-.69 3.05.5 1.07 1.55 1.76 2.74 1.76h.01l-.06-.02z" />
  </svg>
);

export const TextEditorIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 9H7v-2h6v2zm3-4H7V5h9v2zm-3 7H7v-2h6v2z"/>
  </svg>
);

export const TerminalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M4 3h16c.55 0 1 .45 1 1v16c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1V4c0-.55.45-1 1-1zm1.5 11.5l3-3-3-3L7.06 7l3.95 3.95-3.95 3.95L5.5 14.5zm5.25 2h7.5v-2h-7.5v2z"/>
  </svg>
);

export const FilesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
  </svg>
);

export const HelpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.882 0-1.473.882-1.473 1.765 0 .882.59 1.764 1.473 1.764.882 0 1.473-.882 1.473-1.764 0-.883-.59-1.765-1.473-1.765Zm-2.205 6.352v.662A.44.44 0 0 0 11.865 16h.27a.44.44 0 0 0 .44-.44v-2.09a.44.44 0 0 0-.44-.44h-.27a.44.44 0 0 0-.44.44v.662h-.44a.44.44 0 0 0-.44.44Zm1.54-2.205c.59 0 1.029-.441 1.029-1.029V11.03a.44.44 0 0 0-.44-.44h-.27a.44.44 0 0 0-.44.44v.352a.44.44 0 0 1-.44.44h-.441a.44.44 0 0 0-.44.441v.22c0 .59.441 1.029 1.029 1.029h.441Z" clipRule="evenodd" />
  </svg>
);

export const SettingsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M11.078 4.75A3.35 3.35 0 007.5 5.368V3.75a.75.75 0 00-1.5 0v1.618a3.35 3.35 0 00-3.578.618.75.75 0 00-.352 1.022l.406.702a.75.75 0 001.022.352A1.851 1.851 0 015.85 7.5H4.75a.75.75 0 000 1.5h1.1a1.851 1.851 0 01-2.322.852.75.75 0 00-1.022.352l-.406.702a.75.75 0 00.352 1.022A3.35 3.35 0 006 12.632V14.25a.75.75 0 001.5 0v-1.618a3.35 3.35 0 003.578-.618.75.75 0 00.352-1.022l-.406-.702a.75.75 0 00-1.022-.352A1.851 1.851 0 017.65 9H8.75a.75.75 0 000-1.5H7.65a1.851 1.851 0 012.322-.852.75.75 0 001.022-.352l.406-.702a.75.75 0 00-.352-1.022zm8.316 1.454a.75.75 0 00-1.022-.352A1.851 1.851 0 0116.15 7.5h-1.1a.75.75 0 000 1.5h1.1a1.851 1.851 0 012.322.852.75.75 0 001.022.352l.406.702a.75.75 0 00-.352 1.022A3.35 3.35 0 0018 12.632V14.25a.75.75 0 001.5 0v-1.618a3.35 3.35 0 003.578-.618.75.75 0 00.352-1.022l-.406-.702a.75.75 0 00-1.022-.352A1.851 1.851 0 0118.35 9H19.25a.75.75 0 000-1.5h-1.1a1.851 1.851 0 01-2.322-.852.75.75 0 00-1.022-.352l-.406-.702a.75.75 0 00.352-1.022A3.35 3.35 0 0016.5 5.368V3.75a.75.75 0 00-1.5 0v1.618a3.35 3.35 0 00-3.578.618zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
    <path d="M14.06 12a2.06 2.06 0 11-4.12 0 2.06 2.06 0 014.12 0z" />
 </svg>
);

export const KeePassXCIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M8 10V7a4 4 0 118 0v3h1a2 2 0 012 2v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7a2 2 0 012-2h1zm2-3a2 2 0 114 0v3H10V7z" clipRule="evenodd" />
    <path d="M12 12.5a.5.5 0 00-.5.5v2a.5.5 0 001 0v-2a.5.5 0 00-.5-.5z" />
  </svg>
);


export const APPS_CONFIG: AppDefinition[] = [
  { id: 'tor_browser', name: 'Tor Browser', icon: <TorBrowserIcon className="w-8 h-8" />, component: TorBrowserApp, defaultWidth: 1024, defaultHeight: 768 },
  { id: 'text_editor', name: 'Text Editor', icon: <TextEditorIcon className="w-8 h-8" />, component: TextEditorApp, defaultWidth: 800, defaultHeight: 600 },
  { id: 'terminal', name: 'Terminal', icon: <TerminalIcon className="w-8 h-8" />, component: TerminalApp, defaultWidth: 700, defaultHeight: 450 },
  { id: 'files', name: 'Files', icon: <FilesIcon className="w-8 h-8" />, component: FilesApp, defaultWidth: 900, defaultHeight: 650 },
  { id: 'settings', name: 'Settings', icon: <SettingsIcon className="w-8 h-8" />, component: SettingsApp, defaultWidth: 600, defaultHeight: 500},
  { id: 'keepassxc', name: 'KeePassXC Sim', icon: <KeePassXCIcon className="w-8 h-8" />, component: KeePassXCApp, defaultWidth: 700, defaultHeight: 550},
  { id: 'help_assistant', name: 'Help Assistant', icon: <HelpIcon className="w-8 h-8" />, component: HelpAssistantApp, defaultWidth: 600, defaultHeight: 700 },
];

// Window Control Icons
export const MinimizeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20 14H4v-2h16v2z" />
  </svg>
);

export const MaximizeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M4 4h16v16H4V4zm2 2v12h12V6H6z" />
  </svg>
);

export const RestoreIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M14 14h5v5h-5zM5 14h5v5H5zM5 5h5v5H5zM14 5h5v5h-5zM3 3v18h18V3H3zm2 2h14v14H5V5z"/>
  </svg>
);


export const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41z" />
  </svg>
);

export const TailsLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg fill="currentColor" viewBox="0 0 256 256" {...props}>
    <path d="M152,100a24,24,0,1,1-24-24A24,24,0,0,1,152,100Z"></path>
    <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Z"></path>
    <path d="M128,72a56,56,0,1,0,56,56A56.06,56.06,0,0,0,128,72Zm0,96a40,40,0,1,1,40-40A40,40,0,0,1,128,168Z"></path>
  </svg>
);
