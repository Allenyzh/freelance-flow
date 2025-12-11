package update

import "time"

// UpdateInfo contains information about a release.
type UpdateInfo struct {
	Version         string              `json:"version"`
	ReleaseDate     time.Time           `json:"releaseDate"`
	ReleaseNotes    string              `json:"releaseNotes"`
	ReleaseNotesURL string              `json:"releaseNotesUrl,omitempty"`
	Mandatory       bool                `json:"mandatory"`
	Platforms       map[string]Platform `json:"platforms"`
}

// Platform contains platform-specific download information.
// key corresponds to "GOOS-GOARCH", e.g., "darwin-amd64", "windows-amd64".
type Platform struct {
	URL       string `json:"url"`
	Signature string `json:"signature"` // sha256:xxx
	Size      int64  `json:"size"`
}

// UpdateStatus represents the current status of the update process.
type UpdateStatus string

const (
	UpdateStatusNone        UpdateStatus = "none"
	UpdateStatusAvailable   UpdateStatus = "available"
	UpdateStatusDownloading UpdateStatus = "downloading"
	UpdateStatusReady       UpdateStatus = "ready"
	UpdateStatusError       UpdateStatus = "error"
)

// UpdateState reflects the current state of the update system,
// intended to be sent to the frontend.
type UpdateState struct {
	Status           UpdateStatus `json:"status"`
	CurrentVersion   string       `json:"currentVersion"`
	LatestVersion    string       `json:"latestVersion,omitempty"`
	UpdateInfo       *UpdateInfo  `json:"updateInfo,omitempty"`
	DownloadProgress float64      `json:"downloadProgress,omitempty"` // 0-100
	Error            string       `json:"error,omitempty"`
}

// CheckOptions configures how updates are checked.
type CheckOptions struct {
	Prerelease bool `json:"prerelease"`
}
