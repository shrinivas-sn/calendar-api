import React, { useState } from 'react';
import { Clipboard, Check } from 'lucide-react';

export default function CodeSnippet({ url }) {
  const [activeTab, setActiveTab] = useState('curl');
  const [copied, setCopied] = useState(false);

  const getSnippets = () => {
    return {
      curl: `curl -X GET "${url}"`,
      javascript: `fetch("${url}")
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));`,
      python: `import requests

url = "${url}"
response = requests.get(url)
data = response.json()
print(data)`,
      go: `package main

import (
	"fmt"
	"io"
	"net/http"
)

func main() {
	url := "${url}"
	resp, err := http.Get(url)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	fmt.Println(string(body))
}`
    };
  };

  const snippets = getSnippets();
  const currentSnippet = snippets[activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: 'curl', label: 'cURL' },
    { id: 'javascript', label: 'JavaScript' },
    { id: 'python', label: 'Python' },
    { id: 'go', label: 'Go' }
  ];

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-lg">
      {/* Tabs Header */}
      <div className="flex items-center justify-between px-4 bg-black/40 border-b border-white/5 h-11">
        <div className="flex space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-xs font-semibold px-2.5 py-1.5 rounded-md transition-all duration-150 ${
                activeTab === tab.id
                  ? 'bg-saffron-500/10 text-saffron-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-white/5 hover:bg-white/10 border border-white/5 px-2.5 py-1 rounded transition-colors"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Clipboard size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Snippet display */}
      <div className="p-4 bg-black/60 overflow-x-auto min-h-[140px] flex items-center">
        <pre className="font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap break-all w-full">
          {currentSnippet}
        </pre>
      </div>
    </div>
  );
}
