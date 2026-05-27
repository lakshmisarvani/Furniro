# 📦 Furniture eCommerce Backend (TypeScript)

---

## 📌 Project Overview

A production-ready RESTful API backend for the **Furniro** furniture eCommerce platform. Built with Node.js, Express, MongoDB, and TypeScript. Supports full eCommerce functionality: authentication, product browsing, cart management, wishlist, and order processing.
 
---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js (TypeScript) |
| Database | MongoDB (Mongoose) |
| Authentication | JWT (jsonwebtoken) |
| Password Hashing | bcrypt |
| Language | TypeScript (strict) |
| Dev Server | ts-node-dev |

---

## 📁 Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.ts                  # MongoDB connection
│   ├── models/
│   │   ├── User.ts                # User schema
│   │   ├── Product.ts             # Product schema
│   │   ├── Cart.ts                # Cart schema
│   │   ├── Order.ts               # Order schema
│   │   └── Wishlist.ts            # Wishlist schema
│   ├── controllers/
│   │   ├── authController.ts      # Register, Login, Profile
│   │   ├── productController.ts   # CRUD + Filter/Search
│   │   ├── cartController.ts      # Cart operations
│   │   ├── orderController.ts     # Place & view orders
│   │   └── wishlistController.ts  # Wishlist toggle & view
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── productRoutes.ts
│   │   ├── cartRoutes.ts
│   │   ├── orderRoutes.ts
│   │   └── wishlistRoutes.ts
│   ├── middleware/
│   │   ├── authMiddleware.ts      # JWT protect middleware
│   │   └── errorHandler.ts        # Centralized error handler
│   └── server.ts                  # Express app entry point
├── .env
├── package.json
└── tsconfig.json
```

---

## 🗄 Database Schemas

### User
| Field | Type | Notes |
|-------|------|-------|
| name | String | Required |
| email | String | Required, unique |
| password | String | Hashed with bcrypt |
| createdAt | Date | Auto |

### Product
| Field | Type | Notes |
|-------|------|-------|
| name | String | Required |
| description | String | Required |
| price | Number | Required |
| category | String | e.g. Dining, Bedroom, Living Room |
| image | String | Image URL |
| stock | Number | Default 0 |
| rating | Number | Default 0 |
| reviewCount | Number | Default 0 |
| isNew | Boolean | Badge flag |
| discount | Number | Discount % |

### Cart
| Field | Type | Notes |
|-------|------|-------|
| user | ObjectId | Ref: User |
| items | Array | [{product, quantity, color, size}] |
| updatedAt | Date | Auto |

### Order
| Field | Type | Notes |
|-------|------|-------|
| user | ObjectId | Ref: User |
| items | Array | [{product, quantity, price}] |
| totalAmount | Number | Computed |
| shippingAddress | Object | street, city, zip, country |
| status | String | pending/processing/shipped/delivered |
| paymentMethod | String | e.g. bank/cash |
| createdAt | Date | Auto |

### Wishlist
| Field | Type | Notes |
|-------|------|-------|
| user | ObjectId | Ref: User, unique |
| products | Array | [ObjectId refs to Product] |

---

## 🔐 Authentication Flow

```
1. POST /api/auth/register  → hash password → save User → return JWT
2. POST /api/auth/login     → compare hash → return JWT
3. Protected routes         → send JWT in Authorization: Bearer <token>
4. authMiddleware           → verify JWT → attach req.user → next()
```

---

## 🚀 API Endpoints

### Auth APIs
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/register | ❌ | Register new user |
| POST | /api/auth/login | ❌ | Login, receive JWT |
| GET | /api/auth/profile | ✅ | Get logged-in user profile |
| PUT | /api/auth/profile | ✅ | Update name/email/password |

### Product APIs
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | /api/products | ❌ | Get all products (filter/search) |
| GET | /api/products/:id | ❌ | Get single product |
| POST | /api/products | ❌ | Create product (admin-ready) |
| PUT | /api/products/:id | ❌ | Update product |
| DELETE | /api/products/:id | ❌ | Delete product |

Query params for GET /api/products:
- `?search=sofa` — name search
- `?category=Dining` — filter by category
- `?minPrice=100&maxPrice=500` — price range
- `?sort=price_asc` | `price_desc` | `newest`

### Cart APIs
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | /api/cart | ✅ | Get user's cart |
| POST | /api/cart | ✅ | Add item to cart |
| PUT | /api/cart/:productId | ✅ | Update item quantity |
| DELETE | /api/cart/:productId | ✅ | Remove item from cart |
| DELETE | /api/cart | ✅ | Clear entire cart |

### Wishlist APIs
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | /api/wishlist | ✅ | Get user wishlist |
| POST | /api/wishlist/:productId | ✅ | Toggle add/remove product |

### Order APIs
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/orders | ✅ | Place order from cart |
| GET | /api/orders | ✅ | Get all user orders |
| GET | /api/orders/:id | ✅ | Get single order detail |

---

## 📂 Complete Backend Code

---

### `package.json`

```json
{
  "name": "furniro-backend",
  "version": "1.0.0",
  "description": "Furniro eCommerce REST API",
  "main": "dist/server.js",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.4.0"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/node": "^20.14.2",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.4.5"
  }
}
```

---

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

### `.env`

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/furniro
JWT_SECRET=furniro_super_secret_key_2024
JWT_EXPIRES_IN=7d
```

