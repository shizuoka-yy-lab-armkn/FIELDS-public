import { Box, type BoxProps, Flex } from "@chakra-ui/react";
import { type ReactNode } from "react";
import { GLOBAL_HEADER_H, GlobalHeader, type GlobalHeaderProps } from "../domain/GlobalHeader";

export type WithHeaderProps = {
  children: ReactNode;
  headerProps?: GlobalHeaderProps;
};

export const WithHeader = ({
  children,
  headerProps,
}: WithHeaderProps) => {
  const bg: BoxProps["bg"] = "gray.200";
  return (
    <>
      <GlobalHeader {...headerProps} />
      <Flex minW="100%" maxW="100%" w="100%" bg={bg}>
        <Flex flexDirection="column" minH="100vh" pt={GLOBAL_HEADER_H} flex={1} w="1px">
          <Box as="main" bg={bg} flexGrow={1} minH="100%">{children}</Box>
        </Flex>
      </Flex>
    </>
  );
};
