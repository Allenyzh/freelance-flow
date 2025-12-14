// Package main contains the Wails application entry and helper methods.
package main

import (
	"context"
	"encoding/base64"
	"fmt"
	"os"
	"os/exec"
	"runtime"
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

// SaveAndOpenPDF shows a native save dialog, saves the PDF, and opens it with the default viewer.
// Returns the saved file path on success, or an empty string if cancelled/failed.
func (a *App) SaveAndOpenPDF(base64Data string, defaultFilename string) (string, error) {
	// Show save dialog
	filePath, err := wailsRuntime.SaveFileDialog(a.ctx, wailsRuntime.SaveDialogOptions{
		DefaultFilename: defaultFilename,
		Title:           "Save Invoice PDF",
		Filters: []wailsRuntime.FileFilter{
			{DisplayName: "PDF Files", Pattern: "*.pdf"},
		},
	})
	if err != nil {
		return "", fmt.Errorf("save dialog error: %w", err)
	}

	// User cancelled
	if filePath == "" {
		return "", nil
	}

	// Decode base64 to bytes
	pdfBytes, err := base64.StdEncoding.DecodeString(base64Data)
	if err != nil {
		return "", fmt.Errorf("failed to decode PDF: %w", err)
	}

	// Write to file
	if err := os.WriteFile(filePath, pdfBytes, 0644); err != nil {
		return "", fmt.Errorf("failed to save PDF: %w", err)
	}

	// Open with default application
	go func() {
		var cmd *exec.Cmd
		switch runtime.GOOS {
		case "darwin":
			cmd = exec.Command("open", filePath)
		case "windows":
			cmd = exec.Command("rundll32", "url.dll,FileProtocolHandler", filePath)
		default: // linux
			cmd = exec.Command("xdg-open", filePath)
		}
		_ = cmd.Start()
	}()

	return filePath, nil
}
