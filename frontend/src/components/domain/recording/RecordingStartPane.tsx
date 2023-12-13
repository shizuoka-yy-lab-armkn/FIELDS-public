import {
  getGetRecordingAvailabilityQueryKey,
  useStartRecording,
} from "@/gen/oapi/backend/v1/client/recording/recording";
import { SubjectBrief, User } from "@/gen/oapi/backend/v1/schema";
import { useGetSubjectList } from "@/hooks/subjects";
import { useGetUsertList } from "@/hooks/users";
import { getPageTitle } from "@/usecase/pagemeta";
import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
  UnorderedList,
  useDisclosure,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import Head from "next/head";
import { ChangeEventHandler, useCallback, useState } from "react";

const PAGE_TITLE = getPageTitle("収録開始");
const CONFIRM_BTN_TEXT = "設定を確認して開始";

export const RecordingStartPane = () => {
  console.log("rendred RecordingStartPane");

  const { subjects } = useGetSubjectList();
  const { users } = useGetUsertList();

  const queryClient = useQueryClient();

  const [subj, setSubj] = useState<SubjectBrief | undefined>(undefined);
  const [user, setUser] = useState<User | undefined>(undefined);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { mutate, isPending: isStartRequestPending } = useStartRecording({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetRecordingAvailabilityQueryKey() });
        onClose();
      },
      onError: (err) => {
        console.error(err);
      },
    },
  });

  if (subjects?.length === 1 && subj == null) {
    setSubj(subjects[0]);
  }

  const handleSubjectSelectChange = useCallback<ChangeEventHandler<HTMLSelectElement>>((ev) => {
    if (subjects == null) return;
    const id = ev.target.value;
    setSubj(subjects.find((s) => s.id === id));
  }, [subjects]);

  const handleUserSelectChange = useCallback<ChangeEventHandler<HTMLSelectElement>>((ev) => {
    if (users == null) return;
    const username = ev.target.value;
    setUser(users.find((u) => u.username === username));
  }, [users]);

  const handleStartButtonClick = () => {
    if (subj == null || user == null) return;
    mutate({
      data: {
        subjectSlug: subj.slug,
        username: user.username,
      },
    });
  };

  const hasFormError = subj == null || user == null;

  return (
    <Container maxW="720px">
      <Head>
        <title>{PAGE_TITLE}</title>
      </Head>
      <Card
        mt={12}
        py={8}
        px={12}
      >
        <Heading as="h1" fontSize="3xl" mb={4}>収録を開始する</Heading>
        <Text>下記フォームで収録の設定をしてからボタンを押してください。</Text>
        <Box as="form" my={8}>
          <FormControl mb={6}>
            <FormLabel>作業</FormLabel>
            <Select value={subj?.id} onChange={handleSubjectSelectChange}>
              {subjects?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </FormControl>
          <FormControl mb={6}>
            <FormLabel>作業者</FormLabel>
            <Select placeholder="--- 選択してください ---" onChange={handleUserSelectChange}>
              {users?.map((u) => <option key={u.username} value={u.username}>{u.username}</option>)}
            </Select>
          </FormControl>
          <Box textAlign="center">
            <Button size="lg" px={12} colorScheme="teal" isDisabled={hasFormError} onClick={onOpen}>
              {CONFIRM_BTN_TEXT}
            </Button>
          </Box>
        </Box>
      </Card>
      <Modal isOpen={isOpen} isCentered size="2xl" onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>収録の開始</ModalHeader>
          <ModalCloseButton />
          <Divider />
          <ModalBody>
            <Text>下記設定にて収録を開始します。</Text>
            <UnorderedList mt={4} mb={6}>
              <ListItem>
                <Text as="span" display="inline-block" minW="6ch">作業:</Text> <strong>{subj?.name}</strong>
              </ListItem>
              <ListItem>
                <Text as="span" display="inline-block" minW="6ch">作業者:</Text> <strong>{user?.username}</strong>
              </ListItem>
            </UnorderedList>
            <Text mt={4}>
              開始ボタンを押して <strong>5秒以上</strong>{" "}
              待ってから、<strong>大きな音</strong>で拍手を3回して始めてください。
            </Text>
          </ModalBody>
          <ModalFooter display="flex" justifyContent="center">
            <Button
              size="lg"
              px={12}
              colorScheme="blue"
              mr={3}
              isLoading={isStartRequestPending}
              onClick={handleStartButtonClick}
            >
              開始
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};
