import React from 'react';

interface StepProgressProps {
  currentStep: 1 | 2;
  writeComplete: boolean;      // has text in answer
  hasMedia: boolean;           // photos or audio attached
  className?: string;
}

/**
 * Premium two-step progress indicator for the memory editor.
 * Shows "Write" → "Enrich & Save" with editorial styling and warm bronze tones.
 * Step 2 label reflects whether media has been attached.
 */
export function StepProgress({ currentStep, writeComplete, hasMedia, className = '' }: StepProgressProps) {
  const step1Done = writeComplete;
  const step2Active = currentStep === 2;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* ── Step 1: Write ── */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-all duration-300"
          style={{
            backgroundColor: 'var(--bronze)',
            color: 'var(--charcoal)',
            fontFamily: 'var(--font-serif)',
            boxShadow: step1Done
              ? '0 0 0 3px rgba(212,163,115,0.18), 0 3px 10px rgba(212,163,115,0.30)'
              : '0 3px 10px rgba(212,163,115,0.30)',
          }}
        >
          {step1Done ? (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          ) : (
            '1'
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          <span
            className="text-[11px] font-semibold tracking-[0.08em] uppercase leading-none"
            style={{
              color: step1Done ? 'var(--charcoal)' : 'rgba(43,43,43,0.60)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Write
          </span>
          {step1Done && (
            <span className="text-[9px] italic leading-none" style={{ color: 'var(--tea-green)', fontFamily: 'var(--font-sans)' }}>
              in progress
            </span>
          )}
        </div>
      </div>

      {/* ── Connector line ── */}
      <div className="flex-1 max-w-[3.5rem] flex items-center">
        <div
          className="w-full h-0.5 rounded-full transition-all duration-500"
          style={{
            background: step1Done
              ? 'linear-gradient(to right, var(--bronze), rgba(212,163,115,0.30))'
              : 'rgba(212,163,115,0.18)',
          }}
        />
      </div>

      {/* ── Step 2: Enrich & Save ── */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-all duration-300"
          style={
            step2Active
              ? {
                  backgroundColor: 'var(--bronze)',
                  color: 'var(--charcoal)',
                  fontFamily: 'var(--font-serif)',
                  boxShadow: '0 0 0 3px rgba(212,163,115,0.18), 0 3px 10px rgba(212,163,115,0.30)',
                }
              : step1Done
                ? {
                    backgroundColor: 'rgba(204,213,174,0.55)',
                    color: 'var(--charcoal)',
                    fontFamily: 'var(--font-serif)',
                    border: '1.5px solid rgba(212,163,115,0.40)',
                    boxShadow: '0 2px 8px rgba(212,163,115,0.12)',
                  }
                : {
                    backgroundColor: 'rgba(212,163,115,0.10)',
                    color: 'rgba(43,43,43,0.40)',
                    fontFamily: 'var(--font-serif)',
                    border: '1.5px solid rgba(212,163,115,0.20)',
                  }
          }
        >
          {step2Active ? (
            '2'
          ) : step1Done ? (
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          ) : (
            '2'
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          <span
            className="text-[11px] font-semibold tracking-[0.08em] uppercase leading-none transition-colors duration-300"
            style={{
              color: step2Active
                ? 'var(--charcoal)'
                : step1Done
                  ? 'rgba(43,43,43,0.65)'
                  : 'rgba(43,43,43,0.40)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Enrich &amp; Save
          </span>
          {/* Sub-label: context about what step 2 involves */}
          {step1Done && !step2Active && (
            <span
              className="text-[9px] italic leading-none transition-colors duration-300"
              style={{
                color: hasMedia ? 'var(--tea-green)' : 'rgba(43,43,43,0.45)',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {hasMedia ? 'photo + audio ready' : 'photos · audio optional'}
            </span>
          )}
          {step2Active && (
            <span className="text-[9px] italic leading-none" style={{ color: 'var(--bronze)', fontFamily: 'var(--font-sans)' }}>
              completing
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default StepProgress;