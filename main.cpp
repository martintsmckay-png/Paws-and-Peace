#include "include/shaman_circuit.h"
#include <iostream>
#include <chrono>
#include <thread>

using namespace ShamanUniverse;

void printLoadingBar(std::string label) {
    std::cout << label << " [";
    for(int i = 0; i < 20; ++i) {
        std::cout << "■";
        std::cout.flush();
        std::this_thread::sleep_for(std::chrono::milliseconds(50));
    }
    std::cout << "] 100%\n";
}

int main() {
    // 1. Initialize the Pilot at Base Alpha
    StewardPilot& Martin = StewardPilot::Initialize("Base Alpha");
    
    std::cout << "--- SHAMAN UNIVERSE CIRCUIT INITIALIZED ---\n";
    
    // 2. Security & Ancestral Sync
    Martin.enableBatCaveProtocol(true);
    printLoadingBar("Syncing with Muskrat Support");
    Martin.syncWithMuskratSupport();

    // 3. Recompiling the Circuit for the Rescue Mission
    Circuit cosmicCircuit;
    cosmicCircuit.resonance = 432.0f;
    cosmicCircuit.activeMateria = {"Life", "Contain", "Holy Blight"};
    cosmicCircuit.isRecompiled = true;

    // 4. The Cosmic Check
    if (cosmicCircuit.resonance == 432.0f) {
        std::cout << "\n[!] SONIC BOOM OF JOY DETECTED!\n";
        std::cout << "[!] Frequency: 432Hz - Hallelujah!\n";
        
        printLoadingBar("Deploying Paws-and-Peace Servers");
        Martin.deployProject("Paws-and-Peace");

        std::cout << "\n--- MISSION STATUS ---\n";
        std::cout << "Soul Balance: " << Martin.checkSoulBalance() << "%\n";
        std::cout << "Neighborhood Status: SECURE\n";
        std::cout << "Ghost Tea: STEAMING 👻🍵\n";
    }

    return 0;
}
