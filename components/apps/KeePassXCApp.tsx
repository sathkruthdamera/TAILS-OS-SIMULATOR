import React, { useState, useEffect } from 'react';
import { AppProps, KeePassEntry } from '../../types';
import { v4 as uuidv4 } from 'https://esm.sh/uuid';

const KEEPASS_DB_KEY_PREFIX = 'tails_os_simulator_keepass_db_';
const KEEPASS_MASTER_PASS_KEY = 'tails_os_simulator_keepass_master_set'; // just a flag

// VERY INSECURE HASH - FOR SIMULATION ONLY
const simpleHash = async (str: string): Promise<string> => {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback for environments without crypto.subtle (like older test runners)
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `fb_${hash.toString(16)}`; // fb_ for fallback
};


const KeePassXCApp: React.FC<AppProps> = () => {
  const [isLocked, setIsLocked] = useState(true);
  const [masterPasswordAttempt, setMasterPasswordAttempt] = useState('');
  const [databaseName] = useState('simulated_db'); // Fixed DB name for this simulation
  const [entries, setEntries] = useState<KeePassEntry[]>([]);
  const [showAddEntryForm, setShowAddEntryForm] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<KeePassEntry>>({ title: '', username: '', password: '' });
  const [error, setError] = useState('');
  const [hasMasterPassword, setHasMasterPassword] = useState(false);

  useEffect(() => {
    setHasMasterPassword(localStorage.getItem(KEEPASS_MASTER_PASS_KEY) === 'true');
    if (!hasMasterPassword) {
        setIsLocked(false); // Go to setup if no master pass set
    }
  }, [hasMasterPassword]);

  const loadEntries = async (password: string) => {
    const masterHash = await simpleHash(password);
    const storedEntries = localStorage.getItem(`${KEEPASS_DB_KEY_PREFIX}${databaseName}_${masterHash}`);
    if (storedEntries) {
      setEntries(JSON.parse(storedEntries));
      setIsLocked(false);
      setError('');
      setMasterPasswordAttempt('');
    } else {
      setError('Incorrect master password or database not found for this password.');
    }
  };

  const saveEntries = async (currentEntries: KeePassEntry[], password?: string) => {
    const passToUse = password || masterPasswordAttempt; // Use attempt if unlocking, or provided if setting up
    if (!passToUse) { 
        setError("Master password not available for saving."); 
        return false;
    }
    const masterHash = await simpleHash(passToUse);
    localStorage.setItem(`${KEEPASS_DB_KEY_PREFIX}${databaseName}_${masterHash}`, JSON.stringify(currentEntries));
    return true;
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterPasswordAttempt) {
      setError('Please enter a master password.');
      return;
    }
    await loadEntries(masterPasswordAttempt);
  };
  
  const handleSetupMasterPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterPasswordAttempt || masterPasswordAttempt.length < 4) {
        setError('Master password must be at least 4 characters.');
        return;
    }
    await saveEntries([], masterPasswordAttempt); // Save empty DB with new pass
    localStorage.setItem(KEEPASS_MASTER_PASS_KEY, 'true');
    setHasMasterPassword(true);
    setIsLocked(false);
    setError('');
    // masterPasswordAttempt remains set for this session
  };

  const handleAddEntry = async () => {
    if (!newEntry.title) {
      alert("Title is required for new entry.");
      return;
    }
    const entryToAdd: KeePassEntry = {
      id: uuidv4(),
      title: newEntry.title!,
      username: newEntry.username || '',
      password: newEntry.password || '',
      notes: newEntry.notes || '',
    };
    const updatedEntries = [...entries, entryToAdd];
    const success = await saveEntries(updatedEntries);
    if (success) {
        setEntries(updatedEntries);
        setShowAddEntryForm(false);
        setNewEntry({ title: '', username: '', password: '', notes: '' });
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      const updatedEntries = entries.filter(entry => entry.id !== id);
      const success = await saveEntries(updatedEntries);
      if (success) {
        setEntries(updatedEntries);
      }
    }
  };

  const handleLock = () => {
    setIsLocked(true);
    setMasterPasswordAttempt(''); // Clear password attempt for security
    setEntries([]); // Clear entries from state
  };
  
  if (!hasMasterPassword && isLocked) { // isLocked starts true, but if no master pass, switch to setup
    return (
      <div className="h-full flex flex-col bg-slate-800 text-slate-200 p-4 items-center justify-center">
        <div className="bg-slate-700 p-6 rounded-lg shadow-xl text-center w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4 text-yellow-400">KeePassXC Simulator - Setup</h2>
          <p className="text-sm mb-4 text-slate-300">
            Welcome! Please set a master password for your simulated database.
            <br /><strong className="text-red-400">This is a SIMULATION. DO NOT use real passwords.</strong>
          </p>
          <form onSubmit={handleSetupMasterPassword} className="space-y-3">
            <input
              type="password"
              value={masterPasswordAttempt}
              onChange={(e) => setMasterPasswordAttempt(e.target.value)}
              placeholder="Choose a Master Password (min 4 chars)"
              className="w-full p-2 rounded bg-slate-600 text-slate-100 border border-slate-500 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
            <button type="submit" className="w-full p-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold">
              Set Master Password & Create Database
            </button>
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
          </form>
        </div>
      </div>
    );
  }


  if (isLocked) {
    return (
      <div className="h-full flex flex-col bg-slate-800 text-slate-200 p-4 items-center justify-center">
        <div className="bg-slate-700 p-6 rounded-lg shadow-xl text-center w-full max-w-md">
          <h2 className="text-xl font-semibold mb-1 text-yellow-400">KeePassXC Simulator (Locked)</h2>
          <p className="text-xs mb-4 text-red-400">
            <strong>SIMULATION ONLY - NOT SECURE FOR REAL PASSWORDS</strong>
          </p>
          <form onSubmit={handleUnlock} className="space-y-3">
            <input
              type="password"
              value={masterPasswordAttempt}
              onChange={(e) => setMasterPasswordAttempt(e.target.value)}
              placeholder="Master Password"
              className="w-full p-2 rounded bg-slate-600 text-slate-100 border border-slate-500 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
            <button type="submit" className="w-full p-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold">
              Unlock
            </button>
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
          </form>
           <p className="text-xs text-slate-400 mt-4">This app simulates KeePassXC. Data is "protected" by a simple hash of your master password and stored in your browser's localStorage. It is NOT secure.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-200 text-slate-800">
      <div className="p-3 bg-slate-300 border-b border-slate-400 flex items-center justify-between">
        <h2 className="text-lg font-semibold">KeePassXC Simulator ({databaseName})</h2>
        <div className="space-x-2">
            <button onClick={() => setShowAddEntryForm(true)} className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600">
                Add Entry
            </button>
            <button onClick={handleLock} className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">
                Lock Database
            </button>
        </div>
      </div>
       <p className="p-2 text-xs bg-yellow-100 text-yellow-700 border-b border-yellow-300">
        <strong>WARNING: SIMULATION ONLY.</strong> Do not store real sensitive information here. All data is stored insecurely in your browser.
      </p>

      {showAddEntryForm && (
        <div className="p-4 border-b border-slate-300 bg-slate-100">
          <h3 className="text-md font-semibold mb-2">Add New Entry</h3>
          <div className="space-y-2">
            <input type="text" placeholder="Title*" value={newEntry.title || ''} onChange={e => setNewEntry({...newEntry, title: e.target.value})} className="w-full p-1.5 border rounded text-sm"/>
            <input type="text" placeholder="Username" value={newEntry.username || ''} onChange={e => setNewEntry({...newEntry, username: e.target.value})} className="w-full p-1.5 border rounded text-sm"/>
            <input type="password" placeholder="Password" value={newEntry.password || ''} onChange={e => setNewEntry({...newEntry, password: e.target.value})} className="w-full p-1.5 border rounded text-sm"/>
            <textarea placeholder="Notes" value={newEntry.notes || ''} onChange={e => setNewEntry({...newEntry, notes: e.target.value})} className="w-full p-1.5 border rounded text-sm h-20"/>
          </div>
          <div className="mt-2 space-x-2">
            <button onClick={handleAddEntry} className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">Save Entry</button>
            <button onClick={() => setShowAddEntryForm(false)} className="px-3 py-1 bg-slate-400 text-white rounded text-sm hover:bg-slate-500">Cancel</button>
          </div>
        </div>
      )}

      <div className="flex-grow p-4 overflow-y-auto">
        {entries.length === 0 && !showAddEntryForm && (
          <p className="text-slate-500 text-center mt-6">No entries yet. Click "Add Entry" to create one.</p>
        )}
        <ul className="space-y-3">
          {entries.map(entry => (
            <li key={entry.id} className="bg-white p-3 rounded shadow border border-slate-300">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-md text-blue-600">{entry.title}</h4>
                <button onClick={() => handleDeleteEntry(entry.id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
              </div>
              {entry.username && <p className="text-sm"><strong className="text-slate-600">Username:</strong> {entry.username}</p>}
              {entry.password && <p className="text-sm"><strong className="text-slate-600">Password:</strong> <span className="font-mono bg-slate-100 px-1 rounded select-all">{entry.password}</span> (hover to see)</p>}
              {entry.notes && <p className="text-sm mt-1"><strong className="text-slate-600">Notes:</strong><br/><span className="whitespace-pre-wrap text-xs">{entry.notes}</span></p>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default KeePassXCApp;
