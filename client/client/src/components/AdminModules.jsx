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
  <div className="flex flex-col items-center justify-center p-12 bg-slate-800/20 rounded-2xl border border-slate-700/50 border-dashed">
    <Icon size={48} className="text-slate-600 mb-4" />
    <p className="text-slate-400 font-medium">{message}</p>
  </div>
);

// Reusable Loading Component
const LoadingState = () => (
  <div className="flex justify-center items-center p-12">
    <Loader2Icon size={32} className="text-indigo-500 animate-spin" />
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
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <ActivityIcon className="text-indigo-400" /> Overview
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
          <p className="text-slate-400 text-sm font-medium mb-1">Total Certificates</p>
          <p className="text-3xl font-bold text-white">{data?.certs}</p>
        </div>
        <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
          <p className="text-slate-400 text-sm font-medium mb-1">Total Bookings</p>
          <p className="text-3xl font-bold text-white">{data?.bookings}</p>
        </div>
        <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
          <p className="text-slate-400 text-sm font-medium mb-1">Recent Revenue</p>
          <p className="text-3xl font-bold text-green-400">{data?.revenue}</p>
        </div>
      </div>
      <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 mt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="flex gap-4">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            New Booking
          </button>
          <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
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
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileTextIcon className="text-indigo-400" /> Certificates
        </h2>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <PlusIcon size={16} /> Generate Certificate
        </button>
      </div>

      <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50">
        <div className="relative mb-6">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or ID..." 
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? <LoadingState /> : certs.length === 0 ? (
          <EmptyState message="No certificates found. Generate one to get started." icon={FileTextIcon} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-400 border-b border-slate-700">
                <tr><th className="pb-3">ID</th><th className="pb-3">Name</th><th className="pb-3">Date</th><th className="pb-3 text-right">Actions</th></tr>
              </thead>
              <tbody>
                {certs.map(c => (
                  <tr key={c.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                    <td className="py-3 text-slate-300">{c.id}</td>
                    <td className="py-3 text-white font-medium">{c.name}</td>
                    <td className="py-3 text-slate-400">{c.date}</td>
                    <td className="py-3 text-right">
                      <button className="text-indigo-400 hover:text-indigo-300 p-1"><DownloadIcon size={18} /></button>
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
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <CalendarIcon className="text-indigo-400" /> Bookings
      </h2>
      <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50">
        {loading ? <LoadingState /> : bookings.length === 0 ? (
          <EmptyState message="No bookings available." icon={CalendarIcon} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-400 border-b border-slate-700">
                <tr><th className="pb-3">Client</th><th className="pb-3">Category</th><th className="pb-3">Date</th><th className="pb-3">Status</th></tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                    <td className="py-3 text-white">{b.clientName}</td>
                    <td className="py-3 text-slate-300">{b.category}</td>
                    <td className="py-3 text-slate-400">{b.date}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${b.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
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
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <MessageCircleIcon className="text-green-400" /> WhatsApp Logs
      </h2>
      <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50">
        {loading ? <LoadingState /> : logs.length === 0 ? (
          <EmptyState message="No message logs found." icon={MessageCircleIcon} />
        ) : (
          <div className="space-y-3">
            {logs.map((log, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                {log.status === 'success' ? <CheckCircleIcon className="text-green-500 mt-0.5" size={18} /> : <XCircleIcon className="text-red-500 mt-0.5" size={18} />}
                <div>
                  <p className="text-sm text-slate-200">{log.message}</p>
                  <p className="text-xs text-slate-500 mt-1">{log.timestamp} • {log.recipient}</p>
                  {log.error && <p className="text-xs text-red-400 mt-1">Error: {log.error}</p>}
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
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <CreditCardIcon className="text-indigo-400" /> Payments
      </h2>
      <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50">
        {loading ? <LoadingState /> : payments.length === 0 ? (
          <EmptyState message="No transaction history available." icon={CreditCardIcon} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-400 border-b border-slate-700">
                <tr><th className="pb-3">Txn ID</th><th className="pb-3">Amount</th><th className="pb-3">Date</th><th className="pb-3">Status</th></tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                    <td className="py-3 text-slate-300 font-mono text-xs">{p.id}</td>
                    <td className="py-3 text-white font-medium">₹{p.amount}</td>
                    <td className="py-3 text-slate-400">{p.date}</td>
                    <td className="py-3">
                      <span className={`flex items-center gap-1 text-xs font-medium ${p.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
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
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <SettingsIcon className="text-indigo-400" /> System Settings
      </h2>
      <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">Environment Configuration</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3">
              <MessageCircleIcon className="text-green-400" size={20} />
              <span className="text-slate-200">WhatsApp API Connection</span>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-bold ${config?.whatsapp ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {config?.whatsapp ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3">
              <ActivityIcon className="text-blue-400" size={20} />
              <span className="text-slate-200">Database Status</span>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-bold ${config?.database ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {config?.database ? 'HEALTHY' : 'ERROR'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3">
              <CreditCardIcon className="text-indigo-400" size={20} />
              <span className="text-slate-200">Razorpay Integration</span>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-bold ${config?.razorpay ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
              {config?.razorpay ? 'ACTIVE' : 'TEST MODE'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
