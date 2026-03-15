import { useState } from "react";

const workflows = [
  {
    id: "prospect",
    priority: 1,
    label: "P1",
    color: "red",
    icon: "🔍",
    title: "Prospect Research Agent",
    trigger: "Manual — paste business name / URL",
    description: "Researches a target business and generates a personalized cold email.",
    steps: [
      { n: 1, node: "HTTP Request", action: "Fetch website HTML + meta" },
      { n: 2, node: "HTTP Request", action: "Google Places API — ratings, reviews, info" },
      { n: 3, node: "HTTP Request", action: "LinkedIn search (optional, if available)" },
      { n: 4, node: "AI Agent (Gemini)", action: "Identify 3-5 specific AI opportunities for this business" },
      { n: 5, node: "AI Agent (Gemini)", action: "Draft personalized cold email in Turkish (short, pain-first)" },
      { n: 6, node: "Supabase", action: "Store: prospect profile + email draft + opportunities" },
      { n: 7, node: "Telegram", action: "Send card for human review → approve / edit / discard" },
    ],
    tools: ["n8n", "Google Places API", "Gemini 2.0 Flash", "Supabase", "Telegram Bot"],
    output: "Prospect record + approved cold email ready to send",
    buildTime: "2-3 days",
    depends: [],
    note: "Evolution of your existing Leadgen Discovery Agent — retarget ICP.",
  },
  {
    id: "crm",
    priority: 2,
    label: "P2",
    color: "orange",
    icon: "📬",
    title: "Follow-up / CRM Agent",
    trigger: "Daily cron (e.g. 08:00) + manual status update trigger",
    description: "Tracks prospect pipeline, surfaces who needs a follow-up, drafts the message.",
    steps: [
      { n: 1, node: "Supabase", action: "Query prospects where next_follow_up ≤ today AND status NOT IN (closed_won, closed_lost)" },
      { n: 2, node: "IF node", action: "Branch by stage: cold_sent / responded / audited / proposal_sent" },
      { n: 3, node: "AI Agent (Gemini)", action: "Draft stage-appropriate follow-up email in Turkish" },
      { n: 4, node: "Telegram", action: "Send batch digest — approve / edit each follow-up" },
      { n: 5, node: "Email node (Resend)", action: "On approval: send email, update Supabase record" },
      { n: 6, node: "Supabase", action: "Log interaction, set next_follow_up date" },
    ],
    tools: ["n8n", "Supabase", "Gemini 2.0 Flash", "Telegram Bot", "Resend (email)"],
    output: "Follow-ups sent, pipeline updated",
    buildTime: "1-2 days",
    depends: ["prospect"],
    note: "Keeps deals alive without manual tracking. Build immediately after P1.",
  },
  {
    id: "newsletter",
    priority: 2,
    label: "P2",
    color: "orange",
    icon: "📰",
    title: "Newsletter Curator",
    trigger: "Weekly cron (e.g. Monday 09:00)",
    description: "Aggregates AI news, filters for Turkish business relevance, drafts the weekly newsletter in Turkish.",
    steps: [
      { n: 1, node: "RSS Feed (×5-8)", action: "Fetch: TechCrunch AI, The Verge, Hacker News top, WebrazziAI, etc." },
      { n: 2, node: "AI Agent (Gemini)", action: "Score each item 1-10 for relevance to Turkish SMBs" },
      { n: 3, node: "Filter", action: "Keep top 5-7 items scoring ≥ 7" },
      { n: 4, node: "AI Agent (Gemini)", action: "Summarize each in 2-3 Turkish sentences (business-first angle)" },
      { n: 5, node: "Code node", action: "Assemble newsletter HTML template with intro + items + CTA" },
      { n: 6, node: "Supabase", action: "Store draft issue with status: draft" },
      { n: 7, node: "Telegram", action: "Send preview for review → approve / edit" },
      { n: 8, node: "Resend + Webhook", action: "On approval: send to subscriber list, update status: sent" },
    ],
    tools: ["n8n", "RSS nodes", "Gemini 2.0 Flash", "Supabase", "Telegram Bot", "Resend"],
    output: "Weekly Turkish AI newsletter delivered to subscribers",
    buildTime: "2 days",
    depends: [],
    note: "Credibility engine. Runs independently. Subscriber list starts in Supabase.",
  },
  {
    id: "prep",
    priority: 3,
    label: "P3",
    color: "yellow",
    icon: "🎯",
    title: "Consultation Prep Agent",
    trigger: "Manual — trigger before any prospect or client call",
    description: "Produces a pre-call brief: industry context, AI opportunity map, ROI scenarios, talking points.",
    steps: [
      { n: 1, node: "Supabase", action: "Pull prospect/client record + past interactions" },
      { n: 2, node: "HTTP Request (Tavily/Serper)", action: "Fetch latest news for their industry + company name" },
      { n: 3, node: "HTTP Request", action: "Identify 2-3 direct competitors (Google search scrape)" },
      { n: 4, node: "AI Agent (Gemini)", action: "Competitive AI adoption analysis — are their competitors already using AI?" },
      { n: 5, node: "AI Agent (Gemini)", action: "Generate 5 specific AI opportunity cards (problem → solution → estimated time saved)" },
      { n: 6, node: "AI Agent (Gemini)", action: "Draft 3 ROI scenarios (conservative / realistic / optimistic)" },
      { n: 7, node: "AI Agent (Gemini)", action: "Produce one-page call brief with suggested opening + key questions" },
      { n: 8, node: "Telegram", action: "Send formatted brief as structured Telegram message" },
    ],
    tools: ["n8n", "Supabase", "Tavily API", "Gemini 2.0 Flash", "Telegram Bot"],
    output: "One-page call brief with opportunities, ROI, and talking points",
    buildTime: "2-3 days",
    depends: ["prospect"],
    note: "Makes you look like you spent hours preparing. Reality: 5-10 min.",
  },
  {
    id: "curriculum",
    priority: 4,
    label: "P4",
    color: "green",
    icon: "📚",
    title: "Curriculum Generator",
    trigger: "Manual — after audit is done, before engagement starts",
    description: "Generates a fully customized training program outline based on client profile, industry, and goals.",
    steps: [
      { n: 1, node: "Supabase", action: "Pull client record: industry, team size, current tools, tier selected, goals" },
      { n: 2, node: "AI Agent (Gemini)", action: "Select relevant modules from base curriculum library" },
      { n: 3, node: "AI Agent (Gemini)", action: "Generate session plans (objectives, exercises, tools to install per session)" },
      { n: 4, node: "AI Agent (Gemini)", action: "Generate tool setup checklist customized to their stack" },
      { n: 5, node: "AI Agent (Gemini)", action: "Draft recommended OpenClaw skills + workflows for their team" },
      { n: 6, node: "Code node", action: "Assemble full curriculum doc as structured JSON" },
      { n: 7, node: "Supabase", action: "Store curriculum linked to client ID" },
      { n: 8, node: "Telegram", action: "Send summary + link for review" },
    ],
    tools: ["n8n", "Supabase", "Gemini 2.0 Flash", "Telegram Bot"],
    output: "Customized multi-day training plan + tool setup checklist + OpenClaw recommendations",
    buildTime: "2-3 days",
    depends: ["prep"],
    note: "Needs a base curriculum library first — build that as a Supabase JSON table.",
  },
  {
    id: "onboarding",
    priority: 5,
    label: "P5",
    color: "purple",
    icon: "🚀",
    title: "Client Onboarding Workflow",
    trigger: "Manual — triggered when contract is signed",
    description: "Kicks off a new client engagement: creates records, queues curriculum, sends welcome.",
    steps: [
      { n: 1, node: "Supabase", action: "Create client record, set status: active, log start date" },
      { n: 2, node: "Supabase", action: "Create project record with milestones from selected tier" },
      { n: 3, node: "Webhook → Curriculum Generator", action: "Trigger curriculum generation workflow with client ID" },
      { n: 4, node: "AI Agent (Gemini)", action: "Draft personalized welcome email to client" },
      { n: 5, node: "Resend", action: "Send welcome email to client" },
      { n: 6, node: "Code node", action: "Generate onboarding checklist for you (Telegram)" },
      { n: 7, node: "Telegram", action: "Send your onboarding action list + key dates" },
    ],
    tools: ["n8n", "Supabase", "Gemini 2.0 Flash", "Resend", "Telegram Bot"],
    output: "Active client record + curriculum queued + welcome sent + your checklist",
    buildTime: "1 day",
    depends: ["curriculum", "crm"],
    note: "Build last — needs all upstream workflows running first.",
  },
];

