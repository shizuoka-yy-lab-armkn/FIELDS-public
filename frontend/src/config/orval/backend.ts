// 参考: https://orval.dev/guides/custom-axios
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { backendAxios } from "../axios/backend";

// add a second `options` argument here if you want to pass extra options to each generated query
export const customAxios = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const source = axios.CancelToken.source();
  const promise = backendAxios({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-expect-error: Property 'cancel' does not exist on type 'Promise<any>'
  promise.cancel = () => {
    source.cancel("Query was cancelled");
  };

  return promise;
};

// In some case with react-query and swr you want to be able to override the return error type so you can also do it here like this
export type ErrorType<Error> = AxiosError<Error>;

export type BodyType<BodyData> = BodyData;
