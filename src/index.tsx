
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./components/App";
import "./styles.css";
import WelcomeModal from "./components/WelcomeModal";

function Root() {
  const [showWelcome, setShowWelcome] = useState(true);

  const handleStartTutorial = () => {
    setShowWelcome(false);
    // We'll connect the actual tutorial here later.
  };

  const handleSkip = () => {
    setShowWelcome(false);
    localStorage.setItem("welcomeSeen", "true");
  };

  return (
    <StrictMode>
      <App title={document.title} />
      {showWelcome && (
        <WelcomeModal
          onStartTutorial={handleStartTutorial}
          onSkip={handleSkip}
        />
      )}
    </StrictMode>
  );
}

createRoot(document.getElementById("root")!).render(<Root />);
