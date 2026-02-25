package main

import (
	"github.com/gin-gonic/gin"
)

type PriceType int

const (
	WholeSale PriceType = iota
	Retail
)

type Currency int

const (
	KEs PriceType = iota
	USD
)

type PriceFlag int

const (
	actual PriceFlag = iota
	aggregate
	composite //both actual and aggregate
)

type FoodCategory struct {
	Name  string `json:"name"`
	Foods []Commodity `json:"foods"`
}

type Commodity struct {
	Id        int `json:"id"`
	Name      string `json:"name"`
	Currency  Currency `json:"currency"`
	PriceFlag PriceFlag `json:"price_flag"`
	PriceType PriceType `json:"price_type"`
	Date      string `json:"date"`
}

type Location struct {
	Lat  int `json:"lat"`
	Long int `json:"long"`
}

type MarketData struct {
	Name           string `json:"name"`
	Location       Location `json:"location"`
	FoodCategories []FoodCategory `json:"food_categories"`
}

type FoodData struct {
	Markets        []MarketData `json:"markets"`
}

var data_file string = "./wfp_food_prices_ken.csv"

func ReadData(file string) FoodData {
	// open file
	// parse file -> and populate structs before sending to frontend
	return FoodData{}
}



func main() {
	router := gin.Default()
	router.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})
	router.Run() // listens on 0.0.0.0:8080 by default
}
