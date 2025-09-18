"use client";

import { useState } from "react";
import PlaygroundStepper from "./PlaygroundStepper";
import Step1APIModel from "./Step1APIModel";
import Step2Customization from "./Step2Customization";
import Step3ScrapingRAG from "./Step3ScrapingRAG";
import Step4Preview from "./Step4Preview";
import Step5Integration  from "./Step5Integration";

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

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

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
          <Step4Preview theme={theme} color={color} agentName={agentName} />
        )}
        {activeStep === 4 && <Step5Integration />}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-6 flex justify-between">
        <button
          disabled={activeStep === 0}
          onClick={handleBack}
          className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
        >
          Back
        </button>
        <button
          disabled={activeStep === steps.length - 1}
          onClick={handleNext}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}
