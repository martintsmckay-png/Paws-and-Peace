#include "input/input.h"

void Input::update() {
    prevKeys = currKeys;
    prevMouse = currMouse;

    for (int k = KEY_NULL; k < KEY_KP_EQUAL; k++) {
        currKeys[k] = IsKeyDown(k);
    }

    for (int b = 0; b < 3; b++) {
        currMouse[b] = IsMouseButtonDown(b);
    }
}

bool Input::pressed(int key) const {
    return currKeys.at(key) && !prevKeys.at(key);
}

bool Input::released(int key) const {
    return !currKeys.at(key) && prevKeys.at(key);
}

bool Input::down(int key) const {
    return currKeys.at(key);
}

Vector2 Input::mousePosition() const {
    return GetMousePosition();
}

bool Input::mousePressed(int button) const {
    return currMouse.at(button) && !prevMouse.at(button);
}

bool Input::mouseReleased(int button) const {
    return !currMouse.at(button) && prevMouse.at(button);
}

bool Input::mouseDown(int button) const {
    return currMouse.at(button);
}
