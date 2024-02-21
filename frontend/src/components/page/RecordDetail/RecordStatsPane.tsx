import { ProcessDisplayNo } from "@/components/domain/records/ProcessDisplayNo";
import { ChakraNextLink } from "@/components/util/ChakraNextLink";
import { Record } from "@/gen/oapi/backend/v1/schema";
import { RecordSegmentAggr } from "@/model/RecordSegmentAggr";
import { calcScore } from "@/usecase/records";
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
  segs: RecordSegmentAggr[];
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
  { userDisplayName, record, segs }: {
    userDisplayName: string;
    record: Record;
    segs: RecordSegmentAggr[];
  },
) => {
  const missingSegs = segs.filter(s => s.type === "missing");
  const wrongOrderSegs = segs.filter(s => s.type === "wrong");

  const score = useMemo(() => {
    const first = segs.find((s) => s.type !== "missing");
    const last = segs.findLast((s) => s.type !== "missing");

    let userWorkSecs: number;
    if (first == null || last == null || first.type === "missing" || last.type === "missing") {
      userWorkSecs = 0;
    } else {
      userWorkSecs = last.endSec - first.beginSec;
    }
    const missingProcessCount = missingSegs.length;
    const wrongOrderCount = wrongOrderSegs.length;
    return calcScore({
      missingProcessCount,
      wrongOrderCount,
      userWorkSecs,
      speedBonusMaxPointSecs: 210, // 3m30s
    });
  }, [segs, missingSegs.length, wrongOrderSegs.length]);
  console.log(score);

  return (
    <Center {...CARD_COMMON_STYLE}>
      <VStack w="full" maxW="600px">
        <Center flexDirection="column">
          <Heading as="h1" mb={4}>{userDisplayName} さんの {record.dailySeq} 回目の収録</Heading>
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
          count={score.input.missingProcessCount}
        >
          {missingSegs.length === 0 && "工程抜けはありませんでした。素晴らしい！"}
          <UnorderedList>
            {missingSegs.map((s, i) => {
              return (
                <ListItem mt={2} key={`${i}/${s.opstepId}`}>
                  <ProcessDisplayNo value={s.displayNo} />
                  <Text as="span">{s.shortName}</Text>
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
          {wrongOrderSegs.length === 0 && "工程順ミスはありませんでした。素晴らしい！"}
          <UnorderedList>
            {wrongOrderSegs.map((s, i) => {
              return (
                <ListItem mt={2} key={`${i}/${s.opstepId}`}>
                  <ProcessDisplayNo value={s.displayNo} />
                  <Text as="span">{s.shortName}</Text>
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
          <Text>あなたの開始〜終了までの時間: {score.input.userWorkSecs.toFixed(1)} 秒</Text>
          <UnorderedList>
            <ListItem>{score.input.speedBonusMaxPointSecs}秒以内: +{score.cfg.speedBonusMaxPoints}点 (Max)</ListItem>
            <ListItem>{`  〜 この間${score.cfg.speedBonusSpanSecs}秒区間で線形にスピードボーナス算出 〜`}</ListItem>
            <ListItem>{score.input.speedBonusMaxPointSecs + score.cfg.speedBonusSpanSecs}秒以上: +{0}点 (Min)</ListItem>
          </UnorderedList>
        </ScoreCheckPointSection>
      </VStack>
    </Center>
  );
};

const TookTimeChartCard = ({ segs }: {
  segs: RecordSegmentAggr[];
}) => {
  const KEY_YOU = "あなた";
  const KEY_MASTER = "熟練者";
  const TOP_K = 4;

  const data = segs
    .filter(s => s.type !== "missing" && s.durSec > s.referenceDurSec)
    .sort((a, b) => (b.durSec - b.referenceDurSec) - (a.durSec - a.referenceDurSec))
    .slice(0, TOP_K)
    .map((s) => ({
      name: `[${s.displayNo}] ${s.shortName.slice(0, 11)}`,
      [KEY_YOU]: s.durSec,
      [KEY_MASTER]: s.referenceDurSec,
    }));

  console.log("TookTimeChartCard: data", data);

  return (
    <Center {...CARD_COMMON_STYLE} flexDirection="column">
      <Heading as="h2" mb={3}>時間のかかっている工程 上位{TOP_K}件</Heading>
      <Text mb={6}>
        以下の工程は熟練者との差が大きい上位4件です。<br />これらを意識すると時間短縮しやすいでしょう。
      </Text>
      <ResponsiveContainer width="100%" minHeight="440px">
        <BarChart
          width={500}
          height={900}
          data={data}
          layout="horizontal"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" type="category" />
          <YAxis
            type="number"
            label={
              // NOTE: 縦書きにするオプションが無かったので
              // ChromeDevTool の inspector で Outer HTML を以下にコピペ → writing-mode 属性を追加
              // でゴリ押ししている


                <text
                  offset="5"
                  x="35"
                  y="173"
                  className="recharts-text recharts-label"
                  text-anchor="middle"
                  fill="#808080"
                  writing-mode="vertical-lr"
                >
                  <tspan x="35" dy="0.355em">時間 [秒]</tspan>
                </text>

            }
            domain={[0, (dataMax: number) => Math.ceil(dataMax / 5) * 5]}
          />
          <Tooltip
            formatter={(
              v: number,
              _name,
              _item,
              i,
              // @ts-expect-error: Property 'payload' does not exist on type 'Payload<number, NameType> | undefined'.
              [{ payload }],
            ) => `${v.toFixed(1)} 秒${i === 1 ? "" : `(+${(payload[KEY_YOU] - payload[KEY_MASTER]).toFixed(2)}秒)`}`}
          />
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
