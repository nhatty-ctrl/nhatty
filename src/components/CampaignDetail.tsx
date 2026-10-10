import React, { useState } from 'react';
import { Campaign } from '../types/campaign';
import { Breadcrumbs } from './Breadcrumbs';
import { TrackingQrCode } from './TrackingQrCode';

interface CampaignDetailProps {
  campaign: Campaign;
  allCampaigns?: Campaign[];
  onJoin: (campaign: Campaign, targetEl?: HTMLElement) => void;
  onOpenQr: (campaign: Campaign) => void;
  onCopyLink: (campaign: Campaign) => void;
  onShare: (campaign: Campaign) => void;
  onNavigateDetail?: (id: string) => void;
  onNavigateAnalytics?: (id: string) => void;
  onNavigateEarnings?: () => void;
  onBack: () => void;
  isOwner?: boolean;
  onApply?: (campaign: Campaign) => void;
  userHandle?: string;
}

type CampaignState = 'open' | 'approval' | 'applied' | 'joined' | 'closed';

export const CampaignDetail: React.FC<CampaignDetailProps> = ({
  campaign,
  allCampaigns = [],
  onJoin,
  onOpenQr,
  onCopyLink,
  onShare,
  onNavigateDetail,
  onNavigateAnalytics,
  onNavigateEarnings,
  onBack,
  isOwner = false,
  onApply,
  userHandle,
}) => {
  // Determine initial state from campaign properties
  const initialState: CampaignState = campaign.days <= 0
    ? 'closed'
    : campaign.joined
    ? 'joined'
    : campaign.applicationStatus === 'pending'
    ? 'applied'
    : campaign.requiresApproval
    ? 'approval'
    : 'open';

  const [st, setSt] = useState<CampaignState>(initialState);
  const [form, setForm] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [toast, setToast] = useState('');
  const [copied, setCopied] = useState(false);
  const [ftcPledge, setFtcPledge] = useState(true);
  const [eSignName, setESignName] = useState('');

  const slug = campaign.slug || campaign.id;
  const activeUser =
    userHandle ||
    (typeof window !== 'undefined' ? localStorage.getItem('kred_username') : null) ||
    'maya';

  const bg = campaign.bg || '#CECBF6';
  const fg = campaign.fg || '#26215C';
  const icon = campaign.icon || 'ti-device-gamepad-2';
  const price = campaign.price || '0.50';
  const pct = 10;
  const months = 12;
  const linkUrl = `go.umi.example/@${activeUser}/${slug}`;

  const showToast = (text: string) => {
    setToast(text);
    setTimeout(() => {
      setToast('');
    }, 2600);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(linkUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const handleSendApplication = () => {
    if (!msg.trim()) {
      setErr('Write a short note for the founder.');
      return;
    }
    if (!ftcPledge) {
      setErr('You must accept the FTC disclosure compliance pledge (#ad).');
      return;
    }
    if (!eSignName.trim()) {
      setErr('Type your legal name to e-sign the creator agreement.');
      return;
    }
    setSt('applied');
    setForm(false);
    setMsg('');
    setErr('');
    showToast('Application & signed agreement submitted to founder!');
    if (onApply) onApply(campaign);
  };

  const handleJoinClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setSt('joined');
    onJoin(campaign, e.currentTarget);
  };

  return (
    <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6 text-left select-none animate-[fade-in_0.2s_ease-out]">
      {/* Top Header & Breadcrumbs bar */}
      <div className="flex items-center justify-between gap-4 pb-2">
        <Breadcrumbs
          items={[
            { label: 'Campaigns', icon: 'ti-speakerphone', onClick: onBack },
            { label: campaign.cat, icon: 'ti-folder', onClick: onBack },
            { label: campaign.name, icon: 'ti-cube', active: true },
          ]}
        />
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold py-1.5 px-4 rounded-full bg-[#141414] hover:bg-[#1B1B1B] text-[#9C9A92] hover:text-[#F4F2EC] border border-[#222222] cursor-pointer transition-colors shadow-xs"
        >
          <i className="ti ti-arrow-left text-[13px]"></i>
          <span>Back to campaigns</span>
        </button>
      </div>

      {/* Main Campaign Presentation (Expanded naturally across canvas, no rigid border box) */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] lg:grid-cols-[320px_minmax(0,1fr)] gap-8 sm:gap-12 items-start pt-2">
          {/* ================= LEFT COLUMN ================= */}
          <div className="space-y-4">
            {/* Square Logo Card */}
            <div
              className="lg aspect-square w-full rounded-[26px] flex flex-col items-center justify-center p-6 text-center shadow-lg relative"
              style={{ backgroundColor: bg, color: fg }}
            >
              <i className={`ti ${icon} text-[68px]`} aria-hidden="true"></i>
              <div className="text-[24px] font-medium tracking-tight mt-2.5 px-3 truncate max-w-full">
                {campaign.name}
              </div>
            </div>

            {/* Tagline */}
            <div className="sub text-[13px] text-[#9C9A92] leading-relaxed">
              {campaign.tag || 'Casual puzzle games for short breaks'}
            </div>

            {/* "Created by" Row with Founder and Socials */}
            <div className="row flex items-center gap-3.5 pt-2">
              <span
                className="av w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-medium shrink-0"
                style={{ backgroundColor: '#C0DD97', color: '#173404' }}
              >
                {(campaign.by || 'Nora Vale').charAt(0)}
              </span>

              <div className="flex-1 min-w-0">
                <div className="sub text-[11.5px] text-[#9C9A92]">Created by</div>
                <div className="text-[14.5px] font-medium text-[#F4F2EC] truncate">
                  {campaign.by || campaign.host || 'Nora Vale'}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.open('https://instagram.com', '_blank')}
                  className="text-[#9C9A92] hover:text-[#F4F2EC] text-[18px] cursor-pointer bg-transparent border-0 p-0"
                  aria-label="Instagram"
                >
                  <i className="ti ti-brand-instagram"></i>
                </button>
                <button
                  type="button"
                  onClick={() => window.open('https://x.com', '_blank')}
                  className="text-[#9C9A92] hover:text-[#F4F2EC] text-[18px] cursor-pointer bg-transparent border-0 p-0"
                  aria-label="X"
                >
                  <i className="ti ti-brand-x"></i>
                </button>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN ================= */}
          <div className="space-y-5 min-w-0">
            {/* Category Tag Pill */}
            <div>
              <span className="edge inline-flex items-center gap-2 rounded-full py-1.5 pl-2 pr-3.5 text-[13px] text-[#B8B6AE]">
                <span
                  className="w-5 h-5 rounded-[6px] flex items-center justify-center text-[12px] font-bold"
                  style={{ backgroundColor: bg, color: fg }}
                >
                  <i className={`ti ${icon}`} aria-hidden="true"></i>
                </span>
                <span>
                  Featured in <b className="font-medium text-[#F4F2EC]">{campaign.cat}</b>
                </span>
              </span>

              {/* Big Serif Headline */}
              <h1 className="font-serif text-[38px] sm:text-[46px] font-normal tracking-[-1.2px] text-[#F4F2EC] leading-[1.08] mt-3">
                {campaign.name}
              </h1>
            </div>

            {/* Calendar Schedule Row */}
            <div className="row flex items-center gap-3.5">
              <div className="edge sq w-12 h-12 rounded-[14px] flex flex-col items-center justify-center shrink-0">
                <span className="text-[10px] text-[#9C9A92] font-mono leading-none">
                  OCT
                </span>
                <span className="text-[16px] font-medium leading-none mt-0.5">
                  29
                </span>
              </div>
              <div>
                <div className="text-[15px] font-medium text-[#F4F2EC]">
                  Runs until Thursday, October 29
                </div>
                <div className="sub text-[12.5px] text-[#9C9A92] mt-0.5">
                  {campaign.days} days left · started October 2
                </div>
              </div>
            </div>

            {/* Store Listing Row */}
            <div className="row flex items-center gap-3.5">
              <div className="edge sq w-12 h-12 rounded-[14px] flex items-center justify-center text-[20px] shrink-0">
                <i className="ti ti-map-pin"></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-medium text-[#F4F2EC]">
                  Get the app
                </div>
                <div className="sub text-[12.5px] text-[#9C9A92] mt-0.5">
                  Opens the store listing
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => showToast(`Opens the App Store listing for ${campaign.name}`)}
                  className="edge ic cursor-pointer hover:bg-[#141414] transition-colors"
                  aria-label="Open the App Store listing"
                  title="App Store"
                >
                  <i className="ti ti-brand-apple"></i>
                </button>
                <button
                  type="button"
                  onClick={() => showToast(`Opens the Google Play listing for ${campaign.name}`)}
                  className="edge ic cursor-pointer hover:bg-[#141414] transition-colors"
                  aria-label="Open the Google Play listing"
                  title="Google Play"
                >
                  <i className="ti ti-player-play"></i>
                </button>
              </div>
            </div>

            {/* Toast notice */}
            {toast && (
              <div className="sub text-[12px] text-[#C9B8FF] font-medium min-h-[20px] animate-[fade-in_0.15s_ease-out]">
                {toast}
              </div>
            )}

            {/* ================= JOIN CARD (ALL 5 STATES) ================= */}
            <div className="edge rounded-[20px] overflow-hidden bg-[#0E0E0E]">
              <div className="hd text-[14px] font-medium py-3 px-5 border-b border-[#222222] text-[#F4F2EC]">
                {
                  {
                    open: 'Join campaign',
                    approval: 'Apply to join',
                    applied: 'Application sent',
                    joined: 'You are in',
                    closed: 'Campaign closed',
                  }[st]
                }
              </div>

              <div className="p-5 space-y-4">
                {/* State: Open */}
                {st === 'open' && (
                  <>
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#C9B8FF] bg-[#C9B8FF]/10 px-2.5 py-0.5 rounded-full border border-[#C9B8FF]/20">
                          <i className="ti ti-shield-check"></i>
                          <span>Prefunded Escrow Backed</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#F4F2EC] bg-[#141414] px-2.5 py-0.5 rounded-full border border-[#222222]">
                          <span>0% Creator Fee</span>
                        </span>
                      </div>

                      <div className="text-[22px] font-medium tracking-tight text-[#F4F2EC]">
                        Earn ${price} per verified install
                      </div>
                      <div className="text-[14.5px] text-[#C9B8FF] font-medium">
                        Plus {pct}% of subscription revenue for {months} months
                      </div>
                      {campaign.bonusTier && (
                        <div className="inline-flex items-center gap-1.5 text-[12px] text-[#FAC775] font-medium bg-[#FAC775]/10 px-2.5 py-1 rounded-full border border-[#FAC775]/20">
                          <i className="ti ti-trophy"></i>
                          <span>{campaign.bonusTier.label}</span>
                        </div>
                      )}
                    </div>

                    <div className="sub text-[13px] text-[#9C9A92] leading-relaxed">
                      100% of payout funds are prefunded in Stripe escrow before you post. Payouts verify via in-app SDK attestation (not unverified video views).
                      {campaign.maxVideosPerCreator ? ` Max ${campaign.maxVideosPerCreator} videos per creator.` : ''}
                    </div>

                    <button
                      type="button"
                      onClick={handleJoinClick}
                      className="w-full h-[46px] bg-[#F4F2EC] hover:bg-white text-[#000000] font-semibold rounded-full text-[14px] cursor-pointer transition-all duration-150 shadow-sm hover:shadow-[0_0_16px_rgba(244,242,236,0.3)] active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
                    >
                      <i className="ti ti-plus text-[14px] stroke-[2.5]" aria-hidden="true"></i>
                      <span>Join campaign</span>
                    </button>
                  </>
                )}

                {/* State: Approval */}
                {st === 'approval' && (
                  <>
                    {!form ? (
                      <>
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#C9B8FF] bg-[#C9B8FF]/10 px-2.5 py-0.5 rounded-full border border-[#C9B8FF]/20">
                              <i className="ti ti-shield-check"></i>
                              <span>Prefunded Escrow Backed</span>
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#F4F2EC] bg-[#141414] px-2.5 py-0.5 rounded-full border border-[#222222]">
                              <span>0% Creator Fee</span>
                            </span>
                          </div>

                          <div className="text-[22px] font-medium tracking-tight text-[#F4F2EC]">
                            Earn ${price} per verified install
                          </div>
                          <div className="text-[14.5px] text-[#C9B8FF] font-medium">
                            Plus {pct}% of subscription revenue for {months} months
                          </div>
                          {campaign.bonusTier && (
                            <div className="inline-flex items-center gap-1.5 text-[12px] text-[#FAC775] font-medium bg-[#FAC775]/10 px-2.5 py-1 rounded-full border border-[#FAC775]/20">
                              <i className="ti ti-trophy"></i>
                              <span>{campaign.bonusTier.label}</span>
                            </div>
                          )}
                        </div>

                        <div className="sub text-[13px] text-[#9C9A92] leading-relaxed">
                          Founder reviews and approves each creator. To comply with FTC endorsement guidelines, creators e-sign a disclosure agreement before tracking links are issued.
                        </div>

                        <button
                          type="button"
                          onClick={() => setForm(true)}
                          className="w-full h-[46px] bg-[#F4F2EC] hover:bg-white text-[#000000] font-semibold rounded-full text-[14px] cursor-pointer transition-all duration-150 shadow-sm hover:shadow-[0_0_16px_rgba(244,242,236,0.3)] active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
                        >
                          <i className="ti ti-send text-[14px]"></i>
                          <span>Apply & e-sign agreement</span>
                        </button>
                      </>
                    ) : (
                      /* Inline Creator Application Form with FTC Pledge & E-Sign */
                      <div className="space-y-3.5">
                        <div className="row flex items-center gap-3 pb-2 border-b border-[#222222]">
                          <span
                            className="av w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-semibold"
                            style={{ backgroundColor: '#F5C4B3', color: '#4A1B0C' }}
                          >
                            M
                          </span>
                          <div>
                            <div className="text-[14px] font-medium text-[#F4F2EC]">
                              {activeUser}.makes
                            </div>
                            <div className="sub text-[12px] text-[#9C9A92]">
                              TikTok · 24k followers · Verified Creator
                            </div>
                          </div>
                        </div>

                        <textarea
                          value={msg}
                          onChange={(e) => {
                            setMsg(e.target.value);
                            if (err) setErr('');
                          }}
                          placeholder="Tell the founder what kind of video or review you would make for this app"
                          className="ta w-full min-h-[75px] bg-[#000000] border border-[#222222] rounded-[14px] text-[#F4F2EC] p-3 text-[13.5px] outline-none focus:border-[#C9B8FF] resize-vertical leading-relaxed"
                        />

                        {/* FTC Disclosure Compliance Pledge */}
                        <label className="flex items-start gap-2.5 p-3 rounded-[12px] bg-[#141414] border border-[#222222] cursor-pointer text-left select-none">
                          <input
                            type="checkbox"
                            checked={ftcPledge}
                            onChange={(e) => setFtcPledge(e.target.checked)}
                            className="mt-0.5 accent-[#C9B8FF] shrink-0"
                          />
                          <div className="text-[12px] leading-snug text-[#F4F2EC]">
                            <span className="font-semibold text-[#C9B8FF]">FTC Disclosure Pledge (#ad)</span>: I pledge to clearly and conspicuously disclose sponsored content using <b>#ad</b> or platform-approved sponsored tags on TikTok, YouTube, Instagram, or X, adhering to FTC Endorsement Guides.
                          </div>
                        </label>

                        {/* Creator Agreement E-Signature */}
                        <div className="space-y-1 text-left">
                          <div className="text-[11.5px] text-[#9C9A92]">
                            Type your full legal name to e-sign the <b>Umi Creator Performance Agreement</b>:
                          </div>
                          <input
                            type="text"
                            value={eSignName}
                            onChange={(e) => {
                              setESignName(e.target.value);
                              if (err) setErr('');
                            }}
                            placeholder="e.g. Maya Lin"
                            className="w-full h-10 px-3 bg-[#000000] border border-[#222222] rounded-[12px] text-[13px] text-[#F4F2EC] outline-none focus:border-[#C9B8FF]"
                          />
                        </div>

                        {err && (
                          <div className="text-[#FF8A80] text-[13px] min-h-[18px]">
                            {err}
                          </div>
                        )}

                        <div className="flex gap-2.5 pt-1">
                          <button
                            type="button"
                            onClick={handleSendApplication}
                            className="flex-1 h-[46px] bg-[#F4F2EC] hover:bg-white text-[#000000] font-semibold rounded-full text-[14px] cursor-pointer transition-all duration-150 shadow-sm hover:shadow-[0_0_16px_rgba(244,242,236,0.3)] active:scale-[0.99] flex items-center justify-center gap-2"
                          >
                            <i className="ti ti-signature text-[16px]"></i>
                            <span>Sign & submit application</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setForm(false)}
                            className="h-[46px] px-5 rounded-full bg-[#141414] hover:bg-[#1B1B1B] text-[#B8B6AE] hover:text-[#F4F2EC] border border-[#222222] font-medium text-[13.5px] cursor-pointer transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* State: Applied */}
                {st === 'applied' && (
                  <div className="space-y-3">
                    <span className="inline-block bg-[#FAC775] text-[#412402] rounded-full px-3 py-1 text-[12px] font-semibold">
                      Pending review
                    </span>

                    <div className="sub text-[13px] text-[#9C9A92] leading-relaxed">
                      You will get a notification when the founder decides. Most decisions take a day or two.
                    </div>

                    <button
                      type="button"
                      onClick={() => setSt('approval')}
                      className="edge btn text-[12.5px] py-1.5 px-4 cursor-pointer"
                    >
                      Withdraw application
                    </button>
                  </div>
                )}

                {/* State: Joined */}
                {st === 'joined' && (
                  <div className="space-y-4">
                    <div className="sub text-[13px] text-[#9C9A92]">
                      Your creator link. Every verified install through it earns you ${price}.
                    </div>

                    <div className="row flex flex-col sm:flex-row items-stretch sm:items-start gap-4">
                      <div className="flex-1 min-w-0 space-y-3">
                        {/* Vanity link capsule with 1-click copy */}
                        <div className="edge rounded-full flex items-center p-1.5 pl-4 gap-2 bg-[#141414]">
                          <span className="flex-1 font-mono text-[12px] text-[#F4F2EC] truncate">
                            {linkUrl}
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyLink}
                            className="btn sm bg-[#F4F2EC] text-black font-semibold hover:bg-white border-0 px-3.5"
                          >
                            {copied ? 'Copied' : 'Copy'}
                          </button>
                        </div>

                        {/* Download QR Code button */}
                        <button
                          type="button"
                          onClick={() => onOpenQr(campaign)}
                          className="edge btn sm flex items-center gap-1.5 text-[12px] cursor-pointer"
                        >
                          <i className="ti ti-download" aria-hidden="true"></i>
                          <span>Download QR</span>
                        </button>
                      </div>

                      {/* Generated QR Code thumbnail */}
                      <div className="shrink-0 flex justify-center">
                        <TrackingQrCode
                          url={`https://${linkUrl}`}
                          size={100}
                          className="p-1.5 bg-[#F4F2EC] rounded-[14px] shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* State: Closed */}
                {st === 'closed' && (
                  <div className="row flex items-start gap-3">
                    <i className="ti ti-circle-minus text-[24px] text-[#B8B6AE] mt-0.5" aria-hidden="true"></i>
                    <div>
                      <div className="text-[16px] font-medium text-[#F4F2EC]">
                        Not taking creators
                      </div>
                      <div className="sub text-[13px] text-[#9C9A92] mt-0.5 leading-relaxed">
                        This campaign is closed or out of budget. Check Discover for new ones.
                      </div>
                    </div>
                  </div>
                )}

                {/* Creators joined counter footer */}
                {st !== 'closed' && st !== 'joined' && (
                  <div className="sub text-[12px] text-[#9C9A92] pt-2 border-t border-[#222222]">
                    {campaign.creators || 638} creators joined · {campaign.installsVerified || '12.4k'} verified installs
                  </div>
                )}
              </div>
            </div>

            {/* "About campaign" Section */}
            <div className="sec text-[15px] font-medium pb-2 border-b border-[#222222] pt-4">
              About campaign
            </div>
            <div className="text-[15px] text-[#B8B6AE] leading-relaxed whitespace-pre-line">
              {campaign.desc}
            </div>
            <div className="sub text-[12.5px] text-[#9C9A92] mt-2 leading-relaxed">
              A verified install is a new user who opens the app and finishes onboarding. It counts after a 14 day check.
            </div>

            {/* "Requirements" Section */}
            <div className="sec text-[15px] font-medium pb-2 border-b border-[#222222] pt-4">
              Requirements
            </div>
            <div className="space-y-2.5">
              <div className="li flex items-start gap-2.5 text-[14px] text-[#B8B6AE]">
                <i className="ti ti-check text-[#C9B8FF] text-[18px] shrink-0 mt-0.5" aria-hidden="true"></i>
                <span>At least 1,000 followers on one platform</span>
              </div>
              <div className="li flex items-start gap-2.5 text-[14px] text-[#B8B6AE]">
                <i className="ti ti-check text-[#C9B8FF] text-[18px] shrink-0 mt-0.5" aria-hidden="true"></i>
                <span>Post on TikTok, Instagram, or YouTube</span>
              </div>
              <div className="li flex items-start gap-2.5 text-[14px] text-[#B8B6AE]">
                <i className="ti ti-check text-[#C9B8FF] text-[18px] shrink-0 mt-0.5" aria-hidden="true"></i>
                <span>Label every post as sponsored. Age 18 or older</span>
              </div>
            </div>

            {/* "Terms" Section */}
            <div className="sec text-[15px] font-medium pb-2 border-b border-[#222222] pt-4">
              Terms & Platform Guarantees
            </div>
            <div className="divide-y divide-[#222222] text-[13px]">
              <div className="tr flex justify-between py-2.5">
                <span className="text-[#9C9A92]">Reward per verified install</span>
                <span className="font-mono text-[#F4F2EC]">${price}</span>
              </div>
              <div className="tr flex justify-between py-2.5">
                <span className="text-[#9C9A92]">Platform fee on creator pay</span>
                <span className="font-medium text-[#C9B8FF]">0% (You keep 100% of bounty)</span>
              </div>
              <div className="tr flex justify-between py-2.5">
                <span className="text-[#9C9A92]">Trust backing</span>
                <span className="text-[#F4F2EC] flex items-center gap-1.5">
                  <i className="ti ti-lock text-[#C9B8FF] text-[13px]"></i>
                  <span>100% Prefunded in Stripe Escrow</span>
                </span>
              </div>
              <div className="tr flex justify-between py-2.5">
                <span className="text-[#9C9A92]">Attribution standard</span>
                <span className="text-[#F4F2EC]">SDK in-app verified install (not vanity views)</span>
              </div>
              <div className="tr flex justify-between py-2.5">
                <span className="text-[#9C9A92]">Per-creator content cap</span>
                <span className="text-[#F4F2EC]">Max {campaign.maxVideosPerCreator || 3} videos / creator</span>
              </div>
              <div className="tr flex justify-between py-2.5">
                <span className="text-[#9C9A92]">Subscription share</span>
                <span className="text-[#C9B8FF]">{pct}% of net revenue, first {months} months</span>
              </div>
              <div className="tr flex justify-between py-2.5">
                <span className="text-[#9C9A92]">Verification window</span>
                <span className="text-[#F4F2EC]">14 days</span>
              </div>
              <div className="tr flex justify-between py-2.5">
                <span className="text-[#9C9A92]">Settlement batch</span>
                <span className="text-[#F4F2EC]">Weekly, on Fridays</span>
              </div>
              <div className="tr flex justify-between py-2.5">
                <span className="text-[#9C9A92]">FTC endorsement rule</span>
                <span className="text-[#F4F2EC]">Mandatory #ad / sponsored tag compliance</span>
              </div>
              <div className="tr flex justify-between py-2.5">
                <span className="text-[#9C9A92]">Minimum payout</span>
                <span className="text-[#F4F2EC]">$20.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};
