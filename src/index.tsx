import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./components/App";
import "./styles.css";
import WelcomeModal from "./components/WelcomeModal";

function Root() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const handleStartTutorial = () => {
    setShowWelcome(false);
    setShowTutorial(true);
  };

  const handleSkip = () => {
    setShowWelcome(false);
    localStorage.setItem("welcomeSeen", "true");
  };

  const handleCloseTutorial = () => {
    setShowTutorial(false);
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

      {showTutorial && (
        <div className="welcome-overlay">
          <div className="welcome-modal tutorial-modal">
            <h2>UCSD Classroom Finder Tutorial</h2>

            {videoError ? (
              <div className="tutorial-placeholder">
                Tutorial video coming soon!
              </div>
            ) : (
              <video
                controls
                autoPlay
                playsInline
                width="100%"
                onError={() => setVideoError(true)}
              >
                <source
                  src="/ucsd-classrooms-modified/tutorial.mp4"
                  type="video/mp4"
                />
              </video>
            )}

            <div className="welcome-actions">
              <button
                className="welcome-primary"
                onClick={handleCloseTutorial}
              >
                Finish Tutorial
              </button>
            </div>
          </div>
        </div>
      )}
    </StrictMode>
  );
}

createRoot(document.getElementById("root")!).render(<Root />);
