'use client';

import { useEffect } from 'react';

interface CognitoFormProps {
  formId: string;
  height?: number;
  className?: string;
}

export default function CognitoForm({ 
  formId, 
  height = 773, 
  className = '' 
}: CognitoFormProps) {
  useEffect(() => {
    // Load the CognitoForms iframe script
    const script = document.createElement('script');
    script.src = 'https://www.cognitoforms.com/f/iframe.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup script when component unmounts
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <div className={`cognito-form-container ${className}`}>
      <iframe 
        src={`https://www.cognitoforms.com/f/${formId}`}
        allow="payment"
        style={{
          border: 0,
          width: '100%',
          height: `${height}px`,
          fontFamily: 'var(--font-servicenow)'
        }}
        title="CognitoForms"
      />
    </div>
  );
}