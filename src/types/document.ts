export const UserRole = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  CINEMA: "CINEMA",
  CUSTOMER: "CUSTOMER",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserStatus = {
  ACTIVE: "ACTIVE",
  LOCKED: "LOCKED",
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export interface User {
  _id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export const MovieStatus = {
  ACTIVE: "ACTIVE",
  HIDDEN: "HIDDEN",
} as const;
export type MovieStatus = (typeof MovieStatus)[keyof typeof MovieStatus];

export const ShowingStatus = {
  NOW_SHOWING: "NOW_SHOWING",
  COMING_SOON: "COMING_SOON",
  STOPPED: "STOPPED",
} as const;
export type ShowingStatus = (typeof ShowingStatus)[keyof typeof ShowingStatus];

export interface Movie {
  _id: string;
  title: string;
  duration: number;
  ageRestriction: number;
  posterUrl: string;
  trailerUrl: string;
  status: MovieStatus;
  category: string[];
  description: string;
  director: {name: string; avatar: string}[];
  actors: {name: string; avatar: string}[];
  rate: number;
  showingStatus: ShowingStatus;
  revenueSharePercent: number;
}

export const FoodType = {
  SINGLE: "SINGLE",
  COMBO: "COMBO",
} as const;
export type FoodType = (typeof FoodType)[keyof typeof FoodType];

export const FoodStatus = {
  ACTIVE: "ACTIVE",
  HIDDEN: "HIDDEN",
} as const;
export type FoodStatus = (typeof FoodStatus)[keyof typeof FoodStatus];

export interface FoodItem {
  foodId: string;
  name: string;
  quantity: number;
}

export interface Food {
  _id: string;
  name: string;
  type: FoodType;
  price: number;
  imageUrl?: string;
  description: string;
  status: FoodStatus;
  items?: FoodItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  foodId: string;
  quantity: number;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

export const SeatType = {
  NORMAL: "NORMAL",
  VIP: "VIP",
  COUPLE: "COUPLE",
} as const;
export type SeatType = (typeof SeatType)[keyof typeof SeatType];

export interface Seat {
  seatCode: string;
  type: SeatType;
}

export const CinemaRoomStatus = {
  ACTIVE: "ACTIVE",
  MAINTENANCE: "MAINTENANCE",
} as const;
export type CinemaRoomStatus = (typeof CinemaRoomStatus)[keyof typeof CinemaRoomStatus];

export interface CinemaRoom {
  _id: string;
  roomName: string;
  status: CinemaRoomStatus;
  seats: {
    NORMAL: string[];
    VIP: string[];
    COUPLE: string[];
  };
}

export const ShowtimeStatus = {
  ACTIVE: "ACTIVE",
  CANCELED: "CANCELED",
  FINISHED: "FINISHED",
} as const;
export type ShowtimeStatus = (typeof ShowtimeStatus)[keyof typeof ShowtimeStatus];

export const SeatStatus = {
  AVAILABLE: "AVAILABLE",
  HELD: "HELD",
  SOLD: "SOLD",
} as const;
export type SeatStatus = (typeof SeatStatus)[keyof typeof SeatStatus];

export interface ShowtimeSeat extends Seat {
  price: number;
  status: SeatStatus;
}

export interface Showtime {
  _id: string;
  movieId: string;
  startTime: Date;
  endTime: Date;
  status: ShowtimeStatus;
  pricingRule: {
    [key in SeatType]: number;
  };
  seats: ShowtimeSeat[];
}

export const BookingStatus = {
  HELD: "HELD",
  PAID: "PAID",
  CHECKED_IN: "CHECKED_IN",
  EXPIRED: "EXPIRED",
  CANCELED: "CANCELED",
} as const;
export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export const PaymentMethod = {
  CASH: "CASH",
  ONLINE: "ONLINE",
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export interface MovieBooking {
  _id: string;
  bookingCode: string;
  showtimeId: string;
  userId: string;
  seats: (ShowtimeSeat & {barcode: string})[];
  totalAmount: number;
  status: BookingStatus;
  foodBookingId?: string;
  payment: {
    method: PaymentMethod;
    paidAt?: Date;
    transactionId?: string;
  };
  createdAt: Date;
  expiredAt: Date;
}

export const FoodBookingStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  CANCELED: "CANCELED",
} as const;
export type FoodBookingStatus = (typeof FoodBookingStatus)[keyof typeof FoodBookingStatus];

export interface FoodBookingItem {
  foodId: string;
  name: string;
  type: FoodType;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface FoodBooking {
  _id: string;
  userId: string;
  items: FoodBookingItem[];
  totalAmount: number;
  status: FoodBookingStatus;
  payment: {
    method: PaymentMethod;
    paidAt?: Date;
    transactionId?: string;
  };
  createdAt: Date;
}

export const ExpenseType = {
  SALARY: "SALARY",
  UTILITY: "UTILITY",
  MAINTENANCE: "MAINTENANCE",
  RENT: "RENT",
  MARKETING: "MARKETING",
  OTHER: "OTHER",
} as const;
export type ExpenseType = (typeof ExpenseType)[keyof typeof ExpenseType];

export interface Expense {
  _id: string;
  type: ExpenseType;
  amount: number;
  description: string;
  date: Date;
  createdBy: string;
  createdAt: Date;
}

export const DiscountType = {
  MOVIE: "MOVIE",
  SHOWTIME: "SHOWTIME",
  ONE_TIME_CODE: "ONE_TIME_CODE",
} as const;
export type DiscountType = (typeof DiscountType)[keyof typeof DiscountType];

export const DiscountValueType = {
  PERCENT: "PERCENT",
  FIXED: "FIXED",
} as const;
export type DiscountValueType = (typeof DiscountValueType)[keyof typeof DiscountValueType];

export const DiscountStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  EXPIRED: "EXPIRED",
} as const;
export type DiscountStatus = (typeof DiscountStatus)[keyof typeof DiscountStatus];

export interface Discount {
  _id: string;
  name: string;
  description: string;
  type: DiscountType;
  discountType: DiscountValueType;
  value: number;
  movieId?: string;
  showtimeId?: string;
  code?: string;
  usageLimit: number;
  usedCount: number;
  startDate: Date;
  endDate: Date;
  status: DiscountStatus;
  createdAt: Date;
  updatedAt: Date;
}
