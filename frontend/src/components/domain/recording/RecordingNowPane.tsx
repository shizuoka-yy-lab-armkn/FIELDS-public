import {
  getGetRecordingAvailabilityQueryKey,
  useFinishRecording,
} from "@/gen/oapi/backend/v1/client/recording/recording";
import { getGetRecordListQueryKey } from "@/gen/oapi/backend/v1/client/records/records";
import { useGetRecordingAvailability } from "@/hooks/recording";
import { getPageTitle } from "@/usecase/pagemeta";
import { Duration } from "@/utils/datetime";
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
import { useEffect, useMemo, useRef, useState } from "react";

const PAGE_TITLE = getPageTitle("収録中");

export const RecordingNowPane = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [realtimeNow, setRealtimeNow] = useState(new Date());

  const intervalRef = useRef<number | null>(null);
  useEffect(() => {
    if (intervalRef.current == null) {
      intervalRef.current = window.setInterval(() => setRealtimeNow(new Date()), 1000);
    }

    return () => {
      if (intervalRef.current != null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const { availability } = useGetRecordingAvailability();

  const elapsedFmtTime = useMemo((): string => {
    if (availability == null || availability.type != "recording") return "";
    const recordingStartAt = new Date(availability.startAt);
    const dur = new Duration(recordingStartAt, realtimeNow);
    return dur.fmtHMS();
  }, [realtimeNow, availability]);

  const { mutate, isPending } = useFinishRecording({
    mutation: {
      onSuccess: ({ recordId }) => {
        queryClient.invalidateQueries({ queryKey: getGetRecordListQueryKey() });

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
        <Center flexDirection="column" color="teal.900" pb={20}>
          <Heading as="h1" fontSize="8xl" my={8}>
            収録中
          </Heading>
          <Text fontSize="6xl" mb={6}>
            {elapsedFmtTime}
          </Text>
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
