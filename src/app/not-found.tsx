"use client";

import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800">
      <div className="flex items-center text-7xl md:text-9xl font-extrabold">
        <motion.span
          className="text-indigo-600"
          initial={{ rotateY: -90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          4
        </motion.span>

        <motion.span
          className="mx-4 inline-block text-indigo-600"
          style={{ display: "inline-block", perspective: 1000 }}
          animate={{ rotateY: 360, rotateX: 15 }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
        >
          0
        </motion.span>

        <motion.span
          className="text-indigo-600"
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          4
        </motion.span>
      </div>

      <motion.h2
        className="mt-6 text-3xl font-bold text-gray-800 dark:text-gray-100"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        Page Not Found
      </motion.h2>

      <motion.p
        className="mt-2 text-lg text-gray-600 dark:text-gray-400 text-center px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        Sorry, the page you’re looking for doesn’t exist.
      </motion.p>

      <motion.a
        href="/"
        className="mt-8 px-8 py-3 rounded-lg bg-indigo-600 text-white font-medium shadow-lg hover:shadow-xl transition-transform"
        whileHover={{ scale: 1.1, rotateX: 5, rotateY: 5 }}
        whileTap={{ scale: 0.95, rotateX: -5, rotateY: -5 }}
      >
        Go Home
      </motion.a>
    </div>
  );
}
