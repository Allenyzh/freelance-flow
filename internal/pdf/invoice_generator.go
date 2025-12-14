package pdf

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"freelance-flow/internal/dto"
	"freelance-flow/internal/models"
	"freelance-flow/internal/utils"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/go-pdf/fpdf"
)

// Generator handles PDF generation for invoices.
type Generator struct {
	TemplatesDir string
}

// NewGenerator creates a new PDF generator.
func NewGenerator(templatesDir string) *Generator {
	return &Generator{TemplatesDir: templatesDir}
}

// GeneratePDF builds a PDF based on invoice, client, settings, and linked time entries.
func (g *Generator) GeneratePDF(invoice dto.InvoiceOutput, client models.Client, settings models.UserSettings, message string) (string, error) {
	// Use template-based PDF generation
	pdfBytes, err := g.renderPDFWithTemplate(invoice, client, settings, message)
	if err != nil {
		log.Printf("Template PDF failed, falling back to fpdf: %v", err)
		// Fallback to old fpdf method
		return g.generatePDFWithFpdf(invoice, client, settings, message)
	}

	return base64.StdEncoding.EncodeToString(pdfBytes), nil
}

// renderPDFWithTemplate uses the HTML template renderer for PDF generation.
func (g *Generator) renderPDFWithTemplate(invoice dto.InvoiceOutput, client models.Client, settings models.UserSettings, message string) ([]byte, error) {
	renderer := NewTemplateRenderer(g.TemplatesDir)

	// Build billing city line from parts (reuse logic or reimplement?)
	// Let's implement helper here or check utils.
	// The user asked to move format functions. Let's assume buildBillingCityLine is specific enough to be here or moved to utils?
	// I didn't move it to utils yet (I only did FormatAmount, etc.).
	// Wait, I should have moved it. Let's add it to utils in next tool call if I forgot?
	// Actully, creating it locally is fine if it's simple string join.
	billingCityLine := buildBillingCityLine(client)

	// Get currency symbol
	currencySymbol := utils.GetCurrencySymbol(settings.Currency)

	// Use billing company, fallback to client name
	billingCompany := client.BillingCompany
	if billingCompany == "" {
		billingCompany = client.Name
	}

	// Build template data
	data := InvoiceTemplateData{
		SenderName:       settings.SenderName,
		SenderCompany:    settings.SenderCompany,
		SenderAddress:    settings.SenderAddress,
		SenderPostalCode: settings.SenderPostalCode,
		SenderPhone:      settings.SenderPhone,
		SenderEmail:      settings.SenderEmail,

		BillingCompany:  billingCompany,
		BillingAddress:  client.BillingAddress,
		BillingCityLine: billingCityLine,

		InvoiceNumber: invoice.Number,
		IssueDate:     utils.FormatDate(invoice.IssueDate, settings.DateFormat, settings.Timezone),
		DueDate:       utils.FormatDate(invoice.DueDate, settings.DateFormat, settings.Timezone),
		Terms:         settings.InvoiceTerms,

		Subtotal:       invoice.Subtotal,
		TaxRate:        invoice.TaxRate,
		TaxAmount:      invoice.TaxAmount,
		Total:          invoice.Total,
		Currency:       settings.Currency,
		CurrencySymbol: currencySymbol,

		MinRows: 5,
		Message: message,
	}

	// Convert invoice items
	for _, item := range invoice.Items {
		data.Items = append(data.Items, InvoiceItemData{
			Description: item.Description,
			Quantity:    item.Quantity,
			UnitPrice:   item.UnitPrice,
			Amount:      item.Amount,
		})
	}

	// Use quickbooks template by default
	return renderer.GenerateInvoicePDF("quickbooks", data)
}

// buildBillingCityLine constructs "City, Province, Postal Code" line.
func buildBillingCityLine(client models.Client) string {
	parts := []string{}
	if client.BillingCity != "" {
		parts = append(parts, client.BillingCity)
	}
	if client.BillingProvince != "" {
		parts = append(parts, client.BillingProvince)
	}
	if client.BillingPostalCode != "" {
		parts = append(parts, client.BillingPostalCode)
	}
	if len(parts) == 0 {
		return "City, Province, Postal code"
	}
	return strings.Join(parts, ", ")
}

