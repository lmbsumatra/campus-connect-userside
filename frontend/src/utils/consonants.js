export const FOR_RENT = "For Rent";

export const FOR_SALE = "For Sale";

export const TO_BUY = "To Buy";

export const TO_RENT = "To Rent";

export const PICK_UP = "pickup";

export const MEET_UP = "meetup";

export const PAY_UPON_MEETUP = "payment upon meetup";

export const GCASH = "gcash";

export const STRIPE = "stripe"

export const categories = [
  "Electronics",
  "Home",
  "Fashion",
  "Sports",
  "Books",
  "Toys",
  "Automotive",
  "Health",
  "Hobbies",
  "Technology",
  "Business",
  "Musical",
  "Pet",
  "Event",
  "Travel",
];

export const defaultImages = [
  `https://res.cloudinary.com/campusconnectcl/image/upload/v1735920030/cc/upjauojvyedsriwhdcks.svg`,
];

export const REACT_APP_API_URL = "http://localhost:3001";
export const REACT_APP_GOOGLE_CLIENT_ID =
  "474440031362-3ja3qh8j5bpn0bfs1t7216u8unf0ogat.apps.googleusercontent.com";

// Follow system actions
export const Follow = "Follow";
export const FollowBack = "Follow Back";
export const Following = "Following";

// paths, routes
export const RENT = "rent";
export const SHOP = "shop";
export const LEND = "lend";

export const MY_LISTINGS = "profile/my-listings";
export const MY_ITEMS = "profile/my-for-sale";

// filters

// item conditions
export const CONDITIONS = [
  "New",
  "Used (like new)",
  "Used (fair)",
  "Used (good)",
  "Poor",
];

export const COLLEGES = ["COS", "CAFA", "CIE", "CIT", "COE", "CLA"];

export const DELIVERYMODE = ["pickup", "meetup"];

export const PAYMENTMODE = ["payment upon meetup", "gcash"];

export const defaultFilters = {
  condition: [],
  college: [],
  priceRange: [0, 1000],
  sortBy: "",
  category: "",
  deliveryMethod: "",
  paymentMethod: "",
  lateCharges: false,
  securityDeposit: false,
  repairReplacement: false,
};
