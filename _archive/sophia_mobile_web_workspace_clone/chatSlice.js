import { createSlice, nanoid } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

const now = () => dayjs().format('HH:mm');

const initialState = {
  messages: [
    {
      id: nanoid(),
      role: 'assistant',
      text: 'Hi! I’m Sophia — your personal AI workspace assistant. What can I help you with today?',
      timestamp: now(),
    },
  ],
  model: 'Claude Sonnet 4',
  contextSize: '128k ctx',
  tokenCount: 0,
  toolPrompt: null,
  isTyping: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addUserMessage(state, action) {
      state.messages.push({
        id: nanoid(),
        role: 'user',
        text: action.payload,
        timestamp: now(),
      });
    },
    addAssistantMessage(state, action) {
      state.messages.push({
        id: nanoid(),
        role: 'assistant',
        text: action.payload,
        timestamp: now(),
      });
    },
    setTyping(state, action) {
      state.isTyping = action.payload;
    },
    setToolPrompt(state, action) {
      state.toolPrompt = action.payload;
    },
    incrementTokenCount(state, action) {
      state.tokenCount += action.payload;
    },
  },
});

export const {
  addUserMessage,
  addAssistantMessage,
  setTyping,
  setToolPrompt,
  incrementTokenCount,
} = chatSlice.actions;
export default chatSlice.reducer;
