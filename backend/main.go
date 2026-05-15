package main

import (
	"it-inventory-backend/controllers"
	"it-inventory-backend/database"
	"it-inventory-backend/models" // <--- 1. เพิ่ม Import models เข้ามาเพื่อใช้ AutoMigrate

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// 1. เชื่อมต่อฐานข้อมูล
	database.ConnectDB()

	// ---> 2. สั่งให้สร้างตาราง users อัตโนมัติในฐานข้อมูล <---
	database.DB.AutoMigrate(&models.User{})

	r := gin.Default()

	// 3. ตั้งค่า CORS (สำคัญมาก!) เพื่อให้ React (พอร์ต 3000) คุยกับ Go (พอร์ต 8080) ได้
	r.Use(cors.Default())

	// ---> 4. เพิ่ม API Group สำหรับ Auth (เข้าสู่ระบบ / สร้างบัญชี) <---
	auth := r.Group("/auth")
	{
		auth.POST("/register", controllers.RegisterAdmin)
		auth.POST("/login", controllers.Login)
	}

	// 5. สร้าง API Group สำหรับจัดการอุปกรณ์ (API เดิมของคุณ)
	api := r.Group("/api")
	{
		api.POST("/categories", controllers.CreateCategory)
		api.GET("/categories", controllers.GetCategories)

		api.POST("/products", controllers.CreateProduct)
		api.GET("/products", controllers.GetProducts)

		// API ของ Asset
		api.POST("/assets", controllers.CreateAsset)
		api.GET("/assets", controllers.GetAssets)

		api.POST("/transactions", controllers.CreateTransaction)
		api.GET("/transactions", controllers.GetTransactions)

		// API อัปเดตสถานะ
		api.PATCH("/assets/:id/status", controllers.UpdateAssetStatus)

		// API สำหรับลบอุปกรณ์
		api.DELETE("/assets/:id", controllers.DeleteAsset)

		// API สำหรับแก้ไขข้อมูล
		api.PUT("/assets/:id", controllers.EditAsset)

		api.DELETE("/categories/:id", controllers.DeleteCategory)

		api.DELETE("/products/:id", controllers.DeleteProduct)
	}

	r.Run(":8080")
}
