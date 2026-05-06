import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHoarding extends Document {
  name: string;
  description?: string;
  location: {
    address: string;
    city: string;

    state: string;
    zipCode?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  dimensions: {
    width: number;
    height: number;
  };
  type: string;
  lightingType: 'Lit' | 'Non-Lit' | 'Front Lit' | 'Back Lit';
  pricePerMonth: number;
  minimumBookingAmount: number;
  minimumBookingMonths: number;
  images: string[];
  owner: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  uniqueReach?: number;



  structureType?: string;
  availabilityStatus?: string;
  availability: {
      blockedDates: Array<{ startDate: Date; endDate: Date; reason?: string }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

const HoardingSchema: Schema<IHoarding> = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true, index: true },

    state: { type: String, required: true },
    zipCode: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  dimensions: {
    width: { type: Number, required: true },
    height: { type: Number, required: true }
  },
  type: { 
    type: String, 
    required: true,
    enum: ["Hoarding", "Unipole", "Gantry", "Bus Shelter", "Kiosk", "Other"]
  },
  lightingType: {
    type: String,
    required: true,
    enum: ['Lit', 'Non-Lit', 'Front Lit', 'Back Lit'],
    default: 'Non-Lit'
  },
  pricePerMonth: { type: Number, required: true },
  minimumBookingAmount: { type: Number, default: 0 },
  minimumBookingMonths: { type: Number, default: 1 },
  images: [{ type: String }],
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: {  
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  uniqueReach: { type: Number },


  structureType: { type: String },
  availabilityStatus: { type: String, default: 'Immediately' },
  availability: {
     blockedDates: [{
         startDate: { type: Date },
         endDate: { type: Date },
         reason: { type: String }
     }]
  }
}, {
  timestamps: true
});

HoardingSchema.index({ name: 'text', description: 'text', 'location.city': 'text', 'location.address': 'text' });

if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.Hoarding;
}

const Hoarding = mongoose.models.Hoarding || mongoose.model<IHoarding>('Hoarding', HoardingSchema);

export default Hoarding;
