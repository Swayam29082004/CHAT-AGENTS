"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import PlaygroundStepper from "./PlaygroundStepper";
import Step1APIModel from "./Step1APIModel";
import Step2Customization from "./Step2Customization";
import Step3ScrapingRAG from "./Step3ScrapingRAG";
import Step4Preview from "./Step4Preview";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faFloppyDisk, faSpinner } from "@fortawesome/free-solid-svg-icons";

export default function Playground() {
  const [activeStep, setActiveStep] = useState(0);
  const router = useRouter(); // Initialize router

  // --- State for agent properties ---
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState("");
  const [modelName, setModelName] = useState(""); // Renamed from model
  const [agentName, setAgentName] = useState("Helpful Assistant");
  const [avatar, setAvatar] = useState("/PHOTO_AGENT.jpg");
  const [color, setColor] = useState("#4f46e5");
  const [welcomeMessage, setWelcomeMessage] = useState("Hello! How can I help you today?");
  const [placeholderText, setPlaceholderText] = useState("Ask a question...");
  
  // --- State for UI ---
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ✅ Updated steps array as requested
  const steps = ["API & Model", "Customization", "Scraping + RAG", "Preview"];

  const handleNext = async () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = async () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };
  
  const handleSaveAgent = async () => {
    setIsSaving(true);
    setSaveError(null);
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user?.id) {
        setSaveError("You must be logged in to save an agent.");
        setIsSaving(false);
        return;
    }

    const agentData = {
        userId: user.id,
        name: agentName,
        provider,
        modelName,
        avatar,
        color,
        welcomeMessage,
        placeholderText,
        // The API key should be encrypted on the backend, not sent plain
        // We'll pass it for now, but a real app should handle this securely.
    };

    try {
        const response = await fetch('/api/agents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(agentData)
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Could not save the agent.");
        }
        
        // On success, redirect to the deploy page
        router.push('/dashboard/deploy');

    } catch (err: any) {
        setSaveError(err.message);
    } finally {
        setIsSaving(false);
    }
  };

  // NOTE: The `saveProgress` and `loadProgress` logic has been removed for simplicity.
  // The current approach is to save the complete agent at the final step.

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">Chat Agent Playground</h1>
      {saveError && <div className="alert-error mb-4">{saveError}</div>}
      <PlaygroundStepper steps={steps} activeStep={activeStep} />

      <div className="mt-8">
        {activeStep === 0 && (
          <Step1APIModel 
            apiKey={apiKey} setApiKey={setApiKey} 
            provider={provider} setProvider={setProvider} 
            modelName={modelName} setModelName={setModelName} // Pass renamed props
          />
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
        {/* Step5Integration is removed */}
      </div>

      <div className="mt-8 flex justify-between">
        <button disabled={activeStep === 0} onClick={handleBack} className="btn-primary bg-gray-300 text-gray-800 hover:bg-gray-400 disabled:opacity-50">
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Back
        </button>

        {activeStep === steps.length - 1 ? (
          <button onClick={handleSaveAgent} disabled={isSaving} className="btn-primary bg-green-600 hover:bg-green-700 disabled:opacity-50">
            {isSaving ? <FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> : <FontAwesomeIcon icon={faFloppyDisk} className="mr-2" />}
            {isSaving ? 'Saving...' : 'Save Agent'}
          </button>
        ) : (
          <button onClick={handleNext} className="btn-primary">
            Next <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
          </button>
        )}
      </div>
    </div>
  );
}