package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"it-inventory-backend/database"
	"it-inventory-backend/models"
)

// บันทึกประวัติการใช้งาน (Create Transaction)
func CreateTransaction(c *gin.Context) {
	var transaction models.Transaction

	if err := c.ShouldBindJSON(&transaction); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := database.DB.Create(&transaction).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record transaction"})
		return
	}

	// ดึงข้อมูล Asset และ Product ที่เกี่ยวข้องมาด้วย
	database.DB.Preload("Asset").Preload("Asset.Product").First(&transaction, transaction.ID)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Transaction recorded successfully",
		"data":    transaction,
	})
}

// ดึงประวัติทั้งหมด (Get All Transactions)
func GetTransactions(c *gin.Context) {
	var transactions []models.Transaction

	database.DB.Preload("Asset").Preload("Asset.Product").Find(&transactions)

	c.JSON(http.StatusOK, gin.H{
		"data": transactions,
	})
}
