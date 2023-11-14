import { SegmentStatusBadge } from "@/components/domain/records/SegmentTypeBadge";
import * as schema from "@/gen/oapi/backend/v1/schema";
import { ActionMetaDict } from "@/model/subjects";
import { Box, BoxProps, Flex, Heading, Text, TextProps } from "@chakra-ui/react";
import { useMemo } from "react";

type Color = BoxProps["bg"];
const BORDER_COLOR: Color = "gray.400";

export type RecordDetailProps = {
  record: schema.Record;
  subject: schema.Subject;
  evaluation: schema.RecordEvaluation;
};

export const RecordDetail = ({
  record,
  subject,
  evaluation,
}: RecordDetailProps) => {
  const actionMetaDict = useMemo((): ActionMetaDict => {
    return Object.fromEntries(subject.actions.map((a) => [a.actionId, a]));
  }, [subject.actions]);

  return (
    <Flex minH="full" h="1px">
      <SegmentsSidebar
        segs={evaluation.segs}
        actionMetaDict={actionMetaDict}
        fps={record.fps}
        onSegmentClick={() => {}}
      />
    </Flex>
  );
};

type SegmentsSidebarProps = {
  segs: schema.Segment[];
  actionMetaDict: ActionMetaDict;
  fps: number;
  onSegmentClick: (seg: schema.Segment) => void;
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

const SegmentsSidebar = ({
  segs,
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

          return (
            <Box
              key={segIdx}
              as="li"
              py={3}
              px={3}
              borderColor="gray.400"
              borderBottomWidth="1px"
              bg={seg.type !== "valid" ? "red.100" : undefined}
            >
              <Box>
                <ActionId actionId={seg.actionId} mr={1} />
                <Text as="span" fontWeight="semibold">{actionMetaDict[seg.actionId]!.shortName}</Text>
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
                        {tooLong ? " ×" : ""}
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

const ActionId = ({ actionId, ...props }: {
  actionId: number;
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
      {actionId}
    </Text>
  );
};
