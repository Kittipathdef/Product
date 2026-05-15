package database

import (
	"fmt"
	"log"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	// นำเข้า bcrypt เพื่อใช้จัดการรหัสผ่าน
	"golang.org/x/crypto/bcrypt"

	"it-inventory-backend/models"
)

var DB *gorm.DB

func ConnectDB() {
	dsn := "root:Poom12300za@@tcp(127.0.0.1:3306)/it_inventory?charset=utf8mb4&parseTime=True&loc=Local"

	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}

	fmt.Println("Database connection successful!")

	// 1. สั่ง AutoMigrate เพื่อสร้าง/อัปเดตตาราง
	err = DB.AutoMigrate(
		&models.User{},
		&models.Category{},
		&models.Product{},
		&models.Asset{},
		&models.Transaction{},
	)

	if err != nil {
		log.Fatal("Failed to migrate database: ", err)
	}

	fmt.Println("Database migrated successfully!")

	// 2. เรียกใช้ Seeder เพื่อสร้างบัญชี Admin เริ่มต้น (ป้องกันปัญหา Hash ผิดพลาด)
	SeedAdminUser()

	fmt.Println("Ready for IT Inventory management.")
}

// SeedAdminUser จะสร้าง User admin:1234 ให้อัตโนมัติถ้ายังไม่มีในระบบ
func SeedAdminUser() {
	var count int64
	// เช็คว่ามี User อยู่ในระบบบ้างไหม
	DB.Model(&models.User{}).Count(&count)

	if count == 0 {
		fmt.Println("🌱 No users found, creating default admin...")

		// ให้ Go เป็นคน Hash รหัสผ่านให้เอง 100% เพื่อความแม่นยำ
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte("1234"), 10)
		if err != nil {
			log.Println("Failed to hash password for seeder:", err)
			return
		}

		admin := models.User{
			Username: "admin",
			Password: string(hashedPassword),
			Role:     "admin",
			Name:     "System Administrator",
		}

		if err := DB.Create(&admin).Error; err != nil {
			log.Println("Failed to create seed admin user:", err)
		} else {
			fmt.Println("✅ Default admin created: (user: admin, pass: 1234)")
		}
	}
}
