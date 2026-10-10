import React, { useState } from 'react';
import { Campaign, CampaignApplication } from '../types/campaign';

interface ApplyCampaignModalProps {
  campaign: Campaign | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (application: Omit<CampaignApplication, 'id' | 'submittedAt'>) => void;
  userHandle: string;
}

export const ApplyCampaignModal: React.FC<ApplyCampaignModalProps> = ({
  campaign,
  isOpen,
  onClose,
  onSubmit,
  userHandle,
}) => {
  const [handle, setHandle] = useState(userHandle || 'creator');
  const [channel, setChannel] = useState<'tiktok' | 'youtube' | 'instagram' | 'x' | 'twitch'>('tiktok');
  const [followers, setFollowers] = useState('25k - 100k');
  const [pitch, setPitch] = useState('');
  const [ftcPledge, setFtcPledge] = useState(true);
  const [eSignName, setESignName] = useState('');
  const [err, setErr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !campaign) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ftcPledge) {
      setErr('You must pledge FTC disclosure compliance before submitting.');
      return;
    }
    if (!eSignName.trim()) {
      setErr('Please type your legal name to e-sign the creator performance agreement.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onSubmit({
        campaignId: campaign.id,
        creatorHandle: handle.replace('@', '').trim() || userHandle,
        creatorName: `@${handle.replace('@', '').trim() || userHandle}`,
        primaryChannel: channel,
        followerCount: followers,
        pitchNote: pitch.trim() || 'Excited to promote your app to my active community.',
        status: 'pending',
      });
      onClose();
    }, 400);
  };

  const bg = campaign.bg || '#CECBF6';
  const fg = campaign.fg || '#26215C';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-[fade-in_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[500px] bg-[#121215] border border-[#27272A] rounded-[24px] p-6 sm:p-7 shadow-2xl relative select-none text-left animate-[pop_0.25s_cubic-bezier(0.16,1,0.3,1)] max-h-[92vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-7 h-7 rounded-full bg-[#1C1C1F] hover:bg-[#27272A] text-[#9A9892] hover:text-[#F4F2EC] flex items-center justify-center border-0 cursor-pointer transition-colors"
          aria-label="Close"
        >
          <i className="ti ti-x text-[13px]"></i>
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-[#27272A] pb-4">
          <div
            className="w-11 h-11 rounded-[14px] flex items-center justify-center text-[22px] shrink-0 shadow-sm"
            style={{ backgroundColor: bg, color: fg }}
          >
            <i className={`ti ${campaign.icon || 'ti-device-gamepad-2'}`}></i>
          </div>
          <div>
            <div className="text-[17px] font-semibold text-[#F4F2EC]">
              Apply to {campaign.name}
            </div>
            <div className="text-[12px] text-[#A1A1AA] flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className="font-semibold text-[#F4F2EC]">${campaign.price} / verified install</span>
              <span>·</span>
              <span className="text-[#C9B8FF] font-medium">0% Creator Fee</span>
              <span>·</span>
              <span className="text-[#FAC775]">Approval & E-Sign Required</span>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-[12px] font-medium text-[#D4D4D8] mb-1">
              Your Creator Handle
            </label>
            <div className="flex items-center gap-2 bg-[#18181C] border border-[#27272A] rounded-[12px] px-3 py-2 text-[13px]">
              <span className="text-[#71717A] font-mono">@</span>
              <input
                type="text"
                value={handle}
                onChange={(e) => {
                  setHandle(e.target.value);
                  if (err) setErr('');
                }}
                placeholder="handle"
                className="w-full bg-transparent text-[#F4F2EC] focus:outline-none font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-[#D4D4D8] mb-1">
                Primary Channel
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as any)}
                className="w-full bg-[#18181C] border border-[#27272A] rounded-[12px] px-3 py-2 text-[12.5px] text-[#F4F2EC] focus:outline-none"
              >
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
                <option value="instagram">Instagram</option>
                <option value="x">Twitter / X</option>
                <option value="twitch">Twitch / Kick</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#D4D4D8] mb-1">
                Audience Reach
              </label>
              <select
                value={followers}
                onChange={(e) => setFollowers(e.target.value)}
                className="w-full bg-[#18181C] border border-[#27272A] rounded-[12px] px-3 py-2 text-[12.5px] text-[#F4F2EC] focus:outline-none"
              >
                <option value="5k - 25k">5k - 25k followers</option>
                <option value="25k - 100k">25k - 100k followers</option>
                <option value="100k - 500k">100k - 500k followers</option>
                <option value="500k+">500k+ followers</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#D4D4D8] mb-1">
              Short Pitch to Founder (Optional)
            </label>
            <textarea
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              placeholder="e.g. I create daily tech/app reviews and plan to feature your app in an upcoming reel…"
              rows={2}
              className="w-full bg-[#18181C] border border-[#27272A] rounded-[12px] p-3 text-[12.5px] text-[#F4F2EC] placeholder-[#71717A] focus:outline-none resize-none"
            />
          </div>

          {/* FTC Disclosure Compliance Pledge */}
          <label className="flex items-start gap-2.5 p-3 rounded-[12px] bg-[#18181C] border border-[#27272A] cursor-pointer text-left select-none">
            <input
              type="checkbox"
              checked={ftcPledge}
              onChange={(e) => {
                setFtcPledge(e.target.checked);
                if (err) setErr('');
              }}
              className="mt-0.5 accent-[#C9B8FF] shrink-0"
            />
            <div className="text-[11.5px] leading-snug text-[#F4F2EC]">
              <span className="font-semibold text-[#C9B8FF]">FTC Disclosure Pledge (#ad)</span>: I pledge to clearly and conspicuously disclose sponsored links using <b>#ad</b> or platform sponsor disclosures, adhering to FTC Endorsement Guides.
            </div>
          </label>

          {/* Creator Agreement E-Signature */}
          <div className="space-y-1 text-left">
            <div className="text-[11px] text-[#9C9A92]">
              Type your legal name to e-sign the <b>Umi Creator Performance Agreement</b>:
            </div>
            <input
              type="text"
              value={eSignName}
              onChange={(e) => {
                setESignName(e.target.value);
                if (err) setErr('');
              }}
              placeholder="e.g. Alex Chen"
              className="w-full h-9.5 px-3 bg-[#18181C] border border-[#27272A] rounded-[10px] text-[12.5px] text-[#F4F2EC] outline-none focus:border-[#C9B8FF]"
              required
            />
          </div>

          {err && (
            <div className="text-[12px] text-[#FF8A80] flex items-center gap-1">
              <i className="ti ti-alert-circle"></i>
              <span>{err}</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-full bg-[#141414] hover:bg-[#1B1B1B] text-[#B8B6AE] hover:text-[#F4F2EC] border border-[#222222] text-[13px] font-medium cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 px-4 rounded-full bg-[#F4F2EC] hover:bg-white text-[#000000] text-[13px] font-semibold cursor-pointer transition-all shadow-sm hover:shadow-[0_0_12px_rgba(244,242,236,0.35)] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <i className="ti ti-signature text-[14px]"></i>
              <span>{submitting ? 'Submitting…' : 'Sign & Submit Application'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
