"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import {
  Users,
  Search,
  Loader2,
  ChevronRight,
  Shield,
  Building2,
  Mail,
  Phone,
  ArrowLeft,
} from "lucide-react";

interface Vendor {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  kycStatus: string;
  createdAt: string;
}

export default function AdminVendorsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [authChecked, setAuthChecked] = useState(false);

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

  useEffect(() => {
    if (!authChecked) return;

    const fetchVendors = async () => {
      try {
        const res = await fetchWithAuth("/api/admin/users?role=vendor");
        if (res.ok) {
          const data = await res.json();
          setVendors(data.users);
        }
      } catch (error) {
        console.error("Failed to fetch vendors", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, [authChecked]);

  const filteredVendors = vendors.filter((vendor) =>
    [vendor.name, vendor.email, vendor.phone]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  if (loading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Building2 className="text-[#2563eb]" size={32} />
                Vendor Management
              </h1>
              <p className="text-gray-500 mt-1">
                Manage all registered vendors and their listings
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search vendors by name, email or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#2563eb] outline-none transition-all text-lg"
          />
        </div>

        {/* Vendors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.length > 0 ? (
            filteredVendors.map((vendor) => (
              <div
                key={vendor._id}
                onClick={() => router.push(`/admin/vendors/${vendor._id}`)}
                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-[#2563eb] font-bold text-2xl border border-blue-100 group-hover:scale-110 transition-transform">
                      {vendor.image ? (
                        <img
                          src={vendor.image}
                          alt={vendor.name}
                          className="w-full h-full object-cover rounded-2xl"
                        />
                      ) : (
                        vendor.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg group-hover:text-[#2563eb] transition-colors">
                        {vendor.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            vendor.kycStatus === "approved"
                              ? "bg-green-100 text-green-700"
                              : vendor.kycStatus === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {vendor.kycStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-300 group-hover:text-[#2563eb] transition-colors" />
                </div>

                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-gray-400" />
                    {vendor.email}
                  </div>
                  {vendor.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-400" />
                      {vendor.phone}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                    Joined {new Date(vendor.createdAt).toLocaleDateString()}
                  </span>
                  <div className="text-[#2563eb] font-bold text-xs flex items-center gap-1 group-hover:gap-2 transition-all">
                    View Listings <ChevronRight size={12} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
              <Building2 className="mx-auto text-gray-200 mb-4" size={64} />
              <p className="text-gray-400 font-medium">No vendors found matching your search</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
