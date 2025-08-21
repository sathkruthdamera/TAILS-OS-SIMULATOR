import { PersistentItem } from '../types';
import { v4 as uuidv4 } from 'https://esm.sh/uuid';

const PERSISTENT_STORAGE_KEY = 'tails_os_simulator_persistent_storage_v2'; // Updated key for new structure

export const getPersistentStorage = (): PersistentItem[] => {
  try {
    const stored = localStorage.getItem(PERSISTENT_STORAGE_KEY);
    if (stored) {
      const items = JSON.parse(stored) as PersistentItem[];
      // Ensure all items have necessary fields, especially parentId
      return items.map(item => ({ ...item, parentId: item.parentId === undefined ? null : item.parentId }));
    }
    return [];
  } catch (error) {
    console.error("Error reading persistent storage:", error);
    return [];
  }
};

export const savePersistentStorage = (items: PersistentItem[]): void => {
  try {
    localStorage.setItem(PERSISTENT_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('persistentStorageChanged'));
  } catch (error) {
    console.error("Error saving persistent storage:", error);
  }
};

export const getItemsByParentId = (parentId: string | null): PersistentItem[] => {
  const allItems = getPersistentStorage();
  return allItems.filter(item => item.parentId === parentId).sort((a,b) => a.name.localeCompare(b.name));
};

export const getItemById = (id: string): PersistentItem | undefined => {
  const allItems = getPersistentStorage();
  return allItems.find(item => item.id === id);
};

export const getItemByPath = (path: string): PersistentItem | undefined => {
    const allItems = getPersistentStorage();
    if (path === '/' || path === '') return { id: 'root', name: 'Persistent', type: 'folder', parentId: null, createdAt: '', modifiedAt: '' }; // Virtual root

    const parts = path.split('/').filter(p => p);
    let currentParentId: string | null = null;
    let currentItem: PersistentItem | undefined;

    for (const part of parts) {
        currentItem = allItems.find(item => item.parentId === currentParentId && item.name === part);
        if (!currentItem) return undefined;
        currentParentId = currentItem.id;
    }
    return currentItem;
};


export const addItem = (name: string, type: 'folder' | 'file', parentId: string | null, content?: string): PersistentItem | null => {
  const allItems = getPersistentStorage();
  const now = new Date().toISOString();
  
  // Check for duplicates in the same folder
  const siblings = allItems.filter(item => item.parentId === parentId);
  if (siblings.some(sibling => sibling.name === name && sibling.type === type)) {
    console.warn(`Item named "${name}" of type "${type}" already exists in this folder.`);
    return null; // Or throw error / return specific status
  }

  const newItem: PersistentItem = {
    id: uuidv4(),
    name,
    type,
    parentId,
    content: type === 'file' ? content || '' : undefined,
    createdAt: now,
    modifiedAt: now,
  };
  allItems.push(newItem);
  savePersistentStorage(allItems);
  return newItem;
};

export const updateItemContent = (id: string, newContent: string): PersistentItem | null => {
  let allItems = getPersistentStorage();
  const itemIndex = allItems.findIndex(item => item.id === id);
  if (itemIndex > -1 && allItems[itemIndex].type === 'file') {
    allItems[itemIndex].content = newContent;
    allItems[itemIndex].modifiedAt = new Date().toISOString();
    savePersistentStorage(allItems);
    return allItems[itemIndex];
  }
  return null;
};

export const renameItem = (id: string, newName: string): PersistentItem | null => {
  let allItems = getPersistentStorage();
  const itemIndex = allItems.findIndex(item => item.id === id);
  if (itemIndex > -1) {
    const item = allItems[itemIndex];
    // Check for duplicates with the new name in the same folder
    const siblings = allItems.filter(i => i.parentId === item.parentId && i.id !== id);
    if (siblings.some(sibling => sibling.name === newName && sibling.type === item.type)) {
      console.warn(`Item named "${newName}" of type "${item.type}" already exists in this folder.`);
      return null;
    }
    allItems[itemIndex].name = newName;
    allItems[itemIndex].modifiedAt = new Date().toISOString();
    savePersistentStorage(allItems);
    return allItems[itemIndex];
  }
  return null;
}

export const deleteItem = (id: string): boolean => {
  let allItems = getPersistentStorage();
  const itemToDelete = allItems.find(item => item.id === id);
  if (!itemToDelete) return false;

  let itemsToDeleteIds = [id];
  // If it's a folder, recursively find all children to delete
  if (itemToDelete.type === 'folder') {
    const findChildrenRecursive = (folderId: string) => {
      const children = allItems.filter(item => item.parentId === folderId);
      for (const child of children) {
        itemsToDeleteIds.push(child.id);
        if (child.type === 'folder') {
          findChildrenRecursive(child.id);
        }
      }
    };
    findChildrenRecursive(id);
  }
  
  const updatedItems = allItems.filter(item => !itemsToDeleteIds.includes(item.id));
  savePersistentStorage(updatedItems);
  return true;
};

// Initialize with a few example items if storage is empty
if (getPersistentStorage().length === 0) {
  addItem("My Documents", "folder", null);
  const notesFolder = addItem("Notes", "folder", null);
  if (notesFolder) {
    addItem("Meeting_notes.txt", "file", notesFolder.id, "Initial notes for the meeting...");
    addItem("Todo_list.txt", "file", notesFolder.id, "- Buy groceries\n- Finish report");
  }
  addItem("Welcome.txt", "file", null, "Welcome to your Persistent Storage!");
}
