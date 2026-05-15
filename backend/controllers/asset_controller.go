package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"it-inventory-backend/database"
	"it-inventory-backend/models"
)

// เพิ่มอุปกรณ์ IT ชิ้นใหม่เข้าคลัง (Create Asset)
func CreateAsset(c *gin.Context) {
	var asset models.Asset

	if err := c.ShouldBindJSON(&asset); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 👇 1. ดักจับที่นี่! ตรวจสอบว่าต้องมี Serial Number และ ProductID
	if asset.SerialNumber == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณากรอก Serial Number (S/N)"})
		return
	}
	if asset.ProductID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาเลือกรุ่นสินค้า (Product Model)"})
		return
	}

	// 2. บันทึกลงฐานข้อมูล
	if err := database.DB.Create(&asset).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create asset: อาจมี Serial Number นี้อยู่ในระบบแล้ว"})
		return
	}

	// ดึงข้อมูล Product และ Category ที่เกี่ยวข้องมาแสดงผลด้วย
	database.DB.Preload("Product").Preload("Product.Category").First(&asset, asset.ID)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Asset created successfully",
		"data":    asset,
	})
}

// ดึงข้อมูลอุปกรณ์ IT ทั้งหมดในคลัง (Get All Assets)
func GetAssets(c *gin.Context) {
	var assets []models.Asset

	// ใช้ Preload ดึงข้อมูลของ Product และ Category ออกมาพร้อมกันเลย (จะได้เอาไปโชว์ในตารางบน React ได้ง่ายๆ)
	database.DB.Preload("Product").Preload("Product.Category").Find(&assets)

	c.JSON(http.StatusOK, gin.H{
		"data": assets,
	})
}

// อัปเดตสถานะอุปกรณ์ (Update Status)
func UpdateAssetStatus(c *gin.Context) {
	var asset models.Asset
	id := c.Param("id") // รับ ID จาก URL

	// 1. หาอุปกรณ์ในฐานข้อมูล
	if err := database.DB.First(&asset, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Asset not found"})
		return
	}

	// 2. รับค่า Status ใหม่ที่หน้าเว็บส่งมาให้
	var updateData struct {
		Status string `json:"status"`
	}
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 3. อัปเดตและเซฟลงฐานข้อมูล
	asset.Status = updateData.Status
	database.DB.Save(&asset)

	c.JSON(http.StatusOK, gin.H{
		"message": "Status updated successfully",
		"data":    asset,
	})
}

// ลบอุปกรณ์ (Delete Asset)
func DeleteAsset(c *gin.Context) {
	id := c.Param("id")
	var asset models.Asset

	// 1. ตรวจสอบก่อนว่ามีอุปกรณ์นี้อยู่ในระบบไหม
	if err := database.DB.First(&asset, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Asset not found"})
		return
	}

	// 2. สั่งลบข้อมูลออกจากฐานข้อมูล
	if err := database.DB.Delete(&asset).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete asset"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Asset deleted successfully",
	})
}

// แก้ไขข้อมูลอุปกรณ์ (Edit Asset)
func EditAsset(c *gin.Context) {
	id := c.Param("id")
	var asset models.Asset

	// 1. ตรวจสอบว่ามีอุปกรณ์นี้อยู่ไหม
	if err := database.DB.First(&asset, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Asset not found"})
		return
	}

	// 2. รับข้อมูลใหม่จากหน้าเว็บ (ตัวอย่างนี้เราจะให้แก้ Serial Number ก่อน)
	var updateData struct {
		SerialNumber string `json:"serialNumber"`
	}
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 3. อัปเดตและเซฟลงฐานข้อมูล
	asset.SerialNumber = updateData.SerialNumber
	database.DB.Save(&asset)

	c.JSON(http.StatusOK, gin.H{
		"message": "Asset updated successfully",
	})
}
