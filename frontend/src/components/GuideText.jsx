import React from 'react';

// Renders guide text written with a small markdown subset:
// **bold**, `inline code`, "- " bullet lines, "1. " numbered lines, blank-line breaks.
// Plain React elements only; the text is never injected as HTML.

const TEXT_CLASS = 'text-slate-300 text-sm sm:text-[15px] leading-relaxed';

function renderInline(text) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={i} className="font-mono text-[0.9em] text-slate-200 bg-slate-900 border border-slate-800 rounded px-1 py-0.5">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function toBlocks(text) {
  const blocks = [];
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    const last = blocks[blocks.length - 1];
    if (line === '') {
      blocks.push({ type: 'break' });
    } else if (/^- /.test(line)) {
      if (last && last.type === 'ul') last.items.push(line.slice(2));
      else blocks.push({ type: 'ul', items: [line.slice(2)] });
    } else if (/^\d+\. /.test(line)) {
      const item = line.replace(/^\d+\. /, '');
      if (last && last.type === 'ol') last.items.push(item);
      else blocks.push({ type: 'ol', items: [item] });
    } else if (last && last.type === 'p') {
      last.text += ' ' + line;
    } else {
      blocks.push({ type: 'p', text: line });
    }
  }
  return blocks.filter((b) => b.type !== 'break');
}

export default function GuideText({ text }) {
  return (
    <div className="space-y-3">
      {toBlocks(text).map((block, i) => {
        if (block.type === 'ul') {
          return (
            <ul key={i} className={`list-disc pl-5 space-y-1.5 ${TEXT_CLASS}`}>
              {block.items.map((item, j) => <li key={j}>{renderInline(item)}</li>)}
            </ul>
          );
        }
        if (block.type === 'ol') {
          return (
            <ol key={i} className={`list-decimal pl-5 space-y-1.5 ${TEXT_CLASS}`}>
              {block.items.map((item, j) => <li key={j}>{renderInline(item)}</li>)}
            </ol>
          );
        }
        return <p key={i} className={TEXT_CLASS}>{renderInline(block.text)}</p>;
      })}
    </div>
  );
}
