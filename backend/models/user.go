package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	// 📌 เติม size:255; เข้าไปตรงนี้ครับ
	Username string `gorm:"uniqueIndex;size:255;not null" json:"username"`
	Password string `gorm:"not null" json:"-"` // ใส่ json:"-" เพื่อไม่ให้ส่งรหัสผ่านกลับไปใน API (ดีมากครับ เป็น Best Practice 👍)
	Role     string `gorm:"size:50;default:'admin'" json:"role"`
	Name     string `gorm:"size:255" json:"name"`
}
