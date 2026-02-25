package main

import (
	"encoding/csv"
	"net/http"

	// "encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

// ==================== TYPES ====================

type PriceType int

const (
	WholeSale PriceType = iota
	Retail
)

func (p PriceType) String() string {
	return [...]string{"Wholesale", "Retail"}[p]
}

type Currency int

const (
	KES Currency = iota
	USD
)

func (c Currency) String() string {
	return [...]string{"KES", "USD"}[c]
}

type PriceFlag int

const (
	Actual PriceFlag = iota
	Aggregate
	Composite // both actual and aggregate
)

func (f PriceFlag) String() string {
	return [...]string{"Actual", "Aggregate", "Composite"}[f]
}

// FoodCategory represents a category like "cereals and tubers"
type FoodCategory struct {
	Name  string      `json:"name"`
	Foods []Commodity `json:"foods"`
}

// Commodity represents a specific food item
type Commodity struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Price       float64   `json:"price"`
	Currency    Currency  `json:"currency"`
	PriceFlag   PriceFlag `json:"price_flag"`
	PriceType   PriceType `json:"price_type"`
	Unit        string    `json:"unit"`
	Date        string    `json:"date"`
	CommodityID int       `json:"commodity_id"` // The original commodity ID from CSV
}

// Location coordinates
type Location struct {
	Lat  float64 `json:"lat"`
	Long float64 `json:"long"`
}

// MarketData represents a market location
type MarketData struct {
	Name           string         `json:"name"`
	Location       Location       `json:"location"`
	FoodCategories []FoodCategory `json:"food_categories"`
	Admin1         string         `json:"admin1"` // Region (e.g., "North Eastern")
	Admin2         string         `json:"admin2"` // County (e.g., "Garissa")
}

// FoodData is the top-level structure
type FoodData struct {
	Markets []MarketData `json:"markets"`
	// Also keep a flat list for quick lookups
	Commodities []Commodity `json:"-"` // Not exported to JSON
}

// CSVRecord represents a single row from the CSV
type CSVRecord struct {
	Date        string
	Admin1      string // Region
	Admin2      string // County
	Market      string
	MarketID    int
	Lat         float64
	Long        float64
	Category    string
	Commodity   string
	CommodityID int
	Unit        string
	PriceFlag   string
	PriceType   string
	Currency    string
	Price       float64
	USDPrice    float64
}

var data_file string = "./wfp_food_prices_ken(1).csv"

// ==================== CSV PARSING ====================

// ReadData parses the CSV file and populates the FoodData struct
func ReadData(file string) (FoodData, error) {
	// Open the CSV file
	f, err := os.Open(file)
	if err != nil {
		return FoodData{}, fmt.Errorf("failed to open file: %w", err)
	}
	defer f.Close()

	// Create a new CSV reader
	reader := csv.NewReader(f)
	
	// Read the header row
	header, err := reader.Read()
	if err != nil {
		return FoodData{}, fmt.Errorf("failed to read header: %w", err)
	}
	
	fmt.Printf("📊 CSV Headers: %v\n\n", header)

	// Map to store unique markets
	marketMap := make(map[string]*MarketData)
	// Store all commodities for quick lookup
	var allCommodities []Commodity

	// Read all records
	lineNum := 1
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Printf("Warning: error reading line %d: %v", lineNum, err)
			continue
		}
		lineNum++

		// Parse the record
		csvRecord, err := parseCSVRecord(record)
		if err != nil {
			log.Printf("Warning: error parsing line %d: %v", lineNum, err)
			continue
		}

		// Create market key
		marketKey := fmt.Sprintf("%s|%s|%s", csvRecord.Admin1, csvRecord.Admin2, csvRecord.Market)

		// Get or create market
		market, exists := marketMap[marketKey]
		if !exists {
			market = &MarketData{
				Name:     csvRecord.Market,
				Admin1:   csvRecord.Admin1,
				Admin2:   csvRecord.Admin2,
				Location: Location{Lat: csvRecord.Lat, Long: csvRecord.Long},
				FoodCategories: []FoodCategory{},
			}
			marketMap[marketKey] = market
		}

		// Create commodity
		commodity := Commodity{
			ID:          len(allCommodities) + 1,
			Name:        csvRecord.Commodity,
			Price:       csvRecord.Price,
			Currency:    parseCurrency(csvRecord.Currency),
			PriceFlag:   parsePriceFlag(csvRecord.PriceFlag),
			PriceType:   parsePriceType(csvRecord.PriceType),
			Unit:        csvRecord.Unit,
			Date:        csvRecord.Date,
			CommodityID: csvRecord.CommodityID,
		}
		allCommodities = append(allCommodities, commodity)

		// Add commodity to market's category
		addCommodityToMarket(market, csvRecord.Category, commodity)
	}

	// Convert map to slice
	foodData := FoodData{
		Markets:     make([]MarketData, 0, len(marketMap)),
		Commodities: allCommodities,
	}

	for _, market := range marketMap {
		foodData.Markets = append(foodData.Markets, *market)
	}

	fmt.Printf("✅ Parsed %d markets and %d commodities\n", len(foodData.Markets), len(allCommodities))
	return foodData, nil
}

