import React, { useState } from 'react';
import { UserRole, UserSocialLinks } from '../types/campaign';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (profile: {
    username: string;
    displayName: string;
    role: UserRole;
    socials: UserSocialLinks;
  }) => void;
  initialRole?: UserRole;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialRole = 'creator',
}) => {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<UserRole>(initialRole);
  const [username, setUsername] = useState('creator');
  const [displayName, setDisplayName] = useState('Alex Rivera');
  const [socials, setSocials] = useState<UserSocialLinks>({
    twitter: '@alex_builds',
    tiktok: '@alex_clips',
    youtube: 'AlexTech',
    instagram: '',
  });

  if (!isOpen) return null;

  const handleFinish = () => {
    onComplete({
      username: username.toLowerCase().replace(/[^a-z0-9_-]/g, '').trim() || 'user',
      displayName: displayName.trim() || 'Creator',
      role,
      socials,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-[fade-in_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[500px] bg-[#121215] border border-[#27272A] rounded-[24px] p-6 sm:p-7 shadow-2xl relative select-none text-left animate-[pop_0.25s_cubic-bezier(0.16,1,0.3,1)]"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-7 h-7 rounded-full bg-[#1C1C1F] hover:bg-[#27272A] text-[#9A9892] hover:text-[#F5F3EC] flex items-center justify-center border-0 cursor-pointer transition-colors"
          aria-label="Skip onboarding"
        >
          <i className="ti ti-x text-[13px]"></i>
        </button>

        {/* Progress Dots */}
        <div className="flex items-center gap-1.5 mb-5">
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === step
                  ? 'w-7 bg-[#C7F26B]'
                  : idx < step
                  ? 'w-3 bg-[#388BFD]'
                  : 'w-3 bg-[#27272A]'
              }`}
            />
          ))}
        </div>

        {/* Step 0: Welcome & Role Selection */}
        {step === 0 && (
          <div className="space-y-5 animate-[fade-in_0.15s_ease-out]">
            <div>
              <div className="text-[11px] font-mono tracking-wider uppercase text-[#C7F26B]">
                WELCOME TO KRED
              </div>
              <h2 className="text-[24px] sm:text-[28px] font-semibold text-[#F5F3EC] mt-1 tracking-tight">
                How will you use KRED?
              </h2>
              <p className="text-[13.5px] text-[#A1A1AA] mt-1 leading-relaxed">
                Connect your accounts to generate personalized referral links, track installs, and receive weekly Friday payouts.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Creator Card */}
              <div
                onClick={() => setRole('creator')}
                className={`p-4 rounded-[18px] border transition-all cursor-pointer ${
                  role === 'creator'
                    ? 'bg-[#1C1C22] border-[#C7F26B] shadow-md ring-1 ring-[#C7F26B]/50'
                    : 'bg-[#16161A] border-[#27272A] hover:border-[#3F3F46]'
                }`}
              >
                <div className="w-9 h-9 rounded-[10px] bg-[#CECBF6] text-[#26215C] flex items-center justify-center text-[18px] mb-3">
                  <i className="ti ti-speakerphone"></i>
                </div>
                <div className="font-semibold text-[15px] text-[#F5F3EC]">Creator / Partner</div>
                <div className="text-[12px] text-[#A1A1AA] mt-1 leading-normal">
                  Promote mobile apps, claim custom short links & QR codes, and earn bounties on verified installs.
                </div>
              </div>

              {/* Founder Card */}
              <div
                onClick={() => setRole('founder')}
                className={`p-4 rounded-[18px] border transition-all cursor-pointer ${
                  role === 'founder'
                    ? 'bg-[#1C1C22] border-[#388BFD] shadow-md ring-1 ring-[#388BFD]/50'
                    : 'bg-[#16161A] border-[#27272A] hover:border-[#3F3F46]'
                }`}
              >
                <div className="w-9 h-9 rounded-[10px] bg-[#388BFD] text-white flex items-center justify-center text-[18px] mb-3">
                  <i className="ti ti-device-mobile"></i>
                </div>
                <div className="font-semibold text-[15px] text-[#F5F3EC]">App Founder / Studio</div>
                <div className="text-[12px] text-[#A1A1AA] mt-1 leading-normal">
                  Launch campaigns, connect the RavenCore SDK, and acquire verified users with zero fraud risk.
                </div>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full pill on py-2.5 justify-center text-[13.5px] font-medium cursor-pointer"
              >
                <span>Continue</span>
                <i className="ti ti-arrow-right text-[13px]"></i>
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Username & Social Channels */}
        {step === 1 && (
          <div className="space-y-4 animate-[fade-in_0.15s_ease-out]">
            <div>
              <div className="text-[11px] font-mono tracking-wider uppercase text-[#388BFD]">
                IDENTITY & SHORT LINKS
              </div>
              <h2 className="text-[22px] sm:text-[26px] font-semibold text-[#F5F3EC] mt-1 tracking-tight">
                Claim your personal handle
              </h2>
              <p className="text-[13px] text-[#A1A1AA] mt-0.5 leading-relaxed">
                Your username defines your vanity referral URLs e.g. <span className="text-[#C7F26B] font-mono">kred.link/app/{username || 'you'}</span>
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-[12px] font-medium text-[#D4D4D8] mb-1">
                  Unique Username
                </label>
                <div className="flex items-center gap-2 bg-[#18181C] border border-[#27272A] rounded-[12px] px-3 py-2">
                  <span className="text-[13px] font-mono text-[#71717A]">kred.link/app/</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    placeholder="yourhandle"
                    className="flex-1 bg-transparent text-[#F5F3EC] font-mono text-[13px] focus:outline-none"
                  />
                  <i className="ti ti-circle-check text-[#C7F26B]"></i>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#D4D4D8] mb-1">
                  Primary Social Accounts
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 bg-[#18181C] border border-[#27272A] rounded-[10px] px-2.5 py-1.5 text-[12px]">
                    <i className="ti ti-brand-tiktok text-[#EE1D52] text-[15px]"></i>
                    <input
                      type="text"
                      value={socials.tiktok}
                      onChange={(e) => setSocials({ ...socials, tiktok: e.target.value })}
                      placeholder="@tiktok"
                      className="w-full bg-transparent text-[#F5F3EC] focus:outline-none font-mono text-[11.5px]"
                    />
                  </div>

                  <div className="flex items-center gap-2 bg-[#18181C] border border-[#27272A] rounded-[10px] px-2.5 py-1.5 text-[12px]">
                    <i className="ti ti-brand-youtube text-[#FF0000] text-[15px]"></i>
                    <input
                      type="text"
                      value={socials.youtube}
                      onChange={(e) => setSocials({ ...socials, youtube: e.target.value })}
                      placeholder="YouTube channel"
                      className="w-full bg-transparent text-[#F5F3EC] focus:outline-none font-mono text-[11.5px]"
                    />
                  </div>

                  <div className="flex items-center gap-2 bg-[#18181C] border border-[#27272A] rounded-[10px] px-2.5 py-1.5 text-[12px]">
                    <i className="ti ti-brand-x text-white text-[15px]"></i>
                    <input
                      type="text"
                      value={socials.twitter}
                      onChange={(e) => setSocials({ ...socials, twitter: e.target.value })}
                      placeholder="@twitter"
                      className="w-full bg-transparent text-[#F5F3EC] focus:outline-none font-mono text-[11.5px]"
                    />
                  </div>

                  <div className="flex items-center gap-2 bg-[#18181C] border border-[#27272A] rounded-[10px] px-2.5 py-1.5 text-[12px]">
                    <i className="ti ti-brand-instagram text-[#E4405F] text-[15px]"></i>
                    <input
                      type="text"
                      value={socials.instagram}
                      onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
                      placeholder="@instagram"
                      className="w-full bg-transparent text-[#F5F3EC] focus:outline-none font-mono text-[11.5px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="pill out py-2.5 px-4 text-[13px] cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 pill on py-2.5 justify-center text-[13px] font-medium cursor-pointer"
              >
                <span>Next</span>
                <i className="ti ti-arrow-right text-[13px]"></i>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: RavenCore & Whoop Escrow Settlement Overview */}
        {step === 2 && (
          <div className="space-y-4 animate-[fade-in_0.15s_ease-out]">
            <div>
              <div className="text-[11px] font-mono tracking-wider uppercase text-[#C7F26B]">
                TRANSPARENCY & SETTLEMENT
              </div>
              <h2 className="text-[22px] sm:text-[26px] font-semibold text-[#F5F3EC] mt-1 tracking-tight">
                How attribution & payouts work
              </h2>
              <p className="text-[13px] text-[#A1A1AA] mt-0.5 leading-relaxed">
                Powered by open-source RavenCore hardware attestation and Whoop escrow settlement rails.
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              <div className="p-3 bg-[#18181C] border border-[#27272A] rounded-[14px] flex items-start gap-3">
                <i className="ti ti-shield-lock text-[#C7F26B] text-[18px] shrink-0 mt-0.5"></i>
                <div className="text-[12px] leading-relaxed">
                  <span className="font-semibold text-[#F5F3EC] block">RavenCore Cryptographic Attestation</span>
                  Rejects emulators and farm clicks with hardware cryptographic tokens. Every install is guaranteed authentic.
                </div>
              </div>

              <div className="p-3 bg-[#18181C] border border-[#27272A] rounded-[14px] flex items-start gap-3">
                <i className="ti ti-calendar-event text-[#388BFD] text-[18px] shrink-0 mt-0.5"></i>
                <div className="text-[12px] leading-relaxed">
                  <span className="font-semibold text-[#F5F3EC] block">Friday Settlement & Digital Receipts</span>
                  Earnings settle weekly every Friday at 17:00 UTC. Payouts arrive directly via Bank, Debit Card, PayPal, or USDC.
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="pill out py-2.5 px-4 text-[13px] cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="flex-1 pill on py-2.5 justify-center text-[13.5px] font-medium cursor-pointer"
              >
                <span>Get Started</span>
                <i className="ti ti-check text-[14px]"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
