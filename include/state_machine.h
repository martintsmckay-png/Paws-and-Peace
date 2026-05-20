#pragma once
#include <string>

enum class AppState {
    Idle,
    Running,
    Exiting
};

class StateMachine {
public:
    StateMachine();

    void update();
    void setState(AppState newState);
    AppState getState() const;

private:
    AppState current;
};