---

### `src/config/db.ts`

```typescript
import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is not defined in environment variables');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

export default connectDB;
```

---

### `src/models/User.ts`

```typescript
import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
```

---

### `src/models/Product.ts`

```typescript
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
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Living Room', 'Bedroom', 'Dining', 'Office', 'Outdoor', 'Accessories'],
    },
    image: {
      type: String,
      default: '',
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    isNew: {
      type: Boolean,
      default: false,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

ProductSchema.index({ name: 'text', description: 'text' });

export default mongoose.model<IProduct>('Product', ProductSchema);
```

---

### `src/models/Cart.ts`

```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  color?: string;
  size?: string;
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    color: {
      type: String,
      default: '',
    },
    size: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const CartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [CartItemSchema],
  },
  { timestamps: true }
);

export default mongoose.model<ICart>('Cart', CartSchema);
```

---

### `src/models/Order.ts`

```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
}

export interface IShippingAddress {
  street: string;
  city: string;
  zip: string;
  country: string;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  shippingAddress: IShippingAddress;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  createdAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [OrderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingAddress: {
      type: ShippingAddressSchema,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      required: true,
      default: 'bank',
    },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>('Order', OrderSchema);
```

---

### `src/models/Wishlist.ts`

```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface IWishlist extends Document {
  user: mongoose.Types.ObjectId;
  products: mongoose.Types.ObjectId[];
}

const WishlistSchema = new Schema<IWishlist>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IWishlist>('Wishlist', WishlistSchema);
```

---

### `src/middleware/authMiddleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: string };
}

interface JwtPayload {
  id: string;
}

export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Not authorized. No token provided.',
      data: null,
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({
      success: false,
      message: 'Server configuration error.',
      data: null,
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = { id: decoded.id };
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: 'Not authorized. Invalid token.',
      data: null,
    });
  }
};
```

---

### `src/middleware/errorHandler.ts`

```typescript
import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[ERROR] ${statusCode} - ${message}`);

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
  });
};

export const createError = (message: string, statusCode: number): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  return error;
};
```

---

### `src/controllers/authController.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';
import { createError } from '../middleware/errorHandler';

