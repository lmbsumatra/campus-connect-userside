export const FOR_RENT = "For Rent";

export const FOR_SALE = "For Sale";

export const TO_BUY = "To Buy";

export const TO_RENT = "To Rent";

export const PICK_UP = "pickup";

export const MEET_UP = "meetup";

export const PAY_UPON_MEETUP = "payment upon meetup";

export const GCASH = "gcash";

export const STRIPE = "stripe";

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

export const REACT_APP_API_URL = "http://api.rentupeers.shop";
export const baseApi = REACT_APP_API_URL || "http://api.rentupeers.shop";
export const baseUrl = "http://localhost:3000"
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

export const STATUS_OPTIONS = [
  "pending",
  "approved",
  "declined",
  "removed",
  "revoked",
  "flagged",
  "unavailable",
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

export const collegesAndCourses = {
  COE: {
    // College of Engineering
    "01": "Bachelor of Science in Civil Engineering (BSCE)",
    "02": "Bachelor of Science in Electrical Engineering (BSEE)",
    "03": "Bachelor of Science in Electronics Engineering (BSECE)",
    "04": "Bachelor of Science in Mechanical Engineering (BSME)",
  },

  COS: {
    // College of Science
    "05": "Bachelor of Applied Science in Laboratory Technology (BAS-LT)",
    "06": "Bachelor of Science in Computer Science (BSCS)",
    "07": "Bachelor of Science in Environmental Science (BSES)",
    "08": "Bachelor of Science in Information System (BSIS)",
    "09": "Bachelor of Science in Information Technology (BSIT)",
  },

  CAFA: {
    // College of Architecture and Fine Arts
    10: "Bachelor of Science Architecture (BSA)",
    11: "Bachelor of Science in Fine Arts (BFA)",
    12: "Bachelor's in Graphic Technology major in Architecture Technology (BGT-AT)",
    13: "Bachelor's in Graphic Technology major in Industrial Design (BGT-ID)",
    14: "Bachelor's in Graphic Technology major in Mechanical Drafting Technology (BGT-MDT)",
  },

  CIE: {
    // College of Industrial Education
    15: "Bachelor of Technology and Livelihood Education - Information and Communication Technology (BTLE-ICT)",
    16: "Bachelor of Technology and Livelihood Education - Home Economics (BTLE-HE)",
    17: "Bachelor of Technology and Livelihood Education - Industrial Arts (BTLE-IA)",
    18: "Bachelor of Technical Vocational Teachers Education - Automotive (BTVTED-AUTOTECH)",
    19: "Bachelor of Technical Vocational Teachers Education - Beauty Care and Wellness (BTVTED-BCW)",
    20: "Bachelor of Technical Vocational Teachers Education - Electrical (BTVTED-ET)",
    21: "Bachelor of Technical Vocational Teachers Education - Electronics (BTVTED-EST)",
    22: "Bachelor of Technical Vocational Teachers Education - Food Service Management (BTVTED-FSM)",
    23: "Bachelor of Technical Vocational Teachers Education - Fashion and Garment (BTVTED-FGT)",
    24: "Bachelor of Technical Vocational Teachers Education - Animation (BTVTED-ANI)",
    25: "Bachelor of Technical Vocational Teachers Education - Computer Programming (BTVTED-COMPRO)",
  },

  CIT: {
    // College of Industrial Technology
    26: "Bachelor of Science in Food Technology (BSFT)",
    27: "Bachelor of Technology Major in Apparel and Fashion (BT-AFT)",
    28: "Bachelor of Technology in Culinary Technology (BT-CLT)",
    29: "Bachelor of Technology Major in Print Media Technology (BT-PMT)",
    30: "Bachelor of Engineering Technology Major in Computer Engineering Technology (BET-CPET)",
    31: "Bachelor of Engineering Technology Major in Construction Technology (BET-CT)",
    32: "Bachelor of Engineering Technology Major in Electrical Technology (BET-ET)",
    33: "Bachelor of Engineering Technology Major in Electronic Communication Technology (BET-ECT)",
    34: "Bachelor of Engineering Technology Major in Electronics Technology (BET-EST)",
    35: "Bachelor of Engineering Technology Major in Instrumentation and Control Technology (BET-INCT)",
    36: "Bachelor of Engineering Technology Major in Mechanical Technology (BET-MT)",
    37: "Bachelor of Engineering Technology Major in Mechatronics Technology (BET-MECT)",
    38: "Bachelor of Engineering Technology Major in Railway Technology (BET-RT)",
    39: "Bachelor of Engineering Technology with Option in Automotive Technology (BETMET-AT)",
    40: "Bachelor of Engineering Technology with Option in Dies and Moulds Technology (BETMET-DMT)",
    41: "Bachelor of Engineering Technology with Option in Heating Ventilating and Air-Conditioning/Refrigeration (BETMET-HVAC/R)",
    42: "Bachelor of Engineering Technology with Option in Power Plant Technology (BETMET-PPT)",
    43: "Bachelor of Engineering Technology with Option in Welding Technology (BETMET-WT)",
  },

  CLA: {
    // College of Liberal Arts
    44: "Bachelor of Science in Business Management major in Industrial Management (BSBA-IM)",
    45: "Bachelor of Science in Entrepreneurship (BSEN)",
    46: "Bachelor of Science in Hospitality Management (BSHM)",
  },
};


export const getStatusClass = (status) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'alert-warning';
    case 'approved':
      return 'alert-success';
    case 'declined':
    case 'revoked':
    case 'flagged':
      return 'alert-danger';
    case 'removed':
      return 'alert-secondary';
    case 'unavailable':
      return 'alert-dark';
    default:
      return 'alert-info';
  }
};