// generatePDFWithFpdf is the legacy PDF generation using fpdf (fallback).
func (g *Generator) generatePDFWithFpdf(invoice dto.InvoiceOutput, client models.Client, settings models.UserSettings, message string) (string, error) {
	pdfPtr, err := g.renderPDF(invoice, client, settings, message)
	if err != nil {
		return "", err
	}

	var buf bytes.Buffer
	if err := pdfPtr.Output(&buf); err != nil {
		return "", fmt.Errorf("failed to render pdf: %w", err)
	}

	return base64.StdEncoding.EncodeToString(buf.Bytes()), nil
}

func loadPDFFonts(pdf *fpdf.Fpdf) (bool, bool) {
	fontDir := "fonts"
	robotoPath := filepath.Join(fontDir, "Roboto-Regular.ttf")
	notoPath := filepath.Join(fontDir, "NotoSansSC-Regular.ttf")
	hasRoboto := false
	hasNoto := false
	// #nosec G304 -- font paths are fixed under app-controlled fonts dir.
	if data, err := os.ReadFile(robotoPath); err == nil {
		pdf.AddUTF8FontFromBytes("Roboto", "", data)
		hasRoboto = true
	}
	// #nosec G304 -- font paths are fixed under app-controlled fonts dir.
	if data, err := os.ReadFile(notoPath); err == nil {
		pdf.AddUTF8FontFromBytes("NotoSansSC", "", data)
		hasNoto = true
	}
	return hasRoboto, hasNoto
}

