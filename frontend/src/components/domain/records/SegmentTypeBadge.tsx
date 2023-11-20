import { Segment } from "@/gen/oapi/backend/v1/schema";
import { Box, BoxProps } from "@chakra-ui/react";

type SegmentStatusBadgeProps = {
  typ: Segment["type"] | "tooLong2x";
} & BoxProps;

export const SegmentStatusBadge = ({ typ }: SegmentStatusBadgeProps) => {
  if (typ === "valid") {
    return <></>;
  }

  const text = ((): string => {
    switch (typ) {
      case "missing":
        return "工程抜け";
      case "wrong":
        return "工程順序間違い";
      case "tooLong2x":
        return "熟練者の2倍以上の時間";
    }
  })();

  const badgeProps: BoxProps = typ === "tooLong2x"
    ? {
      bg: "white",
      color: "#e53e3e",
      border: "1px solid #e53e3e",
    }
    : {
      bg: "#e53e3e",
      color: "white",
    };

  return (
    <Box
      display="inline-block"
      borderRadius="999px"
      py="0.125em"
      px="1.5em"
      fontWeight="semibold"
      {...badgeProps}
    >
      {text}
    </Box>
  );
};
