import { Text, TextProps } from "@chakra-ui/react";

export const ActionId = ({ actionId, ...props }: {
  actionId?: number;
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
      {actionId ?? "-"}
    </Text>
  );
};
