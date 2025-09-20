"use client";
import { useEffect, useState } from "react";
import PlaygroundStepper from "./PlaygroundStepper";
import Step1APIModel from "./Step1APIModel";
import Step2Customization from "./Step2Customization";
import Step3ScrapingRAG from "./Step3ScrapingRAG";
import Step4Preview from "./Step4Preview";
import Step5Integration from "./Step5Integration";

// Import new icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faRocket } from "@fortawesome/free-solid-svg-icons";


export default function Playground() {
  const [activeStep, setActiveStep] = useState(0);

  // global states
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState("");
  const [model, setModel] = useState("");
  const [theme, setTheme] = useState("light");
  const [avatar, setAvatar] = useState("/PHOTO_AGENT.jpg");
  const [color, setColor] = useState("#4f46e5");
  const [agentName, setAgentName] = useState("");

  const steps = [
    "API & Model",
    "Customization",
    "Scraping + RAG",
    "Preview",
    "Integration",
  ];

  const saveProgress = async (step: number) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    let progress: any = {};
    if (step === 0) {
      progress = { apiKey, provider, model };
    } else if (step === 1) {
      progress = { agentName, avatar, color };
    } else if (step === 2) {
      progress = { scrapingEnabled: true };
    } else if (step === 3) {
      progress = { preview: { theme, color, agentName } };
    }

    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          step,
          progress,
        }),
      });
    } catch (err) {
      console.error("Failed to save progress:", err);
    }
  };
  
  const handleNext = async () => {
    if (activeStep < steps.length - 1) {
      await saveProgress(activeStep);
      setActiveStep((prev) => prev + 1);
    }
  };
  
  const handleBack = async () => {
    if (activeStep > 0) {
      await saveProgress(activeStep);
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleDeploy = () => {
    // Add your deployment logic here
    console.log("Deploying agent...");
    alert("Deployment logic would be triggered here!");
  };

  useEffect(() => {
    async function loadProgress() {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user?.id) return;

        const res = await fetch(`/api/progress?userId=${user.id}`);
        const data = await res.json();

        if (data.success && data.agent?.progress) {
          const p = data.agent.progress;

          if (p.step0) {
            setApiKey(p.step0.apiKey || "");
            setProvider(p.step0.provider || "");
            setModel(p.step0.model || "");
          }
          if (p.step1) {
            setAgentName(p.step1.agentName || "");
            setAvatar(p.step1.avatar || "/PHOTO_AGENT.jpg");
            setColor(p.step1.color || "#4f46e5");
          }
          if (p.step3?.preview) {
            setTheme(p.step3.preview.theme || "light");
          }

          const completedSteps = Object.keys(p);
          if (completedSteps.length > 0) {
            const lastStep = Math.max(
              ...completedSteps.map((s) => parseInt(s.replace("step", "")))
            );
            setActiveStep(lastStep < steps.length -1 ? lastStep + 1 : lastStep);
          }
        }
      } catch (err) {
        console.error("Failed to load progress:", err);
      }
    }

    loadProgress();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">Chat Agent Playground</h1>

      {/* Stepper UI */}
      <PlaygroundStepper steps={steps} activeStep={activeStep} />

      {/* Render Step Content */}
      <div className="mt-8">
        {activeStep === 0 && (
          <Step1APIModel
            apiKey={apiKey}
            setApiKey={setApiKey}
            provider={provider}
            setProvider={setProvider}
            model={model}
            setModel={setModel}
          />
        )}
        {activeStep === 1 && (
          <Step2Customization
            agentName={agentName}
            setAgentName={setAgentName}
            avatar={avatar}
            setAvatar={setAvatar}
            color={color}
            setColor={setColor}
          />
        )}
        {activeStep === 2 && <Step3ScrapingRAG />}
        {activeStep === 3 && (
          <Step4Preview />
        )}
        {activeStep === 4 && <Step5Integration />}
      </div>

      {/* Navigation Buttons with Icons and Conditional Logic */}
      <div className="mt-8 flex justify-between">
        <button
          disabled={activeStep === 0}
          onClick={handleBack}
          className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back
        </button>

        {activeStep === steps.length - 1 ? (
          // Show Deploy button on the last step
          <button
            onClick={handleDeploy}
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-green-700 transition-colors"
          >
            Deploy
            <FontAwesomeIcon icon={faRocket} />
          </button>
        ) : (
          // Show Next button on all other steps
          <button
            onClick={handleNext}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-indigo-700 transition-colors"
          >
            Next
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        )}
      </div>
    </div>
  );
}