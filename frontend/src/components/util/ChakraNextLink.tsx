import { Link as ChakraLink } from "@chakra-ui/react";
import type { LinkProps as ChakraLinkProps } from "@chakra-ui/react";
import NextLink from "next/link";

export type ChakraNextLinkProps = ChakraLinkProps;

export const ChakraNextLink = ({ children, ...props }: ChakraNextLinkProps) => {
  return (
    <ChakraLink as={NextLink} color="blue.500" {...props}>
      {children}
    </ChakraLink>
  );
};
