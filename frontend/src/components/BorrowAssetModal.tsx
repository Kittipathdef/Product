import { useState, useEffect } from 'react';
import { X, UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function BorrowAssetModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
  const [categories, setCategories] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    categoryId: '',
    productId: '',
    borrowerName: ''
  });

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        fetch('http://localhost:8080/api/categories').then(r => r.json()),
        fetch('http://localhost:8080/api/assets').then(r => r.json())
      ]).then(([catRes, assetRes]) => {
        setCategories(catRes.data || []);
        setAssets(assetRes.data || []);
      });
    }
  }, [isOpen]);

  const availableAssetsInCategory = assets.filter(a => {
    const catId = a.product?.category?.ID || a.product?.CategoryID || a.Product?.CategoryID;
    return String(catId) === formData.categoryId && a.status === 'Available';
  });

  const uniqueProductsMap = new Map();
  availableAssetsInCategory.forEach(a => {
    const prod = a.product || a.Product;
    const prodId = prod?.ID || a.productId || a.ProductID;
    
    if (prodId && !uniqueProductsMap.has(prodId)) {
      uniqueProductsMap.set(prodId, {
        ID: prodId,
        brand: prod?.brand || '',
        name: prod?.name || 'Unknown'
      });
    }
  });
  const availableProducts = Array.from(uniqueProductsMap.values());

  const availableAssets = assets.filter(a => {
    const prodId = a.product?.ID || a.Product?.ID || a.productId || a.ProductID;
    return String(prodId) === formData.productId && a.status === 'Available';
  });

  const autoSelectedAssetId = availableAssets.length > 0 ? availableAssets[0].ID : null;

  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!autoSelectedAssetId) {
        alert("ไม่มีเครื่องว่างให้ยืมสำหรับรุ่นนี้ครับ!");
        return;
    }

    setIsSubmitting(true);
    
    try {
      // 1. เปลี่ยนสถานะเครื่องเป็น Borrowed (อัปเดตสต็อก)
      const resStatus = await fetch(`http://localhost:8080/api/assets/${autoSelectedAssetId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Borrowed' })
      });

      if (resStatus.ok) {
        // 👇 2. สั่งจดบันทึกลงหน้าประวัติ (Activity Log) ที่แก้ไขให้ตรงกับ Database แล้ว 👇
        try {
          await fetch('http://localhost:8080/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              assetId: autoSelectedAssetId,
              action: 'Check-out',
              staffName: formData.borrowerName,
              actionDate: new Date().toISOString() // ส่งเวลาปัจจุบันไปด้วย
            })
          });
        } catch (err) {
          console.error("จดบันทึกประวัติไม่สำเร็จ:", err);
        }
        // 👆 จบส่วนที่เพิ่ม 👆

        alert(`บันทึกการยืมให้คุณ ${formData.borrowerName} สำเร็จ!\nระบบได้ตัดสต็อกเครื่อง S/N: ${availableAssets[0].serialNumber} ให้เรียบร้อยครับ`);
        onSuccess();
        onClose();
        setFormData({ categoryId: '', productId: '', borrowerName: '' });
      } else {
        alert("อัปเดตสถานะเครื่องไม่สำเร็จ");
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาด ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-blue-50/30">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600" /> Borrow Asset
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X /></button>
        </div>

        <form onSubmit={handleBorrow} className="p-6 space-y-5">
          
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">1. Category</label>
            <select 
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20"
              value={formData.categoryId}
              onChange={e => setFormData({ ...formData, categoryId: e.target.value, productId: '' })}
            >
              <option value="">Select Category...</option>
              {categories.map(c => <option key={c.ID} value={c.ID}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">2. Product Model</label>
            <select 
              required
              disabled={!formData.categoryId}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm disabled:bg-gray-50 focus:ring-2 focus:ring-blue-500/20"
              value={formData.productId}
              onChange={e => setFormData({ ...formData, productId: e.target.value })}
            >
              <option value="">
                {formData.categoryId 
                  ? (availableProducts.length > 0 ? 'Select Product...' : '❌ ไม่มีสินค้ารุ่นใดว่างในหมวดหมู่นี้') 
                  : 'Select Category first'}
              </option>
              {availableProducts.map(p => <option key={p.ID} value={p.ID}>{p.brand} {p.name}</option>)}
            </select>

            {formData.productId && (
              <div className="mt-2 text-xs">
                {availableAssets.length > 0 ? (
                  <span className="text-emerald-600 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> มีเครื่องพร้อมยืม {availableAssets.length} เครื่อง
                  </span>
                ) : (
                  <span className="text-rose-500 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> ไม่มีเครื่องว่างในสต็อก
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-gray-100">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">3. Borrower Name</label>
            <input 
              type="text" required placeholder="ชื่อผู้รับเครื่อง..."
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20"
              value={formData.borrowerName}
              onChange={e => setFormData({ ...formData, borrowerName: e.target.value })}
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || !autoSelectedAssetId}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-300 transition-all shadow-lg shadow-blue-100"
          >
            {isSubmitting ? 'Processing...' : 'Confirm Borrow'}
          </button>
        </form>
      </div>
    </div>
  );
}