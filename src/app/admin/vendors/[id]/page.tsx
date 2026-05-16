"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { formatTimeOnSite } from "@/lib/formatTime";
import {
  Building2,
  Mail,
  Phone,
  ArrowLeft,
  Loader2,
  Plus,
  MapPin,
  IndianRupee,
  Edit,
  Trash2,
  ExternalLink,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  Upload,
  CheckSquare,
  Square,
  Search,
} from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  role: string;
  kycStatus: string;
  totalTimeOnSite?: number;
}

interface Hoarding {
  _id: string;
  name: string;
  location: {
    address: string;
    city: string;
  };
  pricePerMonth: number;
  status: string;
  images: string[];
}

export default function AdminVendorDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState<User | null>(null);
  const [hoardings, setHoardings] = useState<Hoarding[]>([]);
  const [authChecked, setAuthChecked] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [isUploadingJson, setIsUploadingJson] = useState(false);
  const [selectedHoardingIds, setSelectedHoardingIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetchWithAuth("/api/auth/me");
        if (!res.ok) {
          router.push("/");
          return;
        }
        const data = await res.json();
        if (data.user.role !== "admin") {
          router.push("/");
          return;
        }
        setAuthChecked(true);
      } catch (error) {
        router.push("/");
      }
    };
    checkAuth();
  }, [router]);

  const fetchData = async () => {
    try {
      const [vendorRes, hoardingsRes] = await Promise.all([
        fetchWithAuth(`/api/admin/users/${id}/details`),
        fetchWithAuth(`/api/admin/hoardings?owner=${id}`),
      ]);

      if (vendorRes.ok) {
        const data = await vendorRes.json();
        setVendor(data.user);
      }
      if (hoardingsRes.ok) {
        const data = await hoardingsRes.json();
        setHoardings(data.hoardings);
        setSelectedHoardingIds([]);
      }
    } catch (error) {
      console.error("Failed to fetch vendor data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authChecked) {
      fetchData();
    }
  }, [authChecked, id]);

  const handleDeleteHoarding = async (hoardingId: string) => {
    if (!confirm("Are you sure you want to delete this hoarding?")) return;

    setActionLoading(hoardingId);
    try {
      const res = await fetchWithAuth(`/api/admin/hoardings/${hoardingId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setHoardings((prev) => prev.filter((h) => h._id !== hoardingId));
        setSelectedHoardingIds((prev) => prev.filter((id) => id !== hoardingId));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete hoarding");
      }
    } catch (error) {
      alert("Failed to delete hoarding");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleHoardingSelection = (hoardingId: string) => {
    setSelectedHoardingIds((prev) =>
      prev.includes(hoardingId)
        ? prev.filter((id) => id !== hoardingId)
        : [...prev, hoardingId]
    );
  };

  const filteredHoardings = hoardings.filter(h => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.trim().toLowerCase();
    return (
      h.name.toLowerCase().includes(query) ||
      h.location.address.toLowerCase().includes(query) ||
      h.location.city.toLowerCase().includes(query) ||
      h.status.toLowerCase().includes(query)
    );
  });

  const allSelected = filteredHoardings.length > 0 && selectedHoardingIds.length === filteredHoardings.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedHoardingIds([]);
      return;
    }
    setSelectedHoardingIds(filteredHoardings.map((h) => h._id));
  };

  const handleBulkDelete = async () => {
    if (selectedHoardingIds.length === 0) return;

    const confirmed = confirm(
      `Are you sure you want to delete ${selectedHoardingIds.length} selected hoarding(s)?`
    );
    if (!confirmed) return;

    setActionLoading("bulk-delete");
    try {
      const res = await fetchWithAuth("/api/admin/hoardings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hoardingIds: selectedHoardingIds }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete selected hoardings");
        return;
      }

      const selectedSet = new Set(selectedHoardingIds);
      setHoardings((prev) => prev.filter((h) => !selectedSet.has(h._id)));
      setSelectedHoardingIds([]);
    } catch (error) {
      alert("Failed to delete selected hoardings");
    } finally {
      setActionLoading(null);
    }
  };

  const handleJsonUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingJson(true);
    setShowAddMenu(false);
    try {
      const text = await file.text();
      const json = JSON.parse(text);

      let items = [];
      if (Array.isArray(json)) {
        items = json;
      } else if (json.Sheet1 && Array.isArray(json.Sheet1)) {
        items = json.Sheet1.filter((i: any) => i !== null && typeof i === 'object' && Object.keys(i).length > 2);
      } else {
        alert("Invalid JSON format. Expected an array.");
        return;
      }

      let successCount = 0;
      let failCount = 0;
      const errors: string[] = [];

      // Helper to parse dimensions from various formats
      const parseDimensions = (item: any): { width: number; height: number } => {
        // 1. Try nested dimensions object (e.g. { dimensions: { width: 40, height: 10 } })
        if (item.dimensions && typeof item.dimensions === 'object') {
          const dw = parseFloat(item.dimensions.width);
          const dh = parseFloat(item.dimensions.height);
          if (!isNaN(dw) && dw > 0 && !isNaN(dh) && dh > 0) {
            return { width: dw, height: dh };
          }
        }

        // 2. Try explicit top-level numeric width/height fields
        const explicitWidth = parseFloat(item.width);
        const explicitHeight = parseFloat(item.height);
        if (!isNaN(explicitWidth) && explicitWidth > 0 && !isNaN(explicitHeight) && explicitHeight > 0) {
          return { width: explicitWidth, height: explicitHeight };
        }

        // 3. Try parsing a combined size/dimensions string (e.g. "20x10", "20'x10'", "20ft x 10ft", "20 x 10")
        const sizeStr = String(item.size || (typeof item.dimensions === 'string' ? item.dimensions : '') || item.Column4 || "");
        const sizeMatch = sizeStr.match(/(\d+(?:\.\d+)?)\s*[^0-9]*?\s*[xX×]\s*(\d+(?:\.\d+)?)/);
        if (sizeMatch) {
          const w = parseFloat(sizeMatch[1]);
          const h = parseFloat(sizeMatch[2]);
          if (w > 0 && h > 0) return { width: w, height: h };
        }

        // 4. Try extracting dimensions from description string (e.g. "Dimensions: 40X10")
        if (item.description && typeof item.description === 'string') {
          const descMatch = item.description.match(/(\d+(?:\.\d+)?)\s*[xX×]\s*(\d+(?:\.\d+)?)/);
          if (descMatch) {
            const w = parseFloat(descMatch[1]);
            const h = parseFloat(descMatch[2]);
            if (w > 0 && h > 0) return { width: w, height: h };
          }
        }

        // 5. Try Column4 as width and Column5 as height (numeric sheet columns)
        const col4 = parseFloat(item.Column4);
        const col5 = parseFloat(item.Column5);
        if (!isNaN(col4) && col4 > 0 && !isNaN(col5) && col5 > 0) {
          return { width: col4, height: col5 };
        }

        // 6. Fallback
        return {
          width: (!isNaN(explicitWidth) && explicitWidth > 0) ? explicitWidth : 1,
          height: (!isNaN(explicitHeight) && explicitHeight > 0) ? explicitHeight : 1,
        };
      };

      // Helper to extract location fields from nested or flat format
      const parseLocation = (item: any) => {
        const loc = item.location && typeof item.location === 'object' ? item.location : null;
        return {
          address: String(loc?.address || item.address || item["Dear  Sir/ Ma'am"] || "Unknown Address"),
          city: String(loc?.city || item.city || item.Column2 || "Unknown City"),
          state: String(loc?.state || item.state || "Odisha"),
          zipCode: String(loc?.zipCode || loc?.zip || item.zipCode || item.zip || ""),
        };
      };

      // Helper to resolve lighting type
      const parseLightingType = (item: any): string => {
        const validTypes = ["Lit", "Non-Lit", "Front Lit", "Back Lit"];
        const raw = item.lightingType || item.lighting_type || item.lighting || "";
        if (validTypes.includes(raw)) return raw;
        // Check common abbreviations
        const lower = String(raw).toLowerCase().trim();
        if (lower === "fl" || lower === "front lit" || lower === "frontlit") return "Front Lit";
        if (lower === "bl" || lower === "back lit" || lower === "backlit") return "Back Lit";
        if (lower === "lit") return "Lit";
        if (item.Column8 === "FL") return "Front Lit";
        return "Non-Lit";
      };

      for (const item of items) {
        if (!item || typeof item !== 'object') continue;
        
        // Skip empty rows or headers from Sheet1
        if (item.Column1 === "SL" || item.Column1 === "TOTAL" || (typeof item.Column1 === "string" && item.Column1.includes("PROPOSAL"))) continue;

        const { width, height } = parseDimensions(item);
        const location = parseLocation(item);
        const lightingType = parseLightingType(item);

        // Resolve hoarding type
        const validTypes = ["Hoarding", "Unipole", "Gantry", "Bus Shelter", "Kiosk", "Other"];
        const rawType = item.type || item.hoarding_type || "";
        const hoardingType = validTypes.includes(rawType) ? rawType : "Hoarding";

        // Resolve coordinates (nested or flat)
        const coords = item.location?.coordinates || item.coordinates || {};
        const latitude = Number(coords.lat || coords.latitude || item.latitude || item.lat) || 0;
        const longitude = Number(coords.lng || coords.longitude || item.longitude || item.lng) || 0;

        const payload = {
          name: String(item.name || location.address || "Imported Hoarding"),
          description: String(item.description || ""),
          address: location.address,
          city: location.city,
          state: location.state,
          zipCode: location.zipCode,
          latitude,
          longitude,
          width,
          height,
          type: hoardingType,
          lightingType,
          pricePerMonth: Number(item.pricePerMonth || item.price_per_month || item.price || item.Column10) || 1000,
          minimumBookingAmount: Number(item.minimumBookingAmount || item.minimum_booking_amount) || 0,
          uniqueReach: Number(item.uniqueReach || item.unique_reach) || 0,
          images: Array.isArray(item.images) ? item.images : [],
          ownerId: id // vendor ID
        };

        try {
          const res = await fetchWithAuth("/api/hoardings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });

          if (res.ok) {
            successCount++;
          } else {
            failCount++;
            const errText = await res.text();
            console.error(`Failed to upload "${payload.name}":`, errText);
            if (errors.length < 5) {
              errors.push(`"${payload.name}": ${errText}`);
            }
          }
        } catch (err) {
          failCount++;
          console.error(`Error uploading "${payload.name}":`, err);
        }
      }

      let message = `Successfully uploaded ${successCount} hoarding(s).`;
      if (failCount > 0) {
        message += `\n${failCount} failed.`;
        if (errors.length > 0) {
          message += `\n\nFirst errors:\n${errors.join("\n")}`;
        }
      }
      alert(message);
      fetchData(); // Refresh list
    } catch (error) {
      console.error("JSON upload failed", error);
      alert("Failed to parse JSON file.");
    } finally {
      setIsUploadingJson(false);
      // Reset input value so the same file can be selected again
      e.target.value = '';
    }
  };

  if (loading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Vendor not found</h1>
          <button
            onClick={() => router.push("/admin/vendors")}
            className="mt-4 text-[#2563eb] font-bold"
          >
            Back to vendors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin/vendors")}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-[#2563eb] font-bold text-2xl border border-blue-100">
                {vendor.image ? (
                  <img src={vendor.image} alt={vendor.name} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  vendor.name.charAt(0)
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{vendor.name}</h1>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Mail size={14} /> {vendor.email}
                  </div>
                  {vendor.phone && (
                    <div className="flex items-center gap-1">
                      <Phone size={14} /> {vendor.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              disabled={isUploadingJson}
              className="bg-[#2563eb] text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:opacity-75"
            >
              {isUploadingJson ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
              {isUploadingJson ? "Uploading..." : "Add New Hoarding"}
              <ChevronDown size={20} className={`transition-transform ${showAddMenu ? 'rotate-180' : ''}`} />
            </button>

            {showAddMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                <button
                  onClick={() => {
                    setShowAddMenu(false);
                    router.push(`/admin/vendors/${id}/add-hoarding`);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 text-sm font-semibold text-gray-700"
                >
                  <Edit size={16} />
                  Manual upload
                </button>
                <label className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer border-t border-gray-50">
                  <Upload size={16} />
                  Upload json
                  <input 
                    type="file" 
                    accept=".json" 
                    className="hidden" 
                    onChange={handleJsonUpload}
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Vendor Stats/Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 font-medium">KYC Status</p>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`text-sm font-bold px-3 py-1 rounded-full ${
                  vendor.kycStatus === "approved"
                    ? "bg-green-100 text-green-700"
                    : vendor.kycStatus === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {vendor.kycStatus.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 font-medium">Total Hoardings</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{hoardings.length}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 font-medium">Active Listings</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {hoardings.filter((h) => h.status === "approved").length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 font-medium flex items-center gap-1">
              <Clock size={14} className="text-purple-400" />
              Time on Site
            </p>
            <p className="text-2xl font-bold text-purple-600 mt-1">
              {formatTimeOnSite(vendor.totalTimeOnSite)}
            </p>
          </div>
        </div>

        {/* Hoardings List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 size={24} className="text-gray-400" />
            Vendor Listings
          </h2>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search hoardings by name, city, address or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-sm text-gray-900"
            />
          </div>

          {hoardings.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleSelectAll}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  {allSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                  {allSelected ? "Unselect all" : "Select all"}
                </button>
                <p className="text-sm text-gray-500">
                  {selectedHoardingIds.length} selected
                </p>
              </div>

              <button
                onClick={handleBulkDelete}
                disabled={selectedHoardingIds.length === 0 || actionLoading === "bulk-delete"}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === "bulk-delete" ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                Delete selected
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHoardings.length > 0 ? (
              filteredHoardings.map((hoarding) => (
                <div
                  key={hoarding._id}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all group"
                >
                  <div className="relative aspect-video">
                    <button
                      type="button"
                      onClick={() => toggleHoardingSelection(hoarding._id)}
                      className="absolute top-4 left-4 z-10 p-2 rounded-lg bg-white/90 border border-gray-200 hover:bg-white transition-colors"
                      aria-label={`Select ${hoarding.name}`}
                    >
                      {selectedHoardingIds.includes(hoarding._id) ? (
                        <CheckSquare size={18} className="text-[#2563eb]" />
                      ) : (
                        <Square size={18} className="text-gray-500" />
                      )}
                    </button>
                    {hoarding.images && hoarding.images[0] ? (
                      <img
                        src={hoarding.images[0]}
                        alt={hoarding.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-md border ${
                          hoarding.status === "approved"
                            ? "bg-green-500/20 text-green-700 border-green-500/20"
                            : hoarding.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-700 border-yellow-500/20"
                            : "bg-red-500/20 text-red-700 border-red-500/20"
                        }`}
                      >
                        {hoarding.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg group-hover:text-[#2563eb] transition-colors">
                        {hoarding.name}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin size={14} className="text-gray-400" />
                        {hoarding.location.address}, {hoarding.location.city}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
                          Monthly Rent
                        </p>
                        <p className="text-lg font-black text-gray-900 flex items-center">
                          <IndianRupee size={16} />
                          {hoarding.pricePerMonth.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/admin/vendors/${id}/edit-hoarding/${hoarding._id}`)}
                          className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteHoarding(hoarding._id)}
                          disabled={actionLoading === hoarding._id}
                          className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                        >
                          {actionLoading === hoarding._id ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                <Building2 className="mx-auto text-gray-200 mb-4" size={64} />
                <p className="text-gray-400 font-medium">No hoardings found.</p>
                {hoardings.length === 0 && (
                  <button
                     onClick={() => router.push(`/admin/vendors/${id}/add-hoarding`)}
                     className="mt-4 text-[#2563eb] font-bold flex items-center gap-2 mx-auto"
                  >
                    <Plus size={18} /> Add first hoarding
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
