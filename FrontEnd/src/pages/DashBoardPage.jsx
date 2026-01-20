import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Filter, 
  AlertCircle,
  ArrowUpRight,
  Printer,
  HelpCircle, 
  ArrowRight,
  Check,
  Download,
  Send,
  MessageCircle,
  Slack,
  Plus, 
  Trash2, 
  Sparkles, 
  ChevronDown,
  Wand2,
  Loader2,
  Image as ImageIcon,
  Percent,
  Layout, 
  Eye,
  ShieldCheck, 
  Flame,
  CheckCircle2,
  ArrowLeft, 
  Users,
  Save,
  LayoutDashboard,
  FileText,
  TrendingUp,
  Settings,
  LogOut,
  Search,
  Bell,
  DollarSign,
  Clock,
  AlertTriangle,
  Zap,
  Menu,
  X,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  LifeBuoy,
  Camera,
  PlusCircle,
  LayoutList,
  User,
  List,
  Package,
  MapPin,
  Phone,
  Mail,
  Globe,
  ChevronUp,
  Palette,
  Upload,
} from "lucide-react";
import { baseUrl } from "../utils/apiConstant.js";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// --- MOCK DATA ---
const mockStats = [
  {
    title: "Total Revenue (YTD)",
    value: "$124,500",
    icon: DollarSign,
    color: "text-green-600",
    bgColor: "bg-green-100",
    change: "+12.5%",
    trend: "up",
  },
  {
    title: "Pending Payments",
    value: "$14,800",
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    change: "3 Invoices",
    trend: "neutral",
  },
  {
    title: "Overdue Invoices",
    value: "$3,200",
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-100",
    change: "-5.1%",
    trend: "down",
  },
  {
    title: "AI Predicted Cashflow",
    value: "$145,000",
    icon: TrendingUp,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    change: "High Confidence",
    trend: "up",
  },
];

const mockInvoices = [
  {
    id: 9025,
    client: "Acme Corp",
    amount: "$5,200",
    status: "Paid",
    date: "Oct 24",
    due: "Nov 24",
    items: 2,
  },
  {
    id: 9024,
    client: "Apex Solutions",
    amount: "$9,600",
    status: "Pending",
    date: "Oct 23",
    due: "Nov 23",
    items: 5,
  },
  {
    id: 9023,
    client: "Global Tech",
    amount: "$3,200",
    status: "Overdue",
    date: "Oct 20",
    due: "Nov 20",
    items: 1,
  },
  {
    id: 9022,
    client: "Innovate LLC",
    amount: "$1,800",
    status: "Paid",
    date: "Oct 19",
    due: "Nov 19",
    items: 3,
  },
  {
    id: 9021,
    client: "Future Hub",
    amount: "$2,500",
    status: "Pending",
    date: "Oct 18",
    due: "Nov 18",
    items: 4,
  },
  {
    id: 9020,
    client: "Quantum Dynamics",
    amount: "$12,100",
    status: "Paid",
    date: "Oct 17",
    due: "Nov 17",
    items: 2,
  },
];

const mockClients = [
  {
    id: 1,
    name: "Acme Corp",
    email: "contact@acme.com",
    phone: "555-1234",
    address: "123 Main St, Anytown",
  },
  {
    id: 2,
    name: "Apex Solutions",
    email: "info@apex.net",
    phone: "555-5678",
    address: "456 Oak Ave, Big City",
  },
  {
    id: 3,
    name: "Global Tech",
    email: "support@global.org",
    phone: "555-9012",
    address: "789 Pine Ln, Smallville",
  },
  {
    id: 4,
    name: "Innovate LLC",
    email: "sales@innovate.co",
    phone: "555-3456",
    address: "101 Elm Blvd, Tech Hub",
  },
];

const chartData = [
  { month: "Jan", revenue: 100, cashflow: 85 },
  { month: "Feb", revenue: 115, cashflow: 90 },
  { month: "Mar", revenue: 105, cashflow: 95 },
  { month: "Apr", revenue: 130, cashflow: 110 },
  { month: "May", revenue: 150, cashflow: 125 },
  { month: "Jun", revenue: 140, cashflow: 130 },
  { month: "Jul", revenue: 165, cashflow: 155 },
  { month: "Aug", revenue: 170, cashflow: 160 },
];