const sharedInfra = [
  { name: "Supabase DB", detail: "prospects · clients · interactions · newsletter_issues · curriculum_modules", icon: "🗄️" },
  { name: "Telegram Bot", detail: "All human-in-the-loop approvals + notifications route here", icon: "📱" },
  { name: "Resend (or Mailgun)", detail: "Email delivery for cold outreach + newsletters + client comms", icon: "✉️" },
  { name: "Gemini 2.0 Flash (AI Studio)", detail: "LLM for all AI Agent nodes — free tier, already in use", icon: "🤖" },
  { name: "Tavily / Serper API", detail: "Web search for Prep Agent (Tavily: $5 free credits)", icon: "🌐" },
];

const priorityColors = {
  red: { bg: "bg-red-50", border: "border-red-300", badge: "bg-red-500", header: "bg-red-500", text: "text-red-700", dot: "bg-red-400" },
  orange: { bg: "bg-orange-50", border: "border-orange-300", badge: "bg-orange-500", header: "bg-orange-500", text: "text-orange-700", dot: "bg-orange-400" },
  yellow: { bg: "bg-yellow-50", border: "border-yellow-300", badge: "bg-yellow-500", header: "bg-yellow-500", text: "text-yellow-700", dot: "bg-yellow-400" },
  green: { bg: "bg-emerald-50", border: "border-emerald-300", badge: "bg-emerald-500", header: "bg-emerald-500", text: "text-emerald-700", dot: "bg-emerald-400" },
  purple: { bg: "bg-purple-50", border: "border-purple-300", badge: "bg-purple-500", header: "bg-purple-500", text: "text-purple-700", dot: "bg-purple-400" },
};

