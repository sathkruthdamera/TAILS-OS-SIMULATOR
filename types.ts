import React from 'react';

export interface AppProps {
  windowId: string;
  onClose: (id: string) => void;
  bringToFront: (id: string) => void;
  initialPosition?: { x: number; y: number };
  // Optional prop to pass data to an app when it's opened, e.g., file to open
  initialData?: any; 
}

export interface AppDefinition {
  id: string;
  name: string;
  icon: React.ReactNode;
  component: React.FC<AppProps>;
  defaultWidth: number;
  defaultHeight: number;
}

export interface WindowInstance {
  id: string;
  appId: string;
  title: string;
  icon: React.ReactNode;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  component: React.FC<AppProps>;
  initialData?: any; // To pass initial data to the app component
}

export enum TerminalCommand {
  LS = "ls",
  DATE = "date",
  HELP = "help",
  CLEAR = "clear",
  ECHO = "echo",
  WHOAMI = "whoami",
  TAILS = "tails",
  // Persistent storage commands
  PLS = "pls",
  PMKDIR = "pmkdir",
  PTOUCH = "ptouch",
  PRM = "prm",
  PCAT = "pcat",
  PCD = "pcd", // Optional: change directory within persistent storage
}

export interface PersistentItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  content?: string; // For text files
  parentId: string | null; // Root items have null parentId. Others have parent folder's id.
  createdAt: string;
  modifiedAt: string;
}

export interface KeePassEntry {
  id: string;
  title: string;
  username?: string;
  password?: string;
  notes?: string;
}

export interface Settings {
  wallpaperUrl: string;
  torStatus: 'connected' | 'disconnected' | 'connecting';
}

// Events for inter-app communication or global state changes
export type AppEventType = 'persistentStorageChanged' | 'settingsChanged';

export interface AppEvent {
  type: AppEventType;
  payload?: any;
}

// Simple event emitter type
export type Listener = (event: AppEvent) => void;
