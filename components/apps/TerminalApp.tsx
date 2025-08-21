
import React, { useState, useRef, useEffect } from 'react';
import { AppProps, TerminalCommand, PersistentItem } from '../../types';
import * as PSS from '../../services/persistentStorageService'; // PSS for PersistentStorageService

interface TerminalLine {
  id: number;
  type: 'input' | 'output' | 'error' | 'info';
  text: string;
}

const TerminalApp: React.FC<AppProps> = ({ bringToFront, windowId }) => {
  const [history, setHistory] = useState<TerminalLine[]>([
    { id: 0, type: 'output', text: "Tails OS Terminal Simulator [Version 2.0]" },
    { id: 1, type: 'output', text: "(c) Simulated Environment. Type 'help' for available commands." },
    { id: 2, type: 'info', text: "Persistent storage commands: pls, pcd, pmkdir, ptouch, prm, pcat." },
  ]);
  const [input, setInput] = useState('');
  const [currentPersistentPath, setCurrentPersistentPath] = useState<string>('/'); // Represents path within persistent storage
  const inputRef = useRef<HTMLInputElement>(null);
  const historyEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [history]);
  
  useEffect(() => {
    inputRef.current?.focus();
    bringToFront(windowId);
  }, [bringToFront, windowId]);

  const resolvePersistentPath = (pathArg: string): string => {
    if (!pathArg) return currentPersistentPath;
    if (pathArg.startsWith('/')) return pathArg; // Absolute path

    // Relative path
    const currentParts = currentPersistentPath.split('/').filter(p => p);
    const argParts = pathArg.split('/').filter(p => p);
    let newParts = [...currentParts];

    for (const part of argParts) {
        if (part === '..') {
            newParts.pop();
        } else if (part !== '.') {
            newParts.push(part);
        }
    }
    return '/' + newParts.join('/');
  };
  
  const formatItemForPls = (item: PersistentItem, isLongFormat: boolean): string => {
    const typeChar = item.type === 'folder' ? 'd' : '-';
    const date = new Date(item.modifiedAt).toLocaleDateString('en-US', {month:'short', day:'2-digit', hour:'2-digit', minute:'2-digit', hour12: false});
    if (isLongFormat) {
        // Simulated permissions, owner, size
        return `${typeChar}rw-r--r-- 1 amnesiac amnesiac ${item.content?.length || 0}\t${date} ${item.name}${item.type === 'folder' ? '/' : ''}`;
    }
    return `${item.name}${item.type === 'folder' ? '/' : ''}`;
  };


  const handleCommand = (commandStr: string) => {
    const [command, ...args] = commandStr.trim().split(' ');
    let outputText = '';
    let errorText = '';
    let infoText = '';

    const newHistoryEntry: TerminalLine = { id: Date.now(), type: 'input', text: `amnesiac@tails${currentPersistentPath === '/' ? '~' : currentPersistentPath}:~$ ${commandStr}` };
    const tempHistory = [...history, newHistoryEntry];

    switch (command.toLowerCase()) {
      case TerminalCommand.HELP:
        outputText = `Available commands:\n  ${Object.values(TerminalCommand).join('\n  ')}\n\nSimulated file system commands for persistent storage (use 'p' prefix):\n  pls [path] [-l]     List persistent directory contents\n  pcd <path>          Change persistent directory\n  pmkdir <dirname>    Create persistent directory\n  ptouch <filename>   Create empty persistent file\n  prm <path>          Remove persistent file or directory\n  pcat <filepath>     Display persistent file content`;
        break;
      case TerminalCommand.DATE:
        outputText = new Date().toString();
        break;
      case TerminalCommand.LS:
        outputText = "Documents  Downloads  Music  Pictures  Videos  Desktop (simulated)";
        infoText = "For persistent storage, use 'pls'.";
        break;
      case TerminalCommand.CLEAR:
        setHistory([]);
        return; 
      case TerminalCommand.ECHO:
        outputText = args.join(' ');
        break;
      case TerminalCommand.WHOAMI:
        outputText = "amnesiac (simulated)";
        break;
      case TerminalCommand.TAILS:
        outputText = `TORHiddenServiceDir /var/lib/tor/hidden_service/\nTORHiddenServicePort 80 127.0.0.1:8080\n(Simulating Tails network configuration concepts)`;
        break;
      
      // Persistent Storage Commands
      case TerminalCommand.PCD:
        {
            const targetPath = args[0] || '/';
            const resolvedPath = resolvePersistentPath(targetPath);
            if (resolvedPath === '/') {
                setCurrentPersistentPath('/');
                outputText = `Changed directory to / (Persistent Root)`;
            } else {
                const targetItem = PSS.getItemByPath(resolvedPath);
                if (targetItem && targetItem.type === 'folder') {
                    setCurrentPersistentPath(resolvedPath);
                    outputText = `Changed directory to ${resolvedPath}`;
                } else {
                    errorText = `pcd: ${targetPath}: No such directory or not a directory`;
                }
            }
        }
        break;

      case TerminalCommand.PLS:
        {
          const pathArg = args.find(arg => !arg.startsWith('-'));
          const longFormat = args.includes('-l');
          const resolvedPath = resolvePersistentPath(pathArg || '');
          let parentIdToList: string | null;
          
          if (resolvedPath === '/') {
            parentIdToList = null;
          } else {
            const folderItem = PSS.getItemByPath(resolvedPath);
            if (folderItem && folderItem.type === 'folder') {
              parentIdToList = folderItem.id;
            } else {
              errorText = `pls: cannot access '${pathArg || '.'}': No such file or directory`;
              break;
            }
          }
          
          const items = PSS.getItemsByParentId(parentIdToList);
          if (items.length === 0 && !errorText) {
            outputText = "Directory is empty.";
          } else if (!errorText) {
            outputText = items.map(item => formatItemForPls(item, longFormat)).join(longFormat ? '\n' : '\t');
          }
        }
        break;
      case TerminalCommand.PMKDIR:
        {
          const dirName = args[0];
          if (!dirName) {
            errorText = "pmkdir: missing operand"; break;
          }
          const parentDir = PSS.getItemByPath(currentPersistentPath);
          const parentId = (currentPersistentPath === '/' || !parentDir) ? null : parentDir.id;

          const newItem = PSS.addItem(dirName, 'folder', parentId);
          if (newItem) {
            outputText = `Created directory: ${dirName}`;
          } else {
            errorText = `pmkdir: cannot create directory '${dirName}': File exists or error occurred`;
          }
        }
        break;
      case TerminalCommand.PTOUCH:
        {
          const fileName = args[0];
          if (!fileName) {
            errorText = "ptouch: missing file operand"; break;
          }
           const parentDir = PSS.getItemByPath(currentPersistentPath);
           const parentId = (currentPersistentPath === '/' || !parentDir) ? null : parentDir.id;

          const newItem = PSS.addItem(fileName, 'file', parentId, "");
          if (newItem) {
            outputText = `Created file: ${fileName}`;
          } else {
            errorText = `ptouch: cannot create file '${fileName}': File exists or error occurred`;
          }
        }
        break;
      case TerminalCommand.PRM:
        {
          const itemPath = args[0];
          if (!itemPath) {
            errorText = "prm: missing operand"; break;
          }
          const resolvedItemPath = resolvePersistentPath(itemPath);
          const item = PSS.getItemByPath(resolvedItemPath);

          if (item && item.id !== 'root') { // Prevent deleting virtual root
            if (PSS.deleteItem(item.id)) {
              outputText = `Removed '${item.name}'`;
            } else {
              errorText = `prm: cannot remove '${item.name}': Error occurred`;
            }
          } else {
            errorText = `prm: cannot remove '${itemPath}': No such file or directory`;
          }
        }
        break;
      case TerminalCommand.PCAT:
        {
          const filePath = args[0];
          if (!filePath) {
            errorText = "pcat: missing file operand"; break;
          }
          const resolvedFilePath = resolvePersistentPath(filePath);
          const item = PSS.getItemByPath(resolvedFilePath);

          if (item && item.type === 'file') {
            outputText = item.content || "(empty file)";
          } else if (item && item.type === 'folder') {
             errorText = `pcat: ${item.name}: Is a directory`;
          } else {
            errorText = `pcat: ${filePath}: No such file or directory`;
          }
        }
        break;
      default:
        if (commandStr.trim() === '') {
            setHistory(tempHistory); // Add empty input line
            return;
        }
        errorText = `command not found: ${command}`;
        break;
    }
    
    const finalHistory: TerminalLine[] = [...tempHistory];
    if (outputText) finalHistory.push({ id: Date.now() + 1, type: 'output', text: outputText });
    if (infoText) finalHistory.push({ id: Date.now() + 2, type: 'info', text: infoText });
    if (errorText) finalHistory.push({ id: Date.now() + 3, type: 'error', text: errorText });
    
    setHistory(finalHistory);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCommand(input);
    setInput('');
  };

  return (
    <div 
        className="h-full flex flex-col bg-black text-green-400 font-mono p-2 text-sm"
        onClick={() => inputRef.current?.focus()}
    >
      <div className="flex-grow overflow-y-auto pr-2">
        {history.map(line => (
          <div key={line.id} className={`whitespace-pre-wrap ${line.type === 'error' ? 'text-red-400' : line.type === 'input' ? 'text-blue-400' : line.type === 'info' ? 'text-yellow-400' : 'text-green-400'}`}>
            {line.text}
          </div>
        ))}
        <div ref={historyEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex items-center pt-1">
        <span className="text-cyan-400 mr-1">amnesiac@tails{currentPersistentPath === '/' ? '~' : currentPersistentPath}:$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow bg-transparent text-green-400 focus:outline-none"
          autoCapitalize="none"
          autoComplete="off"
          spellCheck="false"
        />
      </form>
    </div>
  );
};

export default TerminalApp;
