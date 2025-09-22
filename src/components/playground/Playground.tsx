// --- Playground.tsx ---
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PlaygroundStepper from "./PlaygroundStepper";
import Step1APIModel from "./Step1APIModel";
import Step2Customization from "./Step2Customization";
import Step3ScrapingRAG from "./Step3ScrapingRAG";
import Step4Preview from "./Step4Preview";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faSpinner, faCheckCircle } from "@fortawesome/free-solid-svg-icons";

export default function Playground() {
  const [activeStep, setActiveStep] = useState(0);
  const router = useRouter();

  // --- State for agent properties ---
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState("");
  const [modelName, setModelName] = useState("");
  const [agentName, setAgentName] = useState("Helpful Assistant");
  const [avatar, setAvatar] = useState("/PHOTO_AGENT.jpg");
  const [color, setColor] = useState("#4f46e5");
  const [welcomeMessage, setWelcomeMessage] = useState("Hello! How can I help you today?");
  const [placeholderText, setPlaceholderText] = useState("Ask a question...");
  const [agentId, setAgentId] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const steps = ["API & Model", "Customization", "Scraping + RAG", "Preview"];

  // --- Debug: log whenever activeStep or agentId changes ---
  useEffect(() => {
    console.log(`[Playground - State] activeStep=${activeStep}, agentId=${agentId}`);
  }, [activeStep, agentId]);

  // ✅ THE FIX: We now use useEffect to move to the next step ONLY AFTER agentId is confirmed.
  useEffect(() => {
    // This effect runs only when agentId changes from null to a real value.
    if (agentId && activeStep === 1) {
      console.log(`[Playground - Post-Save Effect] agentId is now set to: ${agentId}. Moving to Step 2 (Scraping + RAG).`);
      setActiveStep(2); // Move to Scraping step (index 2)
    }
  }, [agentId, activeStep]);

  // Extra debug when about to render preview
  useEffect(() => {
    if (activeStep === 3) {
      console.log(`[Playground - Render] About to render Step4Preview with agentId=${agentId}`);
    }
  }, [activeStep, agentId]);

  const handleNextAndSave = async () => {
    // If we are on Step 2 (index 1), we save the agent.
    if (activeStep === 1) {
      setIsSaving(true);
      setSaveError(null);

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user?.id) {
        setSaveError("❌ You must be logged in to save an agent.");
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
        visibility: "Private",
      };

      try {
        console.log("[Playground - Save Action] Saving agent to backend...", { agentData, userId: user.id });
        const response = await fetch(`/api/dashboard/playground/${user.id}/agents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(agentData),
        });

        const data = await response.json();
        if (!response.ok) {
          console.error("[Playground - Save Action] Backend returned error:", data);
          throw new Error(data.error || "Could not save the agent.");
        }

        // Be robust about where the ID might live in the response
        const newAgentId = data?.agent?._id || data?.agent?.id || data?.id || null;
        if (!newAgentId) {
          console.error("[Playground - Save Action] No agent id found in response:", data);
          throw new Error("No agent id returned from server.");
        }

        console.log(`[Playground - Save Action] Agent saved. Received ID: ${newAgentId}. Setting state (setAgentId).`);
        setAgentId(newAgentId);

        // Note: do NOT advance the step here — the useEffect above will move us when agentId is actually set.
      } catch (err: any) {
        console.error("[Playground - Save Action] Exception:", err);
        setSaveError(err.message || "❌ Something went wrong while saving.");
      } finally {
        setIsSaving(false);
      }
    }
    // For all other steps, just move to the next one.
    else if (activeStep < steps.length - 1) {
      console.log(`[Playground - Navigation] Advancing from step ${activeStep} to ${activeStep + 1}`);
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) setActiveStep((prev) => prev - 1);
  };

  const handleFinish = () => {
    router.push("/dashboard/deploy");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">Chat Agent Playground</h1>
      {saveError && <div className="alert-error mb-4">{saveError}</div>}
      <PlaygroundStepper steps={steps} activeStep={activeStep} />

      <div className="mt-8">
        {activeStep === 0 && <Step1APIModel {...{ apiKey, setApiKey, provider, setProvider, modelName, setModelName }} />}
        {activeStep === 1 && <Step2Customization {...{ agentName, setAgentName, avatar, setAvatar, color, setColor, welcomeMessage, setWelcomeMessage, placeholderText, setPlaceholderText }} />}
        {activeStep === 2 && <Step3ScrapingRAG agentId={agentId} />}
        {activeStep === 3 && <Step4Preview {...{ agentName, avatar, color, welcomeMessage, placeholderText, agentId }} />}
      </div>

      <div className="mt-8 flex justify-between">
        <button
          disabled={activeStep === 0}
          onClick={handleBack}
          className="btn-primary bg-gray-300 text-gray-800 hover:bg-gray-400 disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Back
        </button>

        {activeStep === steps.length - 1 ? (
          <button onClick={handleFinish} className="btn-primary bg-green-600 hover:bg-green-700">
            <FontAwesomeIcon icon={faCheckCircle} className="mr-2" /> Finish & View Agents
          </button>
        ) : (
          <button onClick={handleNextAndSave} className="btn-primary" disabled={isSaving}>
            {isSaving ? <FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> : null}
            {activeStep === 1 ? (isSaving ? "Saving..." : "Save & Continue") : "Next"}
            {!isSaving && <FontAwesomeIcon icon={faArrowRight} className="ml-2" />}
          </button>
        )}
      </div>
    </div>
  );
}


