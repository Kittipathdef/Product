import { useState, useEffect } from 'react';
import { MoreVertical, Calendar, ShieldCheck, CheckCircle2, OctagonAlert, Hammer, Trash2, Pencil, Search, Filter, Settings2, Tag } from 'lucide-react'; 
import BorrowAssetModal from './BorrowAssetModal'; // 👈 เปลี่ยนมา import BorrowAssetModal แทน
import TransactionModal from './TransactionModal'; 
import EditAssetModal from './EditAssetModal';
import ManageModelsModal from './ManageModelsModal';

export interface AssetData {
  ID: number;
  serialNumber: string;
  status: string;
  warrantyExpire: string | null;
  UpdatedAt: string;
  product: {
    brand: string; 
    name: string;
    category: {
      name: string;
    };
  };
}

const statusConfig: Record<string, { icon: any, color: string }> = {
  'Available': { icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
  'Borrowed': { icon: Calendar, color: 'text-blue-600 bg-blue-50' },
  'Maintenance': { icon: Hammer, color: 'text-amber-600 bg-amber-50' },
  'Broken': { icon: OctagonAlert, color: 'text-rose-600 bg-rose-50' },
};

export default function InventoryTable() {
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false); // 👈 เปลี่ยน State สำหรับเปิดหน้ายืม
  const [isManageModelsOpen, setIsManageModelsOpen] = useState(false);

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [selectedAssetForTx, setSelectedAssetForTx] = useState<{id: number, name: string} | null>(null);
  
  const [editingAsset, setEditingAsset] = useState<AssetData | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All'); 

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterCategory]);

  const openTransactionModal = (id: number, name: string) => {
    setSelectedAssetForTx({ id, name });
    setIsTxModalOpen(true);
  };

  const fetchAssets = () => {
    fetch('http://localhost:8080/api/assets')
      .then((res) => res.json())
      .then((data) => {
        setAssets(data.data || []); 
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching assets:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:8080/api/assets/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) fetchAssets(); 
      else alert("อัปเดตสถานะไม่สำเร็จ");
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDeleteAsset = async (id: number, assetName: string) => {
    const isConfirmed = window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการแทงจำหน่าย/ลบอุปกรณ์ "${assetName}"?\n*การกระทำนี้ไม่สามารถกู้คืนข้อมูลได้`);
    if (!isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:8080/api/assets/${id}`, { method: 'DELETE' });
      if (res.ok) fetchAssets();
      else {
        const errorData = await res.json();
        alert(`ลบข้อมูลไม่สำเร็จ: ${errorData.error}`);
      }
    } catch (error) {
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    }
  };

  const handleExportCSV = () => {
    if (assets.length === 0) {
      alert("ไม่มีข้อมูลสำหรับส่งออก");
      return;
    }
    const headers = ["ID", "Brand", "Product Name", "Category", "Serial Number", "Status", "Warranty Expire", "Last Updated"];
    const csvRows = assets.map(asset => [
      asset.ID, `"${asset.product?.brand || 'N/A'}"`, `"${asset.product?.name || 'N/A'}"`, `"${asset.product?.category?.name || 'N/A'}"`,
      asset.serialNumber, asset.status, asset.warrantyExpire || 'N/A', new Date(asset.UpdatedAt).toLocaleDateString('th-TH')
    ]);
    const csvContent = [headers.join(","), ...csvRows.map(row => row.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `IT_Inventory_Export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const uniqueCategories = Array.from(new Set(assets.map(a => a.product?.category?.name).filter(Boolean)));

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      (asset.product?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.product?.brand || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.serialNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || asset.status === filterStatus;
    const matchesCategory = filterCategory === 'All' || asset.product?.category?.name === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalPages = Math.ceil(filteredAssets.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentAssets = filteredAssets.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex justify-center">
        <div className="animate-pulse text-gray-400 font-medium">กำลังโหลดข้อมูลอุปกรณ์...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">IT Inventory List</h3>
          <p className="text-sm text-gray-500 mt-1">Manage and track your hardware assets</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={handleExportCSV} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-xl transition-all">
            Export CSV
          </button>
          <button 
            onClick={() => setIsManageModelsOpen(true)} 
            className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all flex items-center gap-2"
          >
            <Settings2 className="w-4 h-4" /> Manage Models
          </button>
          
          {/* 👇 เปลี่ยนปุ่มเป็น Borrow Asset สีน้ำเงิน 👇 */}
          <button 
            onClick={() => setIsBorrowModalOpen(true)} 
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm shadow-blue-200 flex items-center gap-2"
          >
            📥 Borrow Asset
          </button>
        </div>
      </div>

      <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="ค้นหาด้วยชื่ออุปกรณ์, ยี่ห้อ หรือ Serial Number..." 
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="relative sm:w-48">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select 
            className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-xl appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="All">ทุกหมวดหมู่ (All)</option>
            {uniqueCategories.map(cat => (
              <option key={cat as string} value={cat as string}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="relative sm:w-48">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select 
            className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-xl appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">ทุกสถานะ (All)</option>
            <option value="Available">พร้อมใช้งาน (Available)</option>
            <option value="Borrowed">ถูกยืม (Borrowed)</option>
            <option value="Maintenance">ส่งซ่อม (Maintenance)</option>
            <option value="Broken">ชำรุด (Broken)</option>
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white">
              <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Asset Info</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">S/N</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Warranty</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentAssets.map((asset) => {
              const status = statusConfig[asset.status] || { icon: CheckCircle2, color: 'text-gray-600 bg-gray-50' };
              const categoryName = asset.product?.category?.name || 'Unknown';
              
              return (
                <tr key={asset.ID} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                        {categoryName.toLowerCase().includes('laptop') || categoryName.toLowerCase().includes('macbook') ? (
                          <div className="w-6 h-6 bg-blue-100 rounded p-1 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-blue-600" /></div>
                        ) : (
                          <div className="w-6 h-6 bg-gray-200 rounded" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-900 leading-tight">
                          <span className="font-extrabold">{asset.product?.brand}</span> {asset.product?.name || 'Unknown Product'}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-tight">Last Checked: {formatDate(asset.UpdatedAt)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200 uppercase tracking-wider">
                      {categoryName}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="font-mono text-xs text-gray-500 tracking-tighter uppercase">{asset.serialNumber}</span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color} transition-colors`}>
                      <status.icon className="w-3.5 h-3.5" />
                      <select 
                        value={asset.status}
                        onChange={(e) => handleStatusChange(asset.ID, e.target.value)}
                        className="bg-transparent border-none outline-none cursor-pointer appearance-none text-inherit font-medium pr-2 focus:ring-0"
                      >
                        <option value="Available" className="text-gray-900">Available</option>
                        <option value="Borrowed" className="text-gray-900">Borrowed</option>
                        <option value="Maintenance" className="text-gray-900">Maintenance</option>
                        <option value="Broken" className="text-gray-900">Broken</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 line-clamp-1">{formatDate(asset.warrantyExpire)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditingAsset(asset)} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Edit Asset (แก้ไขข้อมูล)">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteAsset(asset.ID, asset.product?.name || 'Unknown')} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Delete (ลบอุปกรณ์)">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => openTransactionModal(asset.ID, asset.product?.name || 'Unknown')} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all" title="Record Action (เบิก/คืน)">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            
            {filteredAssets.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 mb-3">
                    <Search className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">ไม่พบข้อมูลอุปกรณ์</p>
                  <p className="text-xs text-gray-500 mt-1">ลองเปลี่ยนคำค้นหา หรือเปลี่ยนตัวกรองดูนะครับ</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-gray-500 italic">
          Showing <span className="font-semibold text-gray-700">
            {filteredAssets.length === 0 ? 0 : startIndex + 1}
          </span> to <span className="font-semibold text-gray-700">
            {Math.min(endIndex, filteredAssets.length)}
          </span> of <span className="font-semibold text-gray-700">
            {filteredAssets.length}
          </span> items
        </p>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="flex items-center px-3 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg border border-gray-100">
            Page {totalPages === 0 ? 0 : currentPage} of {totalPages}
          </span>

          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* 👇 เรียกใช้งาน BorrowAssetModal แทน AddAssetModal 👇 */}
      <BorrowAssetModal isOpen={isBorrowModalOpen} onClose={() => setIsBorrowModalOpen(false)} onSuccess={fetchAssets} />
      
      <TransactionModal isOpen={isTxModalOpen} onClose={() => setIsTxModalOpen(false)} onSuccess={fetchAssets} assetId={selectedAssetForTx?.id || null} assetName={selectedAssetForTx?.name || ''} />
      <EditAssetModal isOpen={!!editingAsset} onClose={() => setEditingAsset(null)} onSuccess={fetchAssets} asset={editingAsset} />
      <ManageModelsModal isOpen={isManageModelsOpen} onClose={() => setIsManageModelsOpen(false)} onSuccess={fetchAssets} />
    </div>
  );
}