function ToolBadge({ name }) {
  return (
    <span className="inline-block px-2 py-0.5 rounded text-xs font-mono bg-gray-100 text-gray-600 border border-gray-200 mr-1 mb-1">
      {name}
    </span>
  );
}

function WorkflowCard({ wf, expanded, onToggle }) {
  const c = priorityColors[wf.color];
  return (
    <div className={`rounded-xl border-2 ${c.border} ${c.bg} overflow-hidden shadow-sm`}>
      {/* Header */}
      <button
        className={`w-full text-left px-5 py-4 flex items-start gap-3 hover:opacity-90 transition-opacity`}
        onClick={onToggle}
      >
        <span className="text-2xl mt-0.5">{wf.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-bold text-white ${c.badge} px-2 py-0.5 rounded`}>
              {wf.label} · Build {wf.buildTime}
            </span>
            <h3 className="font-bold text-gray-900 text-base">{wf.title}</h3>
          </div>
          <p className="text-sm text-gray-600 mt-1">{wf.description}</p>
          <p className="text-xs text-gray-500 mt-1">
            <span className="font-semibold">Trigger:</span> {wf.trigger}
          </p>
        </div>
        <span className="text-gray-400 text-lg mt-1">{expanded ? "▲" : "▼"}</span>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-200 bg-white">
          {/* Steps */}
          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">n8n Flow</p>
            <div className="space-y-2">
              {wf.steps.map((s) => (
                <div key={s.n} className="flex items-start gap-3">
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full ${c.dot} text-white text-xs font-bold flex items-center justify-center mt-0.5`}>
                    {s.n}
                  </span>
                  <div>
                    <span className="text-xs font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200 mr-2">
                      {s.node}
                    </span>
                    <span className="text-sm text-gray-700">{s.action}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Output */}
          <div className="mt-4 flex items-start gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 w-14 flex-shrink-0 mt-0.5">Output</span>
            <p className="text-sm text-gray-700 font-medium">{wf.output}</p>
          </div>

          {/* Tools */}
          <div className="mt-3">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Tools</p>
            <div>{wf.tools.map((t) => <ToolBadge key={t} name={t} />)}</div>
          </div>

          {/* Note */}
          {wf.note && (
            <div className={`mt-4 rounded-lg px-3 py-2 ${c.bg} border ${c.border}`}>
              <p className="text-xs text-gray-600"><span className="font-semibold">Note: </span>{wf.note}</p>
            </div>
          )}

          {/* Dependencies */}
          {wf.depends.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-400">
                <span className="font-semibold">Depends on: </span>
                {wf.depends.map((d) => {
                  const dep = workflows.find((w) => w.id === d);
                  return dep ? dep.title : d;
                }).join(", ")}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [expanded, setExpanded] = useState({ prospect: true });

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-3xl mx-auto">
        {/* Title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">⚡</span>
            <h1 className="text-2xl font-bold text-gray-900">Ravna — Agentic Workflow Architecture</h1>
          </div>
          <p className="text-gray-500 text-sm ml-10">6 workflows · all run on self-hosted n8n · human-in-the-loop via Telegram</p>
        </div>

        {/* Build order legend */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { label: "P1 – Build first", color: "bg-red-500" },
            { label: "P2 – Build in parallel", color: "bg-orange-500" },
            { label: "P3 – After P1", color: "bg-yellow-500" },
            { label: "P4 – After P3", color: "bg-emerald-500" },
            { label: "P5 – Last", color: "bg-purple-500" },
          ].map((p) => (
            <span key={p.label} className={`text-xs text-white font-semibold px-3 py-1 rounded-full ${p.color}`}>
              {p.label}
            </span>
          ))}
        </div>

        {/* Workflow cards */}
        <div className="space-y-4 mb-10">
          {workflows.map((wf) => (
            <WorkflowCard
              key={wf.id}
              wf={wf}
              expanded={!!expanded[wf.id]}
              onToggle={() => toggle(wf.id)}
            />
          ))}
        </div>

        {/* Shared infrastructure */}
        <div className="rounded-xl border-2 border-gray-300 bg-white overflow-hidden shadow-sm">
          <div className="px-5 py-3 bg-gray-800">
            <h2 className="text-white font-bold text-sm">🏗️ Shared Infrastructure — set up before building any workflow</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {sharedInfra.map((item) => (
              <div key={item.name} className="flex items-start gap-3 px-5 py-3">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Supabase schema hint */}
        <div className="mt-6 rounded-xl border-2 border-dashed border-gray-300 bg-white p-5">
          <h2 className="font-bold text-gray-800 text-sm mb-3">🗄️ Minimum Supabase Schema</h2>
          <div className="grid grid-cols-1 gap-2">
            {[
              { table: "prospects", fields: "id, business_name, url, industry, city, ai_opportunities (json), email_draft, status, next_follow_up, created_at" },
              { table: "interactions", fields: "id, prospect_id, type (cold_email/call/follow_up), notes, sent_at" },
              { table: "clients", fields: "id, prospect_id, tier (audit/program/advisory), start_date, status, monthly_fee" },
              { table: "newsletter_issues", fields: "id, issue_number, html_content, status (draft/sent), sent_at, subscriber_count" },
              { table: "curriculum_modules", fields: "id, module_name, content (json), tags (array), level (beginner/intermediate/advanced)" },
              { table: "client_curricula", fields: "id, client_id, modules (json), generated_at, notes" },
            ].map((s) => (
              <div key={s.table} className="flex items-start gap-2 text-xs">
                <span className="font-mono font-bold text-indigo-600 w-32 flex-shrink-0">{s.table}</span>
                <span className="text-gray-500">{s.fields}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Build sequence */}
        <div className="mt-6 rounded-xl border-2 border-indigo-200 bg-indigo-50 p-5">
          <h2 className="font-bold text-indigo-900 text-sm mb-3">📋 Recommended Build Sequence</h2>
          <ol className="space-y-2">
            {[
              "Set up shared infra: Supabase tables + Telegram bot + Resend account",
              "P1 — Prospect Research Agent (targets new ICP: digital agencies, e-com)",
              "P2 — Follow-up/CRM Agent (pipeline won't survive without this)",
              "P2 — Newsletter Curator (parallel build, runs independently)",
              "P3 — Consultation Prep Agent (needs Supabase data from P1 to be meaningful)",
              "P4 — Curriculum Generator (build base module library in Supabase first)",
              "P5 — Client Onboarding Workflow (only needed once first client signs)",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-indigo-900">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">Ravna · AI Integration Consulting · ravna.ai</p>
      </div>
    </div>
  );
}
