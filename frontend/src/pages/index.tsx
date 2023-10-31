import { usePing } from "@/gen/oapi/backend/v1/client/debug/debug";
import { Container } from "@chakra-ui/react";

export default function TopPage() {
  const resp = usePing();
  console.log("[usePing]", resp);
  return (
    <Container>
      Hello
    </Container>
  );
}