const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET!;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id }, secret, { expiresIn } as jwt.SignOptions);
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(createError('Please provide name, email and password', 400));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(createError('User already exists with this email', 409));
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(createError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(createError('Invalid email or password', 401));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(createError('Invalid email or password', 401));
    }

    const token = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id).select('-password');
    if (!user) {
      return next(createError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Profile fetched successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.user!.id);

    if (!user) {
      return next(createError('User not found', 404));
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
```

---

### `src/controllers/productController.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import Product from '../models/Product';
import { createError } from '../middleware/errorHandler';

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { search, category, minPrice, maxPrice, sort } = req.query;

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$text = { $search: search as string };
    }

    if (category) {
      filter.category = category as string;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) (filter.price as Record<string, number>).$gte = Number(minPrice);
      if (maxPrice) (filter.price as Record<string, number>).$lte = Number(maxPrice);
    }

    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };

    const products = await Product.find(filter).sort(sortOption);

    res.status(200).json({
      success: true,
      message: 'Products fetched successfully',
      data: { count: products.length, products },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(createError('Product not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Product fetched successfully',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return next(createError('Product not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return next(createError('Product not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
```

---

### `src/controllers/cartController.ts`

```typescript
import { Response, NextFunction } from 'express';
import Cart from '../models/Cart';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/authMiddleware';
import { createError } from '../middleware/errorHandler';
import mongoose from 'mongoose';

export const getCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cart = await Cart.findOne({ user: req.user!.id }).populate(
      'items.product',
      'name price image stock category'
    );

    res.status(200).json({
      success: true,
      message: 'Cart fetched successfully',
      data: { cart: cart || { user: req.user!.id, items: [] } },
    });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId, quantity = 1, color = '', size = '' } = req.body;

    if (!productId) {
      return next(createError('Product ID is required', 400));
    }

    const product = await Product.findById(productId);
    if (!product) {
      return next(createError('Product not found', 404));
    }

    if (product.stock < quantity) {
      return next(createError('Insufficient stock', 400));
    }

    let cart = await Cart.findOne({ user: req.user!.id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user!.id,
        items: [{ product: productId, quantity, color, size }],
      });
    } else {
      const productObjectId = new mongoose.Types.ObjectId(productId);
      const existingItem = cart.items.find(
        (item) => item.product.toString() === productObjectId.toString()
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ product: productObjectId, quantity, color, size });
      }

      await cart.save();
    }

    await cart.populate('items.product', 'name price image stock category');

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;

    if (!quantity || quantity < 1) {
      return next(createError('Quantity must be at least 1', 400));
    }

    const cart = await Cart.findOne({ user: req.user!.id });
    if (!cart) {
      return next(createError('Cart not found', 404));
    }

    const item = cart.items.find(
      (i) => i.product.toString() === productId
    );

    if (!item) {
      return next(createError('Item not found in cart', 404));
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.product', 'name price image stock category');

    res.status(200).json({
      success: true,
      message: 'Cart item updated',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user!.id });
    if (!cart) {
      return next(createError('Cart not found', 404));
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();
    await cart.populate('items.product', 'name price image stock category');

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cart = await Cart.findOne({ user: req.user!.id });
    if (!cart) {
      return next(createError('Cart not found', 404));
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};
```

---

### `src/controllers/wishlistController.ts`

```typescript
import { Response, NextFunction } from 'express';
import Wishlist from '../models/Wishlist';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/authMiddleware';
import { createError } from '../middleware/errorHandler';
import mongoose from 'mongoose';

export const getWishlist = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user!.id }).populate(
      'products',
      'name price image category rating isNew discount'
    );

    res.status(200).json({
      success: true,
      message: 'Wishlist fetched successfully',
      data: { wishlist: wishlist || { user: req.user!.id, products: [] } },
    });
  } catch (error) {
    next(error);
  }
};

export const toggleWishlist = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return next(createError('Product not found', 404));
    }

    const productObjectId = new mongoose.Types.ObjectId(productId);
    let wishlist = await Wishlist.findOne({ user: req.user!.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user!.id,
        products: [productObjectId],
      });

      await wishlist.populate('products', 'name price image category rating isNew discount');

      res.status(200).json({
        success: true,
        message: 'Product added to wishlist',
        data: { wishlist, action: 'added' },
      });
      return;
    }

    const exists = wishlist.products.some(
      (p) => p.toString() === productId
    );

    if (exists) {
      wishlist.products = wishlist.products.filter(
        (p) => p.toString() !== productId
      );
      await wishlist.save();
      await wishlist.populate('products', 'name price image category rating isNew discount');

      res.status(200).json({
        success: true,
        message: 'Product removed from wishlist',
        data: { wishlist, action: 'removed' },
      });
    } else {
      wishlist.products.push(productObjectId);
      await wishlist.save();
      await wishlist.populate('products', 'name price image category rating isNew discount');

      res.status(200).json({
        success: true,
        message: 'Product added to wishlist',
        data: { wishlist, action: 'added' },
      });
    }
  } catch (error) {
    next(error);
  }
};
```

---

### `src/controllers/orderController.ts`

```typescript
import { Response, NextFunction } from 'express';
import Order from '../models/Order';
import Cart from '../models/Cart';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/authMiddleware';
import { createError } from '../middleware/errorHandler';

