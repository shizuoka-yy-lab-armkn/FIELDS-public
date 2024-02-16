import { WithHeader } from "@/components/layout/WithHeader";
import { ChakraNextLink } from "@/components/util/ChakraNextLink";
import { useGetExemplarVideoList } from "@/gen/oapi/backend/v1/client/exemplar-videos/exemplar-videos";
import { getPageTitle } from "@/usecase/pagemeta";
import { Box, Container, Heading, Text } from "@chakra-ui/react";
import Head from "next/head";

const TITLE = "お手本の動画一覧";

export default function ExemplarListPage() {
  const { data: exemplars } = useGetExemplarVideoList({ query: { staleTime: 1000 * 60 } });

  const pageTitle = getPageTitle(TITLE);

  return (
    <WithHeader>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <Container maxW="720px" minH="100%" pt={8} pb={16} px={4}>
        <Heading as="h1" my={4} color="teal.900">{TITLE}</Heading>
        <Box
          as="ul"
          listStyleType="none"
          display="flex"
          flexDir="column"
          gap={4}
        >
          {exemplars?.map((e) => (
            <Box
              as="li"
              key={e.id}
              bg="white"
              borderRadius={6}
            >
              <ChakraNextLink
                href={`/exemplars/${e.id}`}
                display="block"
                px={4}
                py={3}
                color="teal.900"
                _hover={{ color: "cyan.700" }}
              >
                <Text as="span" fontSize="lg" fontWeight="bold" display="block">{e.slug}</Text>
                <Text as="span">対象作業: {e.subject.name}</Text>
              </ChakraNextLink>
            </Box>
          ))}
        </Box>
      </Container>
    </WithHeader>
  );
}
