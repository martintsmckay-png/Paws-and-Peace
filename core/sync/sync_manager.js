// ============================================
// Sync Manager (Offline-First)
// Version: 1.0.0
// ============================================

class SyncManager {
  constructor() {
    this.queueKey = "paws_peace_sync_queue";
    this.loadQueue();
    console.log('🔄 SyncManager initialized');
  }

  loadQueue() {
    const stored = localStorage.getItem(this.queueKey);
    this.queue = stored ? JSON.parse(stored) : [];
    console.log(`📦 Loaded ${this.queue.length} queued records`);
  }

  saveQueue() {
    localStorage.setItem(this.queueKey, JSON.stringify(this.queue));
  }

  addRecord(record) {
    const fullRecord = {
      ...record,
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      synced: false
    };
    
    this.queue.push(fullRecord);
    this.saveQueue();
    console.log('✅ Record added to sync queue:', fullRecord);
    return fullRecord.id;
  }

  getQueue() {
    return [...this.queue];
  }

  getUnsyncedCount() {
    return this.queue.filter(r => !r.synced).length;
  }

  async syncAll(api) {
    console.log('🔄 Starting sync...');
    const unsent = this.queue.filter(r => !r.synced);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < unsent.length; i++) {
      const record = unsent[i];
      try {
        const ok = await api.send(record);
        if (ok) {
          // Mark as synced in queue
          const idx = this.queue.findIndex(r => r.id === record.id);
          if (idx !== -1) {
            this.queue[idx].synced = true;
          }
          successCount++;
          console.log(`✅ Synced: ${record.type}`);
        } else {
          failCount++;
          console.log(`⚠️ Failed to sync: ${record.type}`);
        }
      } catch (error) {
        failCount++;
        console.error(`❌ Sync error:`, error);
      }
    }

    this.saveQueue();
    console.log(`🎯 Sync complete: ${successCount} success, ${failCount} failed`);
    return { successCount, failCount, total: unsent.length };
  }

  clearQueue() {
    this.queue = [];
    this.saveQueue();
    console.log('🗑️ Sync queue cleared');
  }
}

// Export as singleton
window.syncManager = new SyncManager();
