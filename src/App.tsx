import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import "./App.css";

type TStatus =
  | "idle"
  | "get-ready"
  | "shoot"
  | "too-soon"
  | "result"
  | "average-score";

const Title = styled.h3<{ $status: TStatus }>(({ $status = "idle" }) => ({
  fontSize: "2rem",
  fontWeight: "bold",
  margin: "1.5rem 0 0rem 0",
  userSelect:
    $status === "idle" || $status === "average-score" ? "auto" : "none",
}));

const Description = styled.p<{ $status: TStatus }>(({ $status = "idle" }) => ({
  fontSize: "1.25rem",
  userSelect:
    $status === "idle" || $status === "average-score" ? "auto" : "none",
  padding: "0.625rem 0",
}));

const Area = styled.div<{ $status: TStatus }>(({ $status = "idle" }) => ({
  display: "grid",
  placeItems: "center",
  borderRadius: "0.125rem",
  backgroundColor:
    $status === "idle"
      ? "var(--idle)"
      : $status === "get-ready"
        ? "var(--get-ready)"
        : $status === "too-soon"
          ? "var(--too-soon)"
          : $status === "result"
            ? "var(--result)"
            : $status === "average-score"
              ? "var(--average-score)"
              : "var(--shoot)",
  height: "36rem",
}));

const Text = styled.p<{ $status: TStatus }>(({ $status = "idle" }) => ({
  fontSize: "3rem",
  fontWeight: "bold",
  userSelect: "none",
  color:
    $status === "shoot" || $status === "result" || $status === "average-score"
      ? "var(--text)"
      : "var(--text-l)",
}));

const DescriptionWrapper = styled.div({
  display: "flex",
  justifyContent: "center",
  gap: "1rem",
  padding: "1.5rem",
  alignItems: "center",
});

const Button = styled.button<{ $status: TStatus }>(({ $status = "idle" }) => ({
  all: "unset",
  backgroundColor: "var(--idle)",
  padding: "0.625rem 1.25rem",
  borderRadius: "0.125rem",
  color: "var(--text-l)",
  userSelect:
    $status === "idle" || $status === "average-score" ? "auto" : "none",
  transition: "all 300ms",
  "&:hover": {
    // idle color
    backgroundColor: "#808080" + "95",
  },
}));

function App() {
  const [status, setStatus] = useState<TStatus>("idle");
  const [result, setResult] = useState(0);

  const [results, setResults] = useState<number[]>([]);

  const reactionStart = useRef<number | null>(null);
  const reactionEnd = useRef<number | null>(null);

  const handleRestart = () => {
    setResults([]);
    setStatus("idle");
  };

  const handleProgress = () => {
    if (status === "shoot") {
      reactionEnd.current = Date.now();
      setResult(reactionEnd.current - (reactionStart.current as number));
    } else if (status === "idle") {
      setStatus("get-ready");
    } else if (status === "get-ready") {
      setStatus("too-soon");
    } else if (status === "too-soon") {
      setStatus("get-ready");
    } else if (status === "result") {
      if (results.length > 4) {
        setStatus("average-score");
      } else {
        setStatus("get-ready");
      }
    } else {
      // status === "average-score"
      handleRestart();
    }
  };

  useEffect(() => {
    let t: number;

    const startTimer = () => {
      t = setTimeout(
        () => {
          setStatus("shoot");
          reactionStart.current = Date.now();
        },
        ((Date.now() % 10) + 2) * 500,
      );
    };

    if (status === "get-ready") {
      startTimer();
    }

    return () => {
      clearTimeout(t);
    };
  }, [status]);

  useEffect(() => {
    (() => {
      if (result) {
        setStatus("result");
        setResults((prev) => [...prev, result]);
      }
    })();
  }, [result, setStatus]);

  return (
    <>
      <Title $status={status}>Reaction time test app.</Title>
      <DescriptionWrapper>
        <Description $status={status}>
          {status === "idle"
            ? `By hitting start, you're
        going to perform 5 reaction time tests. You will see your average score
        in the end.`
            : status === "average-score"
              ? "Test is finished."
              : `You're performing the test...`}
        </Description>
        {status === "idle" || status === "average-score" ? null : (
          <Button $status={status} onClick={handleRestart}>
            Stop
          </Button>
        )}
      </DescriptionWrapper>
      <Area $status={status} onClick={handleProgress}>
        <Text $status={status}>
          {status === "idle"
            ? "Click to start the test."
            : status === "get-ready"
              ? "Get ready to shoot..."
              : status === "shoot"
                ? "SHOOT!"
                : status === "too-soon"
                  ? "Too soon. Click to retry this test."
                  : status === "result"
                    ? `Test ${results.length} reaction time: ${result}ms.`
                    : // status === "average-score"
                      `Your average reaction time is: ${results.reduce((p, c) => p + c) / results.length}ms.`}
        </Text>
      </Area>
    </>
  );
}

export default App;
