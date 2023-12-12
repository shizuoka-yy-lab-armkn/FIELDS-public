/**
 * Generated by orval v6.19.1 🍺
 * Do not edit manually.
 * FIELDS Backend API
 * OpenAPI spec version: 0.1.0
 */
import { useQuery } from "@tanstack/react-query";
import type { QueryFunction, QueryKey, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { customAxios } from "../../../../../../config/orval/backend";
import type { ErrorType } from "../../../../../../config/orval/backend";
import type { User } from "../../schema";

// eslint-disable-next-line
type SecondParameter<T extends (...args: any) => any> = T extends (
  config: any,
  args: infer P,
) => any ? P
  : never;

/**
 * @summary Get User List
 */
export const getUserList = (
  options?: SecondParameter<typeof customAxios>,
  signal?: AbortSignal,
) => {
  return customAxios<User[]>(
    { url: `/api/v1/users`, method: "get", signal },
    options,
  );
};

export const getGetUserListQueryKey = () => {
  return [`/api/v1/users`] as const;
};

export const getGetUserListQueryOptions = <
  TData = Awaited<ReturnType<typeof getUserList>>,
  TError = ErrorType<unknown>,
>(
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getUserList>>, TError, TData>>;
    request?: SecondParameter<typeof customAxios>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getGetUserListQueryKey();

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getUserList>>> = ({ signal }) =>
    getUserList(requestOptions, signal);

  return { queryKey, queryFn, ...queryOptions } as
    & UseQueryOptions<Awaited<ReturnType<typeof getUserList>>, TError, TData>
    & { queryKey: QueryKey };
};

export type GetUserListQueryResult = NonNullable<Awaited<ReturnType<typeof getUserList>>>;
export type GetUserListQueryError = ErrorType<unknown>;

/**
 * @summary Get User List
 */
export const useGetUserList = <TData = Awaited<ReturnType<typeof getUserList>>, TError = ErrorType<unknown>>(
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getUserList>>, TError, TData>>;
    request?: SecondParameter<typeof customAxios>;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getGetUserListQueryOptions(options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };

  query.queryKey = queryOptions.queryKey;

  return query;
};

/**
 * @summary Get Me
 */
export const getMe = (
  options?: SecondParameter<typeof customAxios>,
  signal?: AbortSignal,
) => {
  return customAxios<User>(
    { url: `/api/v1/users/me`, method: "get", signal },
    options,
  );
};

export const getGetMeQueryKey = () => {
  return [`/api/v1/users/me`] as const;
};

export const getGetMeQueryOptions = <TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<unknown>>(
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>>;
    request?: SecondParameter<typeof customAxios>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getGetMeQueryKey();

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getMe>>> = ({ signal }) => getMe(requestOptions, signal);

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData> & {
    queryKey: QueryKey;
  };
};

export type GetMeQueryResult = NonNullable<Awaited<ReturnType<typeof getMe>>>;
export type GetMeQueryError = ErrorType<unknown>;

/**
 * @summary Get Me
 */
export const useGetMe = <TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<unknown>>(
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>>;
    request?: SecondParameter<typeof customAxios>;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getGetMeQueryOptions(options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };

  query.queryKey = queryOptions.queryKey;

  return query;
};
