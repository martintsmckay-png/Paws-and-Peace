#include "visual/renderer.h"

Renderer::Renderer(int width, int height, const char* title)
    : screenWidth(width), screenHeight(height) {
    InitWindow(screenWidth, screenHeight, title);
    SetTargetFPS(60);
}

Renderer::~Renderer() {
    CloseWindow();
}

void Renderer::begin() {
    BeginDrawing();
    ClearBackground(BLACK);
}

void Renderer::end() {
    EndDrawing();
}

bool Renderer::shouldClose() const {
    return WindowShouldClose();
}
