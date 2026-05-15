import { useState } from 'react';
import { X } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  assetId: number | null;
  assetName: string;
}

export default function TransactionModal({ isOpen, onClose, onSuccess, assetId, assetName }: TransactionModalProps) {
  const [formData, setFormData] = useState({
    staffName: '',
    action: 'Check-out' // ค่าเริ่มต้นคือ ยืม (Check-out)
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !assetId) return null;

  // 👇 เปลี่ยนแค่ฟังก์ชันนี้ฟังก์ชันเดียวครับ 👇
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 1. เตรียมข้อมูลให้ตรงกับที่ Go Backend คาดหวัง
    const transactionPayload = {
      asset_id: assetId,
      staff_name: formData.staffName,
      action_type: formData.action
    };

    try {
      // 2. ยิง API บันทึกประวัติแค่เส้นเดียวพอ
      const res = await fetch('http://localhost:8080/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionPayload)
      });

      if (res.ok) {
        onSuccess(); // รีเฟรชตาราง
        onClose(); // ปิด Modal
        setFormData({ staffName: '', action: 'Check-out' }); // ล้างค่า
      } else {
        const errorData = await res.json();
        alert(`เกิดข้อผิดพลาด: ${errorData.error}`);
      }
    } catch (error) {
      alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } finally {
      setIsSubmitting(false);
    }
  };
  // 👆 สิ้นสุดส่วนที่เปลี่ยน 👆

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-900">Record Action</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs text-blue-600 font-medium uppercase tracking-wider mb-1">Selected Asset</p>
            <p className="text-sm font-semibold text-gray-900">{assetName}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              value={formData.action}
              onChange={e => setFormData({...formData, action: e.target.value})}
            >
              <option value="Check-out">Check-out (ยืมอุปกรณ์)</option>
              <option value="Check-in">Check-in (คืนอุปกรณ์)</option>
              <option value="Repair">Repair (ส่งซ่อม)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Staff Name <span className="text-red-500">*</span></label>
            <input 
              type="text" required placeholder="เช่น สมชาย ใจดี"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              value={formData.staffName}
              onChange={e => setFormData({...formData, staffName: e.target.value})}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm disabled:opacity-50">
              {isSubmitting ? 'Saving...' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}