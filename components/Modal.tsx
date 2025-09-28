import React, { useState, useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
  initialText: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onSave, initialText }) => {
  const [text, setText] = useState(initialText);

  // Reset textarea content when modal is opened with new initial text
  useEffect(() => {
    if (isOpen) {
      setText(initialText);
    }
  }, [isOpen, initialText]);
  
  // Add/remove Escape key listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleSave = () => {
    onSave(text);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 transition-opacity duration-300"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-brand-surface p-6 rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300 scale-95 opacity-0 animate-[scale-in_0.2s_ease-out_forwards]"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <h2 className="text-2xl font-bold text-brand-text mb-4">Edit Response</h2>
        <textarea
          className="w-full h-48 p-3 bg-brand-surface border border-gray-600 rounded-md text-brand-text-secondary focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-colors"
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="Edit response text"
        />
        <div className="mt-6 flex justify-end space-x-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition duration-200"
            aria-label="Cancel editing"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-indigo-500 transition duration-200"
            aria-label="Save changes to response"
          >
            Save Changes
          </button>
        </div>
      </div>
      {/* Simple keyframe animation for modal entrance */}
      <style>{`
        @keyframes scale-in {
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Modal;
