import * as schema from "@/gen/oapi/backend/v1/schema";
import { fmtDatetime } from "@/utils/datetime";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { ButtonProps, Flex, Menu, MenuButton, MenuItem, MenuList, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useMemo } from "react";

export type RecordSelectListProps = {
  records: readonly schema.Record[];
  currentRecordId?: string;
} & ButtonProps;

const fmtRecordName = (recordIndex: number, record: schema.Record): string => {
  const d = new Date(record.recordAt);
  return `収録 ${recordIndex + 1} - ${fmtDatetime(d)}`;
};

export const RecordSelectList = ({ records, currentRecordId, ...props }: RecordSelectListProps) => {
  const currentRecordIndex = useMemo(() => {
    if (currentRecordId == null) return null;
    return records.findIndex((r) => r.recordId === currentRecordId);
  }, [records, currentRecordId]);

  const router = useRouter();

  console.log(`[RecordSelectList] recods=`, records);

  return (
    <Menu autoSelect={false}>
      <MenuButton
        type="button"
        fontSize="14px"
        px={3}
        py={0}
        rounded="md"
        textAlign="left"
        border="1px"
        borderColor="gray.300"
        bg="white"
        color="teal.900"
        _hover={{ bg: "white" }}
        _expanded={{ bg: "white" }}
        {...props}
      >
        <Flex alignItems="center">
          <Text
            as="span"
            display="inline-block"
            w="24ch"
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            {currentRecordIndex == null ? "" : fmtRecordName(currentRecordIndex, records[currentRecordIndex]!)}
          </Text>
          <ChevronDownIcon ml={1} />
        </Flex>
      </MenuButton>
      <MenuList color="teal.900" py={0}>
        {records.map((r, i) => (
          <MenuItem
            key={r.recordId}
            onClick={() => i !== currentRecordIndex && router.push(`/records/${r.recordId}`)}
          >
            {fmtRecordName(i, r)}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};
