/**
 * Generated by orval v6.19.1 🍺
 * Do not edit manually.
 * FIELDS Backend API
 * OpenAPI spec version: 0.1.0
 */
import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  MutationFunction,
  QueryFunction,
  QueryKey,
  UseMutationOptions,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { customAxios } from "../../../../../../config/orval/backend";
import type { BodyType, ErrorType } from "../../../../../../config/orval/backend";
import type {
  FinishRecordingResp,
  HTTPValidationError,
  PostRecordingFromLocalVideoReq,
  RecordingAvailability,
  StartRecordingReq,
} from "../../schema";

// eslint-disable-next-line
type SecondParameter<T extends (...args: any) => any> = T extends (
  config: any,
  args: infer P,
) => any ? P
  : never;

/**
 * @summary Get Recording Availability
 */
export const getRecordingAvailability = (
  options?: SecondParameter<typeof customAxios>,
  signal?: AbortSignal,
) => {
  return customAxios<RecordingAvailability>(
    { url: `/api/v1/recording/availability`, method: "get", signal },
    options,
  );
};

export const getGetRecordingAvailabilityQueryKey = () => {
  return [`/api/v1/recording/availability`] as const;
};

export const getGetRecordingAvailabilityQueryOptions = <
  TData = Awaited<ReturnType<typeof getRecordingAvailability>>,
  TError = ErrorType<unknown>,
>(
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getRecordingAvailability>>, TError, TData>>;
    request?: SecondParameter<typeof customAxios>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getGetRecordingAvailabilityQueryKey();

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getRecordingAvailability>>> = ({ signal }) =>
    getRecordingAvailability(requestOptions, signal);

  return { queryKey, queryFn, ...queryOptions } as
    & UseQueryOptions<Awaited<ReturnType<typeof getRecordingAvailability>>, TError, TData>
    & { queryKey: QueryKey };
};

export type GetRecordingAvailabilityQueryResult = NonNullable<Awaited<ReturnType<typeof getRecordingAvailability>>>;
export type GetRecordingAvailabilityQueryError = ErrorType<unknown>;

/**
 * @summary Get Recording Availability
 */
export const useGetRecordingAvailability = <
  TData = Awaited<ReturnType<typeof getRecordingAvailability>>,
  TError = ErrorType<unknown>,
>(
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getRecordingAvailability>>, TError, TData>>;
    request?: SecondParameter<typeof customAxios>;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getGetRecordingAvailabilityQueryOptions(options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };

  query.queryKey = queryOptions.queryKey;

  return query;
};

/**
 * @summary Start Recording
 */
export const startRecording = (
  startRecordingReq: BodyType<StartRecordingReq>,
  options?: SecondParameter<typeof customAxios>,
) => {
  return customAxios<unknown>(
    {
      url: `/api/v1/recording/start`,
      method: "post",
      headers: { "Content-Type": "application/json" },
      data: startRecordingReq,
    },
    options,
  );
};

export const getStartRecordingMutationOptions = <TError = ErrorType<HTTPValidationError>, TContext = unknown>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof startRecording>>,
      TError,
      { data: BodyType<StartRecordingReq> },
      TContext
    >;
    request?: SecondParameter<typeof customAxios>;
  },
): UseMutationOptions<
  Awaited<ReturnType<typeof startRecording>>,
  TError,
  { data: BodyType<StartRecordingReq> },
  TContext
> => {
  const { mutation: mutationOptions, request: requestOptions } = options ?? {};

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof startRecording>>,
    { data: BodyType<StartRecordingReq> }
  > = (props) => {
    const { data } = props ?? {};

    return startRecording(data, requestOptions);
  };

  return { mutationFn, ...mutationOptions };
};

export type StartRecordingMutationResult = NonNullable<Awaited<ReturnType<typeof startRecording>>>;
export type StartRecordingMutationBody = BodyType<StartRecordingReq>;
export type StartRecordingMutationError = ErrorType<HTTPValidationError>;

