import { ProcessDisplayNo } from "@/components/domain/records/ProcessDisplayNo";
import { ChakraNextLink } from "@/components/util/ChakraNextLink";
import { Record, Segment } from "@/gen/oapi/backend/v1/schema";
import { ActionMetaDict } from "@/model/subjects";
import { calcScore, isNotMissingSegment } from "@/usecase/records";
import { Box, BoxProps, Center, Heading, Icon, ListItem, Text, UnorderedList, VStack } from "@chakra-ui/react";
import { ReactNode, useMemo } from "react";
import { IoCaretForwardCircle } from "react-icons/io5";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const CARD_COMMON_STYLE: BoxProps = {
  w: "full",
  maxW: "960px",
  px: 4,
  py: 12,
  bg: "white",
  color: "teal.900",
  boxShadow: "lg",
  rounded: "2xl",
};

export const RecordStatsPane = (props: {
  userDisplayName: string;
  record: Record;
  segs: Segment[];
  actionMetaDict: ActionMetaDict;
  missingProccesCount: number;
  wrongOrderCount: number;
  maximumSpeedBonusSecs: number;
}) => {
  return (
    <Center w="full" py={12} background="gray.200" flexDirection="column" rowGap={8}>
      <ScoreCard {...props} />
      <TookTimeChartCard {...props} />
    </Center>
  );
};

const BONUS_FG: BoxProps["color"] = "green.600";
const PENALTY_FG: BoxProps["color"] = "red.600";

const ScoreCard = (
  { userDisplayName, record, segs, actionMetaDict, missingProccesCount, wrongOrderCount, maximumSpeedBonusSecs }: {
    userDisplayName: string;
    record: Record;
    segs: Segment[];
    actionMetaDict: ActionMetaDict;
    missingProccesCount: number;
    wrongOrderCount: number;
    maximumSpeedBonusSecs: number;
  },
) => {
  const score = useMemo(() => {
    const first = segs.find((s) => s.type !== "missing");
    const last = segs.findLast((s) => s.type !== "missing");

    let userWorkSecs: number;
    if (first == null || last == null || first.type === "missing" || last.type === "missing") {
      userWorkSecs = 0;
    } else {
      userWorkSecs = (last.end - first.begin) / record.foreheadVideoFps;
    }
    return calcScore({ missingProccesCount, wrongOrderCount, userWorkSecs, maximumSpeedBonusSecs });
  }, [segs, record.foreheadVideoFps, missingProccesCount, wrongOrderCount, maximumSpeedBonusSecs]);
  console.log(score);

  return (
    <Center {...CARD_COMMON_STYLE}>
      <VStack w="full" maxW="600px">
        <Center flexDirection="column">
          <Heading as="h1" mb={4}>{userDisplayName} さんの {record.seq} 回目の収録</Heading>
          <Box pl={20}>
            <Text as="span" color="orange.500" fontSize="8xl" fontWeight="bold">{score.total.toFixed(0)}</Text>
            <Text as="span" fontSize="lg">点 / 100点</Text>
          </Box>
        </Center>

        <Heading as="h2" mt={4} fontSize="3xl">ー スコア内訳 ー</Heading>

        <ScoreCheckPointSection title="ベースライン" unit={score.detail.baseline}>
          誰にでも付与される基本ポイントです。<br />
          このポイントは変わることはありません。
        </ScoreCheckPointSection>

        <ScoreCheckPointSection
          title="工程抜け"
          unit={score.cfg.missingProcessPenalty}
          count={score.input.missingProccesCount}
        >
          <UnorderedList>
            {segs.map((s, i) => {
              if (s.type !== "missing") return null;
              return (
                <ListItem mt={2} key={`${i}/${s.actionId}`}>
                  <ProcessDisplayNo value={s.displayNo} />
                  <Text as="span">{actionMetaDict[s.actionId]!.shortName}</Text>
                  <ChakraNextLink href="#">
                    <Icon as={IoCaretForwardCircle} ml={2} /> 確認する
                  </ChakraNextLink>
                </ListItem>
              );
            })}
          </UnorderedList>
        </ScoreCheckPointSection>

        <ScoreCheckPointSection
          title="工程順ミス"
          unit={score.cfg.wrongOrderPenalty}
          count={score.input.wrongOrderCount}
        >
          <UnorderedList>
            {segs.map((s, i) => {
              if (s.type !== "wrong") return null;
              return (
                <ListItem mt={2} key={`${i}/${s.actionId}`}>
                  <ProcessDisplayNo value={s.displayNo} />
                  <Text as="span">{actionMetaDict[s.actionId]!.shortName}</Text>
                  <ChakraNextLink href="#">
                    <Icon as={IoCaretForwardCircle} ml={2} /> 確認する
                  </ChakraNextLink>
                </ListItem>
              );
            })}
          </UnorderedList>
        </ScoreCheckPointSection>

        <ScoreCheckPointSection
          title="ノーミスボーナス"
          unit={score.cfg.noMistakeBonus}
          disabled={score.detail.noMistakeBonus === 0}
        >
          工程抜けも工程順ミスも無かった場合に付与されるポイントです。
        </ScoreCheckPointSection>

        <ScoreCheckPointSection title="スピードボーナス" unit={score.detail.speedBonus}>
        </ScoreCheckPointSection>
      </VStack>
    </Center>
  );
};

