import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addAssistantMessage, addUserMessage, setTyping, incrementTokenCount } from '../store/slices/chatSlice.js';
import { createFile } from '../store/slices/filesSlice.js';
import styles from '../styles/Chat.module.css';

const quickActions = [
  'Fourier transforms',
  'Debug Python',
  'Big O notation',
  'Circuit analysis',
  'Literature review',
];

function inferLanguage(prompt) {
  const lower = prompt.toLowerCase();
  if (/\bpython\b/.test(lower)) return { language: 'Python 3', ext: 'py', framework: 'none' };
  if (/\b(java|spring)\b/.test(lower)) return { language: 'Java', ext: 'java', framework: 'JVM' };
  if (/\b(node|express)\b/.test(lower)) return { language: 'JavaScript (Node.js)', ext: 'js', framework: 'Node.js' };
  if (/\b(react|next|vue|svelte)\b/.test(lower)) return { language: 'JavaScript (React)', ext: 'jsx', framework: 'React' };
  return { language: 'JavaScript (ES2024)', ext: 'js', framework: 'Vanilla JS' };
}

function makeFileName(prompt, ext) {
  const sanitized = prompt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
  return sanitized ? `${sanitized}.${ext}` : `sophia_output.${ext}`;
}

function estimateComplexity(prompt) {
  const lower = prompt.toLowerCase();
  if (/(optimi[zs]e|performance|scalab|big o)/.test(lower)) return 'Focus on efficiency (O(n) or better)';
  if (/(simple|basic|beginner|intro)/.test(lower)) return 'Simple algorithm (O(n) or better)';
  return 'Balanced readability and performance (O(n) where possible)';
}

function isCodingRequest(prompt) {
  const normalized = prompt.toLowerCase();
  return /\b(code|implement|function|class|script|program|generate|create)\b/.test(normalized);
}

function generateMockResponse(prompt, shouldSave = false) {
  const { language, ext, framework } = inferLanguage(prompt);
  const complexity = estimateComplexity(prompt);
  const analysis = `**Analysis**\n- Interpreted intent: build or explain code based on the prompt.\n- Target language/framework: ${language} (${framework}).\n- Depth: ${complexity}.\n`;

  const sampleOutput = {
    js: `function example(input) {\n  // TODO: replace this with real logic\n  return input;\n}\n\n// Example usage\nconsole.log(example('hello'));`,
    py: `def example(input):\n    # TODO: replace this with real logic\n    return input\n\nif __name__ == '__main__':\n    print(example('hello'))`,
    java: `public class Example {\n    public static String example(String input) {\n        // TODO: replace this with real logic\n        return input;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(example(\"hello\"));\n    }\n}`,
  };

  const codeSnippet = sampleOutput[ext] || sampleOutput.js;

  const outputText = `${analysis}\n**Sample output (${language})**\n\n${codeSnippet}\n\n**Test case**\nInput: 'hello'\nOutput: 'hello'\n`;

  const result = {
    text: `Sure! I can help with "${prompt}".\n\n${outputText}`,
  };

  if (shouldSave && isCodingRequest(prompt)) {
    const name = makeFileName(prompt, ext);
    result.file = {
      name,
      ext,
      content: codeSnippet,
    };
  }

  return result;
}

function findFolderId(nodes, name) {
  for (const node of nodes) {
    if (node.type === 'folder' && node.name === name) return node.id;
    if (node.type === 'folder' && node.children) {
      const found = findFolderId(node.children, name);
      if (found) return found;
    }
  }
  return null;
}

export default function ChatPage() {
  const dispatch = useDispatch();
  const { messages, model, contextSize, tokenCount, isTyping } = useSelector((state) => state.chat);
  const filesTree = useSelector((state) => state.files.tree);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef(null);
  const projectsFolderId = useMemo(() => findFolderId(filesTree, 'projects'), [filesTree]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!draft.trim()) return;

    dispatch(addUserMessage(draft));
    dispatch(setTyping(true));

    const prompt = draft;
    setDraft('');

    setTimeout(() => {
      const response = generateMockResponse(prompt, true);
      let assistantText = response.text;

      if (response.file && projectsFolderId) {
        dispatch(
          createFile({
            folderId: projectsFolderId,
            name: response.file.name,
            ext: response.file.ext,
            size: Math.max(1, Math.ceil(response.file.content.length / 10)),
          }),
        );
        assistantText += `\n\nSaved file to projects/${response.file.name}`;
      }

      dispatch(addAssistantMessage(assistantText));
      dispatch(incrementTokenCount(prompt.length + assistantText.length));
      dispatch(setTyping(false));
    }, 900);
  };

  const handleQuickAction = (label) => {
    dispatch(addUserMessage(label));
    dispatch(setTyping(true));

    setTimeout(() => {
      const response = generateMockResponse(label, true);
      let assistantText = response.text;

      if (response.file && projectsFolderId) {
        dispatch(
          createFile({
            folderId: projectsFolderId,
            name: response.file.name,
            ext: response.file.ext,
            size: Math.max(1, Math.ceil(response.file.content.length / 10)),
          }),
        );
        assistantText += `\n\nSaved file to projects/${response.file.name}`;
      }

      dispatch(addAssistantMessage(assistantText));
      dispatch(incrementTokenCount(label.length + assistantText.length));
      dispatch(setTyping(false));
    }, 800);
  };

  const canSend = useMemo(() => draft.trim().length > 0, [draft]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.meta}>
          <span className={styles.status} aria-label="Online">
            <span className={styles.statusDot} />
            Online
          </span>
          <div>
            <div className={styles.model}>{model}</div>
            <div className={styles.context}>{contextSize}</div>
          </div>
        </div>
        <div className={styles.tokenCounter}>Tokens: {tokenCount}</div>
      </header>

      <div className={styles.quickActions}>
        {quickActions.map((label) => (
          <button
            key={label}
            type="button"
            className={styles.chip}
            onClick={() => handleQuickAction(label)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={styles.chatWindow} ref={scrollRef}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={message.role === 'user' ? styles.messageUser : styles.messageAssistant}
          >
            <div className={styles.messageBody}>{message.text}</div>
            <div className={styles.timestamp}>{message.timestamp}</div>
          </div>
        ))}

        {isTyping && (
          <div className={styles.messageAssistant}>
            <div className={styles.typingBubble}>
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </div>
          </div>
        )}
      </div>

      <footer className={styles.inputArea}>
        <textarea
          className={styles.textarea}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask Sophia a coding question..."
          rows={1}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              if (canSend) handleSend();
            }
          }}
        />
        <button
          type="button"
          className={styles.sendButton}
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
        >
          ➤
        </button>
      </footer>
    </div>
  );
}
