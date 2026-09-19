"use client";

import React from "react";

/**
 * 실시간 스트리밍 중에도 에러 없이 부드럽게 마크다운을 렌더링하는 안전한 컴포넌트
 */
export function MarkdownMessage({ content = "", isUser }) {
  if (isUser) {
    return <span className="whitespace-pre-line">{content}</span>;
  }

  // 줄 단위 파싱
  const lines = content.split("\n");

  return (
    <div className="text-xs leading-relaxed space-y-1.5">
      {lines.map((line, idx) => {
        // 빈 줄
        if (!line.trim()) {
          return <div key={idx} className="h-1" />;
        }

        // 구분선 (---)
        if (line.trim() === "---") {
          return <hr key={idx} className="my-2 border-border" />;
        }

        // 번호 목록 (1. , 2. )
        const orderedMatch = line.match(/^(\d+)\.\s+(.*)/);
        if (orderedMatch) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1 my-0.5">
              <span className="font-bold text-primary shrink-0 font-mono">
                {orderedMatch[1]}.
              </span>
              <div className="flex-1">{renderInlineMarkdown(orderedMatch[2])}</div>
            </div>
          );
        }

        // 불렛 목록 (- , * )
        const bulletMatch = line.match(/^[-*]\s+(.*)/);
        if (bulletMatch) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1 my-0.5">
              <span className="text-primary shrink-0 mt-0.5">•</span>
              <div className="flex-1">{renderInlineMarkdown(bulletMatch[1])}</div>
            </div>
          );
        }

        // 일반 문장
        return (
          <p key={idx} className="my-0.5">
            {renderInlineMarkdown(line)}
          </p>
        );
      })}
    </div>
  );
}

/**
 * 인라인 마크다운 파서: **굵게**, *기울임*, [링크](url)
 */
function renderInlineMarkdown(text) {
  if (!text) return null;

  // 정규식 분해: **bold**, *italic*, [link](url)
  const parts = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // 매치 이전 일반 텍스트
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const matchedStr = match[0];

    // **굵게**
    if (matchedStr.startsWith("**") && matchedStr.endsWith("**")) {
      const boldText = matchedStr.slice(2, -2);
      parts.push(
        <strong key={match.index} className="font-bold text-foreground text-blue-300">
          {boldText}
        </strong>
      );
    }
    // *기울임*
    else if (matchedStr.startsWith("*") && matchedStr.endsWith("*")) {
      const italicText = matchedStr.slice(1, -1);
      parts.push(
        <em key={match.index} className="text-slate-300 not-italic font-semibold">
          {italicText}
        </em>
      );
    }
    // [링크텍스트](url)
    else if (matchedStr.startsWith("[")) {
      const linkMatch = matchedStr.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        const linkText = linkMatch[1];
        const linkUrl = linkMatch[2];
        parts.push(
          <a
            key={match.index}
            href={linkUrl}
            target={linkUrl.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            className="text-primary underline hover:text-blue-300 font-bold ml-1 inline-flex items-center gap-0.5"
          >
            {linkText}
          </a>
        );
      }
    }

    lastIndex = regex.lastIndex;
  }

  // 나머지 텍스트
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}
