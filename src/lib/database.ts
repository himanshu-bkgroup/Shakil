export interface DatabaseStatus {
  success: boolean;
  connected: boolean;
  type: 'mongodb' | 'file';
  databaseName: string;
  maskedUri: string;
  counts: {
    services: number;
    gallery: number;
    enquiries: number;
    faqs: number;
    notifications: number;
  };
  lastError: string | null;
}

/**
 * Fetch real-time database connection status from server
 */
export async function fetchDatabaseStatus(): Promise<DatabaseStatus> {
  try {
    const res = await fetch('/api/database/status');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Failed to fetch database status:', err);
  }

  return {
    success: false,
    connected: false,
    type: 'file',
    databaseName: 'Local JSON Store',
    maskedUri: '',
    counts: {
      services: 0,
      gallery: 0,
      enquiries: 0,
      faqs: 0,
      notifications: 0,
    },
    lastError: 'Server status endpoint unreachable',
  };
}

/**
 * Connect to MongoDB Atlas or local MongoDB
 */
export async function connectMongoDatabase(
  uri: string,
  dbName: string = 'sakil_bag_store'
): Promise<{ success: boolean; message: string; status?: DatabaseStatus }> {
  try {
    const res = await fetch('/api/database/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uri, dbName }),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Network error connecting to MongoDB',
    };
  }
}

/**
 * Disconnect from MongoDB and revert to local storage
 */
export async function disconnectMongoDatabase(): Promise<{
  success: boolean;
  message: string;
  status?: DatabaseStatus;
}> {
  try {
    const res = await fetch('/api/database/disconnect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Error disconnecting from MongoDB',
    };
  }
}

/**
 * Synchronize all current catalog & inquiries data into MongoDB
 */
export async function syncDataToMongo(): Promise<{
  success: boolean;
  message: string;
  status?: DatabaseStatus;
}> {
  try {
    const res = await fetch('/api/database/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Error syncing data to MongoDB',
    };
  }
}
