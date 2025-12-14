// Package models defines database-backed domain models.
package models

import "time"

// User represents an application account owner.
type User struct {
	ID           int       `json:"id"`
	UUID         string    `json:"uuid"` // For future cloud sync
	Username     string    `json:"username"`
	PasswordHash string    `json:"-"` // Never expose hash to frontend
	Email        string    `json:"email"`
	AvatarURL    string    `json:"avatarUrl"`
	CreatedAt    time.Time `json:"createdAt"`
	LastLogin    time.Time `json:"lastLogin"`
	SettingsJSON string    `json:"settingsJson"`
}

// UserSettings defines the structure for the SettingsJSON field
type UserSettings struct {
	Currency               string  `json:"currency"`
	DefaultTaxRate         float64 `json:"defaultTaxRate"`
	Language               string  `json:"language"`
	Theme                  string  `json:"theme"`
	DateFormat             string  `json:"dateFormat"`
	Timezone               string  `json:"timezone"`
	SenderName             string  `json:"senderName"`
	SenderCompany          string  `json:"senderCompany"`
	SenderAddress          string  `json:"senderAddress"`
	SenderPhone            string  `json:"senderPhone"`
	SenderEmail            string  `json:"senderEmail"`
	SenderPostalCode       string  `json:"senderPostalCode"`
	InvoiceTerms           string  `json:"invoiceTerms"`
	DefaultMessageTemplate string  `json:"defaultMessageTemplate"`
	// HST (Harmonized Sales Tax) settings for Canadian self-employed
	HstRegistered  bool   `json:"hstRegistered"`  // Whether user has registered for HST
	HstNumber      string `json:"hstNumber"`      // HST Registration Number (e.g. 12345 6789 RT0001)
	TaxEnabled     bool   `json:"taxEnabled"`     // Whether to show tax on invoices
	ExpectedIncome string `json:"expectedIncome"` // "under30k", "over30k", "unsure"
}
