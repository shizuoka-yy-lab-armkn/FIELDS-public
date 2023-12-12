import * as client from "@/gen/oapi/backend/v1/client/recording/recording";

export const useGetRecordingAvailability = () => {
  const { data: availability, isLoading, isError } = client.useGetRecordingAvailability({
    query: {
      staleTime: 1000,
    },
  });
  return { availability, isLoading, isError };
};
