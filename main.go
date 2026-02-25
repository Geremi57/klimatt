package main

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()

	router.GET("/api/ping", func(c *gin.Context) {
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

	router.Run()
}