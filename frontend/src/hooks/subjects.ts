import * as client from "@/gen/oapi/backend/v1/client/subjects/subjects";

export const useGetSubject = (subjectId: string | undefined) => {
  const { data: subject, isLoading, isError } = client.useGetSubject(subjectId ?? "", {
    query: {
      staleTime: Infinity,
    },
  });
  return { subject, isLoading, isError };
};

export const useGetSubjectList = () => {
  const { data: subjects, isLoading, isError } = client.useGetSubjectList({
    query: {
      staleTime: Infinity,
    },
  });
  return { subjects, isLoading, isError };
};
