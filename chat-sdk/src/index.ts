import { createRoot } from 'react-dom/client';
import React from 'react';
import { ChatWidget } from './components/ChatWidget';

// Export for React/Module environments
export { useChatAgent } from './hooks/useChatAgent';
export { ChatWidget } from './components/ChatWidget';

// Register the Web Component
import './webcomponent';

// UMD Global Helper
export function renderWidget(elementId: string, props: any) {
  const container = document.getElementById(elementId);
  if (container) {
    const root = createRoot(container);
    root.render(React.createElement(ChatWidget, props));
  } else {
    console.error(`[ChatSDK] Element with ID "${elementId}" not found.`);
  }
}