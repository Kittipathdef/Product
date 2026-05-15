import { useState, useEffect } from 'react';
import { Laptop, Plus, X } from 'lucide-react'; // เอา Trash2 ออกไปแล้วครับ

export default function ManageModelsModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess?: () => void }) {
  const [categories, setCategories] = useState([]);
  
  // State สำหรับฟอร์ม
  const [prodForm, setProdForm] = useState({ name: '', brand: '', categoryId: '', serialNumber: '' });

  const fetchData = async () => {
    const resCat = await fetch('http://localhost:8080/api/categories');
    const dataCat = await resCat.json();
    setCategories(dataCat.data || []);
  };

  useEffect(() => { if(isOpen) fetchData(); }, [isOpen]);

  const addProductAndAsset = async () => {
    if (!prodForm.name || !prodForm.categoryId) return alert("กรุณากรอกชื่อรุ่นและหมวดหมู่ให้ครบถ้วน");

    try {
      // 1. สร้างรุ่นสินค้า (Product Model)
      const resProd = await fetch('http://localhost:8080/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: prodForm.name,
          brand: prodForm.brand,
          categoryId: parseInt(prodForm.categoryId)
        })
      });

      if (!resProd.ok) throw new Error("ไม่สามารถสร้างรุ่นสินค้าได้");
      
      const prodData = await resProd.json();
      const newProductId = prodData.data.ID;

      // 2. สร้างอุปกรณ์เข้าคลัง (ถ้ามีการระบุ S/N)
      if (prodForm.serialNumber.trim() !== '') {
        const resAsset = await fetch('http://localhost:8080/api/assets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: newProductId,
            serialNumber: prodForm.serialNumber,
            status: 'Available'
          })
        });

        if (!resAsset.ok) {
          const errData = await resAsset.json();
          throw new Error(errData.error || "สร้างอุปกรณ์เข้าคลังไม่สำเร็จ");
        }

        setProdForm({ name: '', brand: '', categoryId: '', serialNumber: '' });
        if (onSuccess) onSuccess(); 
        onClose(); 
        return; 
      }

      // ถ้าไม่ได้กรอก S/N ให้เคลียร์ฟอร์ม ปิดหน้าต่าง และรีเฟรชตารางหลังบ้าน
      setProdForm({ name: '', brand: '', categoryId: '', serialNumber: '' });
      if (onSuccess) onSuccess();
      onClose();

    } catch (error: any) {
      alert(error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-2 text-blue-600">
            <Laptop className="w-5 h-5" />
            <h3 className="text-lg font-bold text-gray-900">Add Model & Asset</h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Model Information</label>
              <input 
                type="text" placeholder="ชื่อรุ่น (e.g. MacBook Pro M3) *" 
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 mb-2"
                value={prodForm.name} onChange={e => setProdForm({...prodForm, name: e.target.value})}
              />
              <div className="flex gap-2">
                <input 
                  type="text" placeholder="ยี่ห้อ" 
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20"
                  value={prodForm.brand} onChange={e => setProdForm({...prodForm, brand: e.target.value})}
                />
                <select 
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20"
                  value={prodForm.categoryId} onChange={e => setProdForm({...prodForm, categoryId: e.target.value})}
                >
                  <option value="">เลือกหมวดหมู่ *</option>
                  {categories.map((c: any) => (
                    <option key={c.ID} value={c.ID}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="pt-2 border-t border-gray-100">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Asset Entry (Optional)</label>
              <input 
                type="text" placeholder="Serial Number (S/N) - ระบุเพื่อนำเข้าคลังทันที" 
                className="w-full px-3 py-2 border border-blue-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 bg-blue-50/30"
                value={prodForm.serialNumber} onChange={e => setProdForm({...prodForm, serialNumber: e.target.value})}
              />
            </div>
            
            <button onClick={addProductAndAsset} className="w-full mt-2 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 flex items-center justify-center gap-2 shadow-sm transition-colors">
              <Plus className="w-4 h-4" /> Save to System
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}