import { useState, useEffect } from 'react';
import { Tag, Laptop, Plus, Trash2 } from 'lucide-react';

export default function MasterDataManagement() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [newCat, setNewCat] = useState('');
  
  // State สำหรับฟอร์มเพิ่ม Product
  const [prodForm, setProdForm] = useState({ name: '', brand: '', categoryId: '' });

  const fetchData = async () => {
    const resCat = await fetch('http://localhost:8080/api/categories');
    const dataCat = await resCat.json();
    setCategories(dataCat.data || []);

    const resProd = await fetch('http://localhost:8080/api/products');
    const dataProd = await resProd.json();
    setProducts(dataProd.data || []);
  };

  useEffect(() => { fetchData(); }, []);

  const addCategory = async () => {
    if (!newCat) return;
    await fetch('http://localhost:8080/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCat })
    });
    setNewCat('');
    fetchData();
  };

  const addProduct = async () => {
    if (!prodForm.name || !prodForm.categoryId) return;
    await fetch('http://localhost:8080/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: prodForm.name,
        brand: prodForm.brand,
        categoryId: parseInt(prodForm.categoryId)
      })
    });
    setProdForm({ name: '', brand: '', categoryId: '' });
    fetchData();
  };

  const deleteCategory = async (id: number) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่นี้?")) return;
    const res = await fetch(`http://localhost:8080/api/categories/${id}`, {
        method: 'DELETE',
    });
    if (res.ok) fetchData(); // โหลดข้อมูลใหม่หลังจากลบสำเร็จ
  };

  const deleteProduct = async (id: number) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรุ่นสินค้านี้?")) return;
    
    try {
      const res = await fetch(`http://localhost:8080/api/products/${id}`, {
          method: 'DELETE',
      });
      if (res.ok) {
        fetchData(); // โหลดข้อมูลใหม่หลังจากลบสำเร็จ
      } else {
        alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    } catch (error) {
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* ---------------- ส่วนจัดการหมวดหมู่ ---------------- */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-6 text-indigo-600">
          <Tag className="w-5 h-5" />
          <h3 className="font-bold text-gray-900">Manage Categories</h3>
        </div>
        <div className="flex gap-2 mb-4">
          <input 
            type="text" placeholder="ชื่อหมวดหมู่ใหม่..." 
            className="flex-1 px-3 py-2 border rounded-xl text-sm"
            value={newCat} onChange={e => setNewCat(e.target.value)}
          />
          <button onClick={addCategory} className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-2">
          {categories.map((c: any) => (
            <div key={c.ID} className="px-4 py-2 bg-gray-50 rounded-lg text-sm text-gray-700 flex justify-between items-center group transition-all hover:bg-red-50">
              <span>{c.name}</span>
              <button 
                onClick={() => deleteCategory(c.ID)}
                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="ลบหมวดหมู่"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ---------------- ส่วนจัดการรุ่นสินค้า ---------------- */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-6 text-blue-600">
          <Laptop className="w-5 h-5" />
          <h3 className="font-bold text-gray-900">Manage Product Models</h3>
        </div>
        <div className="space-y-3 mb-6">
          <input 
            type="text" placeholder="ชื่อรุ่น (e.g. MacBook Pro M3)" 
            className="w-full px-3 py-2 border rounded-xl text-sm"
            value={prodForm.name} onChange={e => setProdForm({...prodForm, name: e.target.value})}
          />
          <div className="flex gap-2">
            <input 
              type="text" placeholder="ยี่ห้อ" 
              className="flex-1 px-3 py-2 border rounded-xl text-sm"
              value={prodForm.brand} onChange={e => setProdForm({...prodForm, brand: e.target.value})}
            />
            <select 
              className="flex-1 px-3 py-2 border rounded-xl text-sm"
              value={prodForm.categoryId} onChange={e => setProdForm({...prodForm, categoryId: e.target.value})}
            >
              <option value="">เลือกหมวดหมู่</option>
              {categories.map((c: any) => (
                <option key={c.ID} value={c.ID}>{c.name}</option>
              ))}
            </select>
          </div>
          <button onClick={addProduct} className="w-full py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">
            + Add Product Model
          </button>
        </div>
        
        {/* รายชื่อสินค้าพร้อมปุ่มลบ */}
        <div className="max-h-60 overflow-y-auto space-y-2">
          {products.map((p: any) => (
            <div key={p.ID} className="px-4 py-2 border border-gray-50 rounded-lg text-sm flex justify-between items-center group transition-all hover:bg-red-50">
              <div className="flex items-center gap-2">
                <span><span className="font-bold">{p.brand}</span> {p.name}</span>
                {p.Category?.name && (
                  <span className="text-gray-400 text-[10px] uppercase bg-gray-100 px-2 py-0.5 rounded-full">
                    {p.Category.name}
                  </span>
                )}
              </div>
              
              <button 
                onClick={() => deleteProduct(p.ID)}
                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="ลบรุ่นสินค้า"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}