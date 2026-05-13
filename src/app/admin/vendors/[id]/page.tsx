"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
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
} from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  role: string;
  kycStatus: string;
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
      const res = await fetchWithAuth(`/api/hoardings/${hoardingId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setHoardings((prev) => prev.filter((h) => h._id !== hoardingId));
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
      for (const item of items) {
        if (!item || typeof item !== 'object') continue;
        
        // Skip empty rows or headers from Sheet1
        if (item.Column1 === "SL" || item.Column1 === "TOTAL" || (typeof item.Column1 === "string" && item.Column1.includes("PROPOSAL"))) continue;

        const payload = {
          name: String(item.name || item.location || item["Dear  Sir/ Ma'am"] || "Imported Hoarding"),
          description: String(item.description || ""),
          address: String(item.address || item["Dear  Sir/ Ma'am"] || "Unknown Address"),
          city: String(item.city || item.Column2 || "Unknown City"),
          state: String(item.state || "Odisha"),
          latitude: Number(item.latitude) || 0,
          longitude: Number(item.longitude) || 0,
          width: Number(item.width || item.Column4) || 1,
          height: Number(item.height || item.Column5) || 1,
          type: ["Hoarding", "Unipole", "Gantry", "Bus Shelter", "Kiosk", "Other"].includes(item.type) ? item.type : "Hoarding",
          lightingType: ["Lit", "Non-Lit", "Front Lit", "Back Lit"].includes(item.lightingType) ? item.lightingType : (item.Column8 === "FL" ? "Front Lit" : "Non-Lit"),
          pricePerMonth: Number(item.pricePerMonth || item.Column10) || 1000,
          minimumBookingAmount: Number(item.minimumBookingAmount) || 0,
          uniqueReach: Number(item.uniqueReach) || 0,
          images: Array.isArray(item.images) ? item.images : [],
          ownerId: id // vendor ID
        };

        const res = await fetchWithAuth("/api/hoardings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          successCount++;
        } else {
          console.error("Failed to upload item:", await res.text());
        }
      }

      alert(`Successfully uploaded ${successCount} hoardings.`);
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        </div>

        {/* Hoardings List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 size={24} className="text-gray-400" />
            Vendor Listings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hoardings.length > 0 ? (
              hoardings.map((hoarding) => (
                <div
                  key={hoarding._id}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all group"
                >
                  <div className="relative aspect-video">
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
                <p className="text-gray-400 font-medium">This vendor has no hoardings yet.</p>
                <button
                   onClick={() => router.push(`/admin/vendors/${id}/add-hoarding`)}
                   className="mt-4 text-[#2563eb] font-bold flex items-center gap-2 mx-auto"
                >
                  <Plus size={18} /> Add first hoarding
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
