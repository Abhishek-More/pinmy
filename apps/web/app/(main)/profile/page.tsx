"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, RefreshCw, Trash2, ArrowLeft, Key, Eye, EyeOff } from "lucide-react";
import { authClient } from "@/lib/clients/auth-browser";
import { Typography } from "@/components/typography/Typography";
import { Button } from "@/components/ui/button";
import { Identicon } from "@/components/general/Identicon";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface KeyData {
  key: string;
  prefix: string;
  createdAt: string;
}

const LANGUAGES = ["cURL", "JavaScript", "Python", "Go", "Ruby"] as const;
type Language = (typeof LANGUAGES)[number];

const BASE_PATH = "/api/v1/pins";

function snippet(lang: Language, origin: string): string {
  const url = `${origin}${BASE_PATH}`;
  switch (lang) {
    case "cURL":
      return `curl -H "Authorization: Bearer pm_YOUR_KEY" \\
  "${url}"`;
    case "JavaScript":
      return `const res = await fetch("${url}", {
  headers: { Authorization: "Bearer pm_YOUR_KEY" },
});
const { data } = await res.json();`;
    case "Python":
      return `import requests

res = requests.get(
    "${url}",
    headers={"Authorization": "Bearer pm_YOUR_KEY"},
)
data = res.json()["data"]`;
    case "Go":
      return `req, _ := http.NewRequest("GET", "${url}", nil)
req.Header.Set("Authorization", "Bearer pm_YOUR_KEY")
resp, _ := http.DefaultClient.Do(req)`;
    case "Ruby":
      return `require "net/http"
require "json"

uri = URI("${url}")
req = Net::HTTP::Get.new(uri)
req["Authorization"] = "Bearer pm_YOUR_KEY"
res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) { |http| http.request(req) }
data = JSON.parse(res.body)["data"]`;
  }
}

