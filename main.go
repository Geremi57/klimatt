package main

import (
	"encoding/csv"
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
	// Parse CSV data
	fmt.Println("📂 Loading food price data...")
	foodData, err := ReadData(data_file)
	if err != nil {
		log.Fatal("Failed to load data:", err)
	}

	// Create Gin router
	router := gin.Default()

	// Enable CORS
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// API Routes
	router.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	// Get all markets
	router.GET("/api/markets", func(c *gin.Context) {
		c.JSON(200, foodData.Markets)
	})

	// Get markets by region
	router.GET("/api/markets/region/:region", func(c *gin.Context) {
		region := c.Param("region")
		var markets []MarketData
		for _, m := range foodData.Markets {
			if strings.EqualFold(m.Admin1, region) {
				markets = append(markets, m)
			}
		}
		c.JSON(200, markets)
	})

	// Get markets by county
	router.GET("/api/markets/county/:county", func(c *gin.Context) {
		county := c.Param("county")
		var markets []MarketData
		for _, m := range foodData.Markets {
			if strings.EqualFold(m.Admin2, county) {
				markets = append(markets, m)
			}
		}
		c.JSON(200, markets)
	})

	// Get specific market by name
	router.GET("/api/market/:name", func(c *gin.Context) {
		name := c.Param("name")
		for _, m := range foodData.Markets {
			if strings.EqualFold(m.Name, name) {
				c.JSON(200, m)
				return
			}
		}
		c.JSON(404, gin.H{"error": "Market not found"})
	})

	// Get all commodities
	router.GET("/api/commodities", func(c *gin.Context) {
		c.JSON(200, foodData.Commodities)
	})

	// Get commodities by name
	router.GET("/api/commodities/:name", func(c *gin.Context) {
		name := c.Param("name")
		var commodities []Commodity
		for _, comm := range foodData.Commodities {
			if strings.Contains(strings.ToLower(comm.Name), strings.ToLower(name)) {
				commodities = append(commodities, comm)
			}
		}
		c.JSON(200, commodities)
	})

	// Get prices for a specific commodity in a market
	router.GET("/api/prices/:market/:commodity", func(c *gin.Context) {
		marketName := c.Param("market")
		commodityName := c.Param("commodity")
		
		var prices []Commodity
		for _, market := range foodData.Markets {
			if strings.EqualFold(market.Name, marketName) {
				for _, cat := range market.FoodCategories {
					for _, food := range cat.Foods {
						if strings.Contains(strings.ToLower(food.Name), strings.ToLower(commodityName)) {
							prices = append(prices, food)
						}
					}
				}
				break
			}
		}
		
		c.JSON(200, prices)
	})

	// Debug endpoint to see parsed data structure
	router.GET("/debug", func(c *gin.Context) {
		summary := gin.H{
			"total_markets":    len(foodData.Markets),
			"total_commodities": len(foodData.Commodities),
			"regions":           getUniqueRegions(foodData.Markets),
			"counties":          getUniqueCounties(foodData.Markets),
		}
		c.JSON(200, summary)
	})

	router.Run(":8080") // listens on 0.0.0.0:8080 by default
}

// Helper functions for debug endpoint
func getUniqueRegions(markets []MarketData) []string {
	regionMap := make(map[string]bool)
	for _, m := range markets {
		regionMap[m.Admin1] = true
	}
	regions := make([]string, 0, len(regionMap))
	for r := range regionMap {
		regions = append(regions, r)
	}
	return regions
}

func getUniqueCounties(markets []MarketData) []string {
	countyMap := make(map[string]bool)
	for _, m := range markets {
		countyMap[m.Admin2] = true
	}
	counties := make([]string, 0, len(countyMap))
	for c := range countyMap {
		counties = append(counties, c)
	}
	return counties
}