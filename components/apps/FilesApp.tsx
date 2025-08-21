
import React, { useState, useEffect, useCallback } from 'react';
import { AppProps, PersistentItem } from '../../types';
import * as PSS from '../../services/persistentStorageService'; // PSS for PersistentStorageService
import { DesktopContext } from '../Desktop'; // Import context


// Icons (can be moved to constants.tsx if used elsewhere)
const FolderIconInternal: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h3.879a1.5 1.5 0 0 1 1.06.44l.822.82A1.5 1.5 0 0 0 10.32 4H16.5A1.5 1.5 0 0 1 18 5.5v10a1.5 1.5 0 0 1-1.5 1.5H3.5A1.5 1.5 0 0 1 2 15.5v-12Z" />
  </svg>
);

const FileIconInternal: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M4 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.243a2 2 0 0 0-.586-1.414l-4.828-4.829A2 2 0 0 0 11.172 2H4Zm6.5 2.5v2.25H13a.75.75 0 0 0 0-1.5H11V4a.75.75 0 0 0-1.5 0Z" clipRule="evenodd" />
  </svg>
);
const UpArrowIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10 17a.75.75 0 0 1-.75-.75V5.56l-2.47 2.47a.75.75 0 0 1-1.06-1.06l4-4a.75.75 0 0 1 1.06 0l4 4a.75.75 0 0 1-1.06 1.06L10.75 5.56V16.25A.75.75 0 0 1 10 17Z" clipRule="evenodd" />
  </svg>
);


const staticLocations = [
  { id: 'home', name: 'Home (Simulated)', type: 'folder' as 'folder', special: true },
  // { id: 'desktop', name: 'Desktop (Simulated)', type: 'folder' as 'folder', special: true },
  { id: 'persistent', name: 'Persistent Storage', type: 'folder' as 'folder', special: true },
];

const initialStaticFiles = [
    { id: 'docs', name: 'Documents', type: 'folder', parent: 'home' },
    { id: 'dwnlds', name: 'Downloads', type: 'folder', parent: 'home' },
    { id: 'readme_home', name: 'README.txt', type: 'file', parent: 'home', content: "This is the simulated Home folder." },
];


