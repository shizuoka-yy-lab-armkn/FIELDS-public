import { ActionId } from "@/components/domain/records/ActionId";
import { SegmentStatusBadge } from "@/components/domain/records/SegmentTypeBadge";
import * as schema from "@/gen/oapi/backend/v1/schema";
import { ActionMetaDict } from "@/model/subjects";
import utilStyle from "@/styles/util.module.css";
import { Box, BoxProps, Flex, Heading, Text } from "@chakra-ui/react";
import { useMemo } from "react";

type Color = BoxProps["bg"];
const BORDER_COLOR: Color = "gray.400";

type SegmentsSidebarProps = {
  segs: schema.Segment[];
  currentSegIndex?: number;
  actionMetaDict: ActionMetaDict;
  fps: number;
  onSegmentClick: (seg: schema.Segment) => void;
};

export const SegmentsSidebar = ({
  segs,
  currentSegIndex,
  actionMetaDict,
  fps,
  onSegmentClick,
}: SegmentsSidebarProps) => {
  const invalidCount = useMemo(() => segs.filter((s) => s.type !== "valid").length, [segs.length]);

  return (
    <Flex
      flexDir="column"
      maxW="560px"
      h="full"
      maxH="full"
      borderColor={BORDER_COLOR}
      borderRightWidth="1px"
    >
      <Flex
        py={3}
        px={3}
        borderColor={BORDER_COLOR}
        borderBottomWidth="2px"
        alignItems="center"
        justifyContent="space-between"
      >
        <Heading as="h2" fontSize="md">認識結果</Heading>
        <Text as="span" fontSize="xs">{invalidCount} 件の工程ミス</Text>
      </Flex>
      <Flex
        as="ul"
        listStyleType="none"
        flexDir="column"
        overflowY="auto"
        fontSize="sm"
        color="teal.900"
      >
        {segs.map((seg, segIdx) => {
          const tooLong = seg.type !== "missing"
            && actionMetaDict[seg.actionId]!.masterDurMean * fps * 2 < seg.end - seg.begin;

          const highlightProps: BoxProps = {
            boxShadow: "0 0 6px 2px inset darkturquoise",
          };

          return (
            <Box
              key={segIdx}
              as="li"
              py={3}
              px={3}
              borderColor="gray.400"
              borderBottomWidth="1px"
              bg={seg.type !== "valid" ? "red.100" : undefined}
              {...(segIdx === currentSegIndex ? highlightProps : undefined)}
            >
              <Box>
                <ActionId actionId={seg.actionId} mr={1} />
                <Text
                  as="span"
                  fontWeight="semibold"
                  className={segIdx === currentSegIndex ? utilStyle.opacityBlink : ""}
                >
                  {actionMetaDict[seg.actionId]!.shortName}
                </Text>
              </Box>
              <Box ml={8}>
                {seg.type === "missing" ? <Text as="span">---</Text> : (
                  <>
                    <Text as="span">
                      {frameIndexToTimestamp(seg.begin, fps)}
                      {" - "}
                      {frameIndexToTimestamp(seg.end, fps)}
                      <Text as="span" {...(tooLong ? { color: "red.500", fontWeight: "bold" } : {})}>
                        {` (${frameDiffToSecDuration(seg.begin, seg.end, fps)} s)`}
                        {tooLong ? " Long" : ""}
                      </Text>
                    </Text>
                  </>
                )}
              </Box>
              <Box mt={1} ml={7}>
                <SegmentStatusBadge typ={seg.type} />
              </Box>
            </Box>
          );
        })}
      </Flex>
    </Flex>
  );
};

const frameIndexToTimestamp = (frameIndex: number, fps: number): string => {
  const secs = frameIndex / fps | 0;
  const m = secs / 60 | 0;
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const frameDiffToSecDuration = (frameBegin: number, frameEnd: number, fps: number): string => {
  const secs = (frameEnd - frameBegin) / fps;
  return secs.toFixed(1);
};
