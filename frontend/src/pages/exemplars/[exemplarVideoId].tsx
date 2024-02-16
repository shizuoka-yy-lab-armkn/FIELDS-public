import { ProcessDisplayNo } from "@/components/domain/records/ProcessDisplayNo";
import { WithHeader } from "@/components/layout/WithHeader";
import { LoadingPane } from "@/components/util/LoadingPane";
import * as schema from "@/gen/oapi/backend/v1/schema";
import { useGetExemplarVideoDetail, useRouterExemplarVideoId } from "@/hooks/exemplarVideos";
import { RecordSegmentAggrLite } from "@/model/RecordSegmentAggr";
import utilStyle from "@/styles/util.module.css";
import { getPageTitle } from "@/usecase/pagemeta";
import { fmtSecsToMSS } from "@/usecase/records";
import { Box, BoxProps, Flex, Heading, Text, useCallbackRef } from "@chakra-ui/react";
import Head from "next/head";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { useRef } from "react";

type Color = BoxProps["bg"];

export default function ExemplarVideoDetailPage() {
  const exemplarVideoId = useRouterExemplarVideoId();
  const { exemplar, subject, segs } = useGetExemplarVideoDetail(exemplarVideoId);

  const pageTitle = useMemo(() => {
    if (exemplar == null) return getPageTitle("読み込み中");
    return getPageTitle("お手本動画 " + exemplar.slug);
  }, [exemplar]);

  const [currentSegIndex, setCurrentSegIndex] = useState<number | undefined>(undefined);

  const mainPaneRef = useRef<RecordDetailMainPaneMethods>(null);

  if (exemplar == null || subject == null) {
    return <LoadingPane />;
  }

  const handleSegmentClick = (segIdx: number) => {
    setCurrentSegIndex(segIdx);

    const seg = segs[segIdx]!;
    mainPaneRef.current?.seek(seg.beginSec + 0.1);
  };

  return (
    <WithHeader>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <Box display="flex" p={0} minH="full" h="1px">
        <SegmentsSidebar
          exemplarName={exemplar.slug}
          segs={segs}
          currentSegIndex={currentSegIndex}
          onSegmentClick={handleSegmentClick}
        />
        <RecordDetailMainPane
          ref={mainPaneRef}
          exemplar={exemplar}
          subject={subject}
          segs={segs}
          currentSegIndex={currentSegIndex}
          onSegIndexChange={setCurrentSegIndex}
        />
      </Box>
    </WithHeader>
  );
}

type RecordDetailMainPaneProps = {
  exemplar: schema.ExemplarVideo;
  subject: schema.Subject;
  segs: RecordSegmentAggrLite[];
  currentSegIndex?: number;
  onSegIndexChange: (segIndex: number | undefined) => void;
};

type RecordDetailMainPaneMethods = {
  seek: (sec: number) => void;
};

const RecordDetailMainPane = forwardRef<RecordDetailMainPaneMethods, RecordDetailMainPaneProps>(({
  exemplar,
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
  }, [exemplar.videoUrl]);

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
      seg.beginSec <= curTime && curTime < seg.endSec
    ));
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
        </Box>
      </Flex>

      <Box
        as="video"
        ref={videoRef}
        controls
        autoPlay
        muted // mutedが指定されていないとautoPlayは有効にならない
        w="full"
        maxW="70vw"
        maxH="75vh"
        mx="auto"
        my={4}
        borderColor="gray.200"
        borderWidth="1px"
        onTimeUpdate={handleVideoTimeUpdate}
      >
        <source src={exemplar.videoUrl} />
      </Box>
    </Box>
  );
});

RecordDetailMainPane.displayName = "RecordDetailMainPane";

const BORDER_COLOR: Color = "gray.400";

type SegmentsSidebarProps = {
  exemplarName: string;
  segs: RecordSegmentAggrLite[];
  currentSegIndex?: number;
  onSegmentClick: (segIdx: number) => void;
};

export const SegmentsSidebar = ({
  exemplarName,
  segs,
  currentSegIndex,
  onSegmentClick,
}: SegmentsSidebarProps) => {
  const segUListRef = useRef<HTMLUListElement | null>(null);

  // 現在のセグメント位置が見えるように自動スクロール
  useEffect(() => {
    if (currentSegIndex == null || segUListRef.current == null) return;
    // scrollIntoView() は対象の要素を最上部へスクロールさせる．最上部だと見にくいので2要素分の空きを作る．
    const i = Math.max(0, currentSegIndex - 2);
    if (i < segs.length) {
      segUListRef.current.querySelector(`li:nth-child(${i + 1})`)?.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentSegIndex, segs.length]);

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
        <Heading as="h2" fontSize="md">お手本動画</Heading>
        <Text fontSize="xs">{exemplarName}</Text>
      </Flex>
      <Flex
        as="ul"
        ref={segUListRef}
        listStyleType="none"
        flexDir="column"
        overflowY="auto"
        fontSize="sm"
        color="teal.900"
      >
        {segs.map((seg, segIdx) => {
          const highlightProps: BoxProps = {
            boxShadow: "0 0 6px 2px inset darkturquoise",
          };

          return (
            <Box
              key={segIdx}
              as="li"
              borderColor="gray.400"
              borderBottomWidth="1px"
              bg="gray.200"
              cursor="pointer"
              onClick={() => onSegmentClick(segIdx)}
              {...(segIdx === currentSegIndex ? highlightProps : undefined)}
            >
              <Box
                py={3}
                px={3}
                _hover={{ backdropFilter: "brightness(0.95)" }}
              >
                <Box>
                  <ProcessDisplayNo value={seg.displayNo} mr={1} />
                  <Text
                    as="span"
                    fontWeight="semibold"
                    className={segIdx === currentSegIndex ? utilStyle.opacityBlink : ""}
                  >
                    {seg.shortName}
                  </Text>
                </Box>
                <Box ml={8}>
                  <Text as="span">
                    {fmtSecsToMSS(seg.beginSec)}
                    {" - "}
                    {fmtSecsToMSS(seg.endSec)}
                    <Text as="span">
                      {` (${seg.durSec.toFixed(1)} s)`}
                    </Text>
                  </Text>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Flex>
    </Flex>
  );
};
