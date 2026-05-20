#include "state_machine.h"
#include <iostream>

StateMachine::StateMachine() : current(AppState::Idle) {}

void StateMachine::setState(AppState newState) {
    current = newState;
}

AppState StateMachine::getState() const {
    return current;
}

void StateMachine::update() {
    switch (current) {
        case AppState::Idle:
            // Placeholder for idle logic
            break;

        case AppState::Running:
            // Placeholder for running logic
            break;

        case AppState::Exiting:
            std::cout << "Shutting down...\n";
            break;
    }
}
