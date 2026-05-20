#pragma once
#include "raylib.h"

class Renderer {
public:
    Renderer(int width, int height, const char* title);
    ~Renderer();

    void begin();
    void end();
    bool shouldClose() const;

private:
    int screenWidth;
    int screenHeight;
};
