import {
  getGetRecordingAvailabilityQueryKey,
  useFinishRecording,
} from "@/gen/oapi/backend/v1/client/recording/recording";
import { getPageTitle } from "@/usecase/pagemeta";
import {
  Box,
  Button,
  Center,
  Divider,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import Head from "next/head";
import { useRouter } from "next/router";

const PAGE_TITLE = getPageTitle("収録中");

export const RecordingNowPane = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const { mutate, isPending } = useFinishRecording({
    mutation: {
      onSuccess: ({ recordId }) => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: getGetRecordingAvailabilityQueryKey() });
        }, 100);

        router.push(`/records/${recordId}`);
      },
    },
  });

  const handleFinishButtonClick = () => {
    mutate();
  };

  return (
    <>
      <Box w="full" minH="full" h="1px" bg="white" display="flex" justifyContent="center" alignItems="center">
        <Head>
          <title>{PAGE_TITLE}</title>
        </Head>
        <Center flexDirection="column" pb={20}>
          <Heading as="h1" fontSize="8xl" color="teal.900" my={8}>
            収録中
          </Heading>
          <Button colorScheme="blue" fontSize="4xl" p={12} isLoading={isPending} onClick={onOpen}>
            収録終了
          </Button>
        </Center>
      </Box>
      <Modal isOpen={isOpen} size="2xl" onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>収録の終了</ModalHeader>
          <ModalCloseButton />
          <Divider />
          <ModalBody>
            <Text>収録を終了します。よろしいですか？</Text>
          </ModalBody>
          <ModalFooter display="flex" justifyContent="center">
            <Button
              size="lg"
              px={12}
              colorScheme="blue"
              mr={3}
              isLoading={isPending}
              onClick={handleFinishButtonClick}
            >
              終了
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
