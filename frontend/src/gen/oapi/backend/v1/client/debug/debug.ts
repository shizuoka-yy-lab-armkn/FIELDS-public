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
import type { PingResponse } from "../../schema";

// eslint-disable-next-line
type SecondParameter<T extends (...args: any) => any> = T extends (
  config: any,
  args: infer P,
) => any ? P
  : never;

/**
 * @summary 疎通確認API
 */
export const ping = (
  options?: SecondParameter<typeof customAxios>,
  signal?: AbortSignal,
) => {
  return customAxios<PingResponse>(
    { url: `/api/v1/debug/ping`, method: "get", signal },
    options,
  );
};

export const getPingQueryKey = () => {
  return [`/api/v1/debug/ping`] as const;
};

export const getPingQueryOptions = <TData = Awaited<ReturnType<typeof ping>>, TError = ErrorType<unknown>>(
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof ping>>, TError, TData>>;
    request?: SecondParameter<typeof customAxios>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getPingQueryKey();

  const queryFn: QueryFunction<Awaited<ReturnType<typeof ping>>> = ({ signal }) => ping(requestOptions, signal);

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<Awaited<ReturnType<typeof ping>>, TError, TData> & {
    queryKey: QueryKey;
  };
};

export type PingQueryResult = NonNullable<Awaited<ReturnType<typeof ping>>>;
export type PingQueryError = ErrorType<unknown>;

/**
 * @summary 疎通確認API
 */
export const usePing = <TData = Awaited<ReturnType<typeof ping>>, TError = ErrorType<unknown>>(
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof ping>>, TError, TData>>;
    request?: SecondParameter<typeof customAxios>;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getPingQueryOptions(options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };

  query.queryKey = queryOptions.queryKey;

  return query;
};
