import { createSlice } from "@reduxjs/toolkit";
import {
  FOR_SALE,
  GCASH,
  MEET_UP,
  PAY_UPON_MEETUP,
  PICK_UP,
} from "../../utils/consonants";
import { faker } from "@faker-js/faker";
import {
  formatDateFromSelectDate,
  formatTimeWithAMPM,
} from "../../utils/dateFormat.js";

// Utility function to validate available dates
const validateAvailableDates = (dates) => {
  const errors = [];

  if (!dates || dates.length === 0) {
    errors.push("At least one available date is required.");
    return errors;
  }

  // Check if each date has at least one time period
  const datesWithoutTime = dates.filter(
    (date) => !date.timePeriods || date.timePeriods.length === 0
  );
  if (datesWithoutTime.length > 0) {
    errors.push("Each selected date must have at least one time period.");
  }

  // Validate time periods
  dates.forEach((dateItem) => {
    if (dateItem.timePeriods) {
      dateItem.timePeriods.forEach((period) => {
        if (!period.startTime || !period.endTime) {
          errors.push("Start and end times are required for all time periods.");
        } else if (period.startTime >= period.endTime) {
          errors.push("End time must be after start time.");
        }
      });
    }
  });

  // Check for overlapping time periods on the same date
  dates.forEach((dateItem) => {
    if (dateItem.timePeriods && dateItem.timePeriods.length > 1) {
      for (let i = 0; i < dateItem.timePeriods.length; i++) {
        for (let j = i + 1; j < dateItem.timePeriods.length; j++) {
          const period1 = dateItem.timePeriods[i];
          const period2 = dateItem.timePeriods[j];

          if (
            (period1.startTime <= period2.endTime &&
              period1.endTime >= period2.startTime) ||
            (period2.startTime <= period1.endTime &&
              period2.endTime >= period1.startTime)
          ) {
            errors.push("Time periods cannot overlap on the same date.");
            break;
          }
        }
      }
    }
  });

  return errors;
};

