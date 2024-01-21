import { Text, TextProps } from "@chakra-ui/react";

export const ProcessDisplayNo = ({ value, ...props }: {
  value?: number;
} & TextProps) => {
  return (
    <Text
      as="span"
      display="inline-block"
      minW="1.75em"
      textAlign="center"
      px={1}
      fontWeight="semibold"
      bg="blackAlpha.100"
      borderRadius={4}
      {...props}
    >
      {value ?? "-"}
    </Text>
  );
};