// --- UTILITY COMPONENTS ---

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  change,
  trend,
}) => {
  const TrendIcon =
    trend === "up" ? ArrowUp : trend === "down" ? ArrowDown : null;
  const trendColor =
    trend === "up"
      ? "text-green-500"
      : trend === "down"
      ? "text-red-500"
      : "text-gray-500";

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg transition hover:shadow-xl hover:scale-[1.01] duration-300 ease-in-out">
      <div className="flex items-center justify-between">
        <p className="text-gray-500 font-medium text-sm">{title}</p>
        <div className={`p-2 rounded-full ${bgColor}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
      <h2 className="text-3xl font-bold text-black mt-4">{value}</h2>
      <div className="flex items-center mt-3 text-sm">
        {TrendIcon && <TrendIcon className={`w-4 h-4 mr-1 ${trendColor}`} />}
        <span className={`${trendColor} font-semibold`}>{change}</span>
        <span className="text-gray-400 ml-2">
          {title.includes("YTD") ? "since last month" : ""}
        </span>
      </div>
    </div>
  );
};

const ResponsiveBarChart = ({ data, title }) => {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const chartHeight = 250;
  const horizontalPadding = 40; // Space for the Y-axis labels
  const verticalPadding = 20;

  const effectiveHeight = chartHeight - 2 * verticalPadding;
  const effectiveWidth = containerWidth - horizontalPadding;
  const barWidth = 12; // Fixed bar width for aesthetics

  const handleResize = useCallback(() => {
    if (containerRef.current) {
      // Ensure minimum width for readability
      setContainerWidth(Math.max(containerRef.current.offsetWidth, 300));
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  if (containerWidth === 0) {
    return (
      <div
        ref={containerRef}
        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg h-[350px] flex items-center justify-center"
      >
        Loading Chart...
      </div>
    );
  }

  const allValues = data.flatMap((d) => [d.revenue, d.cashflow]);
  const maxVal = Math.max(...allValues) || 100;
  const minVal = 0; // Bar charts typically start at 0

  const range = maxVal - minVal;

  // Function to calculate the Y position and height of a bar
  const getBarMetrics = (value) => {
    if (range === 0) return { y: effectiveHeight + verticalPadding, height: 0 };

    const normalizedHeight = (value - minVal) / range;
    const height = normalizedHeight * effectiveHeight;
    const y = effectiveHeight + verticalPadding - height;
    return { y, height };
  };

  // Calculate X position for the center of each group of bars
  const getXCenter = (index) => {
    const step = effectiveWidth / data.length;
    // Start from the middle of the first segment
    return index * step + step / 2 + horizontalPadding;
  };

  const Y_MAX_VAL = maxVal.toFixed(0);
  const Y_MID_VAL = (maxVal / 2).toFixed(1);
  const Y_MIN_VAL = 0;

  const Y_MAX_POS = verticalPadding;
  const Y_MID_POS = chartHeight / 2;
  const Y_MIN_POS = chartHeight - verticalPadding;

  // Total width used by a bar group (2 bars + spacing)
  const barGroupWidth = barWidth * 2 + 6;

  return (
    <div
      ref={containerRef}
      className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg"
    >
      <h3 className="text-xl font-bold text-black mb-6">{title}</h3>

      <div className="relative" style={{ height: `${chartHeight}px` }}>
        {/* Y-Axis Labels (Text only - positioned absolutely) */}
        <div className="absolute left-0 top-0 h-full pointer-events-none text-xs text-gray-500 z-10">
          {/* Max Label */}
          <div
            className="absolute left-0 pr-1"
            style={{ top: `${Y_MAX_POS}px`, transform: "translateY(-50%)" }}
          >
            {Y_MAX_VAL}
          </div>

          {/* Mid Label */}
          <div
            className="absolute left-0 pr-1"
            style={{ top: `${Y_MID_POS}px`, transform: "translateY(-50%)" }}
          >
            {Y_MID_VAL}
          </div>

          {/* Min Label */}
          <div
            className="absolute left-0 pr-1"
            style={{ top: `${Y_MIN_POS}px`, transform: "translateY(-50%)" }}
          >
            {Y_MIN_VAL}
          </div>
        </div>

        {/* SVG Chart Area (Contains Bars and Grid Lines) */}
        <svg width="100%" height={chartHeight} style={{ overflow: "visible" }}>
          {/* Grid Lines (Now correctly inside the SVG) */}
          <g className="text-gray-200">
            {/* Max Line */}
            <line
              x1={horizontalPadding}
              y1={Y_MAX_POS}
              x2={containerWidth}
              y2={Y_MAX_POS}
              stroke="#E5E7EB"
              strokeDasharray="3 3"
            />
            {/* Mid Line */}
            <line
              x1={horizontalPadding}
              y1={Y_MID_POS}
              x2={containerWidth}
              y2={Y_MID_POS}
              stroke="#E5E7EB"
              strokeDasharray="3 3"
            />
            {/* Base Line */}
            <line
              x1={horizontalPadding}
              y1={Y_MIN_POS}
              x2={containerWidth}
              y2={Y_MIN_POS}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          </g>

          {/* Bars */}
          {data.map((d, index) => {
            const xCenter = getXCenter(index);

            // Revenue Bar
            const revenueMetrics = getBarMetrics(d.revenue);
            const revenueX = xCenter - barGroupWidth / 2;

            // Cashflow Bar
            const cashflowMetrics = getBarMetrics(d.cashflow);
            const cashflowX = xCenter - barGroupWidth / 2 + barWidth + 6;

            return (
              <g key={index}>
                {/* Revenue Bar (Black) */}
                <rect
                  x={revenueX}
                  y={revenueMetrics.y}
                  width={barWidth}
                  height={revenueMetrics.height}
                  fill="black"
                  rx="3"
                  className="transition-all duration-700 ease-out origin-bottom hover:opacity-75"
                />
                {/* Cashflow Bar (Gray) */}
                <rect
                  x={cashflowX}
                  y={cashflowMetrics.y}
                  width={barWidth}
                  height={cashflowMetrics.height}
                  fill="rgb(156, 163, 175)" // Tailwind gray-400
                  rx="3"
                  className="transition-all duration-700 ease-out origin-bottom hover:opacity-75"
                />
              </g>
            );
          })}
        </svg>

        {/* X-Axis Labels */}
        <div className="absolute bottom-0 left-0 w-full flex text-xs text-gray-500 font-medium">
          {data.map((d, index) => (
            <div
              key={index}
              className="absolute text-center"
              style={{
                left: `${getXCenter(index)}px`,
                transform: "translateX(-50%)",
              }}
            >
              {d.month}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-8 mt-10 text-sm pt-4 border-t border-gray-100">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-black rounded-full mr-2"></div>
          Revenue
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
          Cashflow
        </div>
      </div>
    </div>
  );
};

// --- PAGE COMPONENTS ---

const DashboardPage = ({ setPage }) => {
  const [user, setUser] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    axios
      .get(`${baseUrl}/auth/api/me`, {
        withCredentials: true,
      })
      .then((res) => {
        console.log(res.data);
        setUser(res.data);
        console.log(user);
      })
      .catch((err) => {
        // token invalid → logout
        console.log(err);
        navigate("/login");
      });
  }, []);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-3xl font-bold text-gray-800">
          Dashboard Overview
        </h2>
        <button
          onClick={() => setPage("Create Invoice")}
          className="bg-black text-white px-6 py-3 rounded-full font-semibold flex items-center shadow-lg hover:bg-gray-800 transition transform hover:scale-[1.05] active:scale-[0.98]"
        >
          <Zap className="w-5 h-5 mr-2 fill-yellow-300 text-yellow-300" />
          New Invoice
        </button>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {mockStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts and Tables Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {/* Main Chart Area (2/3 width on md/lg screens) */}
        <div className="md:col-span-2">
          <ResponsiveBarChart
            data={chartData}
            title="Monthly Revenue & Cashflow Trend"
          />
        </div>

        {/* Recent Invoices Table (1/3 width on md/lg screens) */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg">
            <h3 className="text-xl font-bold text-black mb-6">
              Recent Invoices
            </h3>

            <ul className="space-y-4">
              {mockInvoices.slice(0, 5).map((invoice) => {
                let statusClasses = "";
                switch (invoice.status) {
                  case "Paid":
                    statusClasses = "bg-green-100 text-green-700";
                    break;
                  case "Pending":
                    statusClasses = "bg-yellow-100 text-yellow-700";
                    break;
                  case "Overdue":
                    statusClasses = "bg-red-100 text-red-700";
                    break;
                  default:
                    statusClasses = "bg-gray-100 text-gray-700";
                }

                return (
                  <li
                    key={invoice.id}
                    className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-b-0 last:pb-0 hover:bg-gray-50 p-2 rounded-lg transition duration-200 cursor-pointer"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        #{invoice.id} - {invoice.client}
                      </p>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusClasses}`}
                      >
                        {invoice.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-black">{invoice.amount}</p>
                      <p className="text-xs text-gray-500">{invoice.date}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 ml-2 cursor-pointer hover:text-black" />
                  </li>
                );
              })}
            </ul>
            <button
              onClick={() => setPage("Invoices")}
              className="w-full mt-6 text-center text-sm font-semibold text-black/80 hover:text-black transition"
            >
              View All Invoices
            </button>
          </div>
        </div>
      </div>
    </>
  );
};


