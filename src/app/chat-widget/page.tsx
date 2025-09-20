import ChatWidget from "@/components/widgets/ChatWidget";

// This page's layout will be minimal, perfect for an iframe
export default function ChatWidgetPage({ params }: { params: { agentId: string } }) {
  // In a real app, you would fetch the userId associated with the agent or use a public ID
  const DUMMY_USER_ID = "66d61f1b2cd070188b835697"; // Replace with actual user logic

  return (
    <div className="h-screen w-screen">
      <ChatWidget agentId={params.agentId} userId={DUMMY_USER_ID} />
    </div>
  );
}