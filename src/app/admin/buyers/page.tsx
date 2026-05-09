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
  ArrowLeft,
  User as UserIcon,
  Mail,
  Phone,
  ShoppingCart,
} from "lucide-react";

interface Buyer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  createdAt: string;
  // We can add booking count later if we want to show it in the list
}

export default function AdminBuyersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
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

    const fetchBuyers = async () => {
      try {
        const res = await fetchWithAuth("/api/admin/users?role=buyer");
        if (res.ok) {
          const data = await res.json();
          setBuyers(data.users);
        }
      } catch (error) {
        console.error("Failed to fetch buyers", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBuyers();
  }, [authChecked]);

  const filteredBuyers = buyers.filter((buyer) =>
    [buyer.name, buyer.email, buyer.phone]
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
                <Users className="text-[#2563eb]" size={32} />
                Buyer Management
              </h1>
              <p className="text-gray-500 mt-1">
                Manage all registered buyers, their bookings and wishlists
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search buyers by name, email or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#2563eb] outline-none transition-all text-lg"
          />
        </div>

        {/* Buyers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuyers.length > 0 ? (
            filteredBuyers.map((buyer) => (
              <div
                key={buyer._id}
                onClick={() => router.push(`/admin/buyers/${buyer._id}`)}
                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-[#2563eb] font-bold text-2xl border border-blue-100 group-hover:scale-110 transition-transform">
                      {buyer.image ? (
                        <img
                          src={buyer.image}
                          alt={buyer.name}
                          className="w-full h-full object-cover rounded-2xl"
                        />
                      ) : (
                        buyer.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg group-hover:text-[#2563eb] transition-colors">
                        {buyer.name}
                      </h3>
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        Registered Buyer
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-300 group-hover:text-[#2563eb] transition-colors" />
                </div>

                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-gray-400" />
                    {buyer.email}
                  </div>
                  {buyer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-400" />
                      {buyer.phone}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                    Joined {new Date(buyer.createdAt).toLocaleDateString()}
                  </span>
                  <div className="text-[#2563eb] font-bold text-xs flex items-center gap-1 group-hover:gap-2 transition-all">
                    View Activity <ChevronRight size={12} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
              <UserIcon className="mx-auto text-gray-200 mb-4" size={64} />
              <p className="text-gray-400 font-medium">No buyers found matching your search</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
