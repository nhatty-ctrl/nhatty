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
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !campaign) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
        className="w-full max-w-[460px] bg-[#121215] border border-[#27272A] rounded-[24px] p-6 sm:p-7 shadow-2xl relative select-none text-left animate-[pop_0.25s_cubic-bezier(0.16,1,0.3,1)]"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-7 h-7 rounded-full bg-[#1C1C1F] hover:bg-[#27272A] text-[#9A9892] hover:text-[#F5F3EC] flex items-center justify-center border-0 cursor-pointer transition-colors"
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
            <div className="text-[17px] font-semibold text-[#F5F3EC]">
              Apply to {campaign.name}
            </div>
            <div className="text-[12px] text-[#A1A1AA] flex items-center gap-1.5 mt-0.5">
              <span>${campaign.price} / verified install</span>
              <span>·</span>
              <span className="text-[#FAC775]">Approval Required</span>
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
                onChange={(e) => setHandle(e.target.value)}
                placeholder="handle"
                className="w-full bg-transparent text-[#F5F3EC] focus:outline-none font-mono"
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
                className="w-full bg-[#18181C] border border-[#27272A] rounded-[12px] px-3 py-2 text-[12.5px] text-[#F5F3EC] focus:outline-none"
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
                className="w-full bg-[#18181C] border border-[#27272A] rounded-[12px] px-3 py-2 text-[12.5px] text-[#F5F3EC] focus:outline-none"
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
              placeholder="e.g. I create daily gaming reviews and plan to feature your app in an upcoming reel…"
              rows={3}
              className="w-full bg-[#18181C] border border-[#27272A] rounded-[12px] p-3 text-[12.5px] text-[#F5F3EC] placeholder-[#71717A] focus:outline-none resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="pill out py-2 px-4 text-[13px] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 pill on py-2 justify-center text-[13px] font-medium cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Submitting…' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
