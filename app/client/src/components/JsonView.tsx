import React, { useMemo } from "react";
import {
  ActionIcon,
  Box,
  CopyButton,
  Group,
  ScrollArea,
  Text,
  Tooltip,
} from "@mantine/core";

/**
 * Colour-coded, read-only JSON block. A tiny tokenizer (no dependency) wraps
 * keys, strings, numbers, booleans/null and punctuation in spans; the colours
 * live in styles.css (.uf-json-*) so they flip with the colour scheme.
 */
interface JsonViewProps {
  /** Any JSON-serialisable value. Strings are shown as-is (e.g. an error line). */
  data: unknown;
  /** Optional caption shown above the block, e.g. "Response". */
  title?: string;
  /** Max height before the block scrolls (default 480). */
  maxHeight?: number | string;
  /** Tint the frame red for error output. */
  tone?: "default" | "error";
}

type TokenKind = "key" | "string" | "number" | "boolean" | "null" | "punct";

interface Token {
  kind: TokenKind | "ws";
  text: string;
}

// Matches one JSON token at a time. Order matters: strings first so a colon
// inside a string is never read as punctuation.
const TOKEN_RE =
  /("(?:\\.|[^"\\])*")(\s*:)?|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(true|false)|(null)|([{}[\],:])|(\s+)/g;

function tokenize(json: string): Token[] {
  const out: Token[] = [];
  let m: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(json)) !== null) {
    if (m[1] !== undefined) {
      if (m[2] !== undefined) {
        out.push({ kind: "key", text: m[1] });
        out.push({ kind: "punct", text: m[2] });
      } else {
        out.push({ kind: "string", text: m[1] });
      }
    } else if (m[3] !== undefined) out.push({ kind: "number", text: m[3] });
    else if (m[4] !== undefined) out.push({ kind: "boolean", text: m[4] });
    else if (m[5] !== undefined) out.push({ kind: "null", text: m[5] });
    else if (m[6] !== undefined) out.push({ kind: "punct", text: m[6] });
    else if (m[7] !== undefined) out.push({ kind: "ws", text: m[7] });
  }
  return out;
}

export const JsonView: React.FC<JsonViewProps> = ({
  data,
  title,
  maxHeight = 480,
  tone = "default",
}) => {
  const text = useMemo(
    () => (typeof data === "string" ? data : JSON.stringify(data, null, 2)),
    [data],
  );
  const tokens = useMemo(
    () => (typeof data === "string" ? null : tokenize(text)),
    [data, text],
  );

  return (
    <Box className="uf-json" data-tone={tone}>
      <Group justify="space-between" className="uf-json-bar" px="sm" py={6}>
        <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts="0.04em">
          {title ?? "JSON"}
        </Text>
        <CopyButton value={text} timeout={1500}>
          {({ copied, copy }) => (
            <Tooltip label={copied ? "Copied" : "Copy"} withArrow>
              <ActionIcon
                variant="subtle"
                color={copied ? "teal" : "gray"}
                size="sm"
                aria-label="Copy JSON"
                onClick={copy}
              >
                <span className="material-icons-outlined" style={{ fontSize: 16 }}>
                  {copied ? "check" : "content_copy"}
                </span>
              </ActionIcon>
            </Tooltip>
          )}
        </CopyButton>
      </Group>
      <ScrollArea.Autosize mah={maxHeight} type="auto" offsetScrollbars>
        <pre className="uf-json-pre">
          {tokens
            ? tokens.map((t, i) =>
                t.kind === "ws" ? (
                  t.text
                ) : (
                  <span key={i} className={`uf-json-${t.kind}`}>
                    {t.text}
                  </span>
                ),
              )
            : text}
        </pre>
      </ScrollArea.Autosize>
    </Box>
  );
};
