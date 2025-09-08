import type { Route } from "./+types/home";
import LoginModal from "~/Components/LoginModal";
import RegisterModal from "~/Components/RegisterModal";
import { useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "SCSU Campus Map" },
    { name: "description", content: "Navigate your SCSU campus with ease" },
  ];
}

export default function Home() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);



  const openLoginModal = () => setShowLoginModal(true)
  const closeLoginModal = () => setShowLoginModal(false)
  const openRegisterModal = () => setShowRegisterModal(true)
  const closeRegisterModal = () => setShowRegisterModal(false)
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-purple-900/20 to-neutral-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      {/* Header */}
      <div className="flex  sm:flex-row items-center justify-between p-4 md:p-6 relative z-10">
        <div className="flex items-center space-x-3 group">
          <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            CampusNav
          </span>
        </div> 
        <div className="flex  sm:flex-row items-center justify-end gap-4">
            <button 
          onClick={() => setShowRegisterModal(true)}
          className="mt-2 sm:mt-0 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 font-semibold text-sm md:text-base ">
          Register
        </button >
        <button 
          onClick={() => setShowLoginModal(true)}
          className="mt-2 sm:mt-0 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 font-semibold text-sm md:text-base">
          Sign in
        </button>
        </div>
   
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center p-8 md:p-16 relative z-10">
        <div className="bg-black/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 md:p-12 shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 max-w-sm md:max-w-4xl w-full">
          <div className="text-center space-y-4 md:space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent leading-tight">
              Welcome to Campus Dashboard
            </h1>
            <h2 className="text-lg md:text-2xl font-medium text-gray-300 leading-relaxed">
              Where are you going today? Never be late or lost on campus again.
            </h2>
            
            {/* Interactive Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 md:mt-8">
              <div className="group cursor-pointer">
                <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-xl p-4 md:p-6 hover:bg-gradient-to-r hover:from-purple-600/30 hover:to-blue-600/30 transition-all duration-300 transform hover:scale-105">
                  <h3 className="text-base md:text-lg font-semibold text-white mb-2">Interactive Map</h3>
                  <p className="text-gray-400 text-xs md:text-sm">Navigate campus with real-time directions</p>
                </div>
              </div>
              
              <div className="group cursor-pointer">
                <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-xl p-4 md:p-6 hover:bg-gradient-to-r hover:from-purple-600/30 hover:to-blue-600/30 transition-all duration-300 transform hover:scale-105">
                  <h3 className="text-base md:text-lg font-semibold text-white mb-2">Smart Schedule</h3>
                  <p className="text-gray-400 text-xs md:text-sm">Plan your day with intelligent routing</p>
                </div>
              </div>
              
              <div className="group cursor-pointer">
                <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-xl p-4 md:p-6 hover:bg-gradient-to-r hover:from-purple-600/30 hover:to-blue-600/30 transition-all duration-300 transform hover:scale-105">
                  <h3 className="text-base md:text-lg font-semibold text-white mb-2">Quick Access</h3>
                  <p className="text-gray-400 text-xs md:text-sm">Find buildings and services instantly</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}

      />
      <RegisterModal
      isOpen={showRegisterModal}
        onClose = {()=>setShowRegisterModal(false)}
      />
    </div>
  );
}
