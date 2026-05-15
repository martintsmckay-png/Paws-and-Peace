// -----------------------------
// Mock API (Offline Simulation)
// -----------------------------

export const mockAPI = {
  async send(record) {
    console.log("Mock sending:", record);

    // Simulate network delay
    await new Promise(r => setTimeout(r, 250));

    // Always succeed for now
    return true;
  }
};