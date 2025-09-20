"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PlaygroundStepper from "./PlaygroundStepper";
import Step1APIModel from "./Step1APIModel";
import Step2Customization from "./Step2Customization";
import Step3ScrapingRAG from "./Step3ScrapingRAG";
import Step4Preview from "./Step4Preview";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faSave } from "@fortawesome/free-solid-svg-icons";

export default function Playground() {
  const [activeStep, setActiveStep] = useState(0);
  const router = useRouter();

  // Global states for agent configuration
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState("");
  const [model, setModel] = useState("");
  const [agentName, setAgentName] = useState("Helpful Assistant");
  const [avatar, setAvatar] = useState("/PHOTO_AGENT.jpg");
  const [color, setColor] = useState("#4f46e5");
  const [welcomeMessage, setWelcomeMessage] = useState("Hello! How can I help you today?");
  const [placeholderText, setPlaceholderText] = useState("Ask a question...");

  // Updated steps array (Integration removed)
  const steps = ["API & Model", "Customization", "Scraping + RAG", "Preview"];

  // This function will now save the complete agent configuration
  const handleSaveAgent = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user?.id) {
      alert("You must be logged in to save an agent.");
      return;
    }

    const agentData = {
      userId: user.id,
      name: agentName,
      provider,
      model,
      avatar,
      color,
      welcomeMessage,
      placeholderText,
      // You can add more fields to save here
    };

    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(agentData),
      });

      if (!response.ok) {
        throw new Error("Failed to save the agent.");
      }
      
      alert("Agent saved successfully!");
      router.push('/dashboard/deploy'); // Redirect to the deploy page
    } catch (err) {
      console.error("Failed to save agent:", err);
      alert("Error: Could not save the agent.");
    }
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">Chat Agent Playground</h1>
      <PlaygroundStepper steps={steps} activeStep={activeStep} />

      <div className="mt-8">
        {activeStep === 0 && (
          <Step1APIModel apiKey={apiKey} setApiKey={setApiKey} provider={provider} setProvider={setProvider} model={model} setModel={setModel} />
        )}
        {activeStep === 1 && (
          <Step2Customization
            agentName={agentName} setAgentName={setAgentName}
            avatar={avatar} setAvatar={setAvatar}
            color={color} setColor={setColor}
            welcomeMessage={welcomeMessage} setWelcomeMessage={setWelcomeMessage}
            placeholderText={placeholderText} setPlaceholderText={setPlaceholderText}
          />
        )}
        {activeStep === 2 && <Step3ScrapingRAG />}
        {activeStep === 3 && (
          <Step4Preview 
            agentName={agentName}
            avatar={avatar}
            color={color}
            welcomeMessage={welcomeMessage}
            placeholderText={placeholderText}
          />
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <button disabled={activeStep === 0} onClick={handleBack} className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-colors">
          <FontAwesomeIcon icon={faArrowLeft} /> Back
        </button>
        {activeStep === steps.length - 1 ? (
          <button onClick={handleSaveAgent} className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-green-700 transition-colors">
            Save & Finish <FontAwesomeIcon icon={faSave} />
          </button>
        ) : (
          <button onClick={handleNext} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-indigo-700 transition-colors">
            Next <FontAwesomeIcon icon={faArrowRight} />
          </button>
        )}
      </div>
    </div>
  );
}