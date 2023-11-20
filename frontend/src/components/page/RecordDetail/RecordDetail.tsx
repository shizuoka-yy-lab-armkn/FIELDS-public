import { ActionId } from "@/components/domain/records/ActionId";
import { SegmentStatusBadge } from "@/components/domain/records/SegmentTypeBadge";
import * as schema from "@/gen/oapi/backend/v1/schema";
import { ActionMetaDict } from "@/model/subjects";
import { frameDiffToSecDuration, frameIndexToTimestamp } from "@/usecase/records";
import { Box, BoxProps, Flex, Heading, Text, useCallbackRef } from "@chakra-ui/react";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { SegmentsSidebar } from "./SegmentsSidebar";

export type RecordDetailProps = {
  record: schema.Record;
  subject: schema.Subject;
  evaluation: schema.RecordEvaluation;
};

type Color = BoxProps["bg"];

export const RecordDetail = ({
  record,
  subject,
  evaluation,
}: RecordDetailProps) => {
  const actionMetaDict = useMemo((): ActionMetaDict => {
    return Object.fromEntries(subject.actions.map((a) => [a.seq, a]));
  }, [subject.actions]);

  const [currentSegIndex, setCurrentSegIndex] = useState<number | undefined>(undefined);

  const mainPaneRef = useRef<RecordDetailMainPaneMethods>(null);

  const handleSegmentClick = (segIdx: number) => {
    setCurrentSegIndex(segIdx);

    const seg = evaluation.segs[segIdx]!;
    if (seg.type !== "missing") {
      mainPaneRef.current?.seek(seg.begin / record.foreheadVideoFps + 0.1);
    }
  };

  return (
    <Flex minH="full" h="1px">
      <SegmentsSidebar
        segs={evaluation.segs}
        currentSegIndex={currentSegIndex}
        actionMetaDict={actionMetaDict}
        fps={record.foreheadVideoFps}
        onSegmentClick={handleSegmentClick}
      />
      <RecordDetailMainPane
        ref={mainPaneRef}
        record={record}
        subject={subject}
        actionMetaDict={actionMetaDict}
        segs={evaluation.segs}
        currentSegIndex={currentSegIndex}
        onSegIndexChange={setCurrentSegIndex}
      />
    </Flex>
  );
};

type RecordDetailMainPaneProps = {
  record: schema.Record;
  subject: schema.Subject;
  actionMetaDict: ActionMetaDict;
  segs: schema.Segment[];
  currentSegIndex?: number;
  onSegIndexChange: (segIndex: number | undefined) => void;
};

type RecordDetailMainPaneMethods = {
  seek: (sec: number) => void;
};

const RecordDetailMainPane = forwardRef<RecordDetailMainPaneMethods, RecordDetailMainPaneProps>(({
  record,
  segs,
  currentSegIndex,
  actionMetaDict,
  onSegIndexChange,
}, ref) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useImperativeHandle(ref, () => ({
    seek: (sec: number): void => {
      if (videoRef.current != null) {
        videoRef.current.currentTime = sec;
      }
    },
  }));

  useEffect(() => {
    if (videoRef.current != null) videoRef.current.load();
  }, [record.foreheadVideoUrl]);

  const handleVideoTimeUpdate = useCallbackRef(() => {
    if (videoRef.current == null) return;
    const video = videoRef.current;
    const videoFrame = video.currentTime * record.foreheadVideoFps | 0;

    // 現在のセグメントが動画のシーク位置を包含しているなら探索しない
    if (currentSegIndex != null) {
      const seg = segs[currentSegIndex]!;
      if (seg?.type !== "missing" && seg.begin <= videoFrame && videoFrame < seg.end) {
        return;
      }
    }

    // 現在の動画のシーク位置を包含するセグメントを探す
    const foundIndex = segs.findIndex((seg) => (
      seg.type !== "missing" && seg.begin <= videoFrame && videoFrame < seg.end
    ));
    console.log("[RecordDetailMainPane] timeupdate:", currentSegIndex, foundIndex);
    onSegIndexChange(foundIndex < 0 ? undefined : foundIndex);
  });

  const currentSeg = currentSegIndex == null ? undefined : segs[currentSegIndex];
  const fps = record.foreheadVideoFps;

  return (
    <Box
      flex="1"
      minH="full"
      h="1px"
      color="teal.900"
      px={4}
      py={4}
      bg="gray.50"
    >
      <Flex justifyContent="space-between" minH="4rem">
        <Box>
          <Heading as="h2" fontSize="lg">
            工程番号
            <ActionId actionId={currentSeg?.actionSeq} ml={1} mr={3} />
            <Text as="span" fontWeight="bold">
              {currentSeg != null && actionMetaDict[currentSeg.actionSeq]!.longName}
            </Text>
          </Heading>
          {currentSeg != null && currentSeg.type !== "valid" && <SegmentStatusBadge typ={currentSeg.type} mt={2} />}
        </Box>
        <SegmentDurInfo seg={currentSeg} fps={fps} actionMetaDict={actionMetaDict} />
      </Flex>

      <Box
        as="video"
        ref={videoRef}
        controls
        w="full"
        maxW="70vw"
        mx="auto"
        my={4}
        onTimeUpdate={handleVideoTimeUpdate}
      >
        <source src={record.foreheadVideoUrl} />
      </Box>
    </Box>
  );
});

const SegmentDurInfo = ({ seg, fps, actionMetaDict }: {
  seg: schema.Segment | undefined;
  fps: number;
  actionMetaDict: ActionMetaDict;
}) => {
  if (seg == null || seg.type === "missing") {
    return <Box textAlign="right">-:-- (---s)</Box>;
  }

  const dur = (seg.end - seg.begin) / fps;
  const masterDurMean = actionMetaDict[seg.actionSeq]!.masterDurMean;
  const diffSign = dur > masterDurMean ? "+" : "";
  const tooLong = masterDurMean * 2 < dur;
  const short = dur < masterDurMean * 1.3;
  const color: Color = tooLong ? "red.500" : short ? "green.500" : "teal.800";

  return (
    <Box fontSize="lg" textAlign="right" minWidth="16rem">
      <Box>
        <Text as="span">
          {frameIndexToTimestamp(seg.begin, fps)}
          {" - "}
          {frameIndexToTimestamp(seg.end, fps)}
        </Text>
        <Text as="span" color={color} fontWeight="bold">
          {` (${frameDiffToSecDuration(seg.begin, seg.end, fps)} s)`}
        </Text>
      </Box>
      <Box>
        <Box display="inline-block" bg={color} borderRadius="999px" fontSize="md" color="white" px={4} py={1}>
          熟練者の {(dur / masterDurMean).toFixed(1)} 倍 (差{diffSign}
          {(dur - masterDurMean).toFixed(1)} s)
        </Box>
      </Box>
      <Box>
        (熟練者の平均時間: {masterDurMean.toFixed(1)} s)
      </Box>
    </Box>
  );
};

RecordDetailMainPane.displayName = "RecordDetailMainPane";
