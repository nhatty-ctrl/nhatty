import React, { useState } from 'react';
import { Campaign } from '../types/campaign';
import { Breadcrumbs } from './Breadcrumbs';
import { TrackingQrCode } from './TrackingQrCode';
import { KredTelemetryBarChart } from './KredTelemetryBarChart';

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

const STATES: [CampaignState, string][] = [
  ['open', 'Open'],
  ['approval', 'Approval'],
  ['applied', 'Applied'],
  ['joined', 'Joined'],
  ['closed', 'Closed'],
];

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
    setSt('applied');
    setForm(false);
    setMsg('');
    setErr('');
    if (onApply) onApply(campaign);
  };

  const handleJoinClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setSt('joined');
    onJoin(campaign, e.currentTarget);
  };

  return (
    <div className="w-full max-w-[1080px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 text-left select-none animate-[fade-in_0.2s_ease-out]">
      {/* Top Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Campaigns', icon: 'ti-speakerphone', onClick: onBack },
          { label: campaign.cat, icon: 'ti-folder', onClick: onBack },
          { label: campaign.name, icon: 'ti-cube', active: true },
        ]}
      />

      {/* Main Container styled with .k */}
      <div className="k border border-[#1F1F1F] shadow-2xl p-5 sm:p-8">
        {/* Preview State Switcher from File 3 */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <span className="sub text-[13px] text-[#9A9892]">Preview state</span>
          <div className="edge inline-flex rounded-full p-1 bg-[#111113]">
            {STATES.map(([stateKey, label]) => (
              <button
                key={stateKey}
                type="button"
                onClick={() => {
                  setSt(stateKey);
                  setForm(false);
                  setErr('');
                }}
                className={`pill text-[12px] py-1 px-3.5 border-0 font-medium cursor-pointer transition-colors ${
                  st === stateKey ? 'on text-black bg-[#F5F3EC]' : 'text-[#B9B7AF] bg-transparent'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Grid Layout matching File 3 */}
        <div className="grid grid-cols-1 md:grid-cols-[250px_minmax(0,1fr)] gap-8 items-start">
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
            <div className="sub text-[13px] text-[#9A9892] leading-relaxed">
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
                <div className="sub text-[11.5px] text-[#9A9892]">Created by</div>
                <div className="text-[14.5px] font-medium text-[#F5F3EC] truncate">
                  {campaign.by || campaign.host || 'Nora Vale'}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.open('https://instagram.com', '_blank')}
                  className="text-[#9A9892] hover:text-[#F5F3EC] text-[18px] cursor-pointer bg-transparent border-0 p-0"
                  aria-label="Instagram"
                >
                  <i className="ti ti-brand-instagram"></i>
                </button>
                <button
                  type="button"
                  onClick={() => window.open('https://x.com', '_blank')}
                  className="text-[#9A9892] hover:text-[#F5F3EC] text-[18px] cursor-pointer bg-transparent border-0 p-0"
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
              <span className="edge inline-flex items-center gap-2 rounded-full py-1.5 pl-2 pr-3.5 text-[13px] text-[#B9B7AF]">
                <span
                  className="w-5 h-5 rounded-[6px] flex items-center justify-center text-[12px] font-bold"
                  style={{ backgroundColor: bg, color: fg }}
                >
                  <i className={`ti ${icon}`} aria-hidden="true"></i>
                </span>
                <span>
                  Featured in <b className="font-medium text-[#F5F3EC]">{campaign.cat}</b>
                </span>
              </span>

              {/* Big Serif Headline */}
              <h1 className="font-serif text-[38px] sm:text-[46px] font-normal tracking-[-1.2px] text-[#F5F3EC] leading-[1.08] mt-3">
                {campaign.name}
              </h1>
            </div>

            {/* Calendar Schedule Row */}
            <div className="row flex items-center gap-3.5">
              <div className="edge sq w-12 h-12 rounded-[14px] flex flex-col items-center justify-center shrink-0">
                <span className="text-[10px] text-[#9A9892] font-mono leading-none">
                  OCT
                </span>
                <span className="text-[16px] font-medium leading-none mt-0.5">
                  29
                </span>
              </div>
              <div>
                <div className="text-[15px] font-medium text-[#F5F3EC]">
                  Runs until Thursday, October 29
                </div>
                <div className="sub text-[12.5px] text-[#9A9892] mt-0.5">
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
                <div className="text-[15px] font-medium text-[#F5F3EC]">
                  Get the app
                </div>
                <div className="sub text-[12.5px] text-[#9A9892] mt-0.5">
                  Opens the store listing
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => showToast(`Opens the App Store listing for ${campaign.name}`)}
                  className="edge ic cursor-pointer hover:bg-[#1C1C20] transition-colors"
                  aria-label="Open the App Store listing"
                  title="App Store"
                >
                  <i className="ti ti-brand-apple"></i>
                </button>
                <button
                  type="button"
                  onClick={() => showToast(`Opens the Google Play listing for ${campaign.name}`)}
                  className="edge ic cursor-pointer hover:bg-[#1C1C20] transition-colors"
                  aria-label="Open the Google Play listing"
                  title="Google Play"
                >
                  <i className="ti ti-player-play"></i>
                </button>
              </div>
            </div>

            {/* Toast notice */}
            {toast && (
              <div className="sub text-[12px] text-[#C7F26B] font-medium min-h-[20px] animate-[fade-in_0.15s_ease-out]">
                {toast}
              </div>
            )}

            {/* ================= JOIN CARD (ALL 5 STATES) ================= */}
            <div className="edge rounded-[20px] overflow-hidden bg-[#0A0A0C]">
              <div className="hd text-[14px] font-medium py-3 px-5 border-b border-[#1F1F1F] text-[#F5F3EC]">
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
                    <div>
                      <div className="text-[22px] font-medium tracking-tight text-[#F5F3EC]">
                        Earn ${price} per verified install
                      </div>
                      <div className="text-[15px] text-[#C7F26B] font-medium mt-1">
                        Plus {pct}% of subscription revenue for {months} months
                      </div>
                    </div>

                    <div className="sub text-[13px] text-[#9A9892] leading-relaxed">
                      Installs are paid weekly after a 14 day check. Open to every creator who
                      meets the requirements.
                    </div>

                    <button
                      type="button"
                      onClick={handleJoinClick}
                      className="btn main w-full h-[48px] bg-[#F5F3EC] hover:bg-white text-black font-semibold rounded-full text-[14px] cursor-pointer transition-all shadow-md mt-2"
                    >
                      Join campaign
                    </button>
                  </>
                )}

                {/* State: Approval */}
                {st === 'approval' && (
                  <>
                    {!form ? (
                      <>
                        <div>
                          <div className="text-[22px] font-medium tracking-tight text-[#F5F3EC]">
                            Earn ${price} per verified install
                          </div>
                          <div className="text-[15px] text-[#C7F26B] font-medium mt-1">
                            Plus {pct}% of subscription revenue for {months} months
                          </div>
                        </div>

                        <div className="sub text-[13px] text-[#9A9892] leading-relaxed">
                          The founder reviews each creator. Your profile goes with your application.
                        </div>

                        <button
                          type="button"
                          onClick={() => setForm(true)}
                          className="btn main w-full h-[48px] bg-[#F5F3EC] hover:bg-white text-black font-semibold rounded-full text-[14px] cursor-pointer transition-all shadow-md mt-2"
                        >
                          Apply
                        </button>
                      </>
                    ) : (
                      /* Inline Creator Application Form */
                      <div className="space-y-3.5">
                        <div className="row flex items-center gap-3 pb-2 border-b border-[#1F1F1F]">
                          <span
                            className="av w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-semibold"
                            style={{ backgroundColor: '#F5C4B3', color: '#4A1B0C' }}
                          >
                            M
                          </span>
                          <div>
                            <div className="text-[14px] font-medium text-[#F5F3EC]">
                              {activeUser}.makes
                            </div>
                            <div className="sub text-[12px] text-[#9A9892]">
                              TikTok · 24k followers
                            </div>
                          </div>
                        </div>

                        <textarea
                          value={msg}
                          onChange={(e) => {
                            setMsg(e.target.value);
                            if (err) setErr('');
                          }}
                          placeholder="Tell the founder what you would make for this campaign"
                          className="ta w-full min-h-[90px] bg-black border border-[#2A2A2A] rounded-[14px] text-[#F5F3EC] p-3 text-[14px] outline-none focus:border-[#F5F3EC] resize-vertical leading-relaxed"
                        />

                        {err && (
                          <div className="text-[#FF8A80] text-[13px] min-h-[18px]">
                            {err}
                          </div>
                        )}

                        <div className="flex gap-2.5 pt-1">
                          <button
                            type="button"
                            onClick={handleSendApplication}
                            className="btn main flex-1 h-[48px] bg-[#F5F3EC] hover:bg-white text-black font-semibold rounded-full text-[14px]"
                          >
                            Send application
                          </button>
                          <button
                            type="button"
                            onClick={() => setForm(false)}
                            className="edge btn h-[48px] px-5"
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

                    <div className="sub text-[13px] text-[#9A9892] leading-relaxed">
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
                    <div className="sub text-[13px] text-[#9A9892]">
                      Your creator link. Every verified install through it earns you ${price}.
                    </div>

                    <div className="row flex flex-col sm:flex-row items-stretch sm:items-start gap-4">
                      <div className="flex-1 min-w-0 space-y-3">
                        {/* Vanity link capsule with 1-click copy */}
                        <div className="edge rounded-full flex items-center p-1.5 pl-4 gap-2 bg-[#121214]">
                          <span className="flex-1 font-mono text-[12px] text-[#F5F3EC] truncate">
                            {linkUrl}
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyLink}
                            className="btn sm bg-[#F5F3EC] text-black font-semibold hover:bg-white border-0 px-3.5"
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
                          className="p-1.5 bg-[#F5F3EC] rounded-[14px] shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* State: Closed */}
                {st === 'closed' && (
                  <div className="row flex items-start gap-3">
                    <i className="ti ti-circle-minus text-[24px] text-[#B9B7AF] mt-0.5" aria-hidden="true"></i>
                    <div>
                      <div className="text-[16px] font-medium text-[#F5F3EC]">
                        Not taking creators
                      </div>
                      <div className="sub text-[13px] text-[#9A9892] mt-0.5 leading-relaxed">
                        This campaign is closed or out of budget. Check Discover for new ones.
                      </div>
                    </div>
                  </div>
                )}

                {/* Creators joined counter footer */}
                {st !== 'closed' && st !== 'joined' && (
                  <div className="sub text-[12px] text-[#9A9892] pt-2 border-t border-[#1F1F1F]">
                    {campaign.creators || 638} creators joined · {campaign.installsVerified || '12.4k'} verified installs
                  </div>
                )}
              </div>
            </div>

            {/* "About campaign" Section */}
            <div className="sec text-[15px] font-medium pb-2 border-b border-[#1F1F1F] pt-4">
              About campaign
            </div>
            <div className="text-[15px] text-[#B9B7AF] leading-relaxed whitespace-pre-line">
              {campaign.desc}
            </div>
            <div className="sub text-[12.5px] text-[#9A9892] mt-2 leading-relaxed">
              A verified install is a new user who opens the app and finishes onboarding. It counts after a 14 day check.
            </div>

            {/* "Requirements" Section */}
            <div className="sec text-[15px] font-medium pb-2 border-b border-[#1F1F1F] pt-4">
              Requirements
            </div>
            <div className="space-y-2.5">
              <div className="li flex items-start gap-2.5 text-[14px] text-[#B9B7AF]">
                <i className="ti ti-check text-[#C7F26B] text-[18px] shrink-0 mt-0.5" aria-hidden="true"></i>
                <span>At least 1,000 followers on one platform</span>
              </div>
              <div className="li flex items-start gap-2.5 text-[14px] text-[#B9B7AF]">
                <i className="ti ti-check text-[#C7F26B] text-[18px] shrink-0 mt-0.5" aria-hidden="true"></i>
                <span>Post on TikTok, Instagram, or YouTube</span>
              </div>
              <div className="li flex items-start gap-2.5 text-[14px] text-[#B9B7AF]">
                <i className="ti ti-check text-[#C7F26B] text-[18px] shrink-0 mt-0.5" aria-hidden="true"></i>
                <span>Label every post as sponsored. Age 18 or older</span>
              </div>
            </div>

            {/* "Terms" Section */}
            <div className="sec text-[15px] font-medium pb-2 border-b border-[#1F1F1F] pt-4">
              Terms
            </div>
            <div className="divide-y divide-[#1F1F1F] text-[13px]">
              <div className="tr flex justify-between py-2.5">
                <span className="text-[#9A9892]">Reward per verified install</span>
                <span className="font-mono text-[#F5F3EC]">${price}</span>
              </div>
              <div className="tr flex justify-between py-2.5">
                <span className="text-[#9A9892]">Subscription share</span>
                <span className="text-[#C7F26B]">{pct}% of net revenue, first {months} months</span>
              </div>
              <div className="tr flex justify-between py-2.5">
                <span className="text-[#9A9892]">Net revenue means</span>
                <span className="text-[#F5F3EC]">After store fees and refunds</span>
              </div>
              <div className="tr flex justify-between py-2.5">
                <span className="text-[#9A9892]">Verification window</span>
                <span className="text-[#F5F3EC]">14 days</span>
              </div>
              <div className="tr flex justify-between py-2.5">
                <span className="text-[#9A9892]">Settlement</span>
                <span className="text-[#F5F3EC]">Weekly, on Fridays</span>
              </div>
              <div className="tr flex justify-between py-2.5">
                <span className="text-[#9A9892]">Minimum payout</span>
                <span className="text-[#F5F3EC]">$20.00</span>
              </div>
            </div>

            {/* Real-time Telemetry Bar Chart (Image 1 Style) */}
            <div className="pt-6 border-t border-[#2A2A2A]">
              <KredTelemetryBarChart
                title={`Let’s look at your latest runs and verified installs for ${campaign.name}.`}
                pillLabel={`Read attribution telemetry · $${price} bounty`}
                icon={icon || 'ti-heart-filled'}
                bountyPrice={parseFloat(price) || 2.5}
                barColor={bg || '#F4C0D1'}
                badgeBg={bg}
                badgeFg={fg}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
