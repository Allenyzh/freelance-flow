package update

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"os"
)

// Downloader handles file downloads with progress tracking.
type Downloader struct {
	client *http.Client
}

// NewDownloader creates a new Downloader.
func NewDownloader() *Downloader {
	return &Downloader{
		client: http.DefaultClient,
	}
}

// Download downloads a file from url to destPath.
// onProgress is called with total bytes and current bytes downloaded.
// If total size is unknown, total will be -1.
func (d *Downloader) Download(ctx context.Context, url string, destPath string, onProgress func(total, current int64)) error {
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := d.client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("bad status: %s", resp.Status)
	}

	out, err := os.Create(destPath)
	if err != nil {
		return fmt.Errorf("failed to create file: %w", err)
	}
	defer out.Close()

	total := resp.ContentLength
	counter := &progressWriter{
		total:      total,
		onProgress: onProgress,
	}

	// io.TeeReader approach usually wraps a Reader, but we need to track writes to 'out'.
	// Or we can wrap 'out' with a writer that counts updates.
	// Actually, io.Copy(dest, io.TeeReader(src, counter)) is standard pattern
	// but here we want to invoke a callback. Simple custom writer is easiest.

	_, err = io.Copy(out, io.TeeReader(resp.Body, counter))
	if err != nil {
		return fmt.Errorf("failed to download file: %w", err)
	}

	return nil
}

// VerifyHash checks if the file at path matches the expected SHA256 hash.
func (d *Downloader) VerifyHash(path string, expectedHash string) error {
	f, err := os.Open(path)
	if err != nil {
		return fmt.Errorf("failed to open file for verification: %w", err)
	}
	defer f.Close()

	hasher := sha256.New()
	if _, err := io.Copy(hasher, f); err != nil {
		return fmt.Errorf("failed to calculate hash: %w", err)
	}

	actualHash := hex.EncodeToString(hasher.Sum(nil))
	if actualHash != expectedHash {
		return fmt.Errorf("hash mismatch: expected %s, got %s", expectedHash, actualHash)
	}

	return nil
}

type progressWriter struct {
	total      int64
	current    int64
	onProgress func(total, current int64)
}

func (pw *progressWriter) Write(p []byte) (int, error) {
	n := len(p)
	pw.current += int64(n)
	if pw.onProgress != nil {
		pw.onProgress(pw.total, pw.current)
	}
	return n, nil
}
