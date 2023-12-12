import * as client from "@/gen/oapi/backend/v1/client/users/users";

export const useGetUsertList = () => {
  const { data: users, isLoading, isError } = client.useGetUserList({
    query: {
      staleTime: Infinity,
    },
  });
  return { users, isLoading, isError };
};
