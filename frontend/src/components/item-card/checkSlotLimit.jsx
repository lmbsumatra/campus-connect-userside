import axios from "axios";
import ShowAlert from "../../utils/ShowAlert";
import { baseApi } from "../../utils/consonants";

export const checkSlotLimit = async ({
  dispatch,
  navigate,
  user,
  student,
  listingType,
  token,
  config,
}) => {
  const isPremiumUser = user?.subscription?.isPremium || false;

  const counts = {
    itemForSale: user?.counts?.itemForSale || 0,
    listingForRent: user?.counts?.listingForRent || 0,
    postLookingForItem: user?.counts?.postLookingForItem || 0,
  };

  const slotLimits = {
    itemForSale: user?.student?.itemSlot || 3,
    listingForRent: user?.student?.listingSlot || 3,
    postLookingForItem: user?.student?.postSlot || 3,
  };

  const itemTypeMap = {
    itemForSale: "items for sale",
    listingForRent: "rental listings",
    postLookingForItem: "wanted items",
  };

  if (!isPremiumUser && counts[listingType] >= slotLimits[listingType]) {
    if (config?.Stripe) {
      ShowAlert(
        dispatch,
        "info",
        "Slot Limit Reached",
        `You've used all your ${slotLimits[listingType]} slots for ${itemTypeMap[listingType]}. Or you may visit USG office`,
        {
          text: "Buy Extra Slot",
          action: async () => {
            try {
              const res = await axios.post(
                `${baseApi}/api/buy-slot/pi`,
                {
                  amount: 25,
                  currency: "PHP",
                  description: `Purchase slot for ${itemTypeMap[listingType]}`,
                  userId: user?.id,
                  listingType,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              const paymentIntent = res.data;
              navigate(`/buy-slot`, {
                state: {
                  token,
                  paymentIntentId: paymentIntent.paymentIntentId,
                  clientSecret: paymentIntent.clientSecret,
                  listingType,
                  userId: user.id,
                },
              });
            } catch (error) {
              console.error("Error creating payment intent:", error);
              ShowAlert(
                dispatch,
                "error",
                "Payment Error",
                "There was an issue creating your payment. Please try again later."
              );
            }
          },
          cancelText: "Maybe Later",
        }
      );
    } else {
      ShowAlert(
        dispatch,
        "info",
        "Slot Limit Reached",
        `You've used all your ${slotLimits[listingType]} slots for ${itemTypeMap[listingType]}. To buy extra slots, please visit the USG office.`
      );
    }

    return false;
  }

  return true;
};
