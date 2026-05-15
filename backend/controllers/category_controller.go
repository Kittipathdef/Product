package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	// เปลี่ยน it-inventory-backend ให้ตรงกับชื่อ module ของคุณ
	"it-inventory-backend/database"
	"it-inventory-backend/models"
)

// สร้างหมวดหมู่ใหม่ (Create Category)
func CreateCategory(c *gin.Context) {
	var category models.Category

	// รับข้อมูล JSON จาก Frontend มาผูกกับ Struct
	if err := c.ShouldBindJSON(&category); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// บันทึกลงฐานข้อมูล
	if err := database.DB.Create(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create category"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Category created successfully",
		"data":    category,
	})
}

// ดึงข้อมูลหมวดหมู่ทั้งหมด (Get All Categories)
func GetCategories(c *gin.Context) {
	var categories []models.Category

	// ค้นหาข้อมูลทั้งหมดจากตาราง categories
	database.DB.Find(&categories)

	c.JSON(http.StatusOK, gin.H{
		"data": categories,
	})
}

// แก้ไขหมวดหมู่ (Update Category)
func UpdateCategory(c *gin.Context) {
	id := c.Param("id")
	var category models.Category

	// 1. หาหมวดหมู่ที่ต้องการแก้
	if err := database.DB.First(&category, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
		return
	}

	// 2. รับชื่อใหม่มาทับ
	if err := c.ShouldBindJSON(&category); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 3. เซฟลงฐานข้อมูล
	database.DB.Save(&category)
	c.JSON(http.StatusOK, gin.H{
		"message": "Category updated successfully",
		"data":    category,
	})
}

// ลบหมวดหมู่ (Delete Category)
func DeleteCategory(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Delete(&models.Category{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถลบหมวดหมู่ได้"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "ลบหมวดหมู่สำเร็จ"})
}
