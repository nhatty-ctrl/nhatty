import React, { useState } from 'react';
import { UserRole } from '../types/campaign';
import { SmileyAvatar, AVATAR_PERSONAS, AVATAR_COLORS } from './SmileyAvatar';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (data: { name: string; role: UserRole; avatarPalette: string; avatarMood: string }) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('Alex Rivera');
  const [role, setRole] = useState<UserRole>('creator');
  const [link, setLink] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<string | null>(null);

  // Auto-assigned avatar
  const [autoAvatar] = useState(() => {
    const p = AVATAR_PERSONAS[Math.floor(Math.random() * AVATAR_PERSONAS.length)];
    const c = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    return { personaId: p.id, paletteId: c, name: p.name };
  });

  if (!isOpen) return null;

  const handleNextStep = () => {
    if (step === 0) {
      if (!name.trim()) return;
      setStep(1);
    } else if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (link.trim()) {
        setIsExtracting(true);
        setTimeout(() => {
          setIsExtracting(false);
          setExtractedData(
            role === 'founder'
              ? 'Mobile app verified from App Store catalog'
              : 'Creator social profile verified'
          );
          setStep(3);
        }, 900);
      } else {
        setStep(3);
      }
    } else if (step === 3) {
      onComplete({
        name: name.trim() || 'Alex Rivera',
        role,
        avatarPalette: autoAvatar.paletteId,
        avatarMood: autoAvatar.personaId,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-[fade-in_0.2s_ease-out]">
      <div className="card w-full max-w-[460px] bg-[#161616] border border-[#2A2A2A] rounded-[24px] p-6 shadow-2xl animate-[pop_0.2s_ease-out] select-none text-left space-y-5">
        {/* Step indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#1C1C1C] text-[#C7F26B] font-mono text-[12px] flex items-center justify-center font-medium">
              {step + 1}
            </span>
            <span className="sub text-[12px]">Step {step + 1} of 4</span>
          </div>
          <span className="text-[12px] text-[#9A9892]">kred onboarding</span>
        </div>

        {step === 0 ? (
          /* Step 1: Enter your name */
          <div className="space-y-4">
            <div>
              <h2 className="text-[22px] font-medium text-[#F5F3EC]">Welcome to kred</h2>
              <p className="sub mt-1">
                The verified install marketplace. What should creators and founders call you?
              </p>
            </div>

            <div>
              <label className="fl" htmlFor="onboard-name">Your name</label>
              <input
                id="onboard-name"
                className="in min-h-[46px]"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivera"
                autoFocus
              />
            </div>
          </div>
        ) : step === 1 ? (
          /* Step 2: Choose Founder or Creator */
          <div className="space-y-4">
            <div>
              <h2 className="text-[22px] font-medium text-[#F5F3EC]">Choose your role</h2>
              <p className="sub mt-1">
                One account can do both, and you can switch roles anytime from your profile menu.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setRole('creator')}
                className={`card p-4 text-left border-2 transition-all cursor-pointer min-h-[120px] flex flex-col justify-between ${
                  role === 'creator' ? 'border-[#C7F26B] bg-[#1A1A1A]' : 'border-transparent'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-[#C0DD97] text-[#173404] flex items-center justify-center text-[18px]">
                  <i className="ti ti-user" aria-hidden="true"></i>
                </div>
                <div>
                  <div className="text-[15px] font-medium text-[#F5F3EC]">Creator</div>
                  <div className="sub text-[11px] mt-0.5">Earn bounties for verified mobile app installs.</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('founder')}
                className={`card p-4 text-left border-2 transition-all cursor-pointer min-h-[120px] flex flex-col justify-between ${
                  role === 'founder' ? 'border-[#C7F26B] bg-[#1A1A1A]' : 'border-transparent'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-[#B5D4F4] text-[#042C53] flex items-center justify-center text-[18px]">
                  <i className="ti ti-building" aria-hidden="true"></i>
                </div>
                <div>
                  <div className="text-[15px] font-medium text-[#F5F3EC]">Founder</div>
                  <div className="sub text-[11px] mt-0.5">Fund campaigns and verify real installs.</div>
                </div>
              </button>
            </div>
          </div>
        ) : step === 2 ? (
          /* Step 3: Paste link to pull data */
          <div className="space-y-4">
            <div>
              <h2 className="text-[22px] font-medium text-[#F5F3EC]">
                {role === 'founder' ? 'Add your mobile app' : 'Add your primary channel'}
              </h2>
              <p className="sub mt-1">
                {role === 'founder'
                  ? 'Paste an App Store or Google Play link. We pull the rest automatically.'
                  : 'Paste your YouTube, TikTok, or social channel link for quick creator attribution.'}
              </p>
            </div>

            <div>
              <label className="fl" htmlFor="onboard-link">
                {role === 'founder' ? 'Store link' : 'Channel link'}
              </label>
              <input
                id="onboard-link"
                className="in min-h-[46px]"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder={
                  role === 'founder'
                    ? 'https://apps.apple.com/app/pixel-pop/id123'
                    : 'https://youtube.com/@alex'
                }
              />
            </div>

            {isExtracting && (
              <div className="ex">
                <i className="ti ti-loader-2 spin text-[18px]"></i>
                <span>Pulling catalog telemetry...</span>
              </div>
            )}
          </div>
        ) : (
          /* Step 4: Auto-assigned avatar */
          <div className="space-y-4 text-center py-2">
            <div>
              <h2 className="text-[22px] font-medium text-[#F5F3EC]">Your profile is ready</h2>
              <p className="sub mt-1">
                An avatar persona has been automatically assigned to your account.
              </p>
            </div>

            <div className="py-3 flex flex-col items-center justify-center">
              <SmileyAvatar
                paletteId={autoAvatar.paletteId}
                personaId={autoAvatar.personaId}
                size={84}
              />
              <div className="text-[16px] font-medium text-[#F5F3EC] mt-3">
                {name} · {autoAvatar.name}
              </div>
              <div className="sub text-[12px] capitalize">
                {role} workspace
              </div>
            </div>

            {extractedData && (
              <div className="ex justify-center text-[12px] text-[#C7F26B]">
                <i className="ti ti-check" aria-hidden="true"></i>
                <span>{extractedData}</span>
              </div>
            )}
          </div>
        )}

        {/* Primary Action Button */}
        <div className="flex justify-between items-center pt-2">
          {step > 0 && step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="pill min-h-[44px] px-4 cursor-pointer"
            >
              Back
            </button>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={handleNextStep}
            className="pill on min-h-[44px] px-6 cursor-pointer font-medium"
          >
            {step === 3 ? 'Land on Campaigns' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};
