import React, { useState, useEffect } from 'react';
import type {
  BusinessSettings,
  Service,
  Enquiry,
  GalleryItem,
  FAQItem,
  AnalyticsEvent,
  AdminNotification,
} from '../../types';
import {
  fetchBusinessSettings,
  saveBusinessSettings,
  fetchServices,
  saveService,
  deleteService,
  fetchEnquiries,
  updateEnquiry,
  deleteEnquiry,
  fetchGallery,
  saveGalleryItem,
  deleteGalleryItem,
  fetchFAQs,
  saveFAQItem,
  deleteFAQItem,
  fetchAnalyticsEvents,
  fetchNotifications,
  markNotificationRead,
  setAdminAuthenticated,
  isSupabaseConfigured,
} from '../../lib/supabase';
import { EnquiryDetailModal } from './EnquiryDetailModal';
import {
  LayoutDashboard,
  Inbox,
  Wrench,
  FileCode,
  Image as ImageIcon,
  HelpCircle,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  Search,
  Filter,
  Download,
  Phone,
  MessageSquare,
  Navigation,
  CheckCircle,
  Clock,
  Sparkles,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
} from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
  onViewWebsite: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, onViewWebsite }) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'enquiries' | 'services' | 'service_pages' | 'gallery' | 'faq' | 'seo' | 'analytics' | 'settings' | 'notifications'
  >('overview');

  // Core Data States
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsEvent[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  // Selected enquiry for detail modal
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);

  // Filters for enquiries table
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Loading & Saving feedback
  const [loading, setLoading] = useState(true);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Editing items
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingGallery, setEditingGallery] = useState<GalleryItem | null>(null);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);

  const loadAllData = async () => {
    try {
      const [sData, srvData, enqData, galData, faqData, anaData, notifData] = await Promise.all([
        fetchBusinessSettings(),
        fetchServices(),
        fetchEnquiries(),
        fetchGallery(),
        fetchFAQs(),
        fetchAnalyticsEvents(),
        fetchNotifications(),
      ]);
      setSettings(sData);
      setServices(srvData);
      setEnquiries(enqData);
      setGallery(galData);
      setFaqs(faqData);
      setAnalytics(anaData);
      setNotifications(notifData);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();

    // Listen for realtime simulated enquiries
    const handleNewEnquiry = (e: any) => {
      loadAllData();
    };
    window.addEventListener('sakil_new_enquiry', handleNewEnquiry);
    return () => window.removeEventListener('sakil_new_enquiry', handleNewEnquiry);
  }, []);

  const triggerSaveAlert = (msg = 'Changes saved successfully!') => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  // Filtered enquiries
  const filteredEnquiries = enquiries.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.phone.includes(searchQuery) ||
      item.requirement_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.message && item.message.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || item.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Export Enquiries to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Name', 'Phone', 'Requirement Type', 'Status', 'Priority', 'Customer Message'];
    const rows = filteredEnquiries.map((e) => [
      e.id,
      new Date(e.created_at).toLocaleString('en-IN'),
      `"${e.name.replace(/"/g, '""')}"`,
      e.phone,
      `"${e.requirement_type}"`,
      e.status,
      e.priority,
      `"${(e.message || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sakil_bag_store_enquiries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Count calculations
  const totalEnquiries = enquiries.length;
  const newEnquiries = enquiries.filter(e => e.status === 'NEW').length;
  const contactedEnquiries = enquiries.filter(e => e.status === 'CONTACTED').length;
  const convertedEnquiries = enquiries.filter(e => e.status === 'CONVERTED').length;
  const highPriority = enquiries.filter(e => e.priority === 'HIGH').length;

  const whatsappClicks = analytics.filter(a => a.event_name === 'whatsapp_click').length;
  const phoneClicks = analytics.filter(a => a.event_name === 'phone_click').length;
  const directionsClicks = analytics.filter(a => a.event_name === 'directions_click').length;
  const pageViews = analytics.filter(a => a.event_name === 'page_view').length;

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 border-2 border-orange-500 border-t-transparent animate-spin rounded-full" />
          <span className="text-sm">Loading Sakil Bag Store Admin...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-r border-neutral-800 bg-neutral-900/60 p-4 shrink-0 flex flex-col justify-between">
        <div>
          {/* Logo & Identity */}
          <div className="pb-6 mb-4 border-b border-neutral-800">
            <h1 className="font-heading text-lg font-bold text-white tracking-tight">
              SAKIL BAG STORE
            </h1>
            <div className="text-[11px] text-orange-400 font-medium">
              Owner: {settings.owner_name}
            </div>
            <div className="text-[10px] text-neutral-500 mt-0.5">
              Sector 22, Noida Admin
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'overview' ? 'bg-orange-600 text-white shadow-sm' : 'text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('enquiries')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'enquiries' ? 'bg-orange-600 text-white shadow-sm' : 'text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <Inbox className="h-4 w-4" />
                <span>Enquiries</span>
              </span>
              {newEnquiries > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-orange-500 text-[10px] text-white">
                  {newEnquiries}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('services')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'services' ? 'bg-orange-600 text-white shadow-sm' : 'text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                <span>Services ({services.length})</span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('gallery')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'gallery' ? 'bg-orange-600 text-white shadow-sm' : 'text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                <span>Parts Gallery</span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('faq')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'faq' ? 'bg-orange-600 text-white shadow-sm' : 'text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                <span>FAQs</span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'analytics' ? 'bg-orange-600 text-white shadow-sm' : 'text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('seo')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'seo' ? 'bg-orange-600 text-white shadow-sm' : 'text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <FileCode className="h-4 w-4" />
                <span>SEO Management</span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'settings' ? 'bg-orange-600 text-white shadow-sm' : 'text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Business Settings</span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'notifications' ? 'bg-orange-600 text-white shadow-sm' : 'text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </span>
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-[10px] text-white">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-neutral-800 space-y-2">
          <button
            onClick={onViewWebsite}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 py-2.5 text-xs font-semibold text-neutral-200 transition-colors"
          >
            <span>View Public Website</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-rose-900/50 bg-rose-950/20 hover:bg-rose-950/40 py-2 text-xs font-medium text-rose-300 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content View */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {saveSuccessMsg && (
          <div className="mb-6 rounded-xl border border-emerald-800 bg-emerald-950/60 p-4 text-xs font-semibold text-emerald-300 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-heading text-2xl font-bold text-white">
                  Welcome, Mohd Shakil
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Sakil Bag Store Operational Dashboard · Sector 22, Noida
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] px-2.5 py-1 rounded-full font-mono ${
                  isSupabaseConfigured ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700' : 'bg-orange-950/60 text-orange-400 border border-orange-800'
                }`}>
                  {isSupabaseConfigured ? '● Supabase PostgreSQL Live' : '● Local Realtime Mode (Active)'}
                </span>
              </div>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
                <div className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold">Total Enquiries</div>
                <div className="font-heading text-2xl font-bold text-white mt-2 tabular-nums">{totalEnquiries}</div>
                <div className="text-[10px] text-neutral-500 mt-1">All time recorded</div>
              </div>

              <div className="rounded-2xl border border-orange-900/40 bg-orange-950/10 p-4">
                <div className="text-[11px] text-orange-400 uppercase tracking-wider font-semibold">New Enquiries</div>
                <div className="font-heading text-2xl font-bold text-orange-400 mt-2 tabular-nums">{newEnquiries}</div>
                <div className="text-[10px] text-neutral-500 mt-1">Awaiting review</div>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
                <div className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold">Converted</div>
                <div className="font-heading text-2xl font-bold text-emerald-400 mt-2 tabular-nums">{convertedEnquiries}</div>
                <div className="text-[10px] text-neutral-500 mt-1">Customer jobs completed</div>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
                <div className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold">WhatsApp Clicks</div>
                <div className="font-heading text-2xl font-bold text-white mt-2 tabular-nums">{whatsappClicks}</div>
                <div className="text-[10px] text-neutral-500 mt-1">Direct chat inquiries</div>
              </div>
            </div>

            {/* Recent Enquiries Table Preview */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-base font-bold text-white">
                  Recent Customer Requirements
                </h3>
                <button
                  onClick={() => setActiveTab('enquiries')}
                  className="text-xs font-semibold text-orange-400 hover:text-orange-300"
                >
                  View All Enquiries →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-neutral-800 text-neutral-400 uppercase text-[10px]">
                    <tr>
                      <th className="pb-3 font-semibold">Date</th>
                      <th className="pb-3 font-semibold">Customer</th>
                      <th className="pb-3 font-semibold">Phone</th>
                      <th className="pb-3 font-semibold">Requirement</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                    {enquiries.slice(0, 5).map((e) => (
                      <tr key={e.id} className="hover:bg-neutral-800/40 transition-colors">
                        <td className="py-3 text-neutral-400 whitespace-nowrap">
                          {new Date(e.created_at).toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-3 font-semibold text-white">{e.name}</td>
                        <td className="py-3 font-mono">{e.phone}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-200">
                            {e.requirement_type}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                            e.status === 'NEW' ? 'bg-orange-950 text-orange-400 border border-orange-800' :
                            e.status === 'CONVERTED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                            'bg-neutral-800 text-neutral-300'
                          }`}>
                            {e.status}
                          </span>
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => setSelectedEnquiry(e)}
                            className="font-semibold text-orange-400 hover:underline"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions & Store Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-3">
                <h3 className="font-heading text-sm font-bold text-white">
                  Store Contact Quick View
                </h3>
                <div className="text-xs text-neutral-300 space-y-1">
                  <div><strong>Phone:</strong> {settings.phone}</div>
                  <div><strong>WhatsApp:</strong> +{settings.whatsapp_number}</div>
                  <div><strong>Location:</strong> {settings.address}</div>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="text-xs font-semibold text-orange-400 hover:underline"
                  >
                    Edit Business Details & URLs →
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-3">
                <h3 className="font-heading text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-orange-400" />
                  <span>AI Business Assistant</span>
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Analyze customer trends and generate factual suggested replies for Mohd Shakil using Google Gemini Edge Functions without manual guesswork.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('enquiries')}
                    className="text-xs font-semibold text-orange-400 hover:underline"
                  >
                    Open Any Enquiry to Generate AI Reply →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. ENQUIRIES TAB */}
        {activeTab === 'enquiries' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-heading text-2xl font-bold text-white">
                  Customer Enquiries ({filteredEnquiries.length})
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  All repair enquiries, wheel measurements, and custom bag requests
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-800 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 bg-neutral-900/60 border border-neutral-800 p-3 rounded-2xl">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, phone, requirement..."
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 pl-9 pr-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-neutral-400">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-neutral-800 bg-neutral-950 px-2.5 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="ALL">ALL STATUSES</option>
                  <option value="NEW">NEW</option>
                  <option value="CONTACTED">CONTACTED</option>
                  <option value="FOLLOW_UP">FOLLOW_UP</option>
                  <option value="CONVERTED">CONVERTED</option>
                  <option value="CLOSED">CLOSED</option>
                  <option value="SPAM">SPAM</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-neutral-400">Priority:</span>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="rounded-xl border border-neutral-800 bg-neutral-950 px-2.5 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="ALL">ALL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-neutral-800 bg-neutral-950/60 text-neutral-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-3 font-semibold">Date</th>
                      <th className="p-3 font-semibold">Name</th>
                      <th className="p-3 font-semibold">Phone</th>
                      <th className="p-3 font-semibold">Requirement</th>
                      <th className="p-3 font-semibold">Status</th>
                      <th className="p-3 font-semibold">Priority</th>
                      <th className="p-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                    {filteredEnquiries.map((enq) => (
                      <tr
                        key={enq.id}
                        onClick={() => setSelectedEnquiry(enq)}
                        className="hover:bg-neutral-800/40 cursor-pointer transition-colors"
                      >
                        <td className="p-3 text-neutral-400 whitespace-nowrap">
                          {new Date(enq.created_at).toLocaleDateString('en-IN')}
                        </td>
                        <td className="p-3 font-semibold text-white">{enq.name}</td>
                        <td className="p-3 font-mono">{enq.phone}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-200">
                            {enq.requirement_type}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                            enq.status === 'NEW' ? 'bg-orange-950 text-orange-400 border border-orange-800' :
                            enq.status === 'CONVERTED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                            'bg-neutral-800 text-neutral-300'
                          }`}>
                            {enq.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] font-bold ${
                            enq.priority === 'HIGH' ? 'text-rose-400' : 'text-neutral-400'
                          }`}>
                            {enq.priority}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEnquiry(enq);
                            }}
                            className="text-xs text-orange-400 hover:text-orange-300 font-semibold"
                          >
                            Open →
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredEnquiries.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-neutral-500">
                          No enquiries found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. SERVICES MANAGEMENT TAB */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-2xl font-bold text-white">
                  Services Management ({services.length})
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Manage active services, slugs, descriptions, and WhatsApp templates
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((srv) => (
                <div
                  key={srv.id}
                  className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-heading text-base font-bold text-white">{srv.name}</h3>
                      <span className="text-[11px] font-mono text-neutral-500">/{srv.slug}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      srv.active ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-neutral-800 text-neutral-500'
                    }`}>
                      {srv.active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {srv.description}
                  </p>

                  <div className="rounded-xl bg-neutral-950 p-2.5 text-[11px] text-neutral-400 font-mono">
                    <span className="text-neutral-500 block mb-0.5">WhatsApp Template:</span>
                    <div className="truncate">{srv.whatsapp_template}</div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-neutral-800/80">
                    <button
                      onClick={async () => {
                        const updated = { ...srv, active: !srv.active };
                        await saveService(updated);
                        setServices(services.map(s => s.id === srv.id ? updated : s));
                        triggerSaveAlert(`Toggled status for ${srv.name}`);
                      }}
                      className="text-xs font-medium text-neutral-300 hover:text-white"
                    >
                      {srv.active ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => setEditingService(srv)}
                      className="text-xs font-semibold text-orange-400 hover:underline inline-flex items-center gap-1"
                    >
                      <Edit2 className="h-3 w-3" />
                      <span>Edit Description & Template</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Service Edit Modal */}
            {editingService && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                <div className="max-w-lg w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
                  <h3 className="font-heading text-lg font-bold text-white">Edit Service: {editingService.name}</h3>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={editingService.description}
                      onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-950 p-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">WhatsApp Template</label>
                    <textarea
                      rows={3}
                      value={editingService.whatsapp_template}
                      onChange={(e) => setEditingService({ ...editingService, whatsapp_template: e.target.value })}
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-950 p-2.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => setEditingService(null)}
                      className="px-4 py-2 text-xs text-neutral-400"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        await saveService(editingService);
                        setServices(services.map(s => s.id === editingService.id ? editingService : s));
                        setEditingService(null);
                        triggerSaveAlert('Service updated successfully');
                      }}
                      className="px-4 py-2 rounded-lg bg-orange-600 text-xs font-bold text-white"
                    >
                      Save Service
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. GALLERY TAB */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-2xl font-bold text-white">
                  Parts & Store Gallery ({gallery.length})
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Upload genuine shop photographs or replace placeholder assets
                </p>
              </div>
              <button
                onClick={() => {
                  const newItem: GalleryItem = {
                    id: 'gal-' + Date.now(),
                    image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
                    title: 'New Trolley Part / Repair',
                    caption: 'Photographed at Sakil Bag Store, Sector 22, Noida',
                    category: 'Wheels',
                    alt_text: 'Trolley bag repair Noida',
                    display_order: gallery.length + 1,
                    active: true,
                  };
                  setEditingGallery(newItem);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 px-3.5 py-2 text-xs font-bold text-white"
              >
                <Plus className="h-4 w-4" />
                <span>Add New Photo</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gallery.map((item) => (
                <div key={item.id} className="rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden flex flex-col justify-between">
                  <div className="relative h-44 w-full bg-neutral-950">
                    <img src={item.image_url} alt={item.alt_text} className="h-full w-full object-cover" />
                    <span className="absolute top-2 left-2 rounded bg-neutral-950/80 px-2 py-0.5 text-[10px] text-orange-400 font-mono">
                      {item.category}
                    </span>
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-heading text-sm font-bold text-white">{item.title}</h3>
                    <p className="text-xs text-neutral-400 truncate">{item.caption}</p>
                    <div className="pt-2 flex items-center justify-between border-t border-neutral-800">
                      <button
                        onClick={() => setEditingGallery(item)}
                        className="text-xs font-medium text-orange-400 hover:underline"
                      >
                        Edit Details
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('Delete this photo?')) {
                            await deleteGalleryItem(item.id);
                            setGallery(gallery.filter(g => g.id !== item.id));
                            triggerSaveAlert('Image removed');
                          }
                        }}
                        className="text-xs text-rose-400 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Gallery Edit Modal */}
            {editingGallery && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                <div className="max-w-lg w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
                  <h3 className="font-heading text-lg font-bold text-white">Edit Gallery Photo</h3>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={editingGallery.title}
                      onChange={(e) => setEditingGallery({ ...editingGallery, title: e.target.value })}
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Image URL</label>
                    <input
                      type="text"
                      value={editingGallery.image_url}
                      onChange={(e) => setEditingGallery({ ...editingGallery, image_url: e.target.value })}
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Category</label>
                    <select
                      value={editingGallery.category}
                      onChange={(e) => setEditingGallery({ ...editingGallery, category: e.target.value as any })}
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-white"
                    >
                      <option value="Wheels">Wheels</option>
                      <option value="Handles">Handles</option>
                      <option value="Locks">Locks</option>
                      <option value="Trolley Parts">Trolley Parts</option>
                      <option value="Bag Repair">Bag Repair</option>
                      <option value="Luggage">Luggage</option>
                      <option value="Customized Bags">Customized Bags</option>
                      <option value="Store">Store</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Caption</label>
                    <input
                      type="text"
                      value={editingGallery.caption || ''}
                      onChange={(e) => setEditingGallery({ ...editingGallery, caption: e.target.value })}
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => setEditingGallery(null)}
                      className="px-4 py-2 text-xs text-neutral-400"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        await saveGalleryItem(editingGallery);
                        await loadAllData();
                        setEditingGallery(null);
                        triggerSaveAlert('Gallery updated');
                      }}
                      className="px-4 py-2 rounded-lg bg-orange-600 text-xs font-bold text-white"
                    >
                      Save Photo
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. FAQ TAB */}
        {activeTab === 'faq' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-2xl font-bold text-white">
                  FAQ Management ({faqs.length})
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Manage questions and answers displayed on the public website
                </p>
              </div>
              <button
                onClick={() => {
                  const newFaq: FAQItem = {
                    id: 'faq-' + Date.now(),
                    question: 'New Question',
                    answer: 'Answer to question...',
                    category: 'General',
                    display_order: faqs.length + 1,
                    active: true,
                  };
                  setEditingFaq(newFaq);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 px-3.5 py-2 text-xs font-bold text-white"
              >
                <Plus className="h-4 w-4" />
                <span>Add FAQ</span>
              </button>
            </div>

            <div className="space-y-3">
              {faqs.map((faq) => (
                <div key={faq.id} className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-heading text-sm font-semibold text-white">{faq.question}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">{faq.category}</span>
                  </div>
                  <p className="text-xs text-neutral-300">{faq.answer}</p>
                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-800/80">
                    <button
                      onClick={() => setEditingFaq(faq)}
                      className="text-xs text-orange-400 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm('Delete this question?')) {
                          await deleteFAQItem(faq.id);
                          setFaqs(faqs.filter(f => f.id !== faq.id));
                          triggerSaveAlert('FAQ deleted');
                        }
                      }}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {editingFaq && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                <div className="max-w-lg w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
                  <h3 className="font-heading text-lg font-bold text-white">Edit FAQ</h3>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Question</label>
                    <input
                      type="text"
                      value={editingFaq.question}
                      onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Answer</label>
                    <textarea
                      rows={4}
                      value={editingFaq.answer}
                      onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-950 p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Category</label>
                    <input
                      type="text"
                      value={editingFaq.category}
                      onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value })}
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button onClick={() => setEditingFaq(null)} className="px-4 py-2 text-xs text-neutral-400">Cancel</button>
                    <button
                      onClick={async () => {
                        await saveFAQItem(editingFaq);
                        await loadAllData();
                        setEditingFaq(null);
                        triggerSaveAlert('FAQ saved');
                      }}
                      className="px-4 py-2 rounded-lg bg-orange-600 text-xs font-bold text-white"
                    >
                      Save FAQ
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 6. BUSINESS SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h2 className="font-heading text-2xl font-bold text-white">
                Business & Contact Settings
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Updating these values dynamically updates phone, WhatsApp, and Google Maps across the entire website.
              </p>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await saveBusinessSettings(settings);
                triggerSaveAlert('Business settings saved successfully!');
              }}
              className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Business Name</label>
                  <input
                    type="text"
                    required
                    value={settings.business_name}
                    onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Owner Name</label>
                  <input
                    type="text"
                    required
                    value={settings.owner_name}
                    onChange={(e) => setSettings({ ...settings, owner_name: e.target.value })}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Supplied Phone Number</label>
                  <input
                    type="text"
                    required
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-white font-mono"
                  />
                  <span className="text-[10px] text-neutral-500">Business phone: 083838 04752</span>
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1">WhatsApp Number (with country code)</label>
                  <input
                    type="text"
                    required
                    value={settings.whatsapp_number}
                    onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-white font-mono"
                  />
                  <span className="text-[10px] text-neutral-500">Separate configurable WhatsApp number</span>
                </div>
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">Full Physical Store Address</label>
                <textarea
                  rows={2}
                  required
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Google Maps Direction URL</label>
                  <input
                    type="url"
                    required
                    value={settings.google_maps_url}
                    onChange={(e) => setSettings({ ...settings, google_maps_url: e.target.value })}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Google Business Profile URL</label>
                  <input
                    type="url"
                    required
                    value={settings.google_business_profile_url}
                    onChange={(e) => setSettings({ ...settings, google_business_profile_url: e.target.value })}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">Opening Hours</label>
                <input
                  type="text"
                  value={settings.opening_hours}
                  onChange={(e) => setSettings({ ...settings, opening_hours: e.target.value })}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="rounded-xl bg-orange-600 hover:bg-orange-500 px-6 py-2.5 text-xs font-bold text-white shadow-md"
                >
                  Save Business Settings
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 7. SEO TAB */}
        {activeTab === 'seo' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h2 className="font-heading text-2xl font-bold text-white">
                Search Engine Optimization (SEO)
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Metadata, Google Search Console readiness, and keyword optimization
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-4">
              <h3 className="font-heading text-base font-bold text-white">Homepage SEO Audit</h3>
              <div className="space-y-3">
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                  <div className="text-neutral-400 text-xs mb-1">Title Tag (59 chars - Optimal):</div>
                  <div className="text-xs text-emerald-400 font-mono">SAKIL BAG STORE - Trolley Bag Repair & Parts Specialist Noida</div>
                </div>

                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                  <div className="text-neutral-400 text-xs mb-1">Meta Description (142 chars - Optimal):</div>
                  <div className="text-xs text-emerald-400 font-mono">Professional trolley bag repair, trolley wheels replacement, handles, locks, luggage repair and customized bags in Sector 22, Noida. Run by Mohd Shakil.</div>
                </div>

                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                  <div className="text-neutral-400 text-xs mb-1">Canonical URL:</div>
                  <div className="text-xs text-neutral-300 font-mono">https://sakilbagstore.com/</div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-800">
                <h4 className="text-xs font-semibold text-white mb-2">Technical SEO Files Available</h4>
                <div className="flex gap-2">
                  <a href="/robots.txt" target="_blank" className="px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-900 text-xs text-neutral-300 hover:text-white">
                    View robots.txt
                  </a>
                  <a href="/sitemap.xml" target="_blank" className="px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-900 text-xs text-neutral-300 hover:text-white">
                    View sitemap.xml
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 8. ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-heading text-2xl font-bold text-white">
                Performance & Analytics
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Real customer interactions tracked privacy-consciously without cookies
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase">
                  <MessageSquare className="h-4 w-4" />
                  <span>WhatsApp Inquiries</span>
                </div>
                <div className="text-3xl font-bold text-white mt-3 tabular-nums">{whatsappClicks}</div>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
                <div className="flex items-center gap-2 text-xs font-semibold text-orange-400 uppercase">
                  <Phone className="h-4 w-4" />
                  <span>Phone Calls Triggered</span>
                </div>
                <div className="text-3xl font-bold text-white mt-3 tabular-nums">{phoneClicks}</div>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase">
                  <Navigation className="h-4 w-4" />
                  <span>Maps Directions Clicks</span>
                </div>
                <div className="text-3xl font-bold text-white mt-3 tabular-nums">{directionsClicks}</div>
              </div>
            </div>

            {/* Events Log */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
              <h3 className="font-heading text-sm font-bold text-white mb-4">
                Recent Interaction Events
              </h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {analytics.slice(0, 30).map((a, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-neutral-800/60 last:border-none">
                    <span className="font-mono text-orange-400">{a.event_name}</span>
                    <span className="text-neutral-400 truncate max-w-xs">{a.page_url}</span>
                    <span className="text-[11px] text-neutral-500">
                      {a.created_at ? new Date(a.created_at).toLocaleTimeString() : 'Just now'}
                    </span>
                  </div>
                ))}
                {analytics.length === 0 && (
                  <div className="text-neutral-500 text-xs py-4 text-center">No analytics recorded yet.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 9. NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="font-heading text-2xl font-bold text-white">
                Notification Center
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Realtime notifications for incoming trolley & bag repair enquiries
              </p>
            </div>

            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`rounded-xl border p-4 flex items-start justify-between gap-4 ${
                    n.read ? 'border-neutral-800 bg-neutral-900/40 text-neutral-400' : 'border-orange-800/80 bg-orange-950/20 text-neutral-200'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-xs text-white">{n.title}</div>
                    <div className="text-xs mt-0.5">{n.message}</div>
                    <div className="text-[10px] text-neutral-500 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                  </div>
                  {!n.read && (
                    <button
                      onClick={async () => {
                        await markNotificationRead(n.id);
                        setNotifications(notifications.map(item => item.id === n.id ? { ...item, read: true } : item));
                      }}
                      className="text-xs font-semibold text-orange-400 hover:underline shrink-0"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="text-neutral-500 text-xs py-8 text-center">No notifications.</div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Enquiry Detail Modal */}
      {selectedEnquiry && settings && (
        <EnquiryDetailModal
          enquiry={selectedEnquiry}
          settings={settings}
          onClose={() => setSelectedEnquiry(null)}
          onUpdateStatus={async (id, status, priority, notes) => {
            await updateEnquiry(id, { status, priority, admin_notes: notes });
            setEnquiries(enquiries.map(e => e.id === id ? { ...e, status, priority, admin_notes: notes } : e));
          }}
          onDelete={async (id) => {
            await deleteEnquiry(id);
            setEnquiries(enquiries.filter(e => e.id !== id));
            setSelectedEnquiry(null);
            triggerSaveAlert('Enquiry deleted');
          }}
        />
      )}
    </div>
  );
};
