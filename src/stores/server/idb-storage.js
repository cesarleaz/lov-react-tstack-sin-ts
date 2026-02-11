import { openDB } from 'idb'

const DB_NAME = 'zustand-server-state-db'
const STORE_NAME = 'zustand-cache'

const getDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
  })
}

// Storage compatible con persist middleware de Zustand.
export const idbStorage = {
  getItem: async (name) => {
    const db = await getDB()
    return (await db.get(STORE_NAME, name)) ?? null
  },
  setItem: async (name, value) => {
    const db = await getDB()
    await db.put(STORE_NAME, value, name)
  },
  removeItem: async (name) => {
    const db = await getDB()
    await db.delete(STORE_NAME, name)
  }
}
