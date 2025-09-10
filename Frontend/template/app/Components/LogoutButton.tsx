interface LogoutButtonProps {
    className?: string;
  }
  
  export default function LogoutButton({ className = "" }: LogoutButtonProps) {
    const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    };
  
    return (
      <button
        onClick={handleLogout}
        className={`bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 font-semibold ${className}`}
      >
        Logout
      </button>
    );
  }