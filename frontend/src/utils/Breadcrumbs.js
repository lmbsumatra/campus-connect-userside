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
        : itemType === TO_RENT
        ? "My Posts"
        : itemType === TO_BUY
        ? "My Posts"
        : "Unknown",
    href:
      itemType === FOR_RENT
        ? "/profile/my-listings"
        : itemType === FOR_SALE
        ? "/profile/my-for-sale"
        : itemType === TO_RENT
        ? "/profile/my-for-rent"
        : itemType === TO_BUY
        ? "/profile/my-to-buy"
        : "/unknown",
  },
  {
    label:
      itemType === FOR_RENT
        ? "Add Listing"
        : itemType === FOR_SALE
        ? "Add Item for Sale"
        : itemType === TO_RENT
        ? "Add Post"
        : itemType === TO_BUY
        ? "Add Post"
        : "Unknown Item Type",
    href:
      itemType === FOR_RENT
        ? "/listings/edit"
        : itemType === FOR_SALE
        ? "/profile/item-for-sale/add"
        : itemType === TO_RENT
        ? "/profile/my-posts/add"
        : itemType === TO_BUY
        ? "/profile/my-posts/add"
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
        : itemType === TO_RENT
        ? "My Posts"
        : itemType === TO_BUY
        ? "My Posts"
        : "Unknown",
    href:
      itemType === FOR_RENT
        ? "/profile/my-listings"
        : itemType === FOR_SALE
        ? "/profile/my-for-sale"
        : itemType === TO_RENT
        ? "/profile/my-posts"
        : itemType === TO_BUY
        ? "/profile/my-posts"
        : "/unknown",
  },
  {
    label:
      itemType === FOR_RENT
        ? "Edit Listing"
        : itemType === FOR_SALE
        ? "Edit Item for Sale"
        : itemType === TO_RENT
        ? "Edit Post"
        : itemType === TO_BUY
        ? "Edit Post"
        : "Unknown Item Type",
    href:
      itemType === FOR_RENT
        ? "/profile/listings/edit"
        : itemType === FOR_SALE
        ? "/profile/my-for-sale/edit"
        : itemType === TO_RENT
        ? "/profile/my-posts/edit"
        : itemType === TO_BUY
        ? "/profile/my-posts/edit"
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
