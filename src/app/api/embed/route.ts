import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get('agentId');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!agentId) {
    return new NextResponse("agentId is required", { status: 400 });
  }

  // This JavaScript code will be executed on the website where the chat agent is embedded.
  const scriptContent = `
    (function() {
      // 1. Create a container for the chat widget iframe
      const chatContainer = document.createElement('div');
      chatContainer.id = 'chat-agent-container';
      chatContainer.style.position = 'fixed';
      chatContainer.style.bottom = '20px';
      chatContainer.style.right = '20px';
      chatContainer.style.width = '400px';
      chatContainer.style.height = '600px';
      chatContainer.style.boxShadow = '0 5px 40px rgba(0,0,0,.16)';
      chatContainer.style.borderRadius = '12px';
      chatContainer.style.overflow = 'hidden';
      chatContainer.style.display = 'none'; // Hidden by default
      chatContainer.style.zIndex = '9999';

      // 2. Create the iframe that will host the chat agent
      const iframe = document.createElement('iframe');
      iframe.src = '${appUrl}/chat-widget/${agentId}';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';

      chatContainer.appendChild(iframe);
      document.body.appendChild(chatContainer);

      // 3. Create the button to toggle the chat widget
      const toggleButton = document.createElement('button');
      toggleButton.id = 'chat-agent-toggle-button';
      toggleButton.style.position = 'fixed';
      toggleButton.style.bottom = '20px';
      toggleButton.style.right = '20px';
      toggleButton.style.width = '60px';
      toggleButton.style.height = '60px';
      toggleButton.style.borderRadius = '50%';
      toggleButton.style.backgroundColor = '#4f46e5';
      toggleButton.style.color = 'white';
      toggleButton.style.border = 'none';
      toggleButton.style.boxShadow = '0 2px 10px rgba(0,0,0,.2)';
      toggleButton.style.cursor = 'pointer';
      toggleButton.style.display = 'flex';
      toggleButton.style.alignItems = 'center';
      toggleButton.style.justifyContent = 'center';
      toggleButton.style.zIndex = '10000';
      toggleButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
      
      document.body.appendChild(toggleButton);

      // 4. Add logic to show/hide the widget
      let isOpen = false;
      toggleButton.addEventListener('click', () => {
        isOpen = !isOpen;
        chatContainer.style.display = isOpen ? 'block' : 'none';
        toggleButton.innerHTML = isOpen 
            ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>' 
            : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
      });

    })();
  `;

  return new NextResponse(scriptContent, {
    headers: {
      "Content-Type": "application/javascript",
    },
  });
}