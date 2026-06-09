import type { AgentDreamState, ValidDreamAgentRequest } from "./schema";

export type SafetyFinding = {
  code: string;
  message: string;
};

const diagnosisPatterns = [
  /心理疾病/,
  /抑郁症/,
  /焦虑症/,
  /精神障碍/,
  /精神分裂/,
  /强迫症/,
];

const occultPatterns = [
  /预兆/,
  /命中注定/,
  /天命/,
  /因果/,
  /劫难/,
];

const coercivePatterns = [
  /这说明你/,
  /你的潜意识一定/,
  /你一定是/,
  /你肯定是/,
  /这意味着你/,
];

const frighteningPatterns = [
  /厄运/,
  /灾难/,
  /死亡预告/,
  /凶兆/,
  /不祥/,
  /完蛋/,
  /必死/,
];

function checkPatterns(text: string, patterns: RegExp[], code: string, message: string): SafetyFinding[] {
  const findings: SafetyFinding[] = [];
  for (const pattern of patterns) {
    if (pattern.test(text)) {
      findings.push({ code, message });
      break;
    }
  }
  return findings;
}

export function detectUnsafeAgentState(state: AgentDreamState): SafetyFinding[] {
  const findings: SafetyFinding[] = [];

  const textFields = [
    state.story,
    state.gentleReflection,
    state.followUpQuestion,
    state.title,
    state.primaryEmotion,
    ...state.emotionArc,
    ...state.symbols,
    ...state.keywords.map((k) => k.text),
  ];

  const combinedText = textFields.join("\n");

  findings.push(
    ...checkPatterns(combinedText, diagnosisPatterns, "DIAGNOSIS", "检测到疾病诊断语言")
  );
  findings.push(
    ...checkPatterns(combinedText, occultPatterns, "OCCULT", "检测到神秘主义断言")
  );
  findings.push(
    ...checkPatterns(combinedText, coercivePatterns, "COERCIVE", "检测到强迫性解读")
  );
  findings.push(
    ...checkPatterns(combinedText, frighteningPatterns, "FRIGHTENING", "检测到恐吓性内容")
  );

  const questionCount = (state.followUpQuestion.match(/[?？]/g) || []).length;
  if (questionCount > 1) {
    findings.push({ code: "MULTI_QUESTION", message: "后续问题包含多个问题" });
  }

  return findings;
}

export function makeSafeFallback(input: ValidDreamAgentRequest, reason: string): AgentDreamState {
  const existing = input.currentState;
  const newStory = input.fragment.content;

  const story = existing?.story
    ? `${existing.story}\n\n新的片段：${newStory}`
    : newStory;

  return {
    title: existing?.title ?? "梦境片段",
    story,
    primaryEmotion: existing?.primaryEmotion ?? "平静",
    emotionIntensity: existing?.emotionIntensity ?? 0.5,
    emotionArc: existing?.emotionArc ?? [],
    keywords: existing?.keywords ?? [],
    symbols: existing?.symbols ?? [],
    gentleReflection: existing?.gentleReflection ?? "",
    followUpQuestion: "这个片段里最清楚的画面是什么？",
    atmosphere: existing?.atmosphere ?? {
      palette: "soft-neutral",
      motion: "gentle-drift",
      density: 0.5,
    },
  };
}
