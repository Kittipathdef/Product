package models

import (
	"time"

	"gorm.io/gorm"
)

// Category เก็บหมวดหมู่ของอุปกรณ์ IT (เช่น Network, Laptop, Peripherals)
type Category struct {
	gorm.Model
	Name        string    `gorm:"type:varchar(100);not null" json:"name"`
	Description string    `gorm:"type:text" json:"description"`
	Products    []Product `json:"products"` // ความสัมพันธ์: 1 Category มีหลาย Products (Has Many)
}

// Product เก็บข้อมูลรุ่นของอุปกรณ์ IT
type Product struct {
	gorm.Model
	Name        string   `gorm:"type:varchar(150);not null" json:"name"`
	ModelNumber string   `gorm:"type:varchar(100)" json:"modelNumber"`
	Brand       string   `gorm:"type:varchar(100)" json:"brand"`
	CategoryID  uint     `json:"categoryId"`
	Category    Category `json:"category"` // ความสัมพันธ์: Product สังกัด 1 Category (Belongs To)
	Assets      []Asset  `json:"assets"`   // ความสัมพันธ์: 1 Product มีอุปกรณ์หลายชิ้น (Has Many)
}

// Asset เก็บข้อมูลอุปกรณ์ IT รายชิ้น (IT Equipment)
type Asset struct {
	gorm.Model
	ProductID      uint          `json:"productId"`
	Product        Product       `json:"product"`
	SerialNumber   string        `gorm:"type:varchar(100);uniqueIndex;not null" json:"serialNumber"`
	Status         string        `gorm:"type:varchar(50);default:'Available'" json:"status"`
	PurchaseDate   *time.Time    `json:"purchaseDate"`   // <--- เติม * ตรงนี้
	WarrantyExpire *time.Time    `json:"warrantyExpire"` // <--- เติม * ตรงนี้
	Transactions   []Transaction `json:"transactions"`
}

// Transaction เก็บประวัติการใช้งานอุปกรณ์ (การเบิก/คืน/ซ่อมบำรุง)
type Transaction struct {
	gorm.Model
	AssetID    uint      `json:"assetId"`
	Asset      Asset     `json:"asset"` // ความสัมพันธ์: Transaction เป็นของ 1 Asset (Belongs To)
	StaffName  string    `gorm:"type:varchar(150);not null" json:"staffName"`
	Action     string    `gorm:"type:varchar(100);not null" json:"action"` // เช่น "Check-out", "Check-in", "Repair"
	ActionDate time.Time `json:"actionDate"`
}
