
interface ChatButtonProps {
  toggleChat: () => void;
  primaryColor: string;
  chatIconSize: number;
  buttonPosition: React.CSSProperties;
}

export function ChatButton({
  toggleChat,
  primaryColor,
  chatIconSize,
  buttonPosition,
}: ChatButtonProps) {
  return (
    <button
      onClick={toggleChat}
      className="absolute shadow-lg flex items-center justify-center rounded-full text-white transition-all duration-300 ease-in-out hover:scale-105 animate-fade-in"
      style={{
        backgroundColor: primaryColor,
        width: `${chatIconSize}px`,
        height: `${chatIconSize}px`,
        ...buttonPosition
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    </button>
  );
}