const TookTimeChartCard = (
  { record, segs, actionMetaDict }: {
    record: Record;
    segs: Segment[];
    actionMetaDict: ActionMetaDict;
  },
) => {
  const KEY_YOU = "あなた";
  const KEY_MASTER = "熟練者";

  const data = segs.filter(isNotMissingSegment)
    .filter((s) => (s.end - s.begin) / record.foreheadVideoFps > actionMetaDict[s.actionId]!.masterDurMean)
    .slice(0, 3)
    .sort((a, b) => (b.end - b.begin) - (a.end - a.begin))
    .map((s) => {
      const meta = actionMetaDict[s.actionId]!;
      return {
        name: `[${meta.displayNo}] ${meta.shortName}`,
        [KEY_YOU]: (s.end - s.begin) / record.foreheadVideoFps,
        [KEY_MASTER]: meta.masterDurMean,
      };
    });

  console.log("TookTimeChartCard: data", data);

  return (
    <Center {...CARD_COMMON_STYLE} flexDirection="column">
      <Heading as="h2" mb={3}>時間のかかっている工程 上位3件</Heading>
      <Text mb={6}>以下の工程を意識すると時間短縮しやすいでしょう。</Text>
      <ResponsiveContainer width="100%" minHeight="400px">
        <BarChart
          width={500}
          height={900}
          data={data}
          layout="horizontal"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" type="category" />
          <YAxis type="number" domain={[0, (dataMax) => Math.ceil(dataMax / 5) * 5]} />
          <Tooltip formatter={(v: number) => `${v.toFixed(1)} 秒`} />
          <Legend />
          <Bar dataKey={KEY_YOU} fill="hotpink" label={KEY_YOU} />
          <Bar dataKey={KEY_MASTER} fill="royalblue" label={KEY_MASTER} />
        </BarChart>
      </ResponsiveContainer>
    </Center>
  );
};

const ScoreCheckPointSection = ({ title, unit, count, disabled, children }: {
  title: string;
  unit: number;
  count?: number;
  disabled?: boolean;
  children: ReactNode;
}) => {
  return (
    <Box as="section" w="full">
      <ScoreCheckPointHeading title={title} unit={unit} count={count} disabled={disabled} />
      <Box ml={2} mt={2}>
        {children}
      </Box>
    </Box>
  );
};

const ScoreCheckPointHeading = ({ title, unit, count, disabled }: {
  title: string;
  unit: number;
  count?: number;
  disabled?: boolean;
}) => {
  const color: BoxProps["color"] = (disabled || count === 0) ? "gray.400" : "teal.900";
  return (
    <Heading
      as="h3"
      mt={6}
      pb={1}
      borderBottomColor="gray.400"
      borderBottomWidth="1px"
      display="flex"
      justifyContent="space-between"
      color="teal.900"
      fontSize="xl"
    >
      <Text as="span" color={color}>{title}</Text>
      <ScoreDetailPoint unit={unit} count={count} disabled={disabled} />
    </Heading>
  );
};

const ScoreDetailPoint = ({ unit, count, disabled }: {
  unit: number;
  count?: number;
  disabled?: boolean;
}) => {
  const x = unit * (count ?? 1);
  const s = (unit >= 0 ? "+" : "") + x.toFixed(0);

  disabled = disabled || count == 0;
  const color: BoxProps["color"] = disabled ? "gray.300" : unit >= 0 ? BONUS_FG : PENALTY_FG;

  const decor: BoxProps["textDecorationLine"] = disabled ? "line-through" : undefined;

  return (
    <Text as="span" color={color} textDecoration={decor}>
      {(count != null)
        ? (
          <>
            {unit}点 × {count} = <Text as="span" fontWeight="bold">{s}点</Text>
          </>
        )
        : <>{s}点</>}
    </Text>
  );
};
