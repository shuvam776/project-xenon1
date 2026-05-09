"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import {
  Users,
  Loader2,
  ArrowLeft,
  Mail,
  Phone,
  ShoppingCart,
  Heart,
  Calendar,
  XCircle,
  Plus,
  MapPin,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building2,
} from "lucide-react";
import Link from "next/link";

interface Hoarding {
  _id: string;
  name: string;
  location: {
    address: string;
    city: string;
  };
  pricePerMonth: number;
  images: string[];
}

interface Booking {
  _id: string;
  hoarding: Hoarding | null;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface Buyer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  kycStatus: string;
  createdAt: string;
}

export default function AdminBuyerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [wishlist, setWishlist] = useState<Hoarding[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [allHoardings, setAllHoardings] = useState<Hoarding[]>([]);

  // Manual Booking Form State
  const [showManualBooking, setShowManualBooking] = useState(false);
  const [manualBooking, setManualBooking] = useState({
    hoardingId: "",
    startDate: "",
    endDate: "",
    totalAmount: 0,
  });
  const [manualBookingLoading, setManualBookingLoading] = useState(false);

  // Action states
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
      const res = await fetchWithAuth(`/api/admin/buyers/${id}`);
      if (res.ok) {
        const data = await res.json();
        setBuyer(data.buyer);
        setWishlist(data.wishlist);
        setBookings(data.bookings);
      } else {
        router.push("/admin/buyers");
      }
    } catch (error) {
      console.error("Failed to fetch buyer details", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHoardings = async () => {
    try {
      const res = await fetchWithAuth("/api/hoardings"); // Generic hoarding list
      if (res.ok) {
        const data = await res.json();
        setAllHoardings(data.hoardings);
      }
    } catch (error) {
      console.error("Failed to fetch hoardings", error);
    }
  };

  useEffect(() => {
    if (authChecked) {
      fetchData();
      fetchHoardings();
    }
  }, [authChecked, id]);

  const handleTerminateBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to terminate this booking? Status will be set to 'cancelled'.")) return;
    
    setActionLoading(bookingId);
    try {
      const res = await fetchWithAuth(`/api/admin/bookings/${bookingId}/terminate`, {
        method: "PATCH",
      });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to terminate booking");
      }
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  const handleManualBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBooking.hoardingId || !manualBooking.startDate || !manualBooking.endDate || !manualBooking.totalAmount) {
      alert("Please fill all fields");
      return;
    }

    setManualBookingLoading(true);
    try {
      const res = await fetchWithAuth("/api/admin/bookings/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerId: id,
          ...manualBooking,
        }),
      });

      if (res.ok) {
        alert("Booking created successfully!");
        setShowManualBooking(false);
        setManualBooking({
          hoardingId: "",
          startDate: "",
          endDate: "",
          totalAmount: 0,
        });
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create booking");
      }
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setManualBookingLoading(false);
    }
  };

  if (loading || !authChecked || !buyer) {
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
              onClick={() => router.push("/admin/buyers")}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                Buyer Detail
              </h1>
              <p className="text-gray-500 mt-1">
                Viewing activity for {buyer.name}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowManualBooking(!showManualBooking)}
            className="bg-[#2563eb] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
          >
            <Plus size={20} />
            Add Manual Booking
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar: Buyer Info */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
              <div className="w-24 h-24 rounded-3xl bg-blue-50 flex items-center justify-center text-[#2563eb] font-bold text-4xl border border-blue-100 mx-auto mb-4">
                {buyer.image ? (
                  <img
                    src={buyer.image}
                    alt={buyer.name}
                    className="w-full h-full object-cover rounded-3xl"
                  />
                ) : (
                  buyer.name.charAt(0)
                )}
              </div>
              <h2 className="text-2xl font-black text-gray-900">{buyer.name}</h2>
              <p className="text-gray-500 font-medium">{buyer.email}</p>
              
              <div className="mt-6 flex flex-col gap-2">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Phone size={14} className="text-gray-400" />
                  {buyer.phone || "No phone added"}
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Calendar size={14} className="text-gray-400" />
                  Joined {new Date(buyer.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-50 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-black text-[#2563eb]">{wishlist.length}</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Wishlist</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-green-600">{bookings.length}</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bookings</p>
                </div>
              </div>
            </div>

            {/* Manual Booking Form */}
            {showManualBooking && (
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-blue-100 animate-in fade-in slide-in-from-top-4 duration-300">
                <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                  <Plus className="text-[#2563eb]" size={20} />
                  Add Manual Booking
                </h3>
                <form onSubmit={handleManualBookingSubmit} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block px-1">Select Hoarding</label>
                    <select
                      value={manualBooking.hoardingId}
                      onChange={(e) => setManualBooking({ ...manualBooking, hoardingId: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#2563eb] outline-none font-bold text-gray-700 text-sm"
                      required
                    >
                      <option value="">Choose a hoarding...</option>
                      {allHoardings.map(h => (
                        <option key={h._id} value={h._id}>{h.name} ({h.location.city})</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block px-1">Start Date</label>
                      <input
                        type="date"
                        value={manualBooking.startDate}
                        onChange={(e) => setManualBooking({ ...manualBooking, startDate: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#2563eb] outline-none font-bold text-gray-700 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block px-1">End Date</label>
                      <input
                        type="date"
                        value={manualBooking.endDate}
                        onChange={(e) => setManualBooking({ ...manualBooking, endDate: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#2563eb] outline-none font-bold text-gray-700 text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block px-1">Total Amount (₹)</label>
                    <input
                      type="number"
                      value={manualBooking.totalAmount}
                      onChange={(e) => setManualBooking({ ...manualBooking, totalAmount: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#2563eb] outline-none font-bold text-gray-700 text-sm"
                      required
                      placeholder="e.g. 50000"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={manualBookingLoading}
                    className="w-full bg-[#2563eb] text-white py-4 rounded-xl font-black text-sm hover:bg-blue-700 transition-all disabled:opacity-50 mt-4"
                  >
                    {manualBookingLoading ? <Loader2 className="animate-spin mx-auto" /> : "Confirm Manual Booking"}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Main Content: Wishlist & Bookings */}
          <div className="lg:col-span-2 space-y-8">
            {/* Wishlist Section */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <Heart className="text-red-500" fill="currentColor" size={24} />
                Wishlist Items
              </h3>
              {wishlist.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {wishlist.map(h => (
                    <div key={h._id} className="flex gap-4 p-4 border border-gray-50 rounded-2xl hover:bg-gray-50 transition-all">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        {h.images[0] ? (
                          <img src={h.images[0]} alt={h.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Building2 size={24} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 truncate">{h.name}</h4>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin size={12} /> {h.location.city}
                        </p>
                        <p className="text-sm font-black text-[#2563eb] mt-2">
                          ₹{h.pricePerMonth?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <Heart className="mx-auto mb-2 opacity-20" size={48} />
                  <p className="font-medium">No items in wishlist</p>
                </div>
              )}
            </div>

            {/* Bookings Section */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <ShoppingCart className="text-[#2563eb]" size={24} />
                Booking History
              </h3>
              {bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.map(b => (
                    <div key={b._id} className="p-6 border border-gray-50 rounded-3xl hover:border-blue-100 transition-all">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                            {b.hoarding?.images[0] ? (
                              <img src={b.hoarding.images[0]} alt={b.hoarding.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <Building2 size={24} />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-black text-gray-900">{b.hoarding?.name || "Deleted Hoarding"}</h4>
                            <p className="text-xs text-gray-500 font-medium">
                              {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                                b.status === 'confirmed' ? 'bg-green-50 text-green-600' :
                                b.status === 'requested' ? 'bg-amber-50 text-amber-600' :
                                'bg-red-50 text-red-600'
                              }`}>
                                {b.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Paid</p>
                          <p className="text-xl font-black text-gray-900">₹{b.totalAmount?.toLocaleString()}</p>
                          
                          {b.status === 'confirmed' && (
                            <button
                              onClick={() => handleTerminateBooking(b._id)}
                              disabled={actionLoading === b._id}
                              className="mt-4 text-xs font-black text-red-500 uppercase tracking-widest hover:text-red-700 flex items-center gap-1 ml-auto disabled:opacity-50"
                            >
                              {actionLoading === b._id ? <Loader2 className="animate-spin" size={12} /> : <XCircle size={14} />}
                              Terminate Session
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <ShoppingCart className="mx-auto mb-2 opacity-20" size={48} />
                  <p className="font-medium">No bookings found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
