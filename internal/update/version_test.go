package update

import (
	"testing"
)

func TestParseVersion(t *testing.T) {
	tests := []struct {
		name    string
		input   string
		valid   bool
		wantErr bool
	}{
		{"valid version", "1.0.0", true, false},
		{"valid prerelease", "1.0.0-alpha.1", true, false},
		{"valid build", "1.0.0+build123", true, false},
		{"invalid empty", "", false, true},
		{"invalid format", "invalid", false, true},
		{"invalid partial", "1.0", false, true},
		{"with v prefix", "v1.0.0", true, false}, // Should handle v prefix
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := ParseVersion(tt.input)
			if (err != nil) != tt.wantErr {
				t.Errorf("ParseVersion() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestCompareVersions(t *testing.T) {
	tests := []struct {
		name    string
		v1      string
		v2      string
		want    int // -1: v1 < v2, 0: v1 == v2, 1: v1 > v2
		wantErr bool
	}{
		{"equal", "1.0.0", "1.0.0", 0, false},
		{"greater", "2.0.0", "1.0.0", 1, false},
		{"less", "0.1.0", "1.0.0", -1, false},
		{"prerelease", "1.0.0-beta", "1.0.0", -1, false},
		{"prerelease comparison", "1.0.0-alpha.1", "1.0.0-alpha.2", -1, false},
		{"invalid v1", "invalid", "1.0.0", 0, true},
		{"invalid v2", "1.0.0", "invalid", 0, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := CompareVersions(tt.v1, tt.v2)
			if (err != nil) != tt.wantErr {
				t.Errorf("CompareVersions() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr && got != tt.want {
				t.Errorf("CompareVersions() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestIsUpdateAvailable(t *testing.T) {
	// Simple wrapper for specific use case
	current := "1.0.0"
	latest := "1.0.1"
	available, err := IsUpdateAvailable(current, latest)
	if err != nil {
		t.Fatalf("IsUpdateAvailable error: %v", err)
	}
	if !available {
		t.Errorf("Expected update available for %s -> %s", current, latest)
	}

	current = "1.0.0"
	latest = "1.0.0"
	available, err = IsUpdateAvailable(current, latest)
	if err != nil {
		t.Fatalf("IsUpdateAvailable error: %v", err)
	}
	if available {
		t.Errorf("Expected no update for equal versions %s -> %s", current, latest)
	}
}
