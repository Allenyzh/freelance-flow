// Package main contains the Wails application entry and helper methods.
package main

import (
	"context"
	"fmt"
	"time"

	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

type BootTimings struct {
	ProcessStart   time.Time `json:"processStart"`
	DbInitMs       int64     `json:"dbInitMs"`
	ServicesInitMs int64     `json:"servicesInitMs"`
	TotalBeforeUI  int64     `json:"totalBeforeUiMs"`
}

// App struct
type App struct {
	ctx         context.Context
	bootTimings BootTimings
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

func (a *App) SetBootTimings(t BootTimings) {
	a.bootTimings = t
}

func (a *App) GetBootTimings() BootTimings {
	return a.bootTimings
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	// Emit timings for frontend to consume during splash.
	wailsRuntime.EventsEmit(ctx, "bootstrap:backend-timings", a.bootTimings)
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}