const FilesApp: React.FC<AppProps> = ({ windowId }) => {
  const [currentLocationId, setCurrentLocationId] = useState<string | null>('persistent'); // Start in Persistent root
  const [currentPathDisplay, setCurrentPathDisplay] = useState<string>('/Persistent');
  const [items, setItems] = useState<PersistentItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<PersistentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { launchApp } = React.useContext(DesktopContext);


  const loadItems = useCallback(() => {
    setIsLoading(true);
    if (currentLocationId === 'persistent' || PSS.getItemById(currentLocationId || '')?.type === 'folder') {
      const persistentItems = PSS.getItemsByParentId(currentLocationId === 'persistent' ? null : currentLocationId);
      setItems(persistentItems);
      
      // Update path display
      let path = '';
      let currId = currentLocationId;
      if (currId && currId !== 'persistent') {
          while(currId) {
              const folder = PSS.getItemById(currId);
              if (folder) {
                  path = `/${folder.name}${path}`;
                  currId = folder.parentId;
              } else {
                  break;
              }
          }
      }
      setCurrentPathDisplay(`/Persistent${path}`);

    } else if (currentLocationId === 'home') {
      // @ts-ignore
      setItems(initialStaticFiles.filter(f => f.parent === 'home'));
      setCurrentPathDisplay('/Home (Simulated)');
    } else {
      setItems([]); // For other static locations if any
      const loc = staticLocations.find(l => l.id === currentLocationId);
      setCurrentPathDisplay(loc ? `/${loc.name}` : '/');
    }
    setIsLoading(false);
  }, [currentLocationId]);

  useEffect(() => {
    loadItems();
    const handleStorageChange = () => loadItems();
    window.addEventListener('persistentStorageChanged', handleStorageChange);
    return () => window.removeEventListener('persistentStorageChanged', handleStorageChange);
  }, [loadItems]);

  const handleItemClick = (item: PersistentItem) => {
    setSelectedItem(item);
  };

  const handleItemDoubleClick = (item: PersistentItem) => {
    if (item.type === 'folder') {
      setCurrentLocationId(item.id); // Navigate into persistent folder
      setSelectedItem(null);
    } else if (item.type === 'file' && item.name.endsWith('.txt')) {
        if (launchApp && PSS.getItemById(item.id)) { // Ensure it's a persistent item
             launchApp(
                { id: 'text_editor', name: 'Text Editor', component: {} as any, defaultHeight:0, defaultWidth:0, icon: <></> }, // Dummy appDef fields
                { fileToOpen: item } // Pass file data as initialData
            );
        } else {
            alert("Cannot open this file type or app launcher not available.");
        }
    } else {
      alert(`Simulating opening ${item.type}: ${item.name}. Double click a .txt file in Persistent Storage to open in Text Editor.`);
    }
  };
  
  const navigateUp = () => {
    if (currentLocationId === 'persistent' || currentLocationId === 'home') return; // Already at a root or special location

    const currentFolder = PSS.getItemById(currentLocationId || '');
    if (currentFolder && currentFolder.parentId) { // Navigate to parent in persistent storage
      setCurrentLocationId(currentFolder.parentId);
    } else if (currentFolder) { // Parent is root of persistent storage
      setCurrentLocationId('persistent');
    }
    setSelectedItem(null);
  };

  const handleCreateFolder = () => {
    if (currentLocationId !== 'persistent' && !PSS.getItemById(currentLocationId || '')) {
        alert("Can only create folders in Persistent Storage.");
        return;
    }
    const folderName = prompt("Enter new folder name:");
    if (folderName) {
      PSS.addItem(folderName, 'folder', currentLocationId === 'persistent' ? null : currentLocationId);
      // loadItems(); // Handled by event listener
    }
  };

  const handleCreateFile = () => {
     if (currentLocationId !== 'persistent' && !PSS.getItemById(currentLocationId || '')) {
        alert("Can only create files in Persistent Storage.");
        return;
    }
    const fileName = prompt("Enter new text file name (e.g., myFile.txt):");
    if (fileName && fileName.endsWith('.txt')) {
      PSS.addItem(fileName, 'file', currentLocationId === 'persistent' ? null : currentLocationId, "");
      // loadItems(); // Handled by event listener
    } else if (fileName) {
      alert("File name must end with .txt");
    }
  };

  const handleDeleteItem = () => {
    if (selectedItem && (currentLocationId === 'persistent' || PSS.getItemById(currentLocationId || ''))) {
      if (confirm(`Are you sure you want to delete "${selectedItem.name}"? This cannot be undone.`)) {
        PSS.deleteItem(selectedItem.id);
        setSelectedItem(null);
        // loadItems(); // Handled by event listener
      }
    } else {
        alert("Select an item from Persistent Storage to delete.");
    }
  };

  const handleRenameItem = () => {
    if (selectedItem && (currentLocationId === 'persistent' || PSS.getItemById(currentLocationId || ''))) {
      const newName = prompt(`Enter new name for "${selectedItem.name}":`, selectedItem.name);
      if (newName && newName !== selectedItem.name) {
        const success = PSS.renameItem(selectedItem.id, newName);
        if (!success) {
          alert(`Failed to rename. An item named "${newName}" might already exist in this folder.`);
        }
        // loadItems(); // Handled by event listener
      }
    } else {
      alert("Select an item from Persistent Storage to rename.");
    }
  };

  const isPersistentView = currentLocationId === 'persistent' || PSS.getItemById(currentLocationId || '') !== undefined;

  return (
    <div className="h-full flex flex-col bg-slate-50 text-slate-800">
      <div className="p-2 bg-slate-200 border-b border-slate-300 flex items-center space-x-2">
        <button onClick={navigateUp} className="p-1 rounded hover:bg-slate-300 disabled:opacity-50" disabled={currentLocationId === 'home' || currentLocationId === 'persistent'}>
          <UpArrowIcon className="w-4 h-4" />
        </button>
        <input 
          type="text" 
          value={currentPathDisplay} 
          readOnly 
          className="flex-grow bg-white p-1 rounded border border-slate-400 text-sm focus:outline-none"
        />
        {isPersistentView && (
          <>
            <button onClick={handleCreateFolder} title="New Folder" className="p-1 rounded hover:bg-slate-300 text-xs">New Folder</button>
            <button onClick={handleCreateFile} title="New Text File" className="p-1 rounded hover:bg-slate-300 text-xs">New .txt File</button>
            <button onClick={handleRenameItem} title="Rename Selected" className="p-1 rounded hover:bg-slate-300 text-xs" disabled={!selectedItem}>Rename</button>
            <button onClick={handleDeleteItem} title="Delete Selected" className="p-1 rounded hover:bg-red-400 text-xs" disabled={!selectedItem}>Delete</button>
          </>
        )}
      </div>

      <div className="flex-grow flex">
        <div className="w-48 bg-slate-100 p-2 border-r border-slate-300">
          <h3 className="font-semibold text-sm mb-2 text-slate-700">Places</h3>
          <ul className="text-sm space-y-1">
            {staticLocations.map(loc => (
              <li key={loc.id} 
                  className={`p-1 rounded cursor-pointer hover:bg-blue-100 text-slate-600 ${currentLocationId === loc.id || (loc.id === 'persistent' && PSS.getItemById(currentLocationId || '') !== undefined ) ? 'bg-blue-200 text-blue-700 font-medium' : ''}`}
                  onClick={() => { setCurrentLocationId(loc.id); setSelectedItem(null); }}>
                {loc.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-grow p-3 overflow-y-auto">
          {isLoading ? (
            <p className="text-slate-500 text-center mt-10">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-slate-500 text-center mt-10">This folder is empty.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {items.map((item: PersistentItem) => (
                <div 
                  key={item.id} 
                  className={`p-3 rounded-lg border flex flex-col items-center text-center cursor-pointer transition-colors duration-150
                              ${selectedItem?.id === item.id ? 'bg-blue-500 text-white border-blue-600 shadow-md' : 'bg-white hover:bg-slate-100 border-slate-300 hover:shadow-sm'}`}
                  onClick={() => handleItemClick(item)}
                  onDoubleClick={() => handleItemDoubleClick(item)}
                  title={item.name}
                >
                  <div className={`w-12 h-12 mb-2 ${selectedItem?.id === item.id ? 'text-white' : item.type === 'folder' ? 'text-blue-500' : 'text-slate-500'}`}>
                    {item.type === 'folder' ? <FolderIconInternal className="w-full h-full" /> : <FileIconInternal className="w-full h-full" />}
                  </div>
                  <span className={`text-xs font-medium truncate w-full ${selectedItem?.id === item.id ? 'text-white' : 'text-slate-700'}`}>{item.name}</span>
                  <span className={`text-xxs truncate w-full ${selectedItem?.id === item.id ? 'text-blue-100' : 'text-slate-500'}`}>
                    {new Date(item.modifiedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="p-1 bg-slate-200 border-t border-slate-300 text-xs text-slate-600 px-2 text-right">
        {selectedItem ? selectedItem.name : `${items.length} items`}
        {isPersistentView ? "" : " (Simulated View)"}
      </div>
    </div>
  );
};

export default FilesApp;