/**
 * @summary Start Recording
 */
export const useStartRecording = <TError = ErrorType<HTTPValidationError>, TContext = unknown>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof startRecording>>,
      TError,
      { data: BodyType<StartRecordingReq> },
      TContext
    >;
    request?: SecondParameter<typeof customAxios>;
  },
) => {
  const mutationOptions = getStartRecordingMutationOptions(options);

  return useMutation(mutationOptions);
};
/**
 * @summary Finish Recording
 */
export const finishRecording = (
  options?: SecondParameter<typeof customAxios>,
) => {
  return customAxios<FinishRecordingResp>(
    { url: `/api/v1/recording/finish`, method: "post" },
    options,
  );
};

export const getFinishRecordingMutationOptions = <TError = ErrorType<unknown>, TVariables = void, TContext = unknown>(
  options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof finishRecording>>, TError, TVariables, TContext>;
    request?: SecondParameter<typeof customAxios>;
  },
): UseMutationOptions<Awaited<ReturnType<typeof finishRecording>>, TError, TVariables, TContext> => {
  const { mutation: mutationOptions, request: requestOptions } = options ?? {};

  const mutationFn: MutationFunction<Awaited<ReturnType<typeof finishRecording>>, TVariables> = () => {
    return finishRecording(requestOptions);
  };

  return { mutationFn, ...mutationOptions };
};

export type FinishRecordingMutationResult = NonNullable<Awaited<ReturnType<typeof finishRecording>>>;

export type FinishRecordingMutationError = ErrorType<unknown>;

/**
 * @summary Finish Recording
 */
export const useFinishRecording = <TError = ErrorType<unknown>, TVariables = void, TContext = unknown>(
  options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof finishRecording>>, TError, TVariables, TContext>;
    request?: SecondParameter<typeof customAxios>;
  },
) => {
  const mutationOptions = getFinishRecordingMutationOptions(options);

  return useMutation(mutationOptions);
};
/**
 * @summary Post Record
 */
export const postRecord = (
  postRecordingFromLocalVideoReq: BodyType<PostRecordingFromLocalVideoReq>,
  options?: SecondParameter<typeof customAxios>,
) => {
  return customAxios<FinishRecordingResp>(
    {
      url: `/api/v1/recording/local_video`,
      method: "post",
      headers: { "Content-Type": "application/json" },
      data: postRecordingFromLocalVideoReq,
    },
    options,
  );
};

export const getPostRecordMutationOptions = <TError = ErrorType<HTTPValidationError>, TContext = unknown>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof postRecord>>,
      TError,
      { data: BodyType<PostRecordingFromLocalVideoReq> },
      TContext
    >;
    request?: SecondParameter<typeof customAxios>;
  },
): UseMutationOptions<
  Awaited<ReturnType<typeof postRecord>>,
  TError,
  { data: BodyType<PostRecordingFromLocalVideoReq> },
  TContext
> => {
  const { mutation: mutationOptions, request: requestOptions } = options ?? {};

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof postRecord>>,
    { data: BodyType<PostRecordingFromLocalVideoReq> }
  > = (props) => {
    const { data } = props ?? {};

    return postRecord(data, requestOptions);
  };

  return { mutationFn, ...mutationOptions };
};

export type PostRecordMutationResult = NonNullable<Awaited<ReturnType<typeof postRecord>>>;
export type PostRecordMutationBody = BodyType<PostRecordingFromLocalVideoReq>;
export type PostRecordMutationError = ErrorType<HTTPValidationError>;

/**
 * @summary Post Record
 */
export const usePostRecord = <TError = ErrorType<HTTPValidationError>, TContext = unknown>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof postRecord>>,
      TError,
      { data: BodyType<PostRecordingFromLocalVideoReq> },
      TContext
    >;
    request?: SecondParameter<typeof customAxios>;
  },
) => {
  const mutationOptions = getPostRecordMutationOptions(options);

  return useMutation(mutationOptions);
};
