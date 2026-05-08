"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { hoardingSchema, type HoardingInput } from "@/lib/validators/hoarding";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { getLocationFromPincode, isValidIndianPincode } from "@/lib/googleMaps";
import MapLocationPicker from "@/components/MapLocationPicker";
import {
  Building2,
  MapPin,
  IndianRupee,
  Ruler,
  Info,
  Image as ImageIcon,
  Loader2,
  X,
  CheckCircle,
  ArrowLeft,
  Save,
} from "lucide-react";

export default function AdminEditHoardingForVendorPage() {
  const router = useRouter();
  const { id: vendorId, hoardingId } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pincodeLoading, setPincodeLoading] = useState(false);

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

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<HoardingInput>({
    resolver: zodResolver(hoardingSchema) as any,
  });

  useEffect(() => {
    if (!authChecked) return;

    const fetchHoarding = async () => {
      try {
        const res = await fetchWithAuth(`/api/hoardings/${hoardingId}`);
        if (!res.ok) {
          setError("Failed to load hoarding details");
          return;
        }
        const data = await res.json();
        const hoarding = data.hoarding;

        reset({
          name: hoarding.name,
          description: hoarding.description || "",
          address: hoarding.location.address,
          city: hoarding.location.city,
          state: hoarding.location.state,
          zipCode: hoarding.location.zipCode || "",
          latitude: hoarding.location.coordinates?.lat,
          longitude: hoarding.location.coordinates?.lng,
          width: hoarding.dimensions.width,
          height: hoarding.dimensions.height,
          type: hoarding.type,
          lightingType: hoarding.lightingType,
          pricePerMonth: hoarding.pricePerMonth,
          minimumBookingAmount: hoarding.minimumBookingAmount || 0,
          minimumBookingMonths: hoarding.minimumBookingMonths || 1,
          uniqueReach: hoarding.uniqueReach || 0,
          images: hoarding.images || [],
        });
        setImages(hoarding.images || []);
      } catch (err: any) {
        setError("Failed to load hoarding");
      } finally {
        setLoading(false);
      }
    };

    fetchHoarding();
  }, [authChecked, hoardingId, reset]);

  if (loading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        const newImages = [...images, data.url];
        setImages(newImages);
        setValue("images", newImages);
      } else {
        setError(data.error || "Upload failed");
      }
    } catch (err: any) {
      setError("Failed to upload image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    setValue("images", newImages);
  };

  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const pincode = e.target.value;
    setValue("zipCode", pincode, { shouldValidate: true, shouldDirty: true });
    if (isValidIndianPincode(pincode)) {
      setPincodeLoading(true);
      try {
        const locationData = await getLocationFromPincode(pincode);
        if (locationData.city) setValue("city", locationData.city, { shouldValidate: true });
        if (locationData.state) setValue("state", locationData.state, { shouldValidate: true });
        if (locationData.lat && locationData.lng) {
          setValue("latitude", locationData.lat, { shouldValidate: true });
          setValue("longitude", locationData.lng, { shouldValidate: true });
        }
      } catch (error) {
        console.error("Failed to fetch location", error);
      } finally {
        setPincodeLoading(false);
      }
    }
  };

  const handleMapLocationSelect = (location: any) => {
    if (location.address) setValue("address", location.address, { shouldValidate: true });
    if (location.city) setValue("city", location.city, { shouldValidate: true });
    if (location.state) setValue("state", location.state, { shouldValidate: true });
    if (location.zipCode) setValue("zipCode", location.zipCode, { shouldValidate: true });
    setValue("latitude", location.lat, { shouldValidate: true });
    setValue("longitude", location.lng, { shouldValidate: true });
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetchWithAuth(`/api/hoardings/${hoardingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to update hoarding");
      setSuccess("Hoarding Updated Successfully!");
      setTimeout(() => {
        router.push(`/admin/vendors/${vendorId}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push(`/admin/vendors/${vendorId}`)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Hoarding</h1>
            <p className="text-gray-500 mt-1">Updating media asset details as Admin</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl font-bold">{error}</div>}
          {success && (
            <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-xl flex items-center gap-2 font-bold">
              <CheckCircle /> {success}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
            {/* Form fields same as add page but with reset data */}
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Basic Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Hoarding Title</label>
                  <input
                    {...register("name")}
                    placeholder="e.g. Hoarding at Birsha Chawk"
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#2563eb] outline-none font-medium"
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1 font-bold">{errors.name.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                  <textarea
                    {...register("description")}
                    rows={3}
                    placeholder="Describe visibility, traffic, etc."
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#2563eb] outline-none font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Photos */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Photos</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 group">
                    <img src={img} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <div className="aspect-square border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors relative">
                  {uploading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <ImageIcon className="mb-2" />
                      <span className="text-[10px] font-bold uppercase">Upload Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Location</h3>
              
              <input type="hidden" {...register("latitude", { valueAsNumber: true })} />
              <input type="hidden" {...register("longitude", { valueAsNumber: true })} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Full Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <input
                      {...register("address")}
                      placeholder="Exact street address"
                      className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#2563eb] outline-none font-medium"
                    />
                  </div>
                  {errors.address && <p className="text-xs text-red-500 mt-1 font-bold">{errors.address.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Zip Code</label>
                  <div className="relative">
                    <input
                      value={watch("zipCode") || ""}
                      onChange={handlePincodeChange}
                      placeholder="Enter 6-digit pincode"
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#2563eb] outline-none font-medium"
                    />
                    {pincodeLoading && (
                      <Loader2 className="absolute right-3 top-3.5 h-4 w-4 animate-spin text-[#2563eb]" />
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">City</label>
                  <input
                    {...register("city")}
                    placeholder="e.g. Mumbai"
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#2563eb] outline-none font-medium"
                  />
                  {errors.city && <p className="text-xs text-red-500 mt-1 font-bold">{errors.city.message}</p>}
                </div>
              </div>
              <div className="mt-4 rounded-2xl overflow-hidden border">
                <MapLocationPicker
                  onLocationSelect={handleMapLocationSelect}
                  searchAddress={[watch("address"), watch("city"), watch("state")].filter(Boolean).join(", ")}
                />
              </div>
            </div>

            {/* Specs & Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Specs & Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
                  <select
                    {...register("type")}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#2563eb] outline-none font-bold"
                  >
                    <option value="Hoarding">Hoarding</option>
                    <option value="Unipole">Unipole</option>
                    <option value="Gantry">Gantry</option>
                    <option value="Bus Shelter">Bus Shelter</option>
                    <option value="Kiosk">Kiosk</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Lighting</label>
                  <select
                    {...register("lightingType")}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#2563eb] outline-none font-bold"
                  >
                    <option value="Non-Lit">Non-Lit</option>
                    <option value="Lit">Lit</option>
                    <option value="Front Lit">Front Lit</option>
                    <option value="Back Lit">Back Lit</option>
                  </select>
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">Price Per Month</label>
                   <div className="relative">
                      <IndianRupee className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                      <input
                        {...register("pricePerMonth", { valueAsNumber: true })}
                        type="number"
                        className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#2563eb] outline-none font-bold"
                      />
                   </div>
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">Unique Reach / Week</label>
                   <input
                    {...register("uniqueReach", { valueAsNumber: true })}
                    type="number"
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#2563eb] outline-none font-bold"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#2563eb] text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              {isSubmitting ? "Saving Changes..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
