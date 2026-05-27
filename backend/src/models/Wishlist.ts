import mongoose, { Document, Schema } from 'mongoose';

export interface IWishlistItem {
  productId: string;
  name: string;
  price: number;
  image: string;
}

export interface IWishlist extends Document {
  user: mongoose.Types.ObjectId;
  items: IWishlistItem[];
}

const WishlistItemSchema = new Schema<IWishlistItem>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, default: '' },
  },
  { _id: false }
);

const WishlistSchema = new Schema<IWishlist>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [WishlistItemSchema],
  },
  { timestamps: true }
);

export default mongoose.model<IWishlist>('Wishlist', WishlistSchema);
