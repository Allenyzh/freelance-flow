package update

import (
	"strings"

	"github.com/blang/semver/v4"
)

// CurrentVersion is the current application version.
// This should be set during build time using -ldflags.
// Default to 0.0.0-dev if not set.
var CurrentVersion = "0.0.0-dev"

// ParseVersion parses a version string into a semver.Version object.
// It automatically strips any leading 'v' character.
func ParseVersion(v string) (semver.Version, error) {
	cleanV := strings.TrimPrefix(strings.TrimSpace(v), "v")
	return semver.Parse(cleanV)
}

// CompareVersions compares two version strings.
// Returns:
//
//	-1 if v1 < v2
//	 0 if v1 == v2
//	 1 if v1 > v2
func CompareVersions(v1, v2 string) (int, error) {
	ver1, err := ParseVersion(v1)
	if err != nil {
		return 0, err
	}
	ver2, err := ParseVersion(v2)
	if err != nil {
		return 0, err
	}
	return ver1.Compare(ver2), nil
}

// IsUpdateAvailable checks if latest version is greater than current version.
func IsUpdateAvailable(current, latest string) (bool, error) {
	cmp, err := CompareVersions(latest, current)
	if err != nil {
		return false, err
	}
	return cmp > 0, nil
}

// GetCurrentVersion returns the current application version.
func GetCurrentVersion() string {
	return CurrentVersion
}
