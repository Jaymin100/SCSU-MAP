import { useRef, useState } from "react";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;

}
// Main component function
export default function RegisterModal({
  isOpen,
  onClose

}: RegisterModalProps) {
  // Event handler for form submission
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Registration successful
      setSuccess('Registration successful! Please log in.');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };
  const MouseDownRef = useRef<EventTarget | null>(null);
  const HandleMouseDown = (e: React.MouseEvent) => {
    MouseDownRef.current = e.target;
  };
  const HandleMouseUp = (e: React.MouseEvent) => {
    const StartedOnBackdrop = MouseDownRef.current === e.currentTarget;
    const EndedOnBackdrop = e.currentTarget === e.target;

    if (StartedOnBackdrop && EndedOnBackdrop) {
      onClose();
    }
    MouseDownRef.current = null;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onMouseDown={HandleMouseDown}
      onMouseUp={HandleMouseUp}
    >
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 border border-purple-500/30 rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Welcome!
          </h2>
          <p className="text-gray-400 text-sm md:text-base">
            Register to start your dashboard
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
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
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

          {/* Success Message */}
          {success && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-green-400 text-sm">
              {success}
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
                Registering...
              </div>
            ) : (
              "Register"
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
