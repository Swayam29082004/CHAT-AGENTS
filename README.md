# Contentstack Chat Agent

Build, customize, and deploy AI-powered chat agents integrated with **Contentstack CMS** and **Pinecone RAG**.  
Embed your agent anywhere using the built-in **Chat Widget SDK**.  

---

## 📺 Demo & Tutorial

👉 [Watch on YouTube](https://youtu.be/VkwO-X2Z1jg)  


https://github.com/user-attachments/assets/03bc7f15-1fb4-4354-acee-269c8d3eaf4f


---

## 🚀 Deployment

## 🔗 Live on Contentstack Launch  
 🌐 [Contentstackapps](https://chat-agents.contentstackapps.com/)  
 🌐 [onRender](https://chat-agents-iz60.onrender.com)

---

## 🌍 Live Demo (Travel Website)

👉 [Travel Website](https://travel-websiteess.onrender.com)  
👉 [GitHub Repo](https://github.com/Swayam29082004/TRAVEL-WEBSITEES.git)  

---

## 📦 NPM Package

👉 [View on npm](https://www.npmjs.com/package/@swayam29082004/chat-sdk?activeTab=code)  

```bash
# Install via npm
npm install @swayam29082004/chat-sdk
```

---

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Swayam29082004/CHAT-AGENTS.git
cd CHAT-AGENTS
```

### 2. Install dependencies

```bash
npm install
npm run dev
```

### 3. Clone the Travel Website repository

```bash
git clone https://github.com/Swayam29082004/TRAVEL-WEBSITEES.git
```

### 4. Install dependencies for the Travel Website

```bash
npm install
npm start
```

### 5. Set up environment variables

Create a `.env.local` file and add your keys:

```env
NEXT_PUBLIC_CONTENTSTACK_API_KEY=your_contentstack_api_key
NEXT_PUBLIC_CONTENTSTACK_DELIVERY_TOKEN=your_delivery_token
NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT=development
CONTENTSTACK_MANAGEMENT_TOKEN=your_management_token
CONTENTSTACK_AGENT_CT_UID=agent
CONTENTSTACK_HISTORY_CT_UID=conversation_history

CONTENTSTACK_CLIENT_ID=your_oauth_client_id
CONTENTSTACK_CLIENT_SECRET=your_oauth_client_secret

OPENAI_API_KEY=your_openai_key
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX_NAME=your_index_name

BRIGHT_DATA_ACCOUNT_ID=your_account
BRIGHT_DATA_ZONE_NAME=your_zone
BRIGHT_DATA_API_TOKEN=your_token
```

### 6. Run the development server

```bash
npm run dev
```

Then open 👉 [http://localhost:3000](http://localhost:3000).

---

## 🚀 Features

- 🔐 **Authentication** — Email/password login, optional 2FA, NextAuth + Contentstack OAuth.  
- 🎨 **Agent Playground** — Stepwise flow to configure agents (model, avatar, theme, etc.).  
- 🌐 **Scraping + RAG** — Scrape websites (static & React), chunk content, store in Pinecone.  
- 💬 **Chat Widget SDK** — Reusable React widget to embed agents in other apps.  
- 📦 **Contentstack Integration** — Manage agent entries in Contentstack, optional conversation history logging.  

---

## 💡 Usage

1. Register / Login  
2. Use the **Playground** to build your agent  
3. Scrape content and preview your agent  
4. Copy the embed snippet and integrate into your site/app  

---

## 🤝 Contributions

Contributions are welcome! Please open an issue first for major changes.

---

## 📄 License

MIT License — free to use and adapt.
