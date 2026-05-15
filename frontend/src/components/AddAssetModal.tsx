import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddAssetModal({ isOpen, onClose, onSuccess }: AddAssetModalProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    productId: '',
    serialNumber: '',
    status: 'Available',
    purchaseDate: '',
    warrantyExpire: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ดึงข้อมูล Product ตอนเปิด Modal
  useEffect(() => {
    if (isOpen) {
      fetch('http://localhost:8080/api/products')
        .then(res => res.json())
        .then(data => {
          // ดักจับข้อมูลให้ชัวร์ว่าได้เป็น Array แน่นอน
          const productList = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
          setProducts(productList);
        })
        .catch(err => console.error("Error fetching products:", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // เช็คให้ชัวร์ว่าเลือก Product แล้วจริงๆ
    if (!formData.productId) {
      alert("กรุณาเลือกรุ่นสินค้า (Product Model)");
      return;
    }

    setIsSubmitting(true);

    // แปลงวันที่ให้เป็นรูปแบบ RFC3339 สำหรับ Go + MySQL
    const payload = {
      productId: parseInt(formData.productId),
      serialNumber: formData.serialNumber,
      status: formData.status,
      purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate).toISOString() : null,
      warrantyExpire: formData.warrantyExpire ? new Date(formData.warrantyExpire).toISOString() : null,
    };

    try {
      const res = await fetch('http://localhost:8080/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        onSuccess(); // สั่งให้ตารางรีเฟรชข้อมูล
        onClose(); // ปิด Modal
        // ล้างค่าฟอร์มกลับเป็นค่าเริ่มต้น
        setFormData({ productId: '', serialNumber: '', status: 'Available', purchaseDate: '', warrantyExpire: '' }); 
      } else {
        const errorData = await res.json();
        alert(`เกิดข้อผิดพลาดในการบันทึก: ${errorData.error}`);
      }
    } catch (error) {
      alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ Backend ได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-900">Add New IT Asset</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Model <span className="text-red-500">*</span></label>
            <select 
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              value={formData.productId}
              onChange={e => setFormData({...formData, productId: e.target.value})}
            >
              <option value="" disabled>Select a product...</option>
              {/* เรนเดอร์ตัวเลือกสินค้าที่ดึงมาจาก API */}
              {products.map(p => (
                <option key={p.ID} value={p.ID}>{p.name} ({p.brand})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Initial Status</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value})}
            >
              <option value="Available">Available (พร้อมใช้งาน)</option>
              <option value="Borrowed">Borrowed (ถูกยืม)</option>
              <option value="Maintenance">Maintenance (ส่งซ่อม)</option>
              <option value="Broken">Broken (ชำรุด)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
              <input 
                type="date" 
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
                value={formData.purchaseDate}
                onChange={e => setFormData({...formData, purchaseDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Expire</label>
              <input 
                type="date" 
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
                value={formData.warrantyExpire}
                onChange={e => setFormData({...formData, warrantyExpire: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm disabled:opacity-50">
              {isSubmitting ? 'Saving...' : 'Save Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}