const InvoicesPage = ({ setPage }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const filterRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mock Data
  const allInvoices = [
    { id: "INV-2024-001", client: "Acme Corp", amount: "$1,250.00", status: "Paid", issueDate: "2024-03-10", dueDate: "2024-03-24", items: 4 },
    { id: "INV-2024-002", client: "Global Tech", amount: "$3,400.00", status: "Pending", issueDate: "2024-03-12", dueDate: "2024-03-26", items: 2 },
    { id: "INV-2024-003", client: "Stark Ind", amount: "$850.00", status: "Overdue", issueDate: "2024-02-28", dueDate: "2024-03-14", items: 1 },
    { id: "INV-2024-004", client: "Wayne Ent", amount: "$5,000.00", status: "Paid", issueDate: "2024-03-01", dueDate: "2024-03-15", items: 8 },
    { id: "INV-2024-005", client: "Cyberdyne", amount: "$2,100.00", status: "Pending", issueDate: "2024-03-14", dueDate: "2024-03-28", items: 3 },
  ];

  const filteredInvoices = allInvoices.filter(inv => {
    const matchesSearch = inv.client.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inv.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === "All" || inv.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case "Paid": return "bg-black text-white border-black";
      case "Pending": return "bg-white text-gray-600 border-gray-200 shadow-sm";
      case "Overdue": return "bg-white text-red-600 border-red-100 shadow-sm";
      default: return "bg-gray-100 text-gray-500 border-transparent";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Paid": return <CheckCircle2 size={12} />;
      case "Pending": return <Clock size={12} />;
      case "Overdue": return <AlertCircle size={12} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] p-4 sm:p-8 md:p-10 font-sans text-slate-900 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-4xl md:text-4xl font-black tracking-tighter text-black mb-4 uppercase">
              Invoice Management
            </h2>
            <p className="text-gray-400 text-md font-medium max-w-xl leading-relaxed">
              Experience live, high-fidelity invoice blueprints. 
              Designed for modern brands that value precision and real-time tracking.
            </p>
          </motion.div>
          
          <motion.button 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            onClick={() => setPage("Create Invoice")}
            className="flex items-center gap-2 bg-black text-white px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-2xl hover:bg-zinc-800 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus size={18} />
            New Invoice
          </motion.button>
        </header>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Revenue", val: "$12,600", color: "text-black" },
            { label: "Paid Invoices", val: "24", color: "text-black" },
            { label: "Pending", val: "$5,500", color: "text-gray-400" },
            { label: "Overdue", val: "1", color: "text-red-500" },
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (i * 0.1), duration: 0.6 }}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
            >
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
              <h3 className={`text-3xl font-black tracking-tighter ${stat.color}`}>{stat.val}</h3>
            </motion.div>
          ))}
        </div>

        {/* Main Content Area */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="bg-white rounded-[2.5rem] border border-gray-200 shadow-xl shadow-black/5 overflow-hidden min-h-[500px]"
        >
          
          {/* Toolbar */}
          <div className="p-6 border-b border-gray-100 flex flex-col lg:flex-row gap-4 justify-between items-center bg-white/50 backdrop-blur-sm relative z-20">
            <div className="relative w-full lg:w-1/3">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search clients or invoice ID..." 
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl border-none text-sm font-medium focus:ring-2 focus:ring-black/10 transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-3 w-full lg:w-auto relative" ref={filterRef}>
              {/* Enhanced Filter Button */}
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-widest border ${
                  isFilterOpen || activeFilter !== "All" 
                  ? "bg-black text-white border-black" 
                  : "bg-white text-gray-600 border-gray-200 hover:border-black hover:text-black"
                }`}
              >
                <Filter size={14} /> 
                {activeFilter === "All" ? "Filter" : activeFilter}
                <ChevronDown size={14} className={`transition-transform duration-300 ${isFilterOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Animated Filter Dropdown */}
              <AnimatePresence>
                {isFilterOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-100 shadow-2xl rounded-2xl overflow-hidden z-50 p-2"
                  >
                    <p className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">Status Type</p>
                    {["All", "Paid", "Pending", "Overdue"].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setActiveFilter(status);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${
                          activeFilter === status 
                          ? "bg-gray-50 text-black" 
                          : "text-gray-500 hover:bg-gray-50 hover:text-black"
                        }`}
                      >
                        {status}
                        {activeFilter === status && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                      </button>
                    ))}
                    {activeFilter !== "All" && (
                      <button 
                        onClick={() => setActiveFilter("All")}
                        className="w-full mt-1 px-4 py-3 text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2"
                      >
                        <X size={12} /> Clear Filter
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:border-black hover:text-black transition-all uppercase tracking-widest">
                <Printer size={14} /> Print
              </button>
            </div>
          </div>

          {/* Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-left">
                  <th className="py-5 pl-10 pr-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Identifier</th>
                  <th className="py-5 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Recipient</th>
                  <th className="py-5 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Amount</th>
                  <th className="py-5 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                  <th className="py-5 px-4 pr-10 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <AnimatePresence mode="popLayout">
                  {filteredInvoices.map((invoice) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={invoice.id} 
                      className="hover:bg-gray-50/80 transition-all group"
                    >
                      <td className="py-6 pl-10 pr-4 font-bold text-sm text-gray-900 tracking-tight">{invoice.id}</td>
                      <td className="py-6 px-4 font-bold text-sm">{invoice.client}</td>
                      <td className="py-6 px-4 font-black text-sm text-center">{invoice.amount}</td>
                      <td className="py-6 px-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black border uppercase tracking-wider ${getStatusStyle(invoice.status)}`}>
                          {getStatusIcon(invoice.status)}
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-6 px-4 pr-10 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 transition-opacity">
                          <button className="p-2.5 text-gray-400 border border-gray-100 bg-white hover:border-black hover:text-black rounded-xl transition-all shadow-sm" title="View Detail">
                            <Eye size={16} />
                          </button>
                          <button className="p-2.5 text-gray-400 border border-gray-100 bg-white hover:border-black hover:text-black rounded-xl transition-all shadow-sm" title="Download PDF">
                            <Download size={16} />
                          </button>
                          <button className="p-2.5 text-red-300 border border-gray-100 bg-white hover:border-red-500 hover:text-red-500 rounded-xl transition-all shadow-sm" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Search size={40} className="text-gray-100" />
                        <p className="text-sm font-bold text-gray-400">No invoices found matching your criteria</p>
                        <button onClick={() => {setActiveFilter("All"); setSearchTerm("")}} className="text-[10px] font-black uppercase text-black underline underline-offset-4">Clear all search</button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Card View (Mobile) */}
          <div className="md:hidden p-4 space-y-4">
            {filteredInvoices.map((invoice) => (
              <motion.div layout key={invoice.id} className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-black text-lg text-gray-900 leading-tight">{invoice.client}</h3>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{invoice.id}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-tighter ${getStatusStyle(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </div>
                
                <div className="flex justify-between items-end border-t border-gray-50 pt-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-1">Grand Total</p>
                    <p className="text-2xl font-black text-gray-900 tracking-tighter">{invoice.amount}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-3 text-gray-500 border border-gray-200 rounded-xl bg-white"><Eye size={20} /></button>
                    <button className="p-3 text-gray-500 border border-gray-200 rounded-xl bg-white"><Download size={20} /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination Footer */}
          <div className="p-8 border-t border-gray-100 flex justify-between items-center bg-gray-50/30">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
              Showing {filteredInvoices.length} of {allInvoices.length} entries
            </span>
            <div className="flex gap-3">
              <button className="px-5 py-2 bg-white border border-gray-200 rounded-lg text-[10px] font-black uppercase tracking-widest disabled:opacity-30 transition-all hover:border-black" disabled>Prev</button>
              <button className="px-5 py-2 bg-white border border-gray-200 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all hover:border-black">Next</button>
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
};



const CreateInvoicePage = () => {
  const [isAiMode, setIsAiMode] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState("unpaid"); 
  const [logo, setLogo] = useState(null);
  const [showLogo, setShowLogo] = useState(true);
  const [discount, setDiscount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // New State for checkboxes
  const [sendOptions, setSendOptions] = useState({
    email: true,
    whatsapp: false,
    slack: false
  });
  
  const [formData, setFormData] = useState({
    clientName: "Select a Client",
    clientEmail: "",
    invoiceNumber: "INV-2024-001",
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  
  const [items, setItems] = useState([
    { description: "", quantity: 1, price: 0, total: 0 },
  ]);

  const savedClients = [
    { id: 1, name: "Acme Corp", email: "billing@acme.com", avatar: "AC" },
    { id: 2, name: "Global Tech Solutions", email: "accounts@globaltech.io", avatar: "GT" },
    { id: 3, name: "Stark Industries", email: "pepper@stark.com", avatar: "SI" },
    { id: 4, name: "Wayne Enterprises", email: "finance@wayne.com", avatar: "WE" },
  ];

  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  const discountAmount = subtotal * (Number(discount) / 100);
  const total = (subtotal - discountAmount).toFixed(2);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].price;
    setItems(updatedItems);
  };

  const addItem = () => setItems([...items, { description: "", quantity: 1, price: 0, total: 0 }]);
  const removeItem = (index) => items.length > 1 && setItems(items.filter((_, i) => i !== index));

  const generateWithAi = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    const apiKey = ""; 
    const systemPrompt = `Return ONLY a JSON array of invoice items for: ${aiPrompt}. Format: [{"description": "item name", "quantity": 1, "price": 100}]`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: aiPrompt }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      const result = await response.json();
      const aiItems = JSON.parse(result.candidates[0].content.parts[0].text);
      setItems(aiItems.map(i => ({ ...i, total: i.quantity * i.price })));
      setIsAiMode(false);
      setAiPrompt("");
    } catch (error) {
      console.error("AI Generation failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="  text-[#1A1A1A] p-4 sm:p-12 font-sans antialiased">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div>
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-4xl md:text-4xl font-black tracking-tighter text-black mb-4 uppercase">
            CREATE INVOICE
            </h2>
            <p className="text-gray-400 text-md font-medium max-w-xl leading-relaxed">
            Draft your professional invoice manually or with AI.
            </p>
          </motion.div>
            
          </div>
          
          {/* Animated AI Button */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gray-200 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
            <button 
              onClick={() => setIsAiMode(!isAiMode)}
              className={`relative flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 border-none outline-none focus:outline-none focus:ring-0 active:scale-95 ${
                isAiMode 
                ? 'bg-white text-black border border-gray-200 shadow-md' 
                : 'bg-black text-white shadow-xl ring-2 ring-offset-2 ring-transparent group-hover:ring-gray-200'
              }`}
            >
              <Sparkles size={16} className={isAiMode ? "" : "animate-pulse"} />
              {isAiMode ? "Exit AI Mode" : "Generate with AI"}
            </button>
          </div>
        </div>

        {/* AI PANEL */}
        {isAiMode && (
          <div className="mb-10 bg-white border border-slate-200 rounded-2xl p-6 shadow-xl shadow-slate-100 animate-in slide-in-from-top-4 duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-900" />
            <div className="flex gap-4">
              <div className="mt-1"><Wand2 size={18} className="text-slate-900" /></div>
              <div className="flex-1">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">AI Invoice Assistant</h3>
                <textarea 
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe your project items (e.g., 'A full branding package with logo, stationary, and website')..."
                  className="w-full bg-transparent border-none p-0  focus:ring-0 text-slate-900 placeholder:text-slate-300 resize-none text-lg  leading-relaxed focus:outline-0"
                  rows={2}
                />
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-50">
                  <span className="text-[10px] text-slate-300 italic font-medium">Powered by Invoice-Gen Pro</span>
                  <button 
                    disabled={isGenerating || !aiPrompt}
                    onClick={generateWithAi}
                    className="bg-slate-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2 transition-all"
                  >
                    {isGenerating ? <Loader2 className="animate-spin" size={16} /> : "Populate Items"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MAIN INVOICE FORM */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          
          {/* Top Bar: Logo & Status */}
          <div className="p-8 sm:p-12 flex flex-col sm:flex-row justify-between gap-12 border-b border-gray-50">
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Branding</span>
                <button 
                  onClick={() => setShowLogo(!showLogo)}
                  className={`w-10 h-5 rounded-full transition-colors relative border-none outline-none focus:outline-none ${showLogo ? 'bg-black' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${showLogo ? 'left-6' : 'left-1'}`} />
                </button>
              </div>

              {showLogo && (
                <div className="w-32 h-32 rounded-3xl border-2 border-dashed border-gray-100 flex items-center justify-center relative group overflow-hidden bg-gray-50/50 transition-all hover:border-black/20">
                  {logo ? (
                    <img src={logo} alt="Logo" className="w-full h-full object-contain p-4" />
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-2 text-gray-400 hover:text-black">
                      <ImageIcon size={24} />
                      <span className="text-[10px] font-bold uppercase">Logo</span>
                      <input type="file" onChange={(e) => setLogo(URL.createObjectURL(e.target.files[0]))} className="hidden" />
                    </label>
                  )}
                  {logo && (
                    <button onClick={() => setLogo(null)} className="absolute top-2 right-2 p-1.5 bg-black text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity outline-none">
                      <X size={12} />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-6">
              {/* STATUS TOGGLE - Updated to Black for "Paid" */}
              <div className="relative bg-gray-100 p-1.5 rounded-2xl flex items-center w-48">
                <div 
                  className={`absolute h-[calc(100%-12px)] w-[calc(50%-6px)] rounded-xl transition-all duration-300 ease-out shadow-sm ${
                    status === 'unpaid' ? 'left-1.5 bg-white' : 'left-[calc(50%+3px)] bg-black'
                  }`}
                />
                <button 
                  onClick={() => setStatus("unpaid")}
                  className={`relative z-10 flex-1 py-2 text-[10px] font-black uppercase border-none outline-none transition-colors ${status === 'unpaid' ? 'text-gray-900' : 'text-gray-400'}`}
                >
                  Unpaid
                </button>
                <button 
                  onClick={() => setStatus("paid")}
                  className={`relative z-10 flex-1 py-2 text-[10px] font-black uppercase border-none outline-none transition-colors ${status === 'paid' ? 'text-white' : 'text-gray-400'}`}
                >
                  Paid
                </button>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Issue Date</p>
                <input 
                  type="date" 
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  className="bg-transparent text-lg font-bold text-right outline-none hover:text-black border-none transition-colors p-0 focus:ring-0"
                />
              </div>
            </div>
          </div>

          {/* Client Selection - Redesigned Card Dropdown */}
          <div className="p-8 sm:p-12 border-b border-gray-50">
            <div className="space-y-4 max-w-lg">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <User size={12} /> Billed To
              </label>
              
              <div className="relative group/dropdown">
                {/* Trigger Button */}
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full flex items-center tracking-tighter justify-between text-3xl font-light py-4 border-b-2 transition-all duration-300 border-none outline-none focus:outline-none ${
                    isDropdownOpen ? 'text-black' : 'text--900'
                  }`}
                >
                  <div className="flex items-center gap-4 text-2xl uppercase font-bold" >
                    {formData.clientName !== "Select a Client" && (
                      <div className="h-10 w-10 rounded-xl bg-black flex items-center justify-center text-xs text-white font-bold shadow-lg shadow-black/20">
                        {formData.clientName.substring(0, 1)}
                      </div>
                    )}
                    <span className={formData.clientName === "Select a Client" ? "text-gray-900" : "text-black font-bold tracking-tight"}>
                      {formData.clientName}
                    </span>
                  </div>
                  <ChevronDown size={24} className={`text-gray-300 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-black' : ''}`} />
                </button>

                {/* Dropdown Menu - Card Style */}
                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                    <div className="absolute top-full left-0 w-full sm:w-[480px] mt-6 bg-white border border-gray-100 rounded-3xl shadow-[0_40px_80px_rgba(0,0,0,0.1)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      
                      {/* Search Header */}
                      <div className="p-4 border-b border-gray-50 bg-gray-50/30 backdrop-blur-sm sticky top-0">
                        <div className="relative">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <input 
                            type="text" 
                            placeholder="Search clients..." 
                            className="w-full bg-white border-none rounded-xl pl-12 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-black/5 placeholder:text-gray-300"
                            autoFocus
                          />
                        </div>
                      </div>

                      {/* Client List */}
                      <div className="max-h-[320px] overflow-y-auto p-2 custom-scrollbar space-y-1">
                        {savedClients.map(client => (
                          <div 
                            key={client.id}
                            onClick={() => {
                              setFormData({...formData, clientName: client.name, clientEmail: client.email});
                              setIsDropdownOpen(false);
                            }}
                            className={`group p-4 rounded-2xl cursor-pointer flex justify-between items-center transition-all duration-200 border border-transparent ${
                              formData.clientName === client.name 
                                ? 'bg-black text-white shadow-lg scale-[0.98]' 
                                : 'hover:bg-gray-50 hover:border-gray-100'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xs font-bold transition-colors ${
                                formData.clientName === client.name 
                                  ? 'bg-white/20 text-white' 
                                  : 'bg-gray-100 text-gray-500 group-hover:bg-white group-hover:shadow-sm'
                              }`}>
                                {client.avatar}
                              </div>
                              <div>
                                <p className="text-sm font-bold tracking-tight">{client.name}</p>
                                <p className={`text-[11px] font-medium ${
                                  formData.clientName === client.name ? 'text-gray-400' : 'text-gray-400'
                                }`}>{client.email}</p>
                              </div>
                            </div>
                            {formData.clientName === client.name && (
                              <div className="bg-white/20 p-1.5 rounded-full">
                                <Check size={14} className="text-white" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* Footer Action */}
                      <div className="p-3 border-t border-gray-50 bg-gray-50/50">
                        <button className="w-full py-3 rounded-xl border border-dashed border-gray-300 text-xs font-bold text-gray-400 hover:text-black hover:border-black transition-all uppercase tracking-widest flex items-center justify-center gap-2">
                          <Plus size={14} /> Create New Client
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <p className="text-sm text-slate-400 font-medium pl-1">{formData.clientEmail}</p>
            </div>
          </div>

          {/* Table Items */}
          <div>
            <div className="px-8 py-4 bg-gray-50/50 flex text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              <div className="flex-grow">Item Description</div>
              <div className="w-20 text-center px-4">Qty</div>
              <div className="w-28 text-right px-4">Price</div>
              <div className="w-28 text-right">Total</div>
              <div className="w-12"></div>
            </div>
            
            <div className="divide-y divide-gray-50">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center px-8 py-6 group hover:bg-gray-50/30 transition-colors">
                  <div className="flex-grow">
                    <input 
                      type="text" 
                      placeholder="Item Description"
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      className="w-full bg-transparent border-none p-0 text-base font-bold focus:ring-0 outline-0 placeholder:text-gray-400 text-gray-900"
                    />
                  </div>
                  <div className="w-20 px-4">
                    <input 
                      type="number" 
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      className="w-full bg-transparent border-none p-0 text-center text-base font-bold focus:ring-0 outline-0"
                    />
                  </div>
                  <div className="w-28 px-4">
                    <input 
                      type="number" 
                      value={item.price}
                      onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                      className="w-full bg-transparent border-none p-0 text-right text-base font-bold focus:ring-0 outline-0"
                    />
                  </div>
                  <div className="w-28 text-right text-base font-black">
                    ${item.total.toLocaleString()}
                  </div>
                  <div className="w-12 text-right">
                    <button 
                      onClick={() => removeItem(idx)}
                      className="text-gray-200 hover:text-black transition-colors outline-none"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={addItem}
              className="w-full py-6 text-[10px] font-black text-gray-400 hover:text-black transition-all uppercase tracking-widest flex items-center justify-center gap-2 border-t border-gray-50 bg-white hover:bg-gray-50 outline-none"
            >
              <Plus size={14} /> Add Line Item
            </button>
          </div>

          {/* Totals & Actions */}
          <div className="p-8 sm:p-12 bg-gray-50/20">
            <div className="flex flex-col md:flex-row justify-between items-start gap-12">
              
              {/* Left Side: Discount & Send Options */}
              <div className="flex-1 w-full max-w-sm space-y-8">
                {/* Discount */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Percent size={12} /> Apply Discount (%)
                  </label>
                  <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all focus-within:border-black">
                    <input 
                      type="number" 
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="w-full bg-transparent border-none p-0 text-lg font-black focus:ring-0 outline-0"
                      placeholder="0"
                    />
                    <span className="text-gray-300 font-bold">%</span>
                  </div>
                </div>

                {/* New Send Options */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Send size={12} /> Send via
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {/* Email Option */}
                    <button 
                      onClick={() => setSendOptions({...sendOptions, email: !sendOptions.email})}
                      className={`flex items-center gap-3 px-5 py-3 rounded-xl border transition-all duration-200 outline-none ${
                        sendOptions.email 
                        ? 'bg-black text-white border-black shadow-lg' 
                        : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <Mail size={16} />
                      <span className="text-xs font-bold uppercase tracking-wide">Email</span>
                      {sendOptions.email && <CheckCircle2 size={14} className="ml-1 text-white" />}
                    </button>

                    {/* WhatsApp Option */}
                    <button 
                      onClick={() => setSendOptions({...sendOptions, whatsapp: !sendOptions.whatsapp})}
                      className={`flex items-center gap-3 px-5 py-3 rounded-xl border transition-all duration-200 outline-none ${
                        sendOptions.whatsapp 
                        ? 'bg-black text-white border-black shadow-lg' 
                        : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <MessageCircle size={16} />
                      <span className="text-xs font-bold uppercase tracking-wide">WhatsApp</span>
                      {sendOptions.whatsapp && <CheckCircle2 size={14} className="ml-1 text-white" />}
                    </button>

                    {/* Slack Option
                    <button 
                      onClick={() => setSendOptions({...sendOptions, slack: !sendOptions.slack})}
                      className={`flex items-center gap-3 px-5 py-3 rounded-xl border transition-all duration-200 outline-none ${
                        sendOptions.slack 
                        ? 'bg-black text-white border-black shadow-lg' 
                        : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <slack size={16} />
                      <span className="text-xs font-bold uppercase tracking-wide">Slack</span>
                      {sendOptions.slack && <CheckCircle2 size={14} className="ml-1 text-white" />}
                    </button> */}
                  </div>
                </div>
              </div>

              {/* Right Side: Totals */}
              <div className="w-full md:w-80 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-bold uppercase tracking-tighter">Subtotal</span>
                  <span className="font-black text-gray-900">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-bold uppercase tracking-tighter">Discount</span>
                  <span className="font-black text-red-500">-${discountAmount.toLocaleString()}</span>
                </div>
                <div className="pt-6 border-t-2 border-black flex justify-between items-end">
                  <span className="font-black text-gray-400 uppercase text-[10px] tracking-widest mb-1">Final Total</span>
                  <span className="font-black text-4xl text-black tracking-tighter">${total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-end gap-6 pt-4">
          <button className="text-[10px] font-black text-gray-400 hover:text-black transition-colors uppercase tracking-[0.2em] outline-none">
            Discard Draft
          </button>
          <button className="bg-black text-white px-10 py-5 rounded-2xl text-[11px] font-black shadow-2xl hover:bg-gray-900 transition-all flex items-center gap-3 uppercase tracking-[0.2em] outline-none active:scale-95">
            Generate & Send <CheckCircle2 size={16} />
          </button>
        </div>

      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f9fafb;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};




const ClientsPage = () => {
  // State to manage view: 'list' or 'form'
  const [isAddingClient, setIsAddingClient] = useState(false);
  
  // Clients Data State
  const [clients, setClients] = useState([
    { id: 1, name: "Arjun Sharma", email: "arjun@example.com", phone: "+91 98765 43210", address: "Mumbai, Maharashtra" },
    { id: 2, name: "Sara Khan", email: "sara.k@org.com", phone: "+91 88822 11100", address: "Bangalore, Karnataka" },
    { id: 3, name: "Rahul Verma", email: "rahul.v@tech.in", phone: "+91 77733 44455", address: "Delhi, NCR" },
  ]);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Save Client and switch view
  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert("Please fill the required fields!");
      return;
    }
    
    const newClient = {
      ...formData,
      id: Date.now(),
    };

    setClients([newClient, ...clients]);
    setFormData({ name: "", email: "", phone: "", address: "" }); // Reset form
    setIsAddingClient(false); // Switch back to list view
  };

  return (
    <div className="min-h-screen bg-[#fafafa] p-6 md:p-12 font-sans text-black">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }} className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <motion.div>
            <h1 className="text-4xl font-black tracking-tighter">CLIENT DIRECTORY</h1>
            <p className="text-gray-500 font-medium">Manage and organize your client database.</p>
          </motion.div>
          
          {!isAddingClient && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsAddingClient(true)}
              className="bg-black text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl hover:bg-gray-800 transition-all"
            >
              <PlusCircle size={20} />
              NEW CLIENT
            </motion.button>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {isAddingClient ? (
            /* --- ADD CLIENT FORM VIEW --- */
            <motion.div
              key="add-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white border border-gray-200 rounded-3xl p-8 md:p-12 shadow-sm max-w-3xl mx-auto"
            >
              <button 
                onClick={() => setIsAddingClient(false)}
                className="flex items-center gap-2 text-gray-400 hover:text-black mb-8 font-bold text-xs tracking-widest transition-colors"
              >
                <ArrowLeft size={16} /> BACK TO DIRECTORY
              </button>

              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <Users className="text-gray-400" /> Client Details
              </h2>

              <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Client Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={18} />
                    <input 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      type="text" 
                      placeholder="Full Name" 
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-black focus:bg-white transition-all" 
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={18} />
                    <input 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      type="email" 
                      placeholder="email@company.com" 
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-black focus:bg-white transition-all" 
                    />
                  </div>
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={18} />
                    <input 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      type="text" 
                      placeholder="+91 00000 00000" 
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-black focus:bg-white transition-all" 
                    />
                  </div>
                </div>

                {/* Address Field */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Location / Address</label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={18} />
                    <input 
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      type="text" 
                      placeholder="City, State" 
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-black focus:bg-white transition-all" 
                    />
                  </div>
                </div>

                <div className="md:col-span-2 pt-6">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    className="w-full bg-black text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:bg-gray-800 transition-all"
                  >
                    <Save size={18} />
                    SAVE CLIENT DATA
                  </motion.button>
                </div>
              </form>
            </motion.div>
          ) : (
            /* --- CLIENT LIST VIEW --- */
            <motion.div
              key="client-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {clients.map((client) => (
                <motion.div
                  key={client.id}
                  layoutId={client.id}
                  whileHover={{ y: -5 }}
                  className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors duration-300">
                      <User size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black truncate">{client.name}</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Verified Client</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <Mail size={16} className="text-gray-300" />
                      {client.email}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <Phone size={16} className="text-gray-300" />
                      {client.phone}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <MapPin size={16} className="text-gray-300" />
                      {client.address}
                    </div>
                  </div>

                  <div className="mt-8 pt-5 border-t border-gray-50 flex justify-between items-center">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white" />
                      <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white" />
                    </div>
                    <span className="text-[10px] font-black bg-gray-50 px-3 py-1 rounded-full text-gray-400">STATUS: ACTIVE</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};



const InvoiceTemplatesPage = () => {
  const mockTemplates = [
    { 
      name: "Modern Minimalist", 
      color: "bg-black", 
      textColor: "text-black", 
      tag: "Popular",
      stats: { time: "2m", fields: "Basic", geo: "Global" },
      icon: <Layout size={20} />
    },
    { 
      name: "Corporate Blue", 
      color: "bg-blue-600", 
      textColor: "text-blue-600", 
      tag: "Enterprise",
      stats: { time: "5m", fields: "Advanced", geo: "Multi-Tax" },
      icon: <ShieldCheck size={20} />
    },
    { 
      name: "Freelancer Classic", 
      color: "bg-emerald-600", 
      textColor: "text-emerald-600", 
      tag: "Trending",
      stats: { time: "3m", fields: "Standard", geo: "Local" },
      icon: <Flame size={20} />
    },
    { 
      name: "Artisanal Light", 
      color: "bg-orange-500", 
      textColor: "text-orange-500", 
      tag: "New",
      stats: { time: "4m", fields: "Custom", geo: "Global" },
      icon: <Zap size={20} />
    },
  ];

  return (
    <div className="min-h-screen p-6 md:p-16 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-4xl md:text-4xl font-black tracking-tighter text-black mb-4 uppercase">
              Template Gallery
            </h2>
            <p className="text-gray-400 text-md font-medium max-w-xl leading-relaxed">
              Experience live, high-fidelity invoice blueprints. 
              Designed for modern brands that value precision.
            </p>
          </motion.div>
        </header>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {mockTemplates.map((template, index) => (
            <motion.div
              key={template.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.8 }}
              whileHover={{ y: -10 }}
              className="group relative"
            >
              {/* Template Card Preview */}
              <div className="relative aspect-[3/4.2] bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden transition-all duration-500 group-hover:shadow-2xl group-hover:border-black/5">
                
                {/* Abstract Preview Mockup */}
                <div className="p-8 h-full flex flex-col justify-between relative z-10">
                  <div className="flex justify-between items-start">
                    {/* Floating Icon Animation */}
                    <motion.div 
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className={`w-12 h-12 rounded-2xl ${template.color} flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-500`}
                    >
                      {template.icon}
                    </motion.div>
                    
                    <div className="text-right space-y-2">
                      <motion.span 
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-[9px] font-black bg-gray-50 text-gray-400 px-2 py-1 rounded-full uppercase tracking-tighter inline-block"
                      >
                        {template.tag}
                      </motion.span>
                      <div className="flex gap-1 justify-end">
                        <div className="h-1 w-6 bg-gray-100 rounded-full" />
                        <div className="h-1 w-3 bg-gray-200 rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Body Content Details with Live Progress */}
                  <div className="flex-grow flex flex-col justify-center space-y-5">
                    <div className="space-y-3">
                      <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden relative">
                        {/* Live Loading Bar */}
                        <motion.div 
                          animate={{ x: ["-100%", "300%"] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          className={`absolute inset-0 w-1/4 ${template.color} opacity-20 blur-sm`}
                        />
                        <div className={`h-full w-1/3 ${template.color} opacity-10`} />
                      </div>
                      <div className="h-2 w-3/4 bg-gray-50 rounded-full" />
                      <div className="h-2 w-1/2 bg-gray-50 rounded-full" />
                    </div>

                    {/* Feature Chips */}
                    <div className="flex flex-wrap gap-2 pt-2">
                       <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 bg-gray-50/50 border border-gray-100 px-2.5 py-1.5 rounded-xl transition-colors group-hover:bg-white">
                          <Clock size={10} className="text-gray-300" /> {template.stats.time}
                       </div>
                       <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 bg-gray-50/50 border border-gray-100 px-2.5 py-1.5 rounded-xl transition-colors group-hover:bg-white">
                          <Globe size={10} className="text-gray-300" /> {template.stats.geo}
                       </div>
                    </div>
                  </div>

                  {/* Footer of Card */}
                  <div className="pt-6 border-t border-gray-50 flex justify-between items-end">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-gray-300 font-bold mb-1">Invoice Total</div>
                      <motion.div 
                        initial={{ opacity: 0.8 }}
                        whileInView={{ opacity: 1 }}
                        className="text-2xl font-black text-black tracking-tight"
                      >
                        $2,450.00
                      </motion.div>
                    </div>
                    {/* Pulsing Status Icon */}
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <CheckCircle2 className={`${template.textColor}`} size={24} />
                    </motion.div>
                  </div>
                </div>

                {/* Hover Overlay - Centered and Non-Overlapping */}
                <div className="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center p-6 text-center">
                  {/* Backdrop Blur Layer */}
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-md" />
                  
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    className="relative z-30 w-full space-y-3"
                  >
                    <button className="w-full bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-2xl hover:bg-gray-800 transition-all active:scale-95">
                      SELECT THEME <ChevronRight size={18} />
                    </button>
                    <p className="mt-2 text-[10px] text-gray-500 font-bold tracking-widest uppercase">Apply to Workspace</p>
                  </motion.div>
                </div>
              </div>

              {/* Label & Static Details */}
              <div className="mt-6 px-3 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-black group-hover:text-gray-600 transition-colors tracking-tight">
                    {template.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                       <FileText size={12} /> {template.stats.fields} Layout
                    </div>
                  </div>
                  {/* Additional External Preview Button */}
                  <motion.button 
                    whileHover={{ x: 5 }}
                    className="mt-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                  >
                    Live Preview <ChevronRight size={14} />
                  </motion.button>
                </div>
                {/* Interaction Button (Static) */}
                <motion.div 
                  whileHover={{ rotate: 90 }}
                  className={`p-2.5 rounded-2xl bg-gray-50 ${template.textColor} group-hover:bg-black group-hover:text-white transition-all duration-300 cursor-pointer`}
                >
                  <Palette size={20} />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Action */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="mt-24 text-center pb-12"
        >
          <div className="h-px w-20 bg-gray-100 mx-auto mb-8" />
          <button className="inline-flex items-center gap-3 text-gray-400 hover:text-black font-bold text-xs tracking-[0.2em] transition-all group">
            <PlusCircle size={18} className="group-hover:rotate-180 transition-transform duration-700" />
            REQUEST CUSTOM BLUEPRINT
          </button>
        </motion.div>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    axios
      .get(`${baseUrl}/auth/api/me`, {
        withCredentials: true,
      })
      .then((res) => {
        console.log("API DATA:", res.data);
        setUserData(res.data);
        console.log("userdata", userData);
      })
      .catch((err) => {
        console.log("Error:", err);
      });
  }, []);

  useEffect(() => {
    console.log("UPDATED STATE:", userData);
  }, [userData]);
       
      const [newName, setNewName] = useState(userData?.name || "")
      const [newPassword, setNewPassword] = useState("")
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg min-h-[70vh]">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">
        User Profile & Account
      </h2>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Profile Picture and Membership */}
        <div className="w-full lg:w-1/3 flex flex-col items-center p-6 bg-gray-50 rounded-xl border border-gray-100">
          <div className="relative group">
            <img
              src={
                userData?.profilePhoto
                  ? userData.profilePhoto
                  : `https://placehold.co/100x100/000000/FFFFFF?text=${userData?.name[0].toUpperCase()}`
              }
              alt="User Avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg group-hover:opacity-90 transition"
            />
            {/* Loading Overlay */}
            {userData?.uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          <h3 className="text-2xl font-bold text-black mt-4">
            {userData?.name}
          </h3>
          <p className="text-sm text-gray-500">{userData?.email}</p>

          <div className="mt-6 p-3 bg-black text-white rounded-full font-semibold text-sm w-fit">
            Membership Plan (
            {userData?.subscriptionPlan})
          </div>

          <div className="mt-6 w-full flex flex-col items-center">
             <label htmlFor="file-upload" className="flex items-center gap-2 bg-white text-black border border-gray-300 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-50 transition shadow-sm hover:shadow-md">
                <Camera className="w-4 h-4" /> 
                <span className="text-sm font-medium">Change Photo</span>
             </label>
             <input 
                id="file-upload" 
                type="file" 
                className="hidden" 
                onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                        setUserData(prev => ({ ...prev, selectedFile: file }));
                    }
                }}
             />
             
             {userData?.selectedFile && (
                <div className="mt-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                     <span className="text-xs text-gray-500 max-w-[150px] truncate">
                        {userData.selectedFile.name}
                     </span>
                     <button 
                        onClick={async () => {
                            if (!userData.selectedFile) return;
                            
                            setUserData(prev => ({ ...prev, uploading: true }));
                            const formData = new FormData();
                            formData.append("avatar", userData.selectedFile); 

                            try {
                                const res = await axios.post(`${baseUrl}/auth/uploadProfilePhoto`, formData, {
                                    headers: { "Content-Type": "multipart/form-data" },
                                    withCredentials: true 
                                });
                                console.log("Upload success", res.data);
                                // Refresh user data to show new image
                                const meRes = await axios.get(`${baseUrl}/auth/api/me`, { withCredentials: true });
                                setUserData(meRes.data);
                                alert("Profile photo updated!");
                            } catch (error) {
                                console.log("Upload failed", error);
                                alert("Failed to upload photo.");
                                setUserData(prev => ({ ...prev, uploading: false }));
                            }
                        }}
                        className="bg-black text-white px-3 py-1.5 rounded-full text-xs font-bold hover:bg-gray-800 transition flex items-center gap-1"
                        disabled={userData?.uploading}
                     >
                        {userData?.uploading ? (
                             "Uploading..." 
                        ) : (
                            <>
                              <Upload className="w-3 h-3" /> Upload
                            </>
                        )}
                     </button>
                     <button 
                        onClick={() => setUserData(prev => ({ ...prev, selectedFile: null }))}
                        className="text-gray-400 hover:text-red-500 transition"
                     >
                        <X className="w-4 h-4" />
                     </button>
                </div>
             )}
          </div>
        </div>

        {/* Account Details Form */}
        <div className="w-full lg:w-2/3">
          <h3 className="text-xl font-semibold text-black border-b pb-2 mb-4">
            Personal Details
          </h3>
          <form className="space-y-4">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User Name
              </label>
              <input
                type="text"
                defaultValue={userData?.name}
                onChange={(e)=>setNewName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                defaultValue={userData?.email}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
              />
            </div>

            <h3 className="text-xl font-semibold text-black border-b pb-2 pt-4 mb-4">
              Security
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                defaultValue={userData?.password}
                onChange={(e)=>setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition"
              />
              <p className="text-xs text-gray-500 mt-1">
                Change your password for enhanced security.
              </p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="bg-black text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-gray-800 transition"
                onClick={async()=>{
                    try {
                        const res = await axios.post(`${baseUrl}/auth/updateProfile`,{
                            newName,
                            newPassword,
                           email: userData?.email
                        })
                    } catch (error) {
                        console.log(error);
                    }
                }}
              >
                Update Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const SettingsPage = () => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg min-h-[70vh]">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Application Settings
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* General Settings */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-black border-b pb-2 mb-4">
            General
          </h3>
          <SettingItem
            title="Business Name"
            value="InvoicePro LLC"
            type="text"
          />
          <SettingItem
            title="Default Currency"
            value="USD"
            type="select"
            options={["USD", "EUR", "GBP"]}
          />
          <SettingItem title="Timezone" value="EST" type="text" />
          <SettingItem
            title="Enable Notifications"
            value={true}
            type="toggle"
          />
        </div>

        {/* Profile & Security */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-black border-b pb-2 mb-4">
            Invoicing Defaults
          </h3>
          <SettingItem
            title="Default Payment Terms"
            value="Net 30"
            type="text"
          />
          <SettingItem title="Default Tax Rate (%)" value="0" type="number" />
          <SettingItem
            title="Default Footer Message"
            value="Thank you for your business!"
            type="textarea"
          />
          <button className="w-full bg-black text-white px-4 py-2 mt-4 rounded-lg hover:bg-gray-800 transition">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const SettingItem = ({ title, value, type, options }) => {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
      <span className="text-gray-700 font-medium">{title}</span>
      <div className="w-1/2">
        {type === "text" && (
          <input
            type="text"
            defaultValue={value}
            className="w-full text-right p-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition"
          />
        )}
        {type === "number" && (
          <input
            type="number"
            defaultValue={value}
            className="w-full text-right p-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition"
          />
        )}
        {type === "select" && (
          <select
            defaultValue={value}
            className="w-full text-right p-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition appearance-none"
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )}
        {type === "toggle" && (
          <label className="flex justify-end items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                defaultChecked={value}
                className="sr-only peer"
              />
              <div className="block bg-gray-200 w-14 h-8 rounded-full peer-checked:bg-black transition duration-300"></div>
              <div className="absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform peer-checked:translate-x-6 duration-300"></div>
            </div>
          </label>
        )}
        {type === "textarea" && (
          <textarea
            defaultValue={value}
            rows="2"
            className="w-full text-right p-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition"
          />
        )}
      </div>
    </div>
  );
};
  
// support componet
const SupportPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState(0); // Default first open

  const faqs = [
    { question: "How does the AI invoice generation work?", answer: "Our AI assistant uses advanced models to parse your natural language descriptions into structured line items. Simply describe the project scope, and it calculates quantities and prices automatically." },
    { question: "Can I change the invoice branding?", answer: "Yes. You can upload your own logo, toggle its visibility, and even customize the status labels to match your brand identity directly from the invoice creation page." },
    { question: "What payment methods are supported?", answer: "Currently, we support Stripe and PayPal integrations. You can configure your payment gateways in the Settings tab to accept payments directly via the invoice link." },
    { question: "How do I export to PDF?", answer: "Once your invoice is finalized, click the 'Process Invoice' button. You will see an option to download the document as a high-resolution PDF." },
  ];

  const categories = [
    { icon: <FileText size={24} />, title: "Billing & Invoices", desc: "Manage payments and history" },
    { icon: <User size={24} />, title: "Account Settings", desc: "Profile, security, and preferences" },
    { icon: <HelpCircle size={24} />, title: "Technical Support", desc: "Troubleshooting bugs and API" },
  ];

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1A1A1A] p-6 sm:p-12 font-sans antialiased selection:bg-slate-100">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* Header & Search */}
        <header className="text-center space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-slate-900">
              Support Center
            </h1>
            <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto">
              Search our knowledge base or get in touch with our expert support team.
            </p>
          </div>

          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
            </div>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for articles (e.g. 'Payment failed')"
              className="w-full pl-14 pr-6 py-5 rounded-full bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus:outline-none focus:ring-0 focus:border-slate-900 transition-all text-base placeholder:text-slate-400 font-medium"
            />
          </div>
        </header>

        {/* Quick Categories */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          {categories.map((cat, idx) => (
            <button 
              key={idx}
              className="flex flex-col items-center text-center p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 hover:-translate-y-1 transition-all duration-300 group outline-none"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-300">
                {cat.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">{cat.title}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{cat.desc}</p>
            </button>
          ))}
        </section>

        {/* FAQs */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-px flex-1 bg-slate-100"></div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Frequently Asked Questions</h2>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                onClick={() => toggleFaq(index)}
                className={`cursor-pointer bg-white border transition-all duration-300 rounded-3xl overflow-hidden group ${openFaqIndex === index ? 'border-slate-900 shadow-lg scale-[1.01]' : 'border-slate-100 hover:border-slate-300'}`}
              >
                <div className="w-full flex items-center justify-between p-6 sm:p-8">
                  <span className={`text-base sm:text-lg font-bold transition-colors ${openFaqIndex === index ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>
                    {faq.question}
                  </span>
                  <div className={`p-2 rounded-full transition-colors ${openFaqIndex === index ? 'bg-slate-100 text-slate-900' : 'bg-transparent text-slate-300 group-hover:text-slate-500'}`}>
                    {openFaqIndex === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
                <div 
                  className={`px-6 sm:px-8 text-slate-500 text-sm sm:text-base leading-relaxed overflow-hidden transition-all duration-500 ease-in-out ${openFaqIndex === index ? 'max-h-40 pb-8 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Footer */}
        <section className="bg-slate-900 rounded-[2.5rem] p-8 md:p-16 text-center relative overflow-hidden animate-in fade-in zoom-in duration-500 delay-300 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full -ml-20 -mb-20 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">Still need help?</h2>
              <p className="text-slate-400 font-medium max-w-md mx-auto text-sm sm:text-base">
                Our dedicated support team is available 24/7 to assist you with any issues or questions.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold text-sm tracking-wide hover:bg-slate-100 transition-all active:scale-95 shadow-xl uppercase">
                <Mail size={18} /> Contact Support
              </button>
              <button className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-slate-800/50 text-white border border-slate-700 rounded-2xl font-bold text-sm tracking-wide hover:bg-slate-800 transition-all active:scale-95 uppercase">
                <MessageCircle size={18} /> Live Chat
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

// --- LAYOUT COMPONENTS ---

const Sidebar = ({ currentPage, setPage, isMobileOpen, setIsMobileOpen }) => {
  const navItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      page: "Dashboard",
      group: "main",
    },
    { name: "Invoices", icon: FileText, page: "Invoices", group: "main" },
    {
      name: "Create Invoice",
      icon: PlusCircle,
      page: "Create Invoice",
      group: "main",
    },
    {
      name: "Templates",
      icon: LayoutList,
      page: "Invoice Templates",
      group: "main",
    }, // NEW
    { name: "Clients", icon: Users, page: "Clients", group: "main" },
    // { name: "Reports", icon: TrendingUp, page: 'Reports', group: 'main' }, // Retained for future use

    { name: "Profile", icon: User, page: "Profile", group: "utility" }, // NEW
    { name: "Settings", icon: Settings, page: "Settings", group: "utility" },
    { name: "Support", icon: LifeBuoy, page: "Support", group: "utility" },
  ];

  const baseClasses =
    "flex items-center p-4 rounded-xl transition duration-200 cursor-pointer";

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        ></div>
      )}

      {/* Sidebar Content */}
      <nav
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-40 transform md:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out flex flex-col`}
      >
        {/* Logo and Close Button */}
        <div className="flex justify-between items-center p-6 pb-3 flex-shrink-0">
          <div className="text-3xl font-extrabold text-black">
            Invoice<span className="text-gray-600">Pro</span>
          </div>
          <button
            className="md:hidden p-1"
            onClick={() => setIsMobileOpen(false)}
          >
            <X size={28} className="text-gray-700 hover:text-black" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="overflow-y-auto px-6 pt-2 pb-4 space-y-2 flex-grow">
          {/* Main Group */}
          <div className="space-y-1 mt-4">
            {navItems
              .filter((item) => item.group === "main")
              .map((item) => (
                <div
                  key={item.name}
                  onClick={() => {
                    setPage(item.page);
                    setIsMobileOpen(false);
                  }}
                  className={`${baseClasses} ${
                    currentPage === item.page
                      ? "bg-black text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-100 hover:text-black"
                  }`}
                >
                  <item.icon className="w-6 h-6 mr-3" />
                  <span className="text-lg font-medium">{item.name}</span>
                </div>
              ))}
          </div>

          {/* Utility Group */}
          <div className="space-y-1 pt-4 mt-4 border-t border-gray-100">
            {navItems
              .filter((item) => item.group === "utility")
              .map((item) => (
                <div
                  key={item.name}
                  onClick={() => {
                    setPage(item.page);
                    setIsMobileOpen(false);
                  }}
                  className={`${baseClasses} ${
                    currentPage === item.page
                      ? "bg-black text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-100 hover:text-black"
                  }`}
                >
                  <item.icon className="w-6 h-6 mr-3" />
                  <span className="text-lg font-medium">{item.name}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Logout at Bottom */}
        <div className="p-6 pt-4 shrink-0 border-t border-gray-100">
          <a
            href="#"
            className={`${baseClasses} text-red-500 hover:bg-red-50 hover:text-red-700`}
            onClick={async(e)=>{
                e.preventDefault(); 
                try {
                    await axios.post(`${baseUrl}/auth/logout`, {}, { withCredentials: true })
                    window.location.href = '/login';
                } catch (error) {
                    console.error("Logout failed:", error);
                }
                }
            }
          >
            <LogOut className="w-6 h-6 mr-3" />
            <span className="text-lg font-medium">Log Out</span>
          </a>
        </div>
      </nav>
    </>
  );
};

// Main App Component
export default function App() {
  const [currentPage, setCurrentPage] = useState("Dashboard");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Function to determine which page component to render
  const renderPage = () => {
    switch (currentPage) {
      case "Dashboard":
        return <DashboardPage setPage={setCurrentPage} />;
      case "Invoices":
        return <InvoicesPage setPage={setCurrentPage} />;
      case "Create Invoice":
        return <CreateInvoicePage />;
      case "Invoice Templates":
        return <InvoiceTemplatesPage />; // NEW
      case "Clients":
        return <ClientsPage />;
      case "Profile":
        return <ProfilePage />; // NEW
      case "Settings":
        return <SettingsPage />;
      case "Support":
        return (
          <SupportPage/>
        );
      default:
        return <DashboardPage setPage={setCurrentPage} />;
    }
  };

  // Custom alert function (to avoid window.alert)
  const alert = (message) => {
    console.log("APP NOTIFICATION:", message);
    // You could replace this with a custom modal or toast notification
  };
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    axios
      .get(`${baseUrl}/auth/api/me`, {
        withCredentials: true,
      })
      .then((res) => {
        console.log("API DATA:", res.data);
        setUserData(res.data);
      })
      .catch((err) => {
        console.log("Error:", err);
      });
  }, []);

  useEffect(() => {
    console.log("UPDATED STATE:", userData);
  }, [userData]);
  return (
    <div className="min-h-screen bg-gray-50 font-sans flex">
      <Sidebar
        currentPage={currentPage}
        setPage={setCurrentPage}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64">
        {/* Header/Navbar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200 p-4 md:p-6 flex justify-between items-center shadow-sm">
          <div className="flex items-center">
            <button
              className="md:hidden p-2 mr-4 hover:bg-gray-100 rounded-full transition"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-2xl font-bold text-black">{currentPage}</h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative hidden sm:block">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Search ${currentPage
                  .toLowerCase()
                  .replace(" ", " ")}...`}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl w-64 focus:ring-2 focus:ring-black focus:border-black transition"
              />
            </div>

            {/* Notifications */}
            <button className="p-2 text-gray-700 hover:bg-gray-100 rounded-full transition">
              <Bell className="w-6 h-6" />
            </button>

            {/* Profile */}
            <div
              className="flex items-center space-x-3 cursor-pointer p-1 rounded-full hover:bg-gray-100 transition"
              onClick={() => setCurrentPage("Profile")}
            >
              <img
                src={`https://placehold.co/100x100/000000/FFFFFF?text=${userData?.name[0].toUpperCase()}`}
                alt="User Avatar"
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6">{renderPage()}</main>
      </div>
    </div>
  );
}
