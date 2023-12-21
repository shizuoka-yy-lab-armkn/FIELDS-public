import { WithHeader } from "@/components/layout/WithHeader";
import { ChakraNextLink } from "@/components/util/ChakraNextLink";
import { useGetRecordList } from "@/hooks/records";
import { fmtRecordName } from "@/usecase/records";
import { Box, Container, Heading } from "@chakra-ui/react";

export default function RecordListPage() {
  const { records } = useGetRecordList();
  return (
    <WithHeader>
      <Container maxW="720px" minH="100%" pt={8} pb={16} px={4}>
        <Heading as="h1" my={4} color="teal.900">収録履歴</Heading>
        <Box
          as="ul"
          listStyleType="none"
          display="flex"
          flexDir="column"
          gap={4}
        >
          {records?.map((r) => (
            <Box
              as="li"
              key={r.recordId}
              bg="white"
              borderRadius={4}
            >
              <ChakraNextLink
                href={`/records/${r.recordId}`}
                display="block"
                px={4}
                py={3}
                color="teal.900"
                _hover={{
                  bg: "gray.50",
                  color: "cyan.500",
                }}
              >
                {fmtRecordName(r)}
              </ChakraNextLink>
            </Box>
          ))}
        </Box>
      </Container>
    </WithHeader>
  );
}