// Utility function for input validation
export const validateInput = (name, value, itemType) => {
  let hasError = false;
  let error = "";
  switch (name) {
    case "category":
      if (value.trim() === "") {
        hasError = true;
        error = "Category cannot be empty.";
      } else {
        hasError = false;
        error = "";
      }
      break;

    case "itemName":
      if (value.trim() === "") {
        hasError = true;
        error = "Item name cannot be empty.";
      } else {
        hasError = false;
        error = "";
      }
      break;

    case "price":
      if (value.trim() === "") {
        hasError = true;
        error = "Price cannot be empty.";
      } else if (!/^(?:\d{1,10}|\d{1,10}\.\d{1,2})$/.test(value)) {
        hasError = true;
        error =
          "Price should be whole number, can be decimal, and only up to 2 decimals.";
      } else {
        hasError = false;
        error = "";
      }
      break;

    case "availableDates":
      const dateValidation = validateAvailableDates(value);
      if (dateValidation.length > 0) {
        hasError = true;
        error = dateValidation.join(" ");
      } else {
        hasError = false;
        error = "";
      }
      break;

    case "deliveryMethod":
      if (value.trim() === "") {
        hasError = true;
        error = "Delivery method cannot be empty.";
      } else if (value !== PICK_UP && value !== MEET_UP) {
        // Changed to AND
        console.log(value, PICK_UP, MEET_UP);
        hasError = true;
        error = "Please choose between pickup and meetup only.";
      } else {
        hasError = false;
        error = "";
      }
      break;

    case "paymentMethod":
      if (value.trim() === "") {
        hasError = true;
        error = "Payment method cannot be empty.";
      } else if (value !== PAY_UPON_MEETUP && value !== GCASH) {
        // Changed to AND
        hasError = true;
        error = "Please choose between Payment upon meetup and Gcash only.";
      } else {
        hasError = false;
        error = "";
      }
      break;
    case "itemCondition":
      if (value.trim() === "") {
        hasError = true;
        error = "Item condition cannot be empty.";
      } else {
        hasError = false;
        error = "";
      }
      break;

    case "lateCharges":
      if (itemType === FOR_SALE) break;
      if (value.trim() === "") {
        hasError = true;
        error =
          "Late charges cannot be empty. Set as 0(zero) if you don't want to add.";
      } else if (!/^(?:\d{1,10}|\d{1,10}\.\d{1,2})$/.test(value)) {
        hasError = true;
        error =
          "Late charges should be whole number, can be decimal, and only up to 2 decimals.";
      } else {
        hasError = false;
        error = "";
      }
      break;

    case "securityDeposit":
      if (itemType === FOR_SALE) break;
      if (value.trim() === "") {
        hasError = true;
        error =
          "Security deposit cannot be empty. Set as 0(zero) if you don't want to add.";
      } else if (!/^(?:\d{1,10}|\d{1,10}\.\d{1,2})$/.test(value)) {
        hasError = true;
        error =
          "Security deposit should be whole number, can be decimal, and only up to 2 decimals.";
      } else {
        hasError = false;
        error = "";
      }
      break;

    case "repairReplacement":
      if (itemType === FOR_SALE) break;
      if (value.trim() === "") {
        hasError = true;
        error = "Repair and replacement condition is required.";
      } else {
        hasError = false;
        error = "";
      }
      break;
    case "desc":
      if (value.trim() === "") {
        hasError = true;
        error = "Item description is required.";
      } else {
        hasError = false;
        error = "";
      }
      break;

    case "tags":
      const isTagsEmpty = value.length === 0;
      const isTagsLessThan3 = value.length < 3;
      console.log(isTagsEmpty, isTagsLessThan3, value.length);
      if (isTagsEmpty) {
        hasError = true;
        error = "Tag is required.";
        console.log(isTagsEmpty, error, hasError);
      } else if (value.length < 3) {
        hasError = true;
        error = "Add at least 3 tags.";
      } else {
        hasError = false;
        error = "";
      }
      break;
    case "specs":
      if (
        !value ||
        typeof value !== "object" ||
        Object.keys(value).length === 0
      ) {
        hasError = true;
        error = "Both key and value are required.";
      } else {
        const entries = Object.entries(value);

        // Get the last entry
        const [key, specValue] = entries[entries.length - 1] || [null, null];

        // Validate key and specValue
        if (!key || !specValue || !key.trim() || !specValue.trim()) {
          hasError = true;
          error = "Both key and value are required.";
        } else if (key.length > 50) {
          hasError = true;
          error = "Key cannot exceed 50 characters.";
        } else if (specValue.length > 100) {
          hasError = true;
          error = "Value cannot exceed 100 characters.";
        } else if (!/^[a-zA-Z0-9 _-]+$/.test(key)) {
          hasError = true;
          error = "Key contains invalid characters.";
        } else if (!/^[a-zA-Z0-9 _.,-]+$/.test(specValue)) {
          hasError = true;
          error = "Value contains invalid characters.";
        } else {
          hasError = false;
          error = "";
        }
      }
      break;
    case "images": {
      const allowedTypes = [
        "image/jpg",
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      const maxSize = 5 * 1024 * 1024; // 5MB limit

      if (!value || value.length === 0) {
        hasError = true;
        error = "At least one image is required.";
      } else if (value.length > 5) {
        hasError = true;
        error = "Maximum of 5 images only.";
      } else {
        for (const fileName of value) {
          const fileExtension = fileName.split(".").pop().toLowerCase();

          if (!allowedTypes.includes(`image/${fileExtension}`)) {
            hasError = true;
            error =
              "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.";
            break;
          }
          // Assuming you're not validating file sizes since you don't have the full file object
          // If needed, you could add a validation step for sizes in metadata as well
        }
      }

      break;
    }
    default:
      hasError = false;
      error = "";
      break;
  }

  return { hasError, error };
};

// Initial state
const initialState = {
  category: { value: "", triggered: false, hasError: false, error: "" },
  itemName: { value: "", triggered: false, hasError: false, error: "" },
  itemType: { value: "", triggered: false, hasError: false, error: "" },
  price: { value: "", triggered: false, hasError: false, error: "" },
  availableDates: {
    value: [],
    triggered: false,
    hasError: false,
    error: "",
  },
  deliveryMethod: { value: "", triggered: false, hasError: false, error: "" },
  paymentMethod: { value: "", triggered: false, hasError: false, error: "" },
  itemCondition: { value: "", triggered: false, hasError: false, error: "" },
  lateCharges: { value: "", triggered: false, hasError: false, error: "" },
  securityDeposit: { value: "", triggered: false, hasError: false, error: "" },
  repairReplacement: {
    value: "",
    triggered: false,
    hasError: false,
    error: "",
  },

  images: { value: [], triggered: false, hasError: false, error: "" }, // Array of images
  desc: { value: "", triggered: false, hasError: false, error: "" }, // Array of tags
  tags: { value: [], triggered: false, hasError: false, error: "" }, // Array of tags
  specs: { value: {}, triggered: false, hasError: false, error: "" }, // Object for specs

  isFormValid: false,
};

// Create a slice for the form
const itemFormSlice = createSlice({
  name: "item-form",
  initialState,
  reducers: {
    generateSampleData: (state) => {
      state.itemName.value = faker.commerce.productName();
      state.price.value = faker.commerce.price(10, 1000);
      state.category.value = faker.helpers.arrayElement([
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
      ]);

      // Generate helpers tags
      state.tags.value = [
        faker.lorem.word(),
        faker.lorem.word(),
        faker.lorem.word(),
      ];

      // Generate a helpers description
      state.desc.value = faker.lorem.sentences(3);

      // Generate available dates with time periods
      state.availableDates.value = [
        {
          date: formatDateFromSelectDate(faker.date.future()),
          timePeriods: [
            {
              startTime: formatTimeWithAMPM(faker.date.future()), 
              endTime: formatTimeWithAMPM(faker.date.future()), 
            },
          ],
        },
      ];

      state.deliveryMethod.value =
        faker.helpers.arrayElement(["pickup", "meetup"]) || "pickup";

      // Generate helpers payment method
      state.paymentMethod.value =
        faker.helpers.arrayElement(["payment upon meetup", "gcash"]) || "gcash";

      // Generate helpers item condition
      state.itemCondition.value = faker.helpers.arrayElement([
        "New",
        "Like New",
        "Used",
        "Damaged",
      ]);

      // Generate helpers late charges
      state.lateCharges.value = faker.finance.amount(5, 50, 2);

      // Generate helpers security deposit amount
      state.securityDeposit.value = faker.finance.amount(100, 500, 2);

      // Generate repair/replacement option
      state.repairReplacement.value = faker.helpers.arrayElement(["Yes", "No"]);

      // Generate helpers images (URLs)
      state.images.value = [
        faker.image.url(),
        faker.image.url(),
        faker.image.url(), // You can add more or less as needed
      ];

      // Generate helpers item specifications
      state.specs.value = {
        color: faker.color.human(),
        size: faker.helpers.arrayElement(["S", "M", "L"]),
        brand: faker.company.name(), // Example of adding a brand field
        weight: `${faker.number.float({ min: 1, max: 10 })} kg`, // helpers weight
      };
    },
    updateAvailableDates: (state, action) => {
      const { hasError, error } = validateInput(
        "availableDates",
        action.payload
      );
      state.availableDates = {
        value: action.payload,
        hasError,
        error,
        triggered: true,
      };
    },
    updateField: (state, action) => {
      const { name, value } = action.payload;
      const itemType = state.itemType.value; // Get current itemType
      const { hasError, error } = validateInput(name, value, itemType);

      // Update the field
      state[name] = { value, hasError, error, triggered: false };

      // Recalculate form validity
      state.isFormValid = Object.keys(state).every(
        (key) => key === "isFormValid" || !state[key].hasError
      );
    },
    blurField: (state, action) => {
      const { name, value } = action.payload;
      const itemType = state.itemType.value; // Get current itemType
      const { hasError, error } = validateInput(name, value, itemType);

      // Update the field on blur
      state[name] = { value, hasError, error, triggered: true };

      // Recalculate form validity
      state.isFormValid = Object.keys(state).every(
        (key) => key === "isFormValid" || !state[key].hasError
      );
    },
  },
});

// Export actions
export const {
  updateField,
  blurField,
  updateAvailableDates,
  generateSampleData,
} = itemFormSlice.actions;

// Export the reducer
export default itemFormSlice.reducer;
