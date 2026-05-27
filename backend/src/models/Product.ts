import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  rating: number;
  reviewCount: number;
  isNew: boolean;
  discount: number;
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    } as any,
    description: {
      type: String,
      required: [true, 'Description is required'],
    } as any,
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    } as any,
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Living Room', 'Bedroom', 'Dining', 'Office', 'Outdoor', 'Accessories'],
    } as any,
    image: {
      type: String,
      default: '',
    } as any,
    stock: {
      type: Number,
      default: 0,
      min: 0,
    } as any,
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    } as any,
    reviewCount: {
      type: Number,
      default: 0,
    } as any,
    isNew: {
      type: Boolean,
      default: false,
    } as any,
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    } as any,
  },
  { timestamps: true }
);

ProductSchema.index({ name: 'text', description: 'text' });

export default mongoose.model<IProduct>('Product', ProductSchema);
