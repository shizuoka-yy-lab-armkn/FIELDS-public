import { ProcessDisplayNo } from "@/components/domain/records/ProcessDisplayNo";
import { SegmentStatusBadge } from "@/components/domain/records/SegmentTypeBadge";
import * as schema from "@/gen/oapi/backend/v1/schema";
import { RecordSegmentAggr } from "@/model/RecordSegmentAggr";
import { fmtSecsToMSS } from "@/usecase/records";
import {
  Box,
  BoxProps,
  Center,
  Flex,
  Heading,
  Progress,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useCallbackRef,
} from "@chakra-ui/react";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { RecordStatsPane } from "./RecordStatsPane";
import { SegmentsSidebar } from "./SegmentsSidebar";

export type RecordDetailProps = {
  record: schema.Record;
  subject: schema.Subject;
  jobProgressPercentage: number;
  segs: RecordSegmentAggr[];
};

type Color = BoxProps["bg"];

export const RecordDetail = ({
  record,
  subject,
  jobProgressPercentage,
  segs,
}: RecordDetailProps) => {
  const [currentSegIndex, setCurrentSegIndex] = useState<number | undefined>(undefined);

  const mainPaneRef = useRef<RecordDetailMainPaneMethods>(null);

  const handleSegmentClick = (segIdx: number) => {
    setCurrentSegIndex(segIdx);

    const seg = segs[segIdx]!;
    if (seg.type !== "missing") {
      mainPaneRef.current?.seek(seg.beginSec + 0.1);
    }
  };

  if (jobProgressPercentage < 100) {
    return (
      <Flex minH="full" h="1px">
        <Center flexDir="column" w="100%" py={20} px={20}>
          <Heading as="h1" fontSize="5xl">工程認識中...</Heading>
          <Progress
            my={4}
            w="full"
            maxW="560px"
            min={0}
            max={100}
            value={jobProgressPercentage}
            size="lg"
            colorScheme="teal"
            hasStripe
            isAnimated
            sx={{
              "& > div:first-of-type": {
                transitionProperty: "width",
                transitionDuration: "2500ms",
              },
            }}
          />
          <Text fontSize="2xl">{jobProgressPercentage} %</Text>
          <Text fontSize="2xl" mt={12}>解体作業やカメラの発熱・充電チェック等をしてお待ちください</Text>
        </Center>
      </Flex>
    );
  }

  const TAB_LIST_H = "60px";

  return (
    <Tabs variant="line" defaultIndex={1} minH="full" h="1px">
      <TabList
        position="absolute"
        top={0}
        h={TAB_LIST_H}
        w="full"
        bg="gray.50"
        border="gray.400"
        borderTopWidth={1}
        borderBottomWidth={2}
        py={2}
        px={4}
        boxShadow="sm"
      >
        <Tab>収録した動画</Tab>
        <Tab>スコア</Tab>
      </TabList>
      <TabPanels minH="full" h="1px" pt={TAB_LIST_H}>
        <TabPanel display="flex" p={0} minH="full" h="1px">
          <SegmentsSidebar
            segs={segs}
            currentSegIndex={currentSegIndex}
            onSegmentClick={handleSegmentClick}
          />
          <RecordDetailMainPane
            ref={mainPaneRef}
            record={record}
            subject={subject}
            segs={segs}
            currentSegIndex={currentSegIndex}
            onSegIndexChange={setCurrentSegIndex}
          />
        </TabPanel>
        <TabPanel p={0}>
          <RecordStatsPane
            record={record}
            segs={segs}
            userDisplayName={record.username}
          />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

type RecordDetailMainPaneProps = {
  record: schema.Record;
  subject: schema.Subject;
  segs: RecordSegmentAggr[];
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
    const curTime = video.currentTime;

    // 現在のセグメントが動画のシーク位置を包含しているなら探索しない
    if (currentSegIndex != null) {
      const seg = segs[currentSegIndex]!;
      if (seg.beginSec <= curTime && curTime < seg.endSec) {
        return;
      }
    }

    // 現在の動画のシーク位置を包含するセグメントを探す
    const foundIndex = segs.findIndex((seg) => (
      seg.type !== "missing" && seg.beginSec <= curTime && curTime < seg.endSec
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
      bg="gray.50"
    >
      <Flex justifyContent="space-between" minH="4rem">
        <Box>
          <Heading as="h2" fontSize="lg">
            工程番号
            <ProcessDisplayNo value={currentSeg?.displayNo} ml={1} mr={3} />
            <Text as="span" fontWeight="bold">
              {currentSeg?.longName}
            </Text>
          </Heading>
          {currentSeg != null && currentSeg.type !== "valid" && <SegmentStatusBadge typ={currentSeg.type} mt={2} />}
        </Box>
        <SegmentDurInfo seg={currentSeg} />
      </Flex>

      <Box
        as="video"
        ref={videoRef}
        controls
        autoPlay
        muted // mutedが指定されていないとautoPlayは有効にならない
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

const SegmentDurInfo = ({ seg }: {
  seg: RecordSegmentAggr | undefined;
}) => {
  if (seg == null || seg.type === "missing") {
    return <Box textAlign="right">-:-- (---s)</Box>;
  }

  const dur = seg.durSec;
  const diffSign = seg.durSec > seg.referenceDurSec ? "+" : "";
  const tooLong = seg.isTooLongDur();
  const allowable = seg.isAllowableDur();
  const color: Color = tooLong ? "red.500" : allowable ? "green.500" : "teal.800";

  return (
    <Box fontSize="lg" textAlign="right" minWidth="16rem">
      <Box>
        <Text as="span">
          {fmtSecsToMSS(seg.beginSec)}
          {" - "}
          {fmtSecsToMSS(seg.endSec)}
        </Text>
        <Text as="span" color={color} fontWeight="bold">
          {` (${seg.durSec.toFixed(1)} s)`}
        </Text>
      </Box>
      <Box>
        <Box display="inline-block" bg={color} borderRadius="999px" fontSize="md" color="white" px={4} py={1}>
          熟練者の {(dur / seg.referenceDurSec).toFixed(1)} 倍 (差{diffSign}
          {(dur - seg.referenceDurSec).toFixed(1)} s)
        </Box>
      </Box>
      <Box>
        (熟練者の平均時間: {seg.referenceDurSec.toFixed(1)} s)
      </Box>
    </Box>
  );
};

RecordDetailMainPane.displayName = "RecordDetailMainPane";
