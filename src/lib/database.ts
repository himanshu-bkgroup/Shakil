import { safeFetchJson } from './apiClient';

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
  const result = await safeFetchJson<DatabaseStatus>('/api/database/status');
  if (result.ok && result.data) {
    const data = result.data;
    return {
      ...data,
      counts: {
        services: data.counts?.services ?? 0,
        gallery: data.counts?.gallery ?? 0,
        enquiries: data.counts?.enquiries ?? 0,
        faqs: data.counts?.faqs ?? 0,
        notifications: data.counts?.notifications ?? 0,
      },
    };
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
    lastError: result.error || null,
  };
}

/**
 * Connect to MongoDB Atlas or local MongoDB
 */
export async function connectMongoDatabase(
  uri: string,
  dbName: string = 'shakil_bag_store'
): Promise<{ success: boolean; message: string; status?: DatabaseStatus }> {
  const result = await safeFetchJson<{ success: boolean; message: string; status?: DatabaseStatus }>(
    '/api/database/connect',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uri, dbName }),
    }
  );

  if (result.ok && result.data) {
    return result.data;
  }

  return {
    success: false,
    message: result.error || 'Failed to connect to MongoDB. Please verify connection string and network access.',
  };
}

/**
 * Disconnect from MongoDB and revert to local storage
 */
export async function disconnectMongoDatabase(): Promise<{
  success: boolean;
  message: string;
  status?: DatabaseStatus;
}> {
  const result = await safeFetchJson<{ success: boolean; message: string; status?: DatabaseStatus }>(
    '/api/database/disconnect',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }
  );

  if (result.ok && result.data) {
    return result.data;
  }

  return {
    success: false,
    message: result.error || 'Failed to disconnect from MongoDB.',
  };
}

/**
 * Synchronize all current catalog & inquiries data into MongoDB
 */
export async function syncDataToMongo(): Promise<{
  success: boolean;
  message: string;
  status?: DatabaseStatus;
}> {
  const result = await safeFetchJson<{ success: boolean; message: string; status?: DatabaseStatus }>(
    '/api/database/sync',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }
  );

  if (result.ok && result.data) {
    return result.data;
  }

  return {
    success: false,
    message: result.error || 'Failed to sync data to MongoDB.',
  };
}
