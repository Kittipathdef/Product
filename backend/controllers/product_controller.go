package controllers

import (
	"net/http"

	"it-inventory-backend/database"
	"it-inventory-backend/models"

	"github.com/gin-gonic/gin"
)

// สร้างรุ่นสินค้าใหม่ (ต้องส่ง category_id มาด้วย)
func CreateProduct(c *gin.Context) {
	var product models.Product
	if err := c.ShouldBindJSON(&product); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := database.DB.Create(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถสร้างรุ่นสินค้าได้"})
		return
	}

	// ดึงข้อมูล Category มาแสดงผลด้วยเลย จะได้เช็คว่าผูกถูกหมวดไหม
	database.DB.Preload("Category").First(&product, product.ID)

	c.JSON(http.StatusCreated, gin.H{"message": "สร้างรุ่นสินค้าสำเร็จ", "data": product})
}

// ดึงรายการรุ่นสินค้าทั้งหมด
func GetProducts(c *gin.Context) {
	var products []models.Product

	// ใช้ Preload ดึงชื่อ Category ออกมาด้วย Frontend จะได้เอาไปโชว์สบายๆ
	database.DB.Preload("Category").Find(&products)

	c.JSON(http.StatusOK, gin.H{"data": products})
}

// แก้ไขรุ่นสินค้า
func UpdateProduct(c *gin.Context) {
	id := c.Param("id")
	var product models.Product

	if err := database.DB.First(&product, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบรุ่นสินค้านี้"})
		return
	}

	if err := c.ShouldBindJSON(&product); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	database.DB.Save(&product)
	c.JSON(http.StatusOK, gin.H{"message": "อัปเดตรุ่นสินค้าสำเร็จ", "data": product})
}

// ลบรุ่นสินค้า (Product)
func DeleteProduct(c *gin.Context) {
	id := c.Param("id")

	// สั่งลบข้อมูลจาก Database
	if err := database.DB.Delete(&models.Product{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถลบรุ่นสินค้าได้"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ลบรุ่นสินค้าสำเร็จ"})
}
