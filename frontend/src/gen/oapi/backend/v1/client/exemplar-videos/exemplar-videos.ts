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
import type { ExemplarVideo, HTTPValidationError } from "../../schema";

// eslint-disable-next-line
type SecondParameter<T extends (...args: any) => any> = T extends (
  config: any,
  args: infer P,
) => any ? P
  : never;

/**
 * @summary Get Exemplar Video List
 */
export const getExemplarVideoList = (
  options?: SecondParameter<typeof customAxios>,
  signal?: AbortSignal,
) => {
  return customAxios<ExemplarVideo[]>(
    { url: `/api/v1/exemplar-videos`, method: "get", signal },
    options,
  );
};

export const getGetExemplarVideoListQueryKey = () => {
  return [`/api/v1/exemplar-videos`] as const;
};

export const getGetExemplarVideoListQueryOptions = <
  TData = Awaited<ReturnType<typeof getExemplarVideoList>>,
  TError = ErrorType<unknown>,
>(
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getExemplarVideoList>>, TError, TData>>;
    request?: SecondParameter<typeof customAxios>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getGetExemplarVideoListQueryKey();

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getExemplarVideoList>>> = ({ signal }) =>
    getExemplarVideoList(requestOptions, signal);

  return { queryKey, queryFn, ...queryOptions } as
    & UseQueryOptions<Awaited<ReturnType<typeof getExemplarVideoList>>, TError, TData>
    & { queryKey: QueryKey };
};

export type GetExemplarVideoListQueryResult = NonNullable<Awaited<ReturnType<typeof getExemplarVideoList>>>;
export type GetExemplarVideoListQueryError = ErrorType<unknown>;

/**
 * @summary Get Exemplar Video List
 */
export const useGetExemplarVideoList = <
  TData = Awaited<ReturnType<typeof getExemplarVideoList>>,
  TError = ErrorType<unknown>,
>(
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getExemplarVideoList>>, TError, TData>>;
    request?: SecondParameter<typeof customAxios>;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getGetExemplarVideoListQueryOptions(options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };

  query.queryKey = queryOptions.queryKey;

  return query;
};

/**
 * @summary Get Exemplar Video
 */
export const getExemplarVideo = (
  exemlarVideoId: string,
  options?: SecondParameter<typeof customAxios>,
  signal?: AbortSignal,
) => {
  return customAxios<ExemplarVideo>(
    { url: `/api/v1/exemplar-videos/${exemlarVideoId}`, method: "get", signal },
    options,
  );
};

export const getGetExemplarVideoQueryKey = (exemlarVideoId: string) => {
  return [`/api/v1/exemplar-videos/${exemlarVideoId}`] as const;
};

export const getGetExemplarVideoQueryOptions = <
  TData = Awaited<ReturnType<typeof getExemplarVideo>>,
  TError = ErrorType<HTTPValidationError>,
>(
  exemlarVideoId: string,
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getExemplarVideo>>, TError, TData>>;
    request?: SecondParameter<typeof customAxios>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getGetExemplarVideoQueryKey(exemlarVideoId);

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getExemplarVideo>>> = ({ signal }) =>
    getExemplarVideo(exemlarVideoId, requestOptions, signal);

  return { queryKey, queryFn, enabled: !!exemlarVideoId, ...queryOptions } as
    & UseQueryOptions<Awaited<ReturnType<typeof getExemplarVideo>>, TError, TData>
    & { queryKey: QueryKey };
};

export type GetExemplarVideoQueryResult = NonNullable<Awaited<ReturnType<typeof getExemplarVideo>>>;
export type GetExemplarVideoQueryError = ErrorType<HTTPValidationError>;

/**
 * @summary Get Exemplar Video
 */
export const useGetExemplarVideo = <
  TData = Awaited<ReturnType<typeof getExemplarVideo>>,
  TError = ErrorType<HTTPValidationError>,
>(
  exemlarVideoId: string,
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getExemplarVideo>>, TError, TData>>;
    request?: SecondParameter<typeof customAxios>;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getGetExemplarVideoQueryOptions(exemlarVideoId, options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };

  query.queryKey = queryOptions.queryKey;

  return query;
};
