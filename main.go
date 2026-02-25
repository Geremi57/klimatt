package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
)

func main() {
	// Alternative 1: FAOSTAT Food Security Indicators
	// url1 := "https://fenixservices.fao.org/faostat/api/v1/en/data/FS"
	
	// // Alternative 2: World Bank API for prices (often more reliable)
	url2 := "https://api.worldbank.org/v2/country/KE/indicator/FP.CPI.TOTL?format=json"
	
	// Alternative 3: FAO FPMA Tool (different endpoint)
	// url3 := "http://www.fao.org/giews/food-prices/home/api/en/"
	
	resp, err := http.Get(url2)
	if err != nil {
		log.Fatal("API Error:", err)
	}
	defer resp.Body.Close()
	
	body, _ := io.ReadAll(resp.Body)
	fmt.Println(string(body))
}