// parseCSVRecord converts a CSV row to a CSVRecord struct
func parseCSVRecord(record []string) (CSVRecord, error) {
	if len(record) < 16 {
		return CSVRecord{}, fmt.Errorf("record has %d fields, expected at least 16", len(record))
	}

	var csvRecord CSVRecord
	var err error

	// Basic fields
	csvRecord.Date = record[0]
	csvRecord.Admin1 = record[1]
	csvRecord.Admin2 = record[2]
	csvRecord.Market = record[3]
	
	// Parse numeric fields
	csvRecord.MarketID, err = strconv.Atoi(record[4])
	if err != nil {
		return CSVRecord{}, fmt.Errorf("invalid MarketID: %s", record[4])
	}

	csvRecord.Lat, err = strconv.ParseFloat(record[5], 64)
	if err != nil {
		return CSVRecord{}, fmt.Errorf("invalid Latitude: %s", record[5])
	}

	csvRecord.Long, err = strconv.ParseFloat(record[6], 64)
	if err != nil {
		return CSVRecord{}, fmt.Errorf("invalid Longitude: %s", record[6])
	}

	csvRecord.Category = record[7]
	csvRecord.Commodity = record[8]
	
	csvRecord.CommodityID, err = strconv.Atoi(record[9])
	if err != nil {
		return CSVRecord{}, fmt.Errorf("invalid CommodityID: %s", record[9])
	}

	csvRecord.Unit = record[10]
	csvRecord.PriceFlag = record[11]
	csvRecord.PriceType = record[12]
	csvRecord.Currency = record[13]

	csvRecord.Price, err = strconv.ParseFloat(record[14], 64)
	if err != nil {
		return CSVRecord{}, fmt.Errorf("invalid Price: %s", record[14])
	}

	csvRecord.USDPrice, err = strconv.ParseFloat(record[15], 64)
	if err != nil {
		return CSVRecord{}, fmt.Errorf("invalid USDPrice: %s", record[15])
	}

	return csvRecord, nil
}

// addCommodityToMarket adds a commodity to the appropriate category in a market
func addCommodityToMarket(market *MarketData, categoryName string, commodity Commodity) {
	// Find or create category
	for i, cat := range market.FoodCategories {
		if cat.Name == categoryName {
			market.FoodCategories[i].Foods = append(market.FoodCategories[i].Foods, commodity)
			return
		}
	}

	// Category doesn't exist, create it
	newCategory := FoodCategory{
		Name:  categoryName,
		Foods: []Commodity{commodity},
	}
	market.FoodCategories = append(market.FoodCategories, newCategory)
}

// ==================== PARSING HELPERS ====================

func parseCurrency(s string) Currency {
	switch strings.ToUpper(s) {
	case "USD":
		return USD
	default:
		return KES
	}
}

func parsePriceFlag(s string) PriceFlag {
	switch strings.ToLower(s) {
	case "actual":
		return Actual
	case "aggregate":
		return Aggregate
	case "composite":
		return Composite
	default:
		return Aggregate
	}
}

func parsePriceType(s string) PriceType {
	switch strings.ToLower(s) {
	case "wholesale":
		return WholeSale
	default:
		return Retail
	}
}

// ==================== API ENDPOINTS ====================

func main() {
  router := gin.Default()
  router.GET("/ping", func(c *gin.Context) {
    c.JSON(200, gin.H{
      "message": "pong",
    })
  })

   // Serving the UI
	router.Static("/assets", "./ui/dist/assets")
	router.StaticFile("/manifest.webmanifest", "./ui/dist/manifest.webmanifest")
	router.StaticFile("/favicon.ico", "./ui/dist/favicon.ico")
	router.NoRoute(func(c *gin.Context) {
		if strings.HasPrefix(c.Request.URL.Path, "/api") {
			c.JSON(http.StatusNotFound, gin.H{"error": "Not found"})
			return
		}

		c.File("./ui/dist/index.html")
	})

  router.Run() // listens on 0.0.0.0:8080 by default
}