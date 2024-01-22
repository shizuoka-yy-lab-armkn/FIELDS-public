import { ProcessDisplayNo } from "@/components/domain/records/ProcessDisplayNo";
import { ChakraNextLink } from "@/components/util/ChakraNextLink";
import { Record, Segment } from "@/gen/oapi/backend/v1/schema";
import { ActionMetaDict } from "@/model/subjects";
import { calcScore } from "@/usecase/records";
import { Box, BoxProps, Center, Heading, Icon, ListItem, Text, UnorderedList, VStack } from "@chakra-ui/react";
import { ReactNode, useMemo } from "react";
import { IoCaretForwardCircle } from "react-icons/io5";

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
    <Center w="full" py={12} background="gray.200">
      <ScoreCard {...props} />
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
    <Center w="full" maxW="960px" px={4} py={12} bg="white" color="teal.900" boxShadow="lg" rounded="2xl">
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