function UsageSnippets() {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const [copiedLang, setCopiedLang] = useState<Language | null>(null);

  const handleCopy = async (lang: Language) => {
    await navigator.clipboard.writeText(snippet(lang, origin));
    setCopiedLang(lang);
    setTimeout(() => setCopiedLang(null), 2000);
  };

  return (
    <Tabs defaultValue="cURL">
      <TabsList variant="line" className="mb-3 gap-0">
        {LANGUAGES.map((lang) => (
          <TabsTrigger key={lang} value={lang} className="cursor-pointer px-3 py-1.5 text-xs font-semibold">
            {lang}
          </TabsTrigger>
        ))}
      </TabsList>
      {LANGUAGES.map((lang) => (
        <TabsContent key={lang} value={lang}>
          <div className="relative">
            <pre className="overflow-x-auto border-2 border-black bg-gray-950 px-4 py-4 pr-12 font-mono text-xs text-green-400">
              {snippet(lang, origin)}
            </pre>
            <button
              onClick={() => handleCopy(lang)}
              className="absolute top-3 right-3 cursor-pointer rounded-none border border-white/20 bg-white/10 p-1.5 text-white/60 transition-colors hover:bg-white/20 hover:text-white"
              title="Copy snippet"
            >
              {copiedLang === lang ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}

export default function ProfilePage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  const [keyData, setKeyData] = useState<KeyData | null>(null);
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
    }
  }, [isPending, session, router]);

  const fetchKeyMeta = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/keys");
      const data = await res.json();
      setKeyData(data.key ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) fetchKeyMeta();
  }, [session, fetchKeyMeta]);

  const handleGenerate = async () => {
    setGenerating(true);
    setCopied(false);
    try {
      const res = await fetch("/api/keys", { method: "POST" });
      const data = await res.json();
      setKeyData({ key: data.raw, prefix: data.prefix, createdAt: data.createdAt });
      setVisible(true);
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async () => {
    await fetch("/api/keys", { method: "DELETE" });
    setKeyData(null);
    setVisible(false);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!keyData) return;
    await navigator.clipboard.writeText(keyData.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isPending || !session) return null;

  return (
    <div className="mx-auto flex h-dvh max-w-2xl flex-col px-6 pt-12 md:pt-20">
      {/* Back link */}
      <button
        onClick={() => router.push("/")}
        className="mb-8 flex cursor-pointer items-center gap-2 self-start text-sm font-medium hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Pins
      </button>

      {/* Profile header */}
      <div className="mb-10 flex items-center gap-4">
        <div className="shrink-0 border-2 border-black">
          <Identicon id={session.user.id} size={48} />
        </div>
        <div>
          <Typography variant="h2">
            {session.user.phoneNumber || "Profile"}
          </Typography>
          <Typography variant="muted">Manage your API access</Typography>
        </div>
      </div>

      {/* API Key section */}
      <div className="border-[3px] border-black bg-white">
        <div className="flex items-center gap-3 border-b-[3px] border-black px-5 py-4">
          <Key className="h-5 w-5" />
          <Typography variant="large">API Key</Typography>
        </div>

        <div className="px-5 py-5">
          <Typography variant="muted" className="mb-5">
            Use your API key to access your pins programmatically. Include it as
            a Bearer token in the Authorization header.
          </Typography>

          {loading ? (
            <div className="h-12 animate-pulse border-2 border-black/10 bg-gray-100" />
          ) : keyData ? (
            <div className="flex flex-col gap-4">
              {/* Key display */}
              <div className="flex items-center gap-3">
                <div className="flex-1 overflow-hidden border-2 border-black bg-gray-50 px-4 py-3 font-mono text-sm">
                  {visible ? (
                    <span className="break-all">{keyData.key}</span>
                  ) : (
                    <span className="text-muted-foreground">
                      {keyData.prefix}{"••••••••••••••••••••••••"}
                    </span>
                  )}
                </div>
                <Button
                  onClick={() => setVisible((v) => !v)}
                  variant="outline"
                  className="shrink-0 border-2 border-black p-2"
                  title={visible ? "Hide key" : "Show key"}
                >
                  {visible ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="shrink-0 border-2 border-black p-2"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <Typography variant="detail">
                Created{" "}
                {new Date(keyData.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </Typography>

              {/* Actions */}
              <div className="flex gap-3">
                <div className="brutal-shadow-accent-wrapper">
                  <Button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="cursor-pointer border-2 border-black px-4 py-2 text-xs font-semibold"
                  >
                    <RefreshCw className={`h-3 w-3 ${generating ? "animate-spin" : ""}`} />
                    {generating ? "Rotating..." : "Rotate Key"}
                  </Button>
                </div>
                <Button
                  onClick={handleRevoke}
                  variant="destructive"
                  className="cursor-pointer border-2 border-black px-4 py-2 text-xs font-semibold"
                >
                  <Trash2 className="h-3 w-3" />
                  Revoke
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-start gap-4">
              <Typography variant="muted">No API key generated yet.</Typography>
              <div className="brutal-shadow-accent-wrapper">
                <Button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="cursor-pointer border-2 border-black px-4 py-2 text-xs font-semibold"
                >
                  <Key className="h-3 w-3" />
                  {generating ? "Generating..." : "Generate API Key"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Usage example */}
      <div className="mt-8 mb-12 border-[3px] border-black bg-white">
        <div className="border-b-[3px] border-black px-5 py-4">
          <Typography variant="large">Usage</Typography>
        </div>
        <div className="px-5 py-5">
          <UsageSnippets />
          <div className="mt-4 flex flex-col gap-2">
            <Typography variant="detail">Query parameters:</Typography>
            <ul className="list-inside list-disc text-xs text-muted-foreground">
              <li><code className="bg-gray-100 px-1">q</code> - full-text search</li>
              <li><code className="bg-gray-100 px-1">category</code> - filter by category</li>
              <li><code className="bg-gray-100 px-1">limit</code> - results per page (1-200, default 50)</li>
              <li><code className="bg-gray-100 px-1">offset</code> - pagination offset</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
