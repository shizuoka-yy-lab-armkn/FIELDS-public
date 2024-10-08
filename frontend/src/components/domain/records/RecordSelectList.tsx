import * as schema from "@/gen/oapi/backend/v1/schema";
import { fmtRecordName } from "@/usecase/records";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { ButtonProps, Flex, Menu, MenuButton, MenuItem, MenuList, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useMemo } from "react";

export type RecordSelectListProps = {
  records: readonly schema.Record[];
  currentRecordId?: string;
} & ButtonProps;

export const RecordSelectList = ({ records, currentRecordId, ...props }: RecordSelectListProps) => {
  const currentRecordIndex = useMemo(() => {
    if (currentRecordId == null) return null;
    const i = records.findIndex((r) => r.recordId === currentRecordId);
    return i < 0 ? null : i;
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
            w="30ch"
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            {currentRecordIndex == null ? "" : fmtRecordName(records[currentRecordIndex]!)}
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
            {fmtRecordName(r)}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};
