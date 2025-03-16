import { FOR_RENT, FOR_SALE, TO_BUY, TO_RENT } from "./consonants";

export const addItemBreadcrumbs = ({ itemType }) => [
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
        ? "/profile/my-listings"
        : itemType === FOR_SALE
        ? "/profile/my-for-sale"
        : "/unknown",
  },
  {
    label:
      itemType === FOR_RENT
        ? "Add Listing"
        : itemType === FOR_SALE
        ? "Add Item for Sale"
        : "Unknown Item Type",
    href:
      itemType === FOR_RENT
        ? "/listings/edit"
        : itemType === FOR_SALE
        ? "/profile/item-for-sale/add"
        : "/unknown",
  },
];
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
        ? "/profile/my-listings"
        : itemType === FOR_SALE
        ? "/profile/my-for-sale"
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
        ? "/profile/listings/edit"
        : itemType === FOR_SALE
        ? "/profile/my-for-sale/edit"
        : "/unknown",
  },
];

export const editPostBreadcrumbs = ({ itemType }) => [
  { label: "Home", href: "/" },
  { label: "Profile", href: "/profile" },
  {
    label: "My Posts",
    href: "/profile/my-posts",
  },
  {
    label: "Edit Post",
    href: "/profile/my-posts/edit",
  },
];
