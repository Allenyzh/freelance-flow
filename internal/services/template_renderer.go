package services

import (
	"bytes"
	"context"
	"embed"
	"fmt"
	"html/template"
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/chromedp/cdproto/page"
	"github.com/chromedp/chromedp"
)

// TemplateRenderer handles HTML template rendering and PDF generation.
type TemplateRenderer struct {
	templatesDir string
}

// NewTemplateRenderer creates a new TemplateRenderer with the given templates directory.
func NewTemplateRenderer(templatesDir string) *TemplateRenderer {
	return &TemplateRenderer{templatesDir: templatesDir}
}

// InvoiceTemplateData holds all data needed to render an invoice template.
type InvoiceTemplateData struct {
	// Sender info
	SenderName       string
	SenderCompany    string
	SenderAddress    string
	SenderPostalCode string
	SenderPhone      string
	SenderEmail      string

	// Client billing info (for INVOICE TO section)
	BillingCompany  string // Company name for invoice
	BillingAddress  string // Street address
	BillingCityLine string // "City, Province, Postal Code"

	// Invoice details
	InvoiceNumber string
	IssueDate     string
	DueDate       string
	Terms         string

	// Items
	Items   []InvoiceItemData
	MinRows int // Minimum rows to display (default 5)

	// Totals
	Subtotal       float64
	TaxRate        float64
	TaxAmount      float64
	Total          float64
	Currency       string // Currency code (e.g., "CAD")
	CurrencySymbol string // Currency symbol (e.g., "$")

	// Message
	Message string

	// CSS content (injected into template)
	CSS template.CSS
}

// InvoiceItemData represents a single line item in the invoice.
type InvoiceItemData struct {
	Description string // Service type description
	Quantity    float64
	UnitPrice   float64
	Amount      float64
}

// templateFuncs provides custom functions for templates.
var templateFuncs = template.FuncMap{
	"sub": func(a, b int) int {
		return a - b
	},
	"iterate": func(n int) []int {
		result := make([]int, n)
		for i := 0; i < n; i++ {
			result[i] = i
		}
		return result
	},
}

// RenderHTML renders the invoice template with the given data.
func (r *TemplateRenderer) RenderHTML(templateName string, data InvoiceTemplateData) (string, error) {
	templatePath := filepath.Join(r.templatesDir, "invoices", templateName, "template.tmpl")
	cssPath := filepath.Join(r.templatesDir, "invoices", templateName, "style.css")

	// Read CSS file
	cssContent, err := os.ReadFile(cssPath)
	if err != nil {
		return "", fmt.Errorf("failed to read CSS file: %w", err)
	}
	data.CSS = template.CSS(cssContent)

	// Parse template
	tmpl, err := template.New("template.tmpl").Funcs(templateFuncs).ParseFiles(templatePath)
	if err != nil {
		return "", fmt.Errorf("failed to parse template: %w", err)
	}

	// Execute template
	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
		return "", fmt.Errorf("failed to execute template: %w", err)
	}

	return buf.String(), nil
}

// RenderPDF converts HTML content to PDF using chromedp.
func (r *TemplateRenderer) RenderPDF(htmlContent string) ([]byte, error) {
	// Create a context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Create chromedp allocator with headless options
	allocCtx, allocCancel := chromedp.NewExecAllocator(ctx,
		append(chromedp.DefaultExecAllocatorOptions[:],
			chromedp.Flag("disable-gpu", true),
			chromedp.Flag("no-sandbox", true),
			chromedp.Flag("disable-dev-shm-usage", true),
		)...,
	)
	defer allocCancel()

	// Create browser context
	browserCtx, browserCancel := chromedp.NewContext(allocCtx)
	defer browserCancel()

	// Navigate to data URL with HTML content
	var pdfBytes []byte
	err := chromedp.Run(browserCtx,
		chromedp.Navigate("about:blank"),
		chromedp.ActionFunc(func(ctx context.Context) error {
			frameTree, err := page.GetFrameTree().Do(ctx)
			if err != nil {
				return err
			}
			return page.SetDocumentContent(frameTree.Frame.ID, htmlContent).Do(ctx)
		}),
		chromedp.ActionFunc(func(ctx context.Context) error {
			var err error
			pdfBytes, _, err = page.PrintToPDF().
				WithPrintBackground(true).
				WithPaperWidth(8.27).   // A4 width in inches
				WithPaperHeight(11.69). // A4 height in inches
				WithMarginTop(0).
				WithMarginBottom(0).
				WithMarginLeft(0).
				WithMarginRight(0).
				Do(ctx)
			return err
		}),
	)

	if err != nil {
		return nil, fmt.Errorf("chromedp failed: %w", err)
	}

	return pdfBytes, nil
}

