import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChatWidget } from './components/ChatWidget';

class ChatWidgetElement extends HTMLElement {
  private root?: import('react-dom/client').Root;

  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.root = createRoot(this.shadowRoot!);
    this.render();
  }

  static get observedAttributes() {
    return ['api-url', 'agent-id', 'api-key', 'agent-name', 'welcome-message', 'placeholder-text', 'theme-color'];
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    if (!this.root || !this.shadowRoot) return;

    const props = {
      apiUrl: this.getAttribute('api-url')!,
      agentId: this.getAttribute('agent-id')!,
      apiKey: this.getAttribute('api-key') || undefined,
      agentName: this.getAttribute('agent-name') || undefined,
      welcomeMessage: this.getAttribute('welcome-message') || undefined,
      placeholderText: this.getAttribute('placeholder-text') || undefined,
      themeColor: this.getAttribute('theme-color') || undefined,
    };
    
    // Inject styles into Shadow DOM
    const styleTag = document.createElement('style');
    // In a real build, you'd fetch this CSS or have Rollup inject it.
    // For simplicity, we assume it's available or can be loaded.
    // This is handled by rollup-plugin-postcss.
    
    this.root.render(React.createElement(ChatWidget, props));
  }
}

customElements.define('chat-widget', ChatWidgetElement);