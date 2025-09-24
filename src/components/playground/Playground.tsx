"use client";
// File: src/components/playground/Playground.tsx
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import PlaygroundStepper from "./PlaygroundStepper";
import Step1APIModel from "./Step1APIModel";
import Step2Customization from "./Step2Customization";
import Step3ScrapingRAG from "./Step3ScrapingRAG";
import Step4Preview from "./Step4Preview";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faSpinner, faCheckCircle } from "@fortawesome/free-solid-svg-icons";

export default function Playground() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams(); // ✅ grab [agentId] from the URL

  // step query param
  const stepFromQuery = Number(searchParams.get("step")) || 0;
  const [activeStep, setActiveStep] = useState(stepFromQuery);

  useEffect(() => {
    setActiveStep(stepFromQuery);
  }, [stepFromQuery]);

  // agentId from URL
  const [agentId, setAgentId] = useState<string | null>(null);

  useEffect(() => {
    if (params?.agentId && typeof params.agentId === "string") {
      setAgentId(params.agentId);
      // ✅ Optionally fetch existing agent data here
      // fetch(`/api/dashboard/playground/${user.id}/agents/${params.agentId}`)
      //   .then(res => res.json())
      //   .then(data => { ...set state with agent fields... });
    }
  }, [params?.agentId]);

  // agent props
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState("OpenAI");
  const [modelName, setModelName] = useState("gpt-4o-mini");
  const [agentName, setAgentName] = useState(
    `Helpful Assistant ${Math.random().toString(36).substring(2, 7)}`
  );
  const [avatar, setAvatar] = useState("/PHOTO_AGENT.jpg");
  const [avatarAssetUid, setAvatarAssetUid] = useState<string | null>(null);
  const [color, setColor] = useState("#4f46e5");
  const [welcomeMessage, setWelcomeMessage] = useState("Hello! How can I help you today?");
  const [placeholderText, setPlaceholderText] = useState("Ask a question...");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const steps = ["API & Model", "Customization", "Scraping + RAG", "Preview"];

  const updateStepInUrl = (step: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("step", step.toString());
    router.replace(`?${params.toString()}`);
  };

  const handleNextAndSave = async () => {
    setSaveError(null);

    if (activeStep === 0 && (!provider || !modelName)) {
      setSaveError("Please select a Provider and a Model to continue.");
      return;
    }

    if (activeStep === 1) {
      setIsSaving(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user?.id) {
        setSaveError("❌ You must be logged in to save an agent.");
        setIsSaving(false);
        return;
      }

      const agentData = {
        name: agentName,
        provider,
        modelName,
        avatar,
        avatarAssetUid,
        color,
        welcomeMessage,
        placeholderText,
      };

      try {
        const response = await fetch(`/api/dashboard/playground/${user.id}/agents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(agentData),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not save the agent.");
        const newAgentId = data?.agent?._id || null;
        if (!newAgentId) throw new Error("No agent id returned from server.");

        setAgentId(newAgentId);

        // ✅ Navigate to /dashboard/playground/[agentId]?step=2
        router.push(`/dashboard/playground/${newAgentId}?step=2`);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Something went wrong.";
        setSaveError(`❌ ${message}`);
      } finally {
        setIsSaving(false);
      }
    } else if (activeStep < steps.length - 1) {
      updateStepInUrl(activeStep + 1);
    }
  };

  const handleBack = () => {
    setSaveError(null);
    if (activeStep > 0) updateStepInUrl(activeStep - 1);
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
        {activeStep === 0 && (
          <Step1APIModel {...{ apiKey, setApiKey, provider, setProvider, modelName, setModelName }} />
        )}
        {activeStep === 1 && (
          <Step2Customization
            {...{
              agentName,
              setAgentName,
              avatar,
              setAvatar,
              setAvatarAssetUid,
              color,
              setColor,
              welcomeMessage,
              setWelcomeMessage,
              placeholderText,
              setPlaceholderText,
            }}
          />
        )}
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
