import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileTextIcon, CalendarIcon, MessageCircleIcon, CreditCardIcon, SettingsIcon, 
  SearchIcon, DownloadIcon, PlusIcon, AlertCircleIcon, CheckCircleIcon, XCircleIcon, 
  Loader2Icon, ActivityIcon, UsersIcon
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Reusable Empty State Component
const EmptyState = ({ message, icon: Icon }) => (
  <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-[#e5e5e5] border-dashed">
    <Icon size={48} className="text-[#606060] mb-4" />
    <p className="text-[#606060] font-medium">{message}</p>
  </div>
);

// Reusable Loading Component
const LoadingState = () => (
  <div className="flex justify-center items-center p-12">
    <Loader2Icon size={32} className="text-red-600 animate-spin" />
  </div>
);

// 1. Dashboard Overview
export const DashboardOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setData({ certs: 142, bookings: 28, revenue: '₹45,000' });
      setLoading(false);
    }, 800);
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0f0f0f] flex items-center gap-2">
        <ActivityIcon className="text-[#606060]" /> Overview
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-[#e5e5e5]">
          <p className="text-[#606060] text-sm font-medium mb-1">Total Certificates</p>
          <p className="text-3xl font-bold text-[#0f0f0f]">{data?.certs}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#e5e5e5]">
          <p className="text-[#606060] text-sm font-medium mb-1">Total Bookings</p>
          <p className="text-3xl font-bold text-[#0f0f0f]">{data?.bookings}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#e5e5e5]">
          <p className="text-[#606060] text-sm font-medium mb-1">Recent Revenue</p>
          <p className="text-3xl font-bold text-green-600">{data?.revenue}</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl border border-[#e5e5e5] mt-6">
        <h3 className="text-lg font-semibold text-[#0f0f0f] mb-4">Quick Actions</h3>
        <div className="flex gap-4">
          <button className="bg-[#0f0f0f] hover:bg-[#272727] text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
            New Booking
          </button>
          <button className="bg-[#f2f2f2] hover:bg-[#e5e5e5] text-[#0f0f0f] px-4 py-2 rounded-full text-sm font-medium transition-colors">
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. Certificate Management
export const CertificateManagement = () => {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get(`${API_BASE}/certificates`).then(res => setCerts(res.data)).catch(() => setCerts([])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#0f0f0f] flex items-center gap-2">
          <FileTextIcon className="text-[#606060]" /> Certificates
        </h2>
        <button className="bg-[#0f0f0f] hover:bg-[#272727] text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
          <PlusIcon size={16} /> Generate Certificate
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#e5e5e5]">
        <div className="relative mb-6">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#606060]" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or ID..." 
            className="w-full bg-[#f9f9f9] border border-[#cccccc] rounded-full py-2 pl-10 pr-4 text-[#0f0f0f] focus:outline-none focus:border-[#909090]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? <LoadingState /> : certs.length === 0 ? (
          <EmptyState message="No certificates found. Generate one to get started." icon={FileTextIcon} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[#606060] border-b border-[#e5e5e5]">
                <tr><th className="pb-3">ID</th><th className="pb-3">Name</th><th className="pb-3">Date</th><th className="pb-3 text-right">Actions</th></tr>
              </thead>
              <tbody>
                {certs.map(c => (
                  <tr key={c.id} className="border-b border-[#e5e5e5] hover:bg-[#f9f9f9]">
                    <td className="py-3 text-[#606060]">{c.id}</td>
                    <td className="py-3 text-[#0f0f0f] font-medium">{c.name}</td>
                    <td className="py-3 text-[#606060]">{c.date}</td>
                    <td className="py-3 text-right">
                      <button className="text-[#606060] hover:text-[#0f0f0f] p-1"><DownloadIcon size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// 3. Booking Management
export const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE}/bookings`).then(res => setBookings(res.data)).catch(() => setBookings([])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0f0f0f] flex items-center gap-2">
        <CalendarIcon className="text-[#606060]" /> Bookings
      </h2>
      <div className="bg-white p-4 rounded-xl border border-[#e5e5e5]">
        {loading ? <LoadingState /> : bookings.length === 0 ? (
          <EmptyState message="No bookings available." icon={CalendarIcon} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[#606060] border-b border-[#e5e5e5]">
                <tr><th className="pb-3">Client</th><th className="pb-3">Category</th><th className="pb-3">Date</th><th className="pb-3">Status</th></tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id} className="border-b border-[#e5e5e5] hover:bg-[#f9f9f9]">
                    <td className="py-3 text-[#0f0f0f]">{b.clientName}</td>
                    <td className="py-3 text-[#606060]">{b.category}</td>
                    <td className="py-3 text-[#606060]">{b.date}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${b.status === 'confirmed' ? 'bg-[#e8f5e9] text-green-700' : 'bg-[#fff8e1] text-yellow-700'}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// 4. WhatsApp Logs
export const WhatsAppLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE}/whatsapp/logs`).then(res => setLogs(res.data)).catch(() => setLogs([])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0f0f0f] flex items-center gap-2">
        <MessageCircleIcon className="text-green-600" /> WhatsApp Logs
      </h2>
      <div className="bg-white p-4 rounded-xl border border-[#e5e5e5]">
        {loading ? <LoadingState /> : logs.length === 0 ? (
          <EmptyState message="No message logs found." icon={MessageCircleIcon} />
        ) : (
          <div className="space-y-3">
            {logs.map((log, i) => (
               <div key={i} className="flex items-start gap-3 p-3 bg-[#f9f9f9] rounded-lg border border-[#e5e5e5]">
                {log.status === 'success' ? <CheckCircleIcon className="text-green-600 mt-0.5" size={18} /> : <XCircleIcon className="text-red-600 mt-0.5" size={18} />}
                <div>
                  <p className="text-sm text-[#0f0f0f]">{log.message}</p>
                  <p className="text-xs text-[#606060] mt-1">{log.timestamp} • {log.recipient}</p>
                  {log.error && <p className="text-xs text-red-600 mt-1">Error: {log.error}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 5. Payments
export const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE}/payments`).then(res => setPayments(res.data)).catch(() => setPayments([])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0f0f0f] flex items-center gap-2">
        <CreditCardIcon className="text-[#606060]" /> Payments
      </h2>
      <div className="bg-white p-4 rounded-xl border border-[#e5e5e5]">
        {loading ? <LoadingState /> : payments.length === 0 ? (
          <EmptyState message="No transaction history available." icon={CreditCardIcon} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[#606060] border-b border-[#e5e5e5]">
                <tr><th className="pb-3">Txn ID</th><th className="pb-3">Amount</th><th className="pb-3">Date</th><th className="pb-3">Status</th></tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id} className="border-b border-[#e5e5e5] hover:bg-[#f9f9f9]">
                    <td className="py-3 text-[#606060] font-mono text-xs">{p.id}</td>
                    <td className="py-3 text-[#0f0f0f] font-medium">₹{p.amount}</td>
                    <td className="py-3 text-[#606060]">{p.date}</td>
                    <td className="py-3">
                      <span className={`flex items-center gap-1 text-xs font-medium ${p.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {p.status === 'success' ? <CheckCircleIcon size={12}/> : <XCircleIcon size={12}/>} {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// 6. Settings
export const Settings = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setConfig({ whatsapp: true, database: true, razorpay: false });
      setLoading(false);
    }, 600);
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-[#e5e5e5]">
        <h3 className="text-lg font-semibold text-[#0f0f0f] mb-4">Environment Configuration</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-[#f9f9f9] rounded-lg border border-[#e5e5e5]">
            <div className="flex items-center gap-3">
              <MessageCircleIcon className="text-[#606060]" size={20} />
              <span className="text-[#0f0f0f]">WhatsApp API Connection</span>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-bold ${config?.whatsapp ? 'bg-[#e8f5e9] text-green-700' : 'bg-[#ffebee] text-red-700'}`}>
              {config?.whatsapp ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#f9f9f9] rounded-lg border border-[#e5e5e5]">
            <div className="flex items-center gap-3">
              <ActivityIcon className="text-[#606060]" size={20} />
              <span className="text-[#0f0f0f]">Database Status</span>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-bold ${config?.database ? 'bg-[#e8f5e9] text-green-700' : 'bg-[#ffebee] text-red-700'}`}>
              {config?.database ? 'HEALTHY' : 'ERROR'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#f9f9f9] rounded-lg border border-[#e5e5e5]">
            <div className="flex items-center gap-3">
              <CreditCardIcon className="text-[#606060]" size={20} />
              <span className="text-[#0f0f0f]">Razorpay Integration</span>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-bold ${config?.razorpay ? 'bg-[#e8f5e9] text-green-700' : 'bg-[#fff8e1] text-yellow-700'}`}>
              {config?.razorpay ? 'ACTIVE' : 'TEST MODE'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