// GenerateInvoicePDF is a convenience method that renders HTML and converts to PDF.
func (r *TemplateRenderer) GenerateInvoicePDF(templateName string, data InvoiceTemplateData) ([]byte, error) {
	html, err := r.RenderHTML(templateName, data)
	if err != nil {
		return nil, err
	}
	return r.RenderPDF(html)
}

// EmbeddedTemplateRenderer uses embedded templates (for production builds).
type EmbeddedTemplateRenderer struct {
	fs embed.FS
}

// NewEmbeddedTemplateRenderer creates a renderer using embedded filesystem.
func NewEmbeddedTemplateRenderer(fs embed.FS) *EmbeddedTemplateRenderer {
	return &EmbeddedTemplateRenderer{fs: fs}
}

// RenderHTML renders the invoice template from embedded filesystem.
func (r *EmbeddedTemplateRenderer) RenderHTML(templateName string, data InvoiceTemplateData) (string, error) {
	templatePath := filepath.Join("templates", "invoices", templateName, "template.tmpl")
	cssPath := filepath.Join("templates", "invoices", templateName, "style.css")

	// Read CSS file
	cssContent, err := r.fs.ReadFile(cssPath)
	if err != nil {
		return "", fmt.Errorf("failed to read embedded CSS file: %w", err)
	}
	data.CSS = template.CSS(cssContent)

	// Read template file
	templateContent, err := r.fs.ReadFile(templatePath)
	if err != nil {
		return "", fmt.Errorf("failed to read embedded template file: %w", err)
	}

	// Parse template
	tmpl, err := template.New("template.tmpl").Funcs(templateFuncs).Parse(string(templateContent))
	if err != nil {
		return "", fmt.Errorf("failed to parse template: %w", err)
	}

	// Execute template
	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
		return "", fmt.Errorf("failed to execute template: %w", err)
	}

	return buf.String(), nil
}

// RenderPDF converts HTML content to PDF using chromedp.
func (r *EmbeddedTemplateRenderer) RenderPDF(htmlContent string) ([]byte, error) {
	// Reuse the same implementation
	tr := &TemplateRenderer{}
	return tr.RenderPDF(htmlContent)
}

// GenerateInvoicePDF is a convenience method that renders HTML and converts to PDF.
func (r *EmbeddedTemplateRenderer) GenerateInvoicePDF(templateName string, data InvoiceTemplateData) ([]byte, error) {
	html, err := r.RenderHTML(templateName, data)
	if err != nil {
		return nil, err
	}
	return r.RenderPDF(html)
}

// GetTemplatesDir returns the templates directory path based on executable location.
func GetTemplatesDir() string {
	// First try relative to executable
	execPath, err := os.Executable()
	if err == nil {
		execDir := filepath.Dir(execPath)
		templatesDir := filepath.Join(execDir, "templates")
		if _, err := os.Stat(templatesDir); err == nil {
			return templatesDir
		}
	}

	// Try current working directory
	cwd, err := os.Getwd()
	if err == nil {
		templatesDir := filepath.Join(cwd, "templates")
		if _, err := os.Stat(templatesDir); err == nil {
			return templatesDir
		}
	}

	// Search upward from cwd to find project root with templates directory
	if cwd != "" {
		dir := cwd
		for i := 0; i < 10; i++ { // Limit search depth
			templatesDir := filepath.Join(dir, "templates")
			if _, err := os.Stat(templatesDir); err == nil {
				return templatesDir
			}
			parent := filepath.Dir(dir)
			if parent == dir {
				break
			}
			dir = parent
		}
	}

	log.Println("Warning: could not find templates directory")
	return "templates"
}
