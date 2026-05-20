#include "visual/renderer.h"
#include "state_machine.h"
#include <iostream>
#include "input/input.h"

int main() {
    // --- Initialize Renderer ---
    Renderer renderer(800, 600, "Paws & Peace Engine");

    // --- Initialize State Machine ---
    StateMachine sm;
    sm.setState(AppState::Idle);
	Input input;
    // --- Main Loop ---
    while (!renderer.shouldClose()) {
	input.update();
        // --- Update Phase ---
        sm.update();

        // Example: simple input-driven state transitions
        if (IsKeyPressed(KEY_ENTER)) {
            sm.setState(AppState::Running);
        }
        if (IsKeyPressed(KEY_ESCAPE)) {
            sm.setState(AppState::Exiting);
        }

        // --- Render Phase ---
        renderer.begin();

        // Basic visual feedback for state
        if (sm.getState() == AppState::Idle) {
            DrawText("STATE: IDLE", 20, 20, 20, LIGHTGRAY);
        } else if (sm.getState() == AppState::Running) {
            DrawText("STATE: RUNNING", 20, 20, 20, GREEN);
        } else if (sm.getState() == AppState::Exiting) {
            DrawText("STATE: EXITING", 20, 20, 20, RED);
        }
	} else if (sm.getState() == AppState::Exiting) {
    DrawText("STATE: EXITING", 20, 20, 20, RED);
}
        renderer.end();
    }

    return 0;
}
