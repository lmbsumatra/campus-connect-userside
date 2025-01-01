import { FOR_RENT, FOR_SALE } from "./consonants";

export const editItemBreadcrumbs = ({ itemType }) => [
  { label: "Home", href: "/" },
  { label: "Profile", href: "/profile" },
  {
    label:
      itemType === FOR_RENT
        ? "My Listings"
        : itemType === FOR_SALE
        ? "My For Sale"
        : "Unknown",
    href:
      itemType === FOR_RENT
        ? "/my-listings"
        : itemType === FOR_SALE
        ? "/my-for-sale"
        : "/unknown",
  },
  {
    label:
      itemType === FOR_RENT
        ? "Edit Listing"
        : itemType === FOR_SALE
        ? "Edit Item for Sale"
        : "Unknown Item Type",
    href:
      itemType === FOR_RENT
        ? "/listings/add"
        : itemType === FOR_SALE
        ? "/item-for-sale/add"
        : "/unknown",
  },
];
