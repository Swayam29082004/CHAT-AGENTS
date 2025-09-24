"use client";

import Link from "next/link";

export default function AppPage() {
  const cards = [
    {
      title: "Virtual Nurse",
      desc: "AI-powered assistant to guide patients with medication reminders and FAQs.",
      link: "/dashboard/playground",
      linkText: "Setup Nurse Agent →",
      color: "bg-blue-600 hover:bg-blue-700",
      image: "/images/nurse.png",
    },
    {
      title: "Appointment Manager",
      desc: "Automate patient bookings, cancellations, and follow-up reminders.",
      link: "/dashboard/deploy",
      linkText: "Deploy Scheduler →",
      color: "bg-green-600 hover:bg-green-700",
      image: "/images/calendar.png",
    },
    {
      title: "Patient History",
      desc: "View and analyze chat interactions with patients for better care.",
      link: "/dashboard/history",
      linkText: "View Records →",
      color: "bg-purple-600 hover:bg-purple-700",
      image: "/images/history.png",
    },
    {
      title: "Symptom Checker",
      desc: "Patients can describe symptoms and get preliminary advice before visiting doctors.",
      link: "/dashboard/playground",
      linkText: "Try Symptom Checker →",
      color: "bg-red-600 hover:bg-red-700",
      image: "/images/symptoms.png",
    },
    {
      title: "Emergency Triage",
      desc: "AI triage assistant to classify emergency severity and guide next steps.",
      link: "/dashboard/playground",
      linkText: "Run Triage Agent →",
      color: "bg-orange-600 hover:bg-orange-700",
      image: "/images/emergency.png",
    },
    {
      title: "Billing Assistant",
      desc: "Answer patient billing questions, send invoices, and assist with insurance claims.",
      link: "/dashboard/deploy",
      linkText: "Deploy Billing Agent →",
      color: "bg-yellow-600 hover:bg-yellow-700",
      image: "/images/billing.png",
    },
    {
      title: "Lab Results Explainer",
      desc: "Helps patients understand their lab test reports in simple language.",
      link: "/dashboard/playground",
      linkText: "View Lab Reports →",
      color: "bg-cyan-600 hover:bg-cyan-700",
      image: "/images/lab.png",
    },
    {
      title: "Mental Health Support",
      desc: "Provide mental wellness check-ins, resources, and guided exercises.",
      link: "/dashboard/playground",
      linkText: "Start Mental Health Agent →",
      color: "bg-pink-600 hover:bg-pink-700",
      image: "/images/mental.png",
    },
    {
      title: "Doctor’s Assistant",
      desc: "Helps doctors by summarizing patient chats, notes, and medical history.",
      link: "/dashboard/deploy",
      linkText: "Enable Doctor Assistant →",
      color: "bg-indigo-600 hover:bg-indigo-700",
      image: "/images/doctor.png",
    },
    {
      title: "Pharmacy Assistant",
      desc: "Helps patients check prescription availability and provides dosage reminders.",
      link: "/dashboard/deploy",
      linkText: "Deploy Pharmacy Agent →",
      color: "bg-teal-600 hover:bg-teal-700",
      image: "/images/pharmacy.png",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">Healthcare AI Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((card, i) => (
          <div
            key={i}
            className="p-6 bg-white rounded-xl shadow hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex flex-col items-center">
              <img
                src={card.image}
                alt={card.title}
                className="w-24 h-24 mb-4 object-contain"
              />
              <h2 className="text-xl font-semibold mb-2 text-center">
                {card.title}
              </h2>
              <p className="text-gray-600 mb-4 text-center">{card.desc}</p>
              <Link
                href={card.link}
                className={`btn-primary ${card.color} px-4 py-2 rounded text-white`}
              >
                {card.linkText}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
