
import React, { useState, useEffect, useCallback } from 'react';
import { AppProps, PersistentItem } from '../../types';
import * as PSS from '../../services/persistentStorageService'; // PSS for PersistentStorageService

const TextEditorApp: React.FC<AppProps> = ({ initialData }) => {
  const [text, setText] = useState('');
  const [currentFile, setCurrentFile] = useState<PersistentItem | null>(null);
  const [fileNameForSave, setFileNameForSave] = useState('untitled.txt');
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [persistentFiles, setPersistentFiles] = useState<PersistentItem[]>([]);
  
  const defaultText = `Welcome to the Text Editor!

Use the File menu to:
- Open .txt files from Persistent Storage
- Save your work to Persistent Storage

Remember, this is a simulation.
`;

  useEffect(() => {
    if (initialData?.fileToOpen && initialData.fileToOpen.type === 'file') {
      const fileToOpen = initialData.fileToOpen as PersistentItem;
      const fileData = PSS.getItemById(fileToOpen.id); // fetch latest
      if (fileData && fileData.content !== undefined) {
        setText(fileData.content);
        setCurrentFile(fileData);
        setFileNameForSave(fileData.name);
      } else {
        setText(`Error: Could not load content for ${fileToOpen.name}`);
        setCurrentFile(null);
      }
    } else {
        setText(defaultText);
        setCurrentFile(null);
        setFileNameForSave('untitled.txt');
    }
  }, [initialData]);
  
  const handleNew = () => {
    setText(defaultText);
    setCurrentFile(null);
    setFileNameForSave('untitled.txt');
  };

  const handleOpenPrep = () => {
    const txtFiles = PSS.getPersistentStorage().filter(item => item.type === 'file' && item.name.endsWith('.txt'));
    setPersistentFiles(txtFiles);
    setShowOpenDialog(true);
  };

  const handleOpenFile = (file: PersistentItem) => {
    if (file.content !== undefined) {
      setText(file.content);
      setCurrentFile(file);
      setFileNameForSave(file.name);
      setShowOpenDialog(false);
    } else {
      alert(`Error: File ${file.name} has no content or is not a text file.`);
    }
  };

  const handleSave = () => {
    if (currentFile) { // Overwrite existing file
      const updatedFile = PSS.updateItemContent(currentFile.id, text);
      if (updatedFile) {
        setCurrentFile(updatedFile);
        alert(`File "${updatedFile.name}" saved successfully!`);
      } else {
        alert(`Error saving "${currentFile.name}".`);
      }
    } else { // Save as new file
      const name = prompt("Save As (in Persistent Storage root, e.g., myDoc.txt):", fileNameForSave);
      if (name && name.trim() && name.endsWith('.txt')) {
        const newFile = PSS.addItem(name.trim(), 'file', null, text); // Save to root of persistent for simplicity
        if (newFile) {
          setCurrentFile(newFile);
          setFileNameForSave(newFile.name);
          alert(`File "${newFile.name}" saved to Persistent Storage root!`);
        } else {
          alert(`Error: File "${name.trim()}" might already exist or another error occurred.`);
        }
      } else if (name) {
        alert("Invalid file name. Must end with .txt and not be empty.");
      }
    }
  };
  
  const getPathDisplay = (item: PersistentItem): string => {
    let path = item.name;
    let parentId = item.parentId;
    while (parentId) {
      const parentFolder = PSS.getItemById(parentId);
      if (parentFolder) {
        path = `${parentFolder.name}/${path}`;
        parentId = parentFolder.parentId;
      } else {
        break;
      }
    }
    return `/Persistent/${path}`;
  };

  return (
    <div className="h-full flex flex-col bg-white text-slate-800">
      <div className="p-1 bg-slate-100 border-b border-slate-300 text-sm flex items-center space-x-2">
        <span className="font-semibold px-1">File:</span>
        <button onClick={handleNew} className="px-2 py-0.5 hover:bg-slate-300 rounded">New</button>
        <button onClick={handleOpenPrep} className="px-2 py-0.5 hover:bg-slate-300 rounded">Open from Persistent</button>
        <button onClick={handleSave} className="px-2 py-0.5 hover:bg-slate-300 rounded">Save to Persistent</button>
        {currentFile && <span className="px-2 text-xs text-slate-500 truncate">Editing: {getPathDisplay(currentFile)}</span>}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-grow w-full h-full p-3 text-sm text-slate-800 bg-white resize-none focus:outline-none font-mono"
        spellCheck="false"
        aria-label="Text editor content"
      />
       <div className="p-1 bg-slate-100 border-t border-slate-300 text-xs text-slate-600 text-right px-2">
        Lines: {text.split('\n').length}, Characters: {text.length}
      </div>

      {showOpenDialog && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowOpenDialog(false)}>
          <div className="bg-white p-4 rounded-lg shadow-xl w-1/2 max-w-lg max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-3">Open from Persistent Storage (.txt files)</h3>
            {persistentFiles.length === 0 ? (
              <p>No .txt files found in your Persistent Storage.</p>
            ) : (
              <ul className="space-y-1">
                {persistentFiles.map(file => (
                  <li key={file.id} 
                      className="p-2 hover:bg-slate-100 rounded cursor-pointer"
                      onClick={() => handleOpenFile(file)}>
                    {getPathDisplay(file)} ({new Date(file.modifiedAt).toLocaleDateString()})
                  </li>
                ))}
              </ul>
            )}
            <button onClick={() => setShowOpenDialog(false)} className="mt-4 px-3 py-1 bg-slate-200 rounded hover:bg-slate-300">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextEditorApp;
