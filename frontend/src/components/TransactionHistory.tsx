import { useState, useEffect } from 'react';
import { History, ArrowRightLeft, User, CalendarClock } from 'lucide-react';

interface Transaction {
  ID: number;
  staffName: string;
  action: string;
  actionDate: string;
  asset: {
    serialNumber: string;
    product: {
      name: string;
    }
  };
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8080/api/transactions')
      .then(res => res.json())
      .then(data => {
        // เรียงจากข้อมูลใหม่ล่าสุดไปเก่าสุด
        const sortedData = (data.data || []).sort((a: any, b: any) => 
          new Date(b.actionDate).getTime() - new Date(a.actionDate).getTime()
        );
        setTransactions(sortedData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching transactions:", err);
        setLoading(false);
      });
  }, []);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('th-TH', { 
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400 animate-pulse">กำลังโหลดข้อมูลประวัติ...</div>;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center gap-3">
        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
          <History className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">Activity Log</h3>
          <p className="text-sm text-gray-500 mt-1">ประวัติการเบิก-คืน และส่งซ่อมอุปกรณ์ทั้งหมด</p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date & Time</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Asset Info</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Staff Name</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((tx) => (
              <tr key={tx.ID} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CalendarClock className="w-4 h-4 text-gray-400" />
                    {formatDateTime(tx.actionDate)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${
                    tx.action === 'Check-out' ? 'bg-blue-50 text-blue-700' : 
                    tx.action === 'Check-in' ? 'bg-emerald-50 text-emerald-700' : 
                    'bg-amber-50 text-amber-700'
                  }`}>
                    <ArrowRightLeft className="w-3 h-3" />
                    {tx.action}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-sm font-medium text-gray-900">{tx.asset?.product?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">{tx.asset?.serialNumber}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="w-3 h-3 text-gray-500" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{tx.staffName}</span>
                  </div>
                </td>
              </tr>
            ))}
            
            {transactions.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500 text-sm">
                  ยังไม่มีประวัติการทำรายการ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}