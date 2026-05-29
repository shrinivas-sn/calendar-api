import React from 'react';

function syntaxHighlight(json) {
  if (typeof json !== 'string') {
    json = JSON.stringify(json, null, 2);
  }
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, function (match) {
    let cls = 'number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'property';
      } else {
        cls = 'string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'boolean';
    } else if (/null/.test(match)) {
      cls = 'null';
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
}

export default function JsonViewer({ data }) {
  const highlighted = syntaxHighlight(data);

  return (
    <div className="w-full relative group">
      <pre 
        className="font-mono text-[11px] sm:text-xs leading-relaxed bg-[#050508]/90 border border-white/10 rounded-xl p-4 overflow-auto max-h-[480px] w-full text-slate-300 scrollbar-thin"
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    </div>
  );
}
