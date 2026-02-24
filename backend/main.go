package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings" // ← MISSING IMPORT
	"time"
)

type Pest struct {
	ID             string   `json:"id"`
	Name           string   `json:"name"`
	LocalName      string   `json:"localName"`
	ScientificName string   `json:"scientificName"`
	Crops          []string `json:"crops"`
	Symptoms       []string `json:"symptoms"`
	QuickTreatment string   `json:"quickTreatment"`
	ImageThumb     string   `json:"imageThumb"`
	HasFullDetails bool     `json:"hasFullDetails"`
	Confidence     string   `json:"confidence"`
}

type PestDetails struct {
	ID              string   `json:"id"`
	Description     string   `json:"description"`
	Lifecycle       []string `json:"lifecycle"`
	Identification  []string `json:"identification"`
	TreatmentOptions []struct {
		Method  string   `json:"method"`
		Options []string `json:"options"`
	} `json:"treatment_options"`
	Prevention      []string `json:"prevention"`
	Images          []string `json:"images"`
	LocalAdvice     []string `json:"local_advice"`
}

type Crop struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type Region struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type SetupRequest struct {
	RegionID string   `json:"region_id"`
	Crops    []string `json:"crops"`
}

// ← FIX: Add Markets and Prices to SetupResponse
type SetupResponse struct {
	Region      Region           `json:"region"`
	Crops       map[string]Crop  `json:"crops"`
	Pests       []Pest           `json:"pests"`
	Markets     []Market         `json:"markets"`      // ← ADD THIS
	Prices      []Price          `json:"prices"`       // ← ADD THIS
	GeneratedAt string           `json:"generated_at"`
}

type Market struct {
	ID        string  `json:"id"`
	Name      string  `json:"name"`
	Region    string  `json:"region"`
	Distance  int     `json:"distance"`
	Latitude  float64 `json:"latitude,omitempty"`
	Longitude float64 `json:"longitude,omitempty"`
}

type Price struct {
	ID          string    `json:"id"`
	MarketID    string    `json:"marketId"`
	MarketName  string    `json:"marketName"`
	Product     string    `json:"product"`
	ProductName string    `json:"productName"`
	Price       float64   `json:"price"`
	Unit        string    `json:"unit"`
	Currency    string    `json:"currency"`
	Date        time.Time `json:"date"`
	Trend       string    `json:"trend"`
}

type PriceHistory struct {
	ProductMarket string       `json:"product_market"`
	History       []PricePoint `json:"history"`
}

type PricePoint struct {
	Date  string  `json:"date"`
	Price float64 `json:"price"`
}

// Global variables
var markets []Market
var prices []Price
var priceHistory map[string][]PricePoint
var pests map[string]Pest
var pestDetails map[string]PestDetails
var crops map[string]Crop
var regions []Region

func loadData() error {
	// Load pest data
	pestData, err := os.ReadFile("data/pest_data.json")
	if err != nil {
		return err
	}

	var pestFile struct {
		Pests       map[string]Pest        `json:"pests"`
		PestDetails map[string]PestDetails `json:"pest_details"`
	}

	if err := json.Unmarshal(pestData, &pestFile); err != nil {
		return err
	}

	pests = pestFile.Pests
	pestDetails = pestFile.PestDetails

	// Create sample crops
	crops = map[string]Crop{
		"maize":   {ID: "maize", Name: "Maize"},
		"beans":   {ID: "beans", Name: "Beans"},
		"cassava": {ID: "cassava", Name: "Cassava"},
		"sorghum": {ID: "sorghum", Name: "Sorghum"},
	}

	// Create sample regions
	regions = []Region{
		{ID: "eastern_kenya", Name: "Eastern Province, Kenya"},
		{ID: "central_kenya", Name: "Central Province, Kenya"},
		{ID: "northern_tanzania", Name: "Northern Tanzania"},
	}

	// Load market data
	marketData, err := os.ReadFile("data/market_data.json")
	if err != nil {
		return err
	}

	var marketFile struct {
		Markets      []Market              `json:"markets"`
		Prices       []Price               `json:"prices"`
		PriceHistory map[string][]PricePoint `json:"price_history"`
	}

	if err := json.Unmarshal(marketData, &marketFile); err != nil {
		return err
	}

	markets = marketFile.Markets
	prices = marketFile.Prices
	priceHistory = marketFile.PriceHistory

	return nil
}

func enableCORS(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	(*w).Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

func regionsHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(&w)
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(regions)
}

func cropsHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(&w)
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	var cropList []Crop
	for _, crop := range crops {
		cropList = append(cropList, crop)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(cropList)
}

func pestsHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(&w)
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	cropID := r.URL.Query().Get("crop")

	var pestList []Pest
	if cropID != "" {
		// Return only pests for this crop
		for _, pest := range pests {
			for _, c := range pest.Crops {
				if c == cropID {
					pestList = append(pestList, pest)
					break
				}
			}
		}
	} else {
		// Return all pests
		for _, pest := range pests {
			pestList = append(pestList, pest)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(pestList)
}

func pestDetailsHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(&w)
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	pestID := r.URL.Path[len("/api/pests/"):]

	details, exists := pestDetails[pestID]
	if !exists {
		http.Error(w, "Pest not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(details)
}

// GET /api/markets?region=eastern_kenya
func marketsHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(&w)
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	region := r.URL.Query().Get("region")

	var result []Market
	if region != "" {
		for _, m := range markets {
			if m.Region == region {
				result = append(result, m)
			}
		}
	} else {
		result = markets
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

// GET /api/prices?market=market_001&product=maize
func pricesHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(&w)
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	marketID := r.URL.Query().Get("market")
	product := r.URL.Query().Get("product")

	var result []Price
	for _, p := range prices {
		if marketID != "" && p.MarketID != marketID {
			continue
		}
		if product != "" && p.Product != product {
			continue
		}
		result = append(result, p)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

// GET /api/prices/latest?products=maize,beans
func latestPricesHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(&w)
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	products := r.URL.Query().Get("products")
	productList := strings.Split(products, ",")

	// Get latest price for each product across markets
	latest := make(map[string][]Price)

	for _, p := range prices {
		for _, prod := range productList {
			if p.Product == prod {
				latest[prod] = append(latest[prod], p)
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(latest)
}

// GET /api/prices/history?product=maize&market=market_001
func priceHistoryHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(&w)
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	product := r.URL.Query().Get("product")
	market := r.URL.Query().Get("market")

	key := product + "_" + market
	history, exists := priceHistory[key]

	if !exists {
		history = []PricePoint{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(history)
}

// ← FIX: Only ONE setupHandler function
func setupHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(&w)
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req SetupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Find region
	var selectedRegion Region
	for _, r := range regions {
		if r.ID == req.RegionID {
			selectedRegion = r
			break
		}
	}

	// Get pests for selected crops
	var pestList []Pest
	for _, pest := range pests {
		for _, crop := range pest.Crops {
			for _, selectedCrop := range req.Crops {
				if crop == selectedCrop {
					pestList = append(pestList, pest)
					break
				}
			}
		}
	}

	// Get selected crops
	selectedCrops := make(map[string]Crop)
	for _, cropID := range req.Crops {
		if crop, exists := crops[cropID]; exists {
			selectedCrops[cropID] = crop
		}
	}

	// Add latest prices to response
	var latestPrices []Price
	seen := make(map[string]bool)
	for _, p := range prices {
		if !seen[p.Product] {
			latestPrices = append(latestPrices, p)
			seen[p.Product] = true
		}
	}

	// ← FIX: Create response with all fields
	response := SetupResponse{
		Region:      selectedRegion,
		Crops:       selectedCrops,
		Pests:       pestList,
		Markets:     markets,
		Prices:      latestPrices,
		GeneratedAt: time.Now().Format(time.RFC3339),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func main() {
	if err := loadData(); err != nil {
		log.Fatal("Failed to load data:", err)
	}

	// Serve frontend files
	fs := http.FileServer(http.Dir("../frontend"))
	http.Handle("/", fs)

	// API endpoints
	http.HandleFunc("/api/regions", regionsHandler)
	http.HandleFunc("/api/crops", cropsHandler)
	http.HandleFunc("/api/pests", pestsHandler)
	http.HandleFunc("/api/pests/", pestDetailsHandler)
	http.HandleFunc("/api/setup", setupHandler)
	
	// ← FIX: Add market handlers
	http.HandleFunc("/api/markets", marketsHandler)
	http.HandleFunc("/api/prices", pricesHandler)
	http.HandleFunc("/api/prices/latest", latestPricesHandler)
	http.HandleFunc("/api/prices/history", priceHistoryHandler)

	log.Println("🚀 Server starting on http://localhost:8080")
	log.Println("📱 Open http://localhost:8080/pests.html to test Pest Detective")
	log.Println("💰 Open http://localhost:8080/markets.html to test Market Prices")
	log.Fatal(http.ListenAndServe(":8080", nil))
}