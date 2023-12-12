import { useGetRecordingAvailability } from "@/hooks/recording";
import { RecordingNowPane } from "../domain/recording/RecordingNowPane";
import { RecordingStartPane } from "../domain/recording/RecordingStartPane";
import { LoadingPane } from "../util/LoadingPane";

export const Recording = () => {
  const { availability } = useGetRecordingAvailability();

  if (availability == null) {
    return <LoadingPane />;
  }
  console.log("rendered Recording page");

  switch (availability.type) {
    case "available":
      return <RecordingStartPane />;
    case "recording":
      return <RecordingNowPane />;
    default: {
      const exhausiveCheck: never = availability;
      throw new Error("Invalid type: " + exhausiveCheck);
    }
  }
};
