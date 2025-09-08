import React, { useState } from "react";
import { useRef } from "react";

// Define the props interface - what this component needs to receive
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Main component function
export default function LoginModal({
  isOpen,
  onClose,
}: LoginModalProps) {
  // Event handler for form submission
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Event handler for form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page from refreshing
    setError(""); // sets it to no error
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (!email.endsWith("@go.minnstate.edu")) setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body : JSON.stringify({
          email,
          password
        })

      });


      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      alert(`Logged in! ${JSON.stringify(data.user)} `)
      onClose();

      window.location.href='dashboard';
      
    } catch (err) {
      setError("Login Failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // Event handler for clicking outside modal
  const mouseDownTargetRef = useRef<EventTarget | null>(null);
  const handleMouseClickDown = (e: React.MouseEvent) => {
    mouseDownTargetRef.current = e.target;
  };
  const handleMouseClickUp = (e: React.MouseEvent) => {
    const startedOnBackDrop = mouseDownTargetRef.current === e.currentTarget;
    const endedOnBackDrop = e.target === e.currentTarget;

    if (startedOnBackDrop && endedOnBackDrop) {
      onClose();
    }
    mouseDownTargetRef.current = null;
  };

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  // Return the JSX (HTML-like structure)
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onMouseDown={handleMouseClickDown}
      onMouseUp={handleMouseClickUp}
    >
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 border border-purple-500/30 rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-400 text-sm md:text-base">
            Sign in to access your campus dashboard
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              SCSU Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="StarID@go.minnstate.edu"
              className="w-full px-4 py-3 bg-neutral-800/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
              disabled={loading}
            />
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 bg-neutral-800/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
              disabled={loading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-2">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-sm transition-colors duration-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