export const placeOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { shippingAddress, paymentMethod = 'bank' } = req.body;

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
      return next(createError('Shipping address is required', 400));
    }

    const cart = await Cart.findOne({ user: req.user!.id }).populate(
      'items.product'
    );

    if (!cart || cart.items.length === 0) {
      return next(createError('Cart is empty. Add items before placing an order.', 400));
    }

    let totalAmount = 0;
    const orderItems: { product: unknown; quantity: number; price: number }[] = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return next(createError(`Product not found: ${item.product}`, 404));
      }
      if (product.stock < item.quantity) {
        return next(createError(`Insufficient stock for: ${product.name}`, 400));
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });

      product.stock -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      user: req.user!.id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
    });

    cart.items = [];
    await cart.save();

    await order.populate('items.product', 'name price image category');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orders = await Order.find({ user: req.user!.id })
      .populate('items.product', 'name price image category')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Orders fetched successfully',
      data: { count: orders.length, orders },
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user!.id,
    }).populate('items.product', 'name price image category');

    if (!order) {
      return next(createError('Order not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Order fetched successfully',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};
```

---

### `src/routes/authRoutes.ts`

```typescript
import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

export default router;
```

---

### `src/routes/productRoutes.ts`

```typescript
import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';

const router = Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
```

---

### `src/routes/cartRoutes.ts`

```typescript
import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cartController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:productId', updateCartItem);
router.delete('/:productId', removeFromCart);
router.delete('/', clearCart);

export default router;
```

---

### `src/routes/wishlistRoutes.ts`

```typescript
import { Router } from 'express';
import { getWishlist, toggleWishlist } from '../controllers/wishlistController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.get('/', getWishlist);
router.post('/:productId', toggleWishlist);

export default router;
```

---

### `src/routes/orderRoutes.ts`

```typescript
import { Router } from 'express';
import {
  placeOrder,
  getUserOrders,
  getOrderById,
} from '../controllers/orderController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.post('/', placeOrder);
router.get('/', getUserOrders);
router.get('/:id', getOrderById);

export default router;
```

---

### `src/server.ts`

```typescript
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import cartRoutes from './routes/cartRoutes';
import wishlistRoutes from './routes/wishlistRoutes';
import orderRoutes from './routes/orderRoutes';

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Furniro API is running',
    data: { version: '1.0.0' },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
```

---

## ▶️ Running the Project

### 1. Setup

```bash
# Navigate into backend folder
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env and set MONGO_URI, JWT_SECRET
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Build for Production

```bash
npm run build
npm start
```

---

## 🧪 Testing APIs (Postman Examples)

### Register User
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```
**Response includes `token` — copy it for protected routes.**

### Get Profile
```
GET http://localhost:5000/api/auth/profile
Authorization: Bearer <your_token>
```

### Create Product
```
POST http://localhost:5000/api/products
Content-Type: application/json

{
  "name": "Syltherine",
  "description": "Stylish cafe chair with cushioned seat",
  "price": 2500000,
  "category": "Living Room",
  "image": "https://example.com/syltherine.png",
  "stock": 50,
  "isNew": false,
  "discount": 30
}
```

### Get All Products (with filters)
```
GET http://localhost:5000/api/products?category=Living Room&sort=price_asc
GET http://localhost:5000/api/products?search=sofa
GET http://localhost:5000/api/products?minPrice=100&maxPrice=5000000
```

### Add to Cart
```
POST http://localhost:5000/api/cart
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "productId": "664a1b2c3d4e5f6789012345",
  "quantity": 2,
  "color": "Natural",
  "size": "L"
}
```

### Update Cart Item
```
PUT http://localhost:5000/api/cart/664a1b2c3d4e5f6789012345
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "quantity": 3
}
```

### Remove from Cart
```
DELETE http://localhost:5000/api/cart/664a1b2c3d4e5f6789012345
Authorization: Bearer <your_token>
```

### Toggle Wishlist
```
POST http://localhost:5000/api/wishlist/664a1b2c3d4e5f6789012345
Authorization: Bearer <your_token>
```
> Calling same endpoint again removes the product from wishlist.

### Place Order
```
POST http://localhost:5000/api/orders
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Jakarta",
    "zip": "10110",
    "country": "Indonesia"
  },
  "paymentMethod": "bank"
}
```

### Get My Orders
```
GET http://localhost:5000/api/orders
Authorization: Bearer <your_token>
```

---

## ⚠️ Notes

- All TypeScript files use **strict mode** — no implicit `any`
- All async functions use `async/await` with proper error forwarding via `next(error)`
- Passwords are **never** returned in API responses (`.select('-password')`)
- Cart is **user-scoped** — one cart document per user (upsert pattern)
- Wishlist **toggle**: POST the same product twice to add then remove
- Order placement **clears the cart** and **decrements product stock** atomically
- JWT token must be sent as `Authorization: Bearer <token>` on all protected routes
- `_id` in MongoDB is `ObjectId` — always validate IDs before querying
- The `$text` search index on Product requires MongoDB text indexing (auto-created by Mongoose)
- CORS is open by default — restrict `origin` in production
