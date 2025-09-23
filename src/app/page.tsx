'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      router.push('/dashboard/app');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-center p-4 relative overflow-hidden">
      {/* Floating Glow Effect */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-400 opacity-30 blur-3xl rounded-full animate-pulse" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-400 opacity-30 blur-3xl animate-pulse" />

      <motion.div
        className="max-w-2xl p-10 rounded-2xl bg-white/80 shadow-2xl backdrop-blur-lg"
        initial={{ rotateY: 10, rotateX: 5, opacity: 0, scale: 0.9 }}
        animate={{ rotateY: 0, rotateX: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        whileHover={{ rotateY: 5, rotateX: -5, scale: 1.05 }}
      >
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900">
          Welcome to the <span className="text-indigo-600">Chat Agent</span> Platform
        </h1>
        <p className="mt-4 text-lg text-gray-700">
          Build, customize, and deploy intelligent chat agents powered by your own data. <br />
          Get started in minutes with our no-code tools.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/login"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transform hover:-translate-y-1 transition-all duration-300"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 px-8 rounded-lg shadow-lg transform hover:-translate-y-1 transition-all duration-300"
          >
            Create Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