// renderPDF draws the invoice PDF with the expected layout.
func (g *Generator) renderPDF(invoice dto.InvoiceOutput, client models.Client, settings models.UserSettings, message string) (*fpdf.Fpdf, error) {
	pdfPtr := fpdf.New("P", "mm", "A4", "")
	pdfPtr.SetMargins(15, 20, 15)
	pdfPtr.AddPage()
	hasRoboto, hasNoto := loadPDFFonts(pdfPtr)
	baseFont := "Helvetica"
	boldStyle := "B" // Helvetica supports bold style
	if hasNoto {
		baseFont = "NotoSansSC"
		boldStyle = "" // UTF-8 fonts don't have bold variant loaded
	} else if hasRoboto {
		baseFont = "Roboto"
		boldStyle = "" // UTF-8 fonts don't have bold variant loaded
	}

	headerFill := func() {
		pdfPtr.SetFillColor(51, 51, 51)
		pdfPtr.Rect(0, 0, 210, 35, "F")
		pdfPtr.SetTextColor(255, 255, 255)
		pdfPtr.SetFont(baseFont, boldStyle, 28)
		pdfPtr.SetXY(150, 12)
		pdfPtr.CellFormat(50, 10, "INVOICE", "", 0, "R", false, 0, "")

		pdfPtr.SetFont(baseFont, "", 11)
		pdfPtr.SetXY(15, 12)
		senderName := settings.SenderName
		if senderName == "" {
			senderName = settings.SenderCompany
		}
		if senderName == "" {
			senderName = "Sender"
		}
		pdfPtr.CellFormat(120, 6, senderName, "", 1, "L", false, 0, "")
		if settings.SenderAddress != "" {
			pdfPtr.CellFormat(120, 6, settings.SenderAddress, "", 1, "L", false, 0, "")
		}
		if settings.SenderPostalCode != "" {
			pdfPtr.CellFormat(120, 6, settings.SenderPostalCode, "", 1, "L", false, 0, "")
		}
		if settings.SenderPhone != "" {
			pdfPtr.CellFormat(120, 6, settings.SenderPhone, "", 1, "L", false, 0, "")
		}
		if settings.SenderEmail != "" {
			pdfPtr.CellFormat(120, 6, settings.SenderEmail, "", 1, "L", false, 0, "")
		}
		pdfPtr.SetTextColor(0, 0, 0)
	}

	sectionInvoiceInfo := func() {
		pdfPtr.Ln(10)
		pdfPtr.SetFont(baseFont, boldStyle, 11)
		pdfPtr.CellFormat(90, 6, "INVOICE TO "+strings.ToUpper(client.Name), "", 0, "L", false, 0, "")
		pdfPtr.CellFormat(90, 6, fmt.Sprintf("INVOICE# %s", invoice.Number), "", 1, "R", false, 0, "")

		pdfPtr.SetFont(baseFont, "", 10)
		pdfPtr.CellFormat(90, 6, client.Address, "", 0, "L", false, 0, "")
		rightY := pdfPtr.GetY()
		pdfPtr.SetXY(105, rightY)
		pdfPtr.CellFormat(90, 6, fmt.Sprintf("DATE %s", utils.FormatDate(invoice.IssueDate, settings.DateFormat, settings.Timezone)), "", 1, "R", false, 0, "")

		pdfPtr.CellFormat(90, 6, fmt.Sprintf("%s %s", client.ContactPerson, client.Email), "", 0, "L", false, 0, "")
		pdfPtr.SetXY(105, pdfPtr.GetY()-6)
		due := invoice.DueDate
		if due == "" {
			due = "DUE DATE"
		}
		pdfPtr.CellFormat(90, 6, fmt.Sprintf("DUE DATE %s", utils.FormatDate(due, settings.DateFormat, settings.Timezone)), "", 1, "R", false, 0, "")

		pdfPtr.SetXY(105, pdfPtr.GetY()-6)
		pdfPtr.CellFormat(90, 6, fmt.Sprintf("TERMS %s", settings.InvoiceTerms), "", 1, "R", false, 0, "")
		pdfPtr.Ln(6)
	}

	tableItems := func() {
		pdfPtr.SetFillColor(12, 168, 67)
		pdfPtr.SetTextColor(255, 255, 255)
		pdfPtr.SetFont(baseFont, boldStyle, 10)
		pdfPtr.CellFormat(100, 8, "DESCRIPTION", "1", 0, "L", true, 0, "")
		pdfPtr.CellFormat(30, 8, "QTY", "1", 0, "C", true, 0, "")
		pdfPtr.CellFormat(30, 8, "RATE", "1", 0, "C", true, 0, "")
		pdfPtr.CellFormat(30, 8, "AMOUNT", "1", 1, "C", true, 0, "")

		pdfPtr.SetTextColor(0, 0, 0)
		pdfPtr.SetFont(baseFont, "", 10)
		description := "Invoice Summary"
		if len(invoice.Items) > 0 && invoice.Items[0].Description != "" {
			description = invoice.Items[0].Description
		}
		qty := 0.0
		rate := 0.0
		for _, item := range invoice.Items {
			qty += item.Quantity
			rate = item.UnitPrice
		}
		if qty == 0 && rate > 0 {
			qty = 1
		}
		amount := invoice.Total

		pdfPtr.CellFormat(100, 10, description, "1", 0, "L", false, 0, "")
		pdfPtr.CellFormat(30, 10, fmt.Sprintf("%.2f", qty), "1", 0, "C", false, 0, "")
		pdfPtr.CellFormat(30, 10, utils.FormatAmount(rate, settings.Currency), "1", 0, "C", false, 0, "")
		pdfPtr.CellFormat(30, 10, utils.FormatAmount(amount, settings.Currency), "1", 1, "C", false, 0, "")
	}

	totalSection := func() {
		pdfPtr.Ln(4)
		startX := 110.0
		pdfPtr.SetXY(startX, pdfPtr.GetY())
		pdfPtr.SetFont(baseFont, "", 10)
		rows := []struct {
			label string
			value string
		}{
			{"SUBTOTAL", utils.FormatAmount(invoice.Subtotal, settings.Currency)},
			{"DISCOUNT", "0"},
			{"TAX", utils.FormatAmount(invoice.TaxAmount, settings.Currency)},
			{"TOTAL", utils.FormatAmount(invoice.Total, settings.Currency)},
			{"BALANCE DUE", utils.FormatAmount(invoice.Total, settings.Currency)},
		}
		for _, row := range rows {
			pdfPtr.CellFormat(40, 8, row.label, "", 0, "L", false, 0, "")
			pdfPtr.CellFormat(40, 8, row.value, "", 1, "R", false, 0, "")
		}
	}

	messageSection := func() {
		pdfPtr.Ln(6)
		pdfPtr.SetFont(baseFont, boldStyle, 10)
		pdfPtr.CellFormat(60, 6, "MESSAGE", "", 1, "L", false, 0, "")
		pdfPtr.SetFont(baseFont, "", 10)
		pdfPtr.MultiCell(120, 6, message, "1", "L", false)
	}

	headerFill()
	sectionInvoiceInfo()
	tableItems()
	messageSection()
	totalSection()

	return pdfPtr, nil
}
