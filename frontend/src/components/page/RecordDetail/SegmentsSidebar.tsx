import { ActionId } from "@/components/domain/records/ActionId";
import { SegmentStatusBadge } from "@/components/domain/records/SegmentTypeBadge";
import * as schema from "@/gen/oapi/backend/v1/schema";
import { ActionMetaDict } from "@/model/subjects";
import utilStyle from "@/styles/util.module.css";
import { frameDiffToSecDuration, frameIndexToTimestamp } from "@/usecase/records";
import { Box, BoxProps, Flex, Heading, Text } from "@chakra-ui/react";
import { useEffect, useMemo, useRef } from "react";

type Color = BoxProps["bg"];
const BORDER_COLOR: Color = "gray.400";

type SegmentsSidebarProps = {
  segs: schema.Segment[];
  currentSegIndex?: number;
  actionMetaDict: ActionMetaDict;
  fps: number;
  onSegmentClick: (segIdx: number) => void;
};

export const SegmentsSidebar = ({
  segs,
  currentSegIndex,
  actionMetaDict,
  fps,
  onSegmentClick,
}: SegmentsSidebarProps) => {
  const invalidCount = useMemo(() => segs.filter((s) => s.type !== "valid").length, [segs]);

  const segUListRef = useRef<HTMLUListElement | null>(null);

  // 現在のセグメント位置が見えるように自動スクロール
  useEffect(() => {
    if (currentSegIndex == null || segUListRef.current == null) return;
    // scrollIntoView() は対象の要素を最上部へスクロールさせる．最上部だと見にくいので2要素分の空きを作る．
    const i = Math.max(0, currentSegIndex - 2);
    console.log("currentSegIndex changed: scroll to", i + 1);
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
        <Heading as="h2" fontSize="md">認識結果</Heading>
        <Text as="span" fontSize="xs">{invalidCount} 件の工程ミス</Text>
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
          const tooLong = seg.type !== "missing"
            && actionMetaDict[seg.actionSeq]!.masterDurMean * fps * 1.5 < seg.end - seg.begin;

          const highlightProps: BoxProps = {
            boxShadow: "0 0 6px 2px inset darkturquoise",
          };

          return (
            <Box
              key={segIdx}
              as="li"
              borderColor="gray.400"
              borderBottomWidth="1px"
              bg={seg.type !== "valid" ? "red.100" : "gray.200"}
              cursor={seg.type !== "missing" ? "pointer" : "initial"}
              onClick={() => seg.type !== "missing" && onSegmentClick(segIdx)}
              {...(segIdx === currentSegIndex ? highlightProps : undefined)}
            >
              <Box
                py={3}
                px={3}
                _hover={{ backdropFilter: "brightness(0.95)" }}
              >
                <Box>
                  <ActionId actionId={seg.actionSeq} mr={1} />
                  <Text
                    as="span"
                    fontWeight="semibold"
                    className={segIdx === currentSegIndex ? utilStyle.opacityBlink : ""}
                  >
                    {actionMetaDict[seg.actionSeq]!.shortName}
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
                        <Box>
                          尤度: {seg.likelihood.toFixed(2)}
                        </Box>
                      </Text>
                    </>
                  )}
                </Box>
                <Box mt={1} ml={7}>
                  <SegmentStatusBadge typ={seg.type} />
                </Box>
              </Box>
            </Box>
          );
        })}
      </Flex>
    </Flex>
  );
};
