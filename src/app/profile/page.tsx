"use client";

import {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  Suspense,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import "@fontsource/chiron-goround-tc";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  FileText,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  Clock,
  Shield,
  ArrowRight,
  Camera,
  Loader2 as Spinner,
} from "lucide-react";
import {
  profileKycSchema,
  type ProfileKYCInput,
} from "@/lib/validators/user";
import { normalizeKycStatus } from "@/lib/kycStatus";

type ProfileUser = {
  name: string;
  email: string;
  phone?: string;
  role: string;
  image?: string;
  emailVerified: boolean;
  isPhoneVerified: boolean;
  kycStatus: string;
  kycDetails?: {
    companyName?: string;
    gstin?: string;
    pan?: string;
    aadhaar?: string;
    address?: string;
    documents?: string[];
  };
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const kycRequired = searchParams.get("kyc_required") === "true";
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [kycSubmitting, setKycSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoStatus, setPhotoStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const kycForm = useForm<ProfileKYCInput>({
    resolver: zodResolver(profileKycSchema),
    mode: "onChange",
  });

  const loadUser = useCallback(async () => {
    try {
      const res = await fetchWithAuth("/api/auth/me");

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setPhoneInput(data.user.phone || "");
          setPhotoPreview(data.user.image || null);
          setPhotoStatus(null);
        const kycDefaults = {
          companyName: "",
          gstin: "",
          pan: "",
          aadhaar: "",
          address: "",
          documents: [],
          acceptTerms: false as const,
        };

        if (data.user.kycDetails) {
          kycForm.reset({
            ...kycDefaults,
            companyName: data.user.kycDetails.companyName || "",
            gstin: data.user.kycDetails.gstin || "",
            pan: data.user.kycDetails.pan || "",
            aadhaar: data.user.kycDetails.aadhaar || "",
            address: data.user.kycDetails.address || "",
            documents: data.user.kycDetails.documents || [],
          });
        } else {
          kycForm.reset(kycDefaults);
        }
      } else {
        router.push("/");
      }
    } catch (e) {
      console.error("Failed to fetch user", e);
      router.push("/");
    } finally {
      setLoading(false);
    }
  }, [router, kycForm]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    return () => {
      if (photoPreview && photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.error("Logout failed", e);
    }
    window.location.href = "/";
  };

  const handlePhotoSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (photoPreview && photoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
    setPhotoStatus(null);
    setUploadingPhoto(true);

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const res = await fetchWithAuth("/api/profile/upload-photo", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed.");
      }

      setPhotoStatus({
        type: "success",
        message: data.message || "Profile photo updated.",
      });
      setPhotoPreview(data.imageUrl || previewUrl);
      await loadUser();
    } catch (err: unknown) {
      console.error("Upload error", err);
      setPhotoStatus({
        type: "error",
        message: getErrorMessage(err, "Upload failed. Please try again."),
      });
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };


  const handleKYCSubmit = async (data: ProfileKYCInput) => {
    setError("");
    setSuccess("");
    const trimmedPhone = phoneInput.trim();
    if (!trimmedPhone) {
      setError("Phone number is required to submit KYC details.");
      return;
    }

    setKycSubmitting(true);
    try {
      const payload = {
        ...data,
        phone: trimmedPhone,
      };
      const res = await fetchWithAuth("/api/auth/kyc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "KYC submission failed");

      setSuccess(result.message || "KYC Details Submitted Successfully.");
      await loadUser();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "KYC submission failed"));
    } finally {
      setKycSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563eb]"></div>
      </div>
    );
  }

  if (!user) return null;

  const displayKycStatus = normalizeKycStatus(user.kycStatus);
  const isFullyVerified = user.role === "admin" || (user.isPhoneVerified && displayKycStatus === "approved");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8" style={{ fontFamily: "'Chiron GoRound TC', sans-serif" }}>
      <div className="max-w-6xl mx-auto space-y-8">
        {kycRequired && displayKycStatus !== "approved" && (
          <div className="bg-red-50 border-2 border-red-100 p-6 rounded-[32px] flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-4">
              <div className="bg-red-500 text-white p-3 rounded-2xl">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="font-black text-red-900 text-lg uppercase tracking-tight">KYC Verification Required</h3>
                <p className="text-red-700 text-sm font-medium">Please complete your verification details below to enable hoarding management features.</p>
              </div>
            </div>
            <a 
              href="#kyc-section" 
              className="px-6 py-3 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-colors shrink-0"
            >
              Fill Details
            </a>
          </div>
        )}
        <div className="flex items-center justify-between">
          <h2 className="text-4xl font-black tracking-tight leading-tight">
            <span className="font-sans font-black text-slate-900 mr-2">Your</span>
            <span className="font-serif italic bg-[linear-gradient(110deg,#2563eb,45%,#dbeafe,55%,#2563eb)] bg-[length:200%_auto] text-transparent bg-clip-text animate-shine drop-shadow-sm">Profile</span>
          </h2>
        </div>

        <div className={isFullyVerified ? "grid grid-cols-1 md:grid-cols-12 gap-6" : "flex flex-col max-w-3xl mx-auto gap-6 w-full"}>
          {/* Box 1: Identity (Top Left) */}
          <div className="md:col-span-8 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center gap-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="h-32 w-32 rounded-3xl bg-white p-1 shadow-xl cursor-pointer group relative hover:scale-105 transition-transform shrink-0 z-10"
            >
              <div className="h-full w-full rounded-2xl bg-blue-50 flex items-center justify-center text-[#2563eb] overflow-hidden">
                {uploadingPhoto ? (
                  <Spinner className="animate-spin" size={32} />
                ) : (
                  <>
                    {photoPreview ? (
                      <img src={photoPreview} alt={user.name} className="h-full w-full object-cover rounded-2xl" />
                    ) : (
                      <User size={56} />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                      <Camera className="text-white" size={28} />
                    </div>
                  </>
                )}
              </div>
              <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handlePhotoSelect} />
            </div>

            <div className="flex-1 text-center sm:text-left z-10">
              <p className="text-blue-600 font-bold text-xs uppercase tracking-widest mb-1 italic">Account Identity</p>
              <h1 className="text-3xl font-black text-gray-900 mb-2">{user.name}</h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-black uppercase tracking-tighter">
                  {user.role} Account
                </span>
                {user.emailVerified && (
                  <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-black uppercase tracking-tighter flex items-center gap-1">
                    <Shield size={12} /> Verified Email
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Box 2: Verification Status (Top Right) */}
          <div className="md:col-span-4 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between gap-6 relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-orange-50 rounded-full -mb-12 -mr-12" />
            
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest relative z-10">Status Badges</h3>
            
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-gray-400" />
                  <span className="text-xs font-bold text-gray-600">Email</span>
                </div>
                {user.emailVerified ? <CheckCircle size={16} className="text-green-500" /> : <Clock size={16} className="text-amber-500" />}
              </div>

              {user.role !== "admin" && (
                <>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <Phone size={18} className="text-gray-400" />
                      <span className="text-xs font-bold text-gray-600">Mobile</span>
                    </div>
                    {user.isPhoneVerified ? <CheckCircle size={16} className="text-green-500" /> : <AlertCircle size={16} className="text-red-500" />}
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <ShieldCheck size={18} className="text-gray-400" />
                      <span className="text-xs font-bold text-gray-600">KYC Status</span>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg ${
                      displayKycStatus === "approved" ? "bg-green-100 text-green-700" :
                      displayKycStatus === "submitted" ? "bg-amber-100 text-amber-700" :
                      displayKycStatus === "rejected" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {displayKycStatus.replace("_", " ")}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Box 3: General Info & Action (Bottom Left) */}
          <div className="md:col-span-8 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className={user.role === "admin" ? "sm:col-span-2 space-y-4" : "space-y-4"}>
                <h3 className="text-sm font-black text-[#ff6900] uppercase tracking-widest">Connect Info</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-2xl border border-transparent hover:border-blue-100 transition-all group">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Primary Email</p>
                    <div className="flex items-center gap-3">
                      <Mail size={20} className="text-blue-500" />
                      <span className="font-bold text-gray-900 line-clamp-1">{user.email}</span>
                    </div>
                  </div>
                  {user.role !== "admin" && (
                    <div className="bg-gray-50 p-4 rounded-2xl border border-transparent hover:border-blue-100 transition-all group">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Secure Mobile</p>
                      <div className="flex items-center gap-3">
                        <Phone size={20} className="text-blue-500" />
                        <span className="font-bold text-gray-900">{user.phone || "Not linked"}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {user.role !== "admin" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-green-600 uppercase tracking-widest">Company & Location</h3>
                  <div className="bg-gray-50 p-5 rounded-2xl border border-transparent hover:border-blue-100 transition-all h-[calc(100%-2rem)]">
                    {user.kycDetails ? (
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Building2 size={18} className="text-blue-500 mt-1" />
                          <div>
                            <p className="text-xs font-black text-gray-900">{user.kycDetails.companyName || "Personal Account"}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">{user.kycDetails.address}</p>
                          </div>
                        </div>
                        {user.kycDetails.gstin && (
                          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                            <FileText size={16} className="text-gray-400" />
                            <span className="text-[10px] font-bold text-gray-600">GSTIN: {user.kycDetails.gstin}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center py-4">
                        <MapPin size={24} className="text-gray-200 mb-2" />
                        <p className="text-xs font-bold text-gray-400">Complete KYC to add company details</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-50 flex items-center justify-between gap-6">
              <div className="flex-1">
                {(user.role === "buyer" || (user.role === "vendor" && displayKycStatus === "approved")) && (
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[24px] p-6 text-white shadow-xl shadow-blue-100 flex items-center justify-between group cursor-pointer"
                       onClick={() => router.push(user.role === "buyer" ? "/buyer/dashboard" : "/vendor/dashboard")}>
                    <div>
                      <h4 className="text-xl font-black">Open {user.role === "buyer" ? "Campaign" : "Vendor"} Dashboard</h4>
                      <p className="text-blue-100 text-xs font-medium mt-1">Manage your {user.role === "buyer" ? "bookings" : "listings"} and analytics</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:text-blue-600 transition-all">
                      <ArrowRight size={24} />
                    </div>
                  </div>
                )}
                {user.role === "vendor" && displayKycStatus === "submitted" && (
                  <div className="bg-amber-50 border border-amber-200 rounded-[24px] p-6 flex items-center gap-4">
                    <Clock size={32} className="text-amber-500" />
                    <div>
                      <h4 className="font-black text-amber-900">Verification Pending</h4>
                      <p className="text-xs text-amber-700 font-medium">Your dashboard will be enabled once KYC is approved.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Box 4: Conditional Action Area (Bottom Right) */}
          {user.role !== "admin" && (!user.isPhoneVerified || ["not_submitted", "rejected", "submitted"].includes(displayKycStatus)) && (
            <div id="kyc-section" className="md:col-span-4 space-y-6">
              {!user.isPhoneVerified && (
                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
                        <Phone size={24} />
                      </div>
                      <h3 className="font-black text-gray-900 italic underline tracking-tight">Add phone number</h3>
                    </div>

                    <input
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-sm transition-all"
                      placeholder="+91 Phone Number"
                    />
                    <p className="text-[10px] font-medium text-gray-500">
                      Phone verification is temporarily handled by admin during KYC review.
                    </p>
                  </div>
                </div>
              )}

              {(displayKycStatus === "not_submitted" || displayKycStatus === "rejected") && (
                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
                        <ShieldCheck size={24} />
                      </div>
                      <h3 className="font-black text-gray-900 italic underline tracking-tight">KYC Verification</h3>
                    </div>

                    <p className="text-[11px] text-gray-500 font-medium">Verify your identity to unlock dashboard controls and premium features.</p>
                    
                    {error && <p className="text-[10px] font-bold text-red-500 bg-red-50 p-2 rounded-lg">{error}</p>}
                    {success && <p className="text-[10px] font-bold text-green-500 bg-green-50 p-2 rounded-lg">{success}</p>}

                    <form onSubmit={kycForm.handleSubmit(handleKYCSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 gap-3">
                        <input {...kycForm.register("companyName")} className="w-full px-4 py-2.5 rounded-xl border-none bg-gray-50 focus:ring-2 focus:ring-blue-500/10 font-bold text-xs" placeholder="Company Name (Optional)" />
                        <input {...kycForm.register("gstin")} onInput={(e) => e.currentTarget.value = e.currentTarget.value.toUpperCase()} className="w-full px-4 py-2.5 rounded-xl border-none bg-gray-50 focus:ring-2 focus:ring-blue-500/10 font-bold text-xs uppercase" placeholder="GSTIN (Optional)" />
                        {kycForm.formState.errors.gstin && <p className="text-[9px] text-red-500 font-bold">{kycForm.formState.errors.gstin.message}</p>}
                        <input {...kycForm.register("pan")} onInput={(e) => e.currentTarget.value = e.currentTarget.value.toUpperCase()} className="w-full px-4 py-2.5 rounded-xl border-none bg-gray-50 focus:ring-2 focus:ring-blue-500/10 font-bold text-xs uppercase" placeholder="PAN Number *" />
                        {kycForm.formState.errors.pan && <p className="text-[9px] text-red-500 font-bold">{kycForm.formState.errors.pan.message}</p>}
                        <input {...kycForm.register("aadhaar")} className="w-full px-4 py-2.5 rounded-xl border-none bg-gray-50 focus:ring-2 focus:ring-blue-500/10 font-bold text-xs" placeholder="Aadhaar Number *" />
                        {kycForm.formState.errors.aadhaar && <p className="text-[9px] text-red-500 font-bold">{kycForm.formState.errors.aadhaar.message}</p>}
                        <textarea {...kycForm.register("address")} rows={2} className="w-full px-4 py-2.5 rounded-xl border-none bg-gray-50 focus:ring-2 focus:ring-blue-500/10 font-bold text-xs" placeholder="Registered Address *" />
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" {...kycForm.register("acceptTerms")} className="rounded text-blue-600" />
                        <span className="text-[9px] font-bold text-gray-500">I accept Terms & Conditions</span>
                      </label>

                      <button
                        type="submit"
                        disabled={kycSubmitting || !kycForm.formState.isValid}
                        className="w-full bg-blue-600 text-white rounded-2xl py-4 font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-100 hover:scale-[1.02] transition-transform disabled:opacity-50"
                      >
                        {kycSubmitting ? "Submitting..." : "Submit KYC Now"}
                      </button>
                    </form>
                  </div>
                </div>
              )}
              
              {displayKycStatus === "submitted" && (
                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative">
                  <div className="flex flex-col items-center justify-center h-full text-center py-10 space-y-4">
                    <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-500 animate-pulse">
                      <Clock size={40} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900 italic">Reviewing KYC</h3>
                      <p className="text-xs text-gray-500 font-medium px-4 mt-2">Our team is verifying your details. This usually takes 24-48 hours.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563eb]"></div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
