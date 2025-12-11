package update

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
)

// GitHubAPIBaseURL can be overridden for testing.
var GitHubAPIBaseURL = "https://api.github.com"

// GithubRelease represents the GitHub Release API response.
type GithubRelease struct {
	TagName     string        `json:"tag_name"`
	PublishedAt time.Time     `json:"published_at"`
	Body        string        `json:"body"`
	HtmlUrl     string        `json:"html_url"`
	Assets      []GithubAsset `json:"assets"`
}

type GithubAsset struct {
	Name               string `json:"name"`
	Size               int64  `json:"size"`
	BrowserDownloadUrl string `json:"browser_download_url"`
}

// FetchLatestRelease fetches the latest release from GitHub.
// It tries to find 'update.json' in the assets for rich metadata.
// If update.json is not found, it falls back to basic info from the release itself.
func FetchLatestRelease(owner, repo string) (*UpdateInfo, error) {
	url := fmt.Sprintf("%s/repos/%s/%s/releases/latest", GitHubAPIBaseURL, owner, repo)

	resp, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch release: %w", err)
	}
	defer func() {
		_ = resp.Body.Close()
	}()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("github api returned status: %d", resp.StatusCode)
	}

	var release GithubRelease
	if err := json.NewDecoder(resp.Body).Decode(&release); err != nil {
		return nil, fmt.Errorf("failed to decode release json: %w", err)
	}

	// 1. Try to find update.json in assets
	for _, asset := range release.Assets {
		if asset.Name == "update.json" {
			return fetchUpdateJSON(asset.BrowserDownloadUrl)
		}
	}

	// 2. Fallback: Construct minimal UpdateInfo from Release data
	// Note: Without update.json, we won't have signatures or structured platform map
	version := strings.TrimPrefix(release.TagName, "v")

	// Try to guess platforms from assets (simple heuristic)
	platforms := make(map[string]Platform)
	for _, asset := range release.Assets {
		name := strings.ToLower(asset.Name)
		if strings.Contains(name, "darwin") && strings.Contains(name, "amd64") {
			platforms["darwin-amd64"] = Platform{URL: asset.BrowserDownloadUrl, Size: asset.Size}
		} else if strings.Contains(name, "darwin") && strings.Contains(name, "arm64") {
			platforms["darwin-arm64"] = Platform{URL: asset.BrowserDownloadUrl, Size: asset.Size}
		} else if strings.Contains(name, "windows") && strings.Contains(name, "amd64") {
			platforms["windows-amd64"] = Platform{URL: asset.BrowserDownloadUrl, Size: asset.Size}
		}
	}

	return &UpdateInfo{
		Version:         version,
		ReleaseDate:     release.PublishedAt,
		ReleaseNotes:    release.Body,
		ReleaseNotesURL: release.HtmlUrl,
		Platforms:       platforms,
	}, nil
}

func fetchUpdateJSON(url string) (*UpdateInfo, error) {
	resp, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch update.json: %w", err)
	}
	defer func() {
		_ = resp.Body.Close()
	}()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("update.json download failed status: %d", resp.StatusCode)
	}

	var info UpdateInfo
	if err := json.NewDecoder(resp.Body).Decode(&info); err != nil {
		return nil, fmt.Errorf("failed to decode update.json: %w", err)
	}
	return &info, nil
}
