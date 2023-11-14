import { WithHeader } from "@/components/layout/WithHeader";
import { Container } from "@chakra-ui/react";

export default function TopPage() {
  return (
    <WithHeader>
      <Container>
        Welcome!
      </Container>
    </WithHeader>
  );
}
