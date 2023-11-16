import { ActionId } from "@/components/domain/records/ActionId";
import * as schema from "@/gen/oapi/backend/v1/schema";
import { ActionMetaDict } from "@/model/subjects";
import { Box, Flex, Heading, Text, useCallbackRef } from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { SegmentsSidebar } from "./SegmentsSidebar";

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

  const [currentSegIndex, setCurrentSegIndex] = useState<number | undefined>(undefined);

  return (
    <Flex minH="full" h="1px">
      <SegmentsSidebar
        segs={evaluation.segs}
        currentSegIndex={currentSegIndex}
        actionMetaDict={actionMetaDict}
        fps={record.fps}
        onSegmentClick={() => {}}
      />
      <RecordDetailMainPane
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

export type RecordDetailMainPaneProps = {
  record: schema.Record;
  subject: schema.Subject;
  actionMetaDict: ActionMetaDict;
  segs: schema.Segment[];
  currentSegIndex?: number;
  onSegIndexChange: (segIndex: number | undefined) => void;
};

const RecordDetailMainPane = ({
  record,
  segs,
  currentSegIndex,
  actionMetaDict,
  onSegIndexChange,
}: RecordDetailMainPaneProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current != null) videoRef.current.load();
  }, [record.headCameraVideoUrl]);

  const handleVideoTimeUpdate = useCallbackRef(() => {
    if (videoRef.current == null) return;
    const video = videoRef.current;
    const videoFrame = video.currentTime * record.fps | 0;

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

  return (
    <Box
      flex="1"
      minH="full"
      h="1px"
      color="teal.900"
      px={4}
      py={4}
      bg="white"
    >
      <Flex justifyContent="space-between">
        <Box>
          <Heading as="h2" fontSize="lg">
            工程番号
            <ActionId actionId={currentSeg?.actionId} ml={1} mr={3} />
            <Text as="span" fontWeight="bold">
              {currentSeg != null && actionMetaDict[currentSeg.actionId]!.longName}
            </Text>
          </Heading>
        </Box>
        <Box>
          X:XX (xx.x s)
        </Box>
      </Flex>

      <Box as="video" ref={videoRef} controls w="full" my={4} onTimeUpdate={handleVideoTimeUpdate}>
        <source src={record.headCameraVideoUrl} />
      </Box>
    </Box>
  );
};
