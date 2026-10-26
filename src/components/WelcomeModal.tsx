
import { useState } from "react";
import "./WelcomeModal.css";

type WelcomeModalProps = {
  onStartTutorial: () => void;
  onSkip: () => void;
};

export default function WelcomeModal({
  onStartTutorial,
  onSkip,
}: WelcomeModalProps) {
  const [open, setOpen] = useState(true);

  if (!open) return null;

  function handleSkip() {
    setOpen(false);
    onSkip();
  }

  function handleStart() {
    setOpen(false);
    onStartTutorial();
  }

  return (
    <div className="welcome-overlay">
      <div className="welcome-modal">
        <h2>Welcome to UCSD Empty Classroom Finder!</h2>
        <p>Would you like a quick tutorial?</p>

        <div className="welcome-actions">
          <button
            className="welcome-primary"
            onClick={onStartTutorial}
          >
            Start tutorial
          </button>

          <button
            className="welcome-secondary"
            onClick={onSkip}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
