import { useQuery } from "@tanstack/react-query";
import { WishHubSDK } from "@wishhub/sdk";

const sdk = new WishHubSDK(process.env.NEXT_PUBLIC_API_URL || "");

export const useWishlists = () => {
  return useQuery({
    queryKey: ["wishlists"],
    queryFn: () => sdk.getWishlists(),
  });
};
