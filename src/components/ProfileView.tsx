import React, { useState } from 'react';
import { Campaign } from '../types/campaign';
import { Breadcrumbs } from './Breadcrumbs';
import {
  SmileyAvatar,
  AVATAR_PERSONAS,
  AVATAR_COLORS,
  DEFAULT_AVATAR_PALETTE,
  DEFAULT_AVATAR_MOOD,
} from './SmileyAvatar';

interface ProfileViewProps {
  onBack: () => void;
  campaigns?: Campaign[];
  onNavigateCampaign?: (campaignId: string) => void;
  onNavigateAnalytics?: (campaignId: string) => void;
  onNavigatePayoutMethods?: () => void;
  onNavigateBilling?: () => void;
  onNavigateNotificationSettings?: () => void;
  onCreateCampaign?: () => void;
  avatarPalette?: string;
  avatarMood?: string;
  onSelectPalette?: (palette: string) => void;
  onSelectMood?: (mood: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onBack,
  campaigns = [],
  onNavigateCampaign,
  onNavigateAnalytics,
  onNavigatePayoutMethods,
  onNavigateBilling,
  onNavigateNotificationSettings,
  onCreateCampaign,
  avatarPalette = DEFAULT_AVATAR_PALETTE,
  avatarMood = DEFAULT_AVATAR_MOOD,
  onSelectPalette,
  onSelectMood,
}) => {
  const [profileTab, setProfileTab] = useState<'created' | 'joined' | 'payouts' | 'avatar'>('created');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const currentPersona =
    AVATAR_PERSONAS.find((p) => p.id === avatarMood) || AVATAR_PERSONAS[0];

  const handleShuffleColor = () => {
    const randomColor =
      AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    if (onSelectPalette) onSelectPalette(randomColor);
  };

  const createdCampaigns = campaigns.filter((c) => !c.joined);
  const joinedCampaigns = campaigns.filter((c) => c.joined);

  const handleCopy = (slug: string) => {
    navigator.clipboard?.writeText(`https://kred.link/${slug}/you`);
    setCopiedLink(slug);
    setTimeout(() => setCopiedLink(null), 1200);
  };

  return (
    <div className="w-full max-w-[940px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Breadcrumbs with Icons */}
      <Breadcrumbs
        items={[
          { label: 'Home', icon: 'ti-home', onClick: onBack },
          { label: 'Profile', icon: 'ti-user', active: true },
        ]}
      />

      {/* Profile Header (Matching Screenshot Design) */}
      <div className="pt-2 pb-6 border-b border-[#2A2A2A]/70 flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 text-center sm:text-left">
        {/* Glowing Gradient Circle Avatar */}
        <div className="relative shrink-0">
          <div
            className="w-[104px] h-[104px] rounded-full p-[2px] flex items-center justify-center shadow-lg transition-transform hover:scale-105"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${avatarPalette}, #161616 80%)`,
            }}
          >
            <div className="w-full h-full rounded-full bg-[#121212] flex items-center justify-center overflow-hidden">
              <SmileyAvatar
                paletteId={avatarPalette}
                personaId={currentPersona.id}
                size={98}
              />
            </div>
          </div>
        </div>

        {/* User Info & Stats */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-[28px] font-medium tracking-[-0.6px] text-[#F5F3EC]">
                Alex Rivera
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-3 text-[13px] text-[#9A9892] mt-0.5">
                <span className="flex items-center gap-1.5">
                  <i className="ti ti-calendar text-[14px]"></i>
                  <span>Joined April 2026</span>
                </span>
                <span>·</span>
                <span className="text-[#F5F3EC] font-medium">
                  <span className="text-[#C7F26B] font-semibold">{createdCampaigns.length}</span> Created
                </span>
                <span>·</span>
                <span className="text-[#F5F3EC] font-medium">
                  <span className="text-[#C7F26B] font-semibold">{joinedCampaigns.length}</span> Joined
                </span>
              </div>
            </div>

            {/* Quick Action Pills */}
            <div className="flex items-center justify-center sm:justify-end gap-2 pt-1 sm:pt-0">
              <button
                type="button"
                onClick={onNavigatePayoutMethods}
                className="pill text-[12px] min-h-[38px] px-3.5 cursor-pointer"
                title="Payout methods"
              >
                <i className="ti ti-wallet"></i>
                <span>Payouts</span>
              </button>
              <button
                type="button"
                onClick={onNavigateBilling}
                className="pill text-[12px] min-h-[38px] px-3.5 cursor-pointer"
                title="Billing and invoices"
              >
                <i className="ti ti-receipt"></i>
                <span>Billing</span>
              </button>
              <button
                type="button"
                onClick={onNavigateNotificationSettings}
                className="pill text-[12px] min-h-[38px] px-3 cursor-pointer"
                title="Notification settings"
                aria-label="Notification settings"
              >
                <i className="ti ti-bell"></i>
              </button>
            </div>
          </div>

          {/* Social Links Row (like in screenshot) */}
          <div className="flex items-center justify-center sm:justify-start gap-2.5 pt-1 text-[#9A9892]">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-[8px] bg-[#161616] hover:bg-[#242424] hover:text-[#F5F3EC] flex items-center justify-center text-[15px] transition-colors border border-[#2A2A2A]/40"
              aria-label="LinkedIn"
            >
              <i className="ti ti-brand-linkedin"></i>
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-[8px] bg-[#161616] hover:bg-[#242424] hover:text-[#F5F3EC] flex items-center justify-center text-[15px] transition-colors border border-[#2A2A2A]/40"
              aria-label="Twitter / X"
            >
              <i className="ti ti-brand-x"></i>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-[8px] bg-[#161616] hover:bg-[#242424] hover:text-[#F5F3EC] flex items-center justify-center text-[15px] transition-colors border border-[#2A2A2A]/40"
              aria-label="GitHub"
            >
              <i className="ti ti-brand-github"></i>
            </a>
            <span className="text-[12px] text-[#9A9892] pl-2 font-mono">
              kred.id/alex
            </span>
          </div>
        </div>
      </div>

      {/* Profile Section Tabs (like in screenshot) */}
      <div className="flex items-center gap-1.5 border-b border-[#2A2A2A]/60 pb-3 overflow-x-auto scrollbar-none select-none">
        {[
          { id: 'created', label: 'My Campaigns', icon: 'ti-speakerphone', count: createdCampaigns.length },
          { id: 'joined', label: 'Joined Campaigns', icon: 'ti-link', count: joinedCampaigns.length },
          { id: 'payouts', label: 'Financials', icon: 'ti-coin', count: null },
          { id: 'avatar', label: 'Avatar & Theme', icon: 'ti-mood-smile', count: null },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setProfileTab(tab.id as any)}
            className={`pill min-h-[40px] px-4 cursor-pointer text-[13px] ${
              profileTab === tab.id ? 'on' : 'text-[#9A9892] hover:text-[#F5F3EC]'
            }`}
          >
            <i className={`ti ${tab.icon}`}></i>
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono ${
                profileTab === tab.id ? 'bg-[#0B0B0B] text-[#F5F3EC]' : 'bg-[#1C1C1C] text-[#9A9892]'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content 1: Created Campaigns (Click any campaign to see that app's analytics!) */}
      {profileTab === 'created' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[16px] font-medium text-[#F5F3EC]">Apps & campaigns</div>
              <div className="sub text-[12px]">Click any campaign to view live telemetry and install attribution.</div>
            </div>
            {onCreateCampaign && (
              <button
                type="button"
                onClick={onCreateCampaign}
                className="pill on min-h-[38px] px-4 text-[12px] cursor-pointer"
              >
                <i className="ti ti-plus"></i>
                <span>New campaign</span>
              </button>
            )}
          </div>

          {createdCampaigns.length > 0 ? (
            <div className="space-y-2.5">
              {createdCampaigns.map((camp) => (
                <div
                  key={camp.id}
                  onClick={() => onNavigateAnalytics && onNavigateAnalytics(camp.id)}
                  className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#2A2A2A] hover:border-[#F5F3EC]/30 hover:bg-[#181818] transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span
                      className="w-12 h-12 rounded-[16px] flex items-center justify-center text-[24px] shrink-0"
                      style={{ backgroundColor: camp.bg, color: camp.fg }}
                    >
                      <i className={`ti ${camp.icon}`}></i>
                    </span>
                    <div className="min-w-0">
                      <div className="text-[16px] font-medium text-[#F5F3EC] group-hover:text-white flex items-center gap-2">
                        <span>{camp.name}</span>
                        <span className="chip text-[11px] py-0.5 px-2 bg-[#222] text-[#B9B7AF]">
                          {camp.cat}
                        </span>
                      </div>
                      <div className="sub text-[12px] mt-0.5">
                        ${camp.price} per install · {camp.creators} creators · {camp.days} days left
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onNavigateCampaign) onNavigateCampaign(camp.id);
                      }}
                      className="ol min-h-[38px] px-3 text-[12px] cursor-pointer"
                    >
                      <span>Public page</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onNavigateAnalytics) onNavigateAnalytics(camp.id);
                      }}
                      className="pill on min-h-[38px] px-4 text-[12px] cursor-pointer font-medium"
                    >
                      <i className="ti ti-chart-bar text-[14px]"></i>
                      <span>View analytics</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Screenshot Empty State Replication */
            <div className="card text-center py-16 px-6 space-y-4 bg-[#141414] border border-[#242424] rounded-[24px]">
              {/* Embossed slate empty state badge icon */}
              <div className="relative inline-flex items-center justify-center">
                <div className="w-20 h-20 rounded-[22px] bg-[#1F1F1F] border border-[#2F2F2F] flex items-center justify-center text-[#555] text-[36px] shadow-inner">
                  <i className="ti ti-layout-grid"></i>
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#2A2A2A] border-2 border-[#141414] text-[#888] font-mono text-[12px] font-bold flex items-center justify-center">
                  0
                </div>
              </div>

              <div>
                <div className="text-[17px] font-medium text-[#F5F3EC]">Nothing here, yet</div>
                <div className="text-[13px] text-[#9A9892] mt-1 max-w-[340px] mx-auto leading-relaxed">
                  Alex has no public campaigns at this time.
                </div>
              </div>

              {onCreateCampaign && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onCreateCampaign}
                    className="pill on min-h-[44px] px-6 cursor-pointer font-medium"
                  >
                    Create a campaign
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 2: Joined Campaigns */}
      {profileTab === 'joined' && (
        <div className="space-y-4">
          <div className="text-[16px] font-medium text-[#F5F3EC]">Campaigns you promote</div>

          {joinedCampaigns.length > 0 ? (
            <div className="space-y-2.5">
              {joinedCampaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#2A2A2A]"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span
                      className="w-12 h-12 rounded-[16px] flex items-center justify-center text-[24px] shrink-0"
                      style={{ backgroundColor: camp.bg, color: camp.fg }}
                    >
                      <i className={`ti ${camp.icon}`}></i>
                    </span>
                    <div className="min-w-0">
                      <div className="text-[16px] font-medium text-[#F5F3EC] flex items-center gap-2">
                        <span>{camp.name}</span>
                        <span className="chip text-[11px] py-0.5 px-2 bg-[#C7F26B] text-[#16140F] font-semibold">
                          Active link
                        </span>
                      </div>
                      <div className="sub text-[12px] font-mono mt-0.5">
                        kred.link/{camp.slug || camp.id}/you
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopy(camp.slug || camp.id)}
                      className="pill on min-h-[38px] px-3.5 text-[12px] cursor-pointer"
                    >
                      {copiedLink === (camp.slug || camp.id) ? 'Copied' : 'Copy link'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigateCampaign && onNavigateCampaign(camp.id)}
                      className="ol min-h-[38px] px-3 text-[12px] cursor-pointer"
                    >
                      View details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Screenshot Empty State Replication */
            <div className="card text-center py-16 px-6 space-y-4 bg-[#141414] border border-[#242424] rounded-[24px]">
              <div className="relative inline-flex items-center justify-center">
                <div className="w-20 h-20 rounded-[22px] bg-[#1F1F1F] border border-[#2F2F2F] flex items-center justify-center text-[#555] text-[36px] shadow-inner">
                  <i className="ti ti-link"></i>
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#2A2A2A] border-2 border-[#141414] text-[#888] font-mono text-[12px] font-bold flex items-center justify-center">
                  0
                </div>
              </div>

              <div>
                <div className="text-[17px] font-medium text-[#F5F3EC]">Nothing here, yet</div>
                <div className="text-[13px] text-[#9A9892] mt-1 max-w-[340px] mx-auto leading-relaxed">
                  Alex has not joined any campaigns to promote yet.
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onBack}
                  className="pill on min-h-[44px] px-6 cursor-pointer font-medium"
                >
                  Browse open marketplace
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content 3: Financials Quick Links */}
      {profileTab === 'payouts' && (
        <div className="space-y-4">
          <div className="text-[16px] font-medium text-[#F5F3EC]">Financial management</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={onNavigatePayoutMethods}
              className="card p-5 border border-[#2A2A2A] hover:bg-[#181818] cursor-pointer transition-colors space-y-3 group"
            >
              <div className="w-11 h-11 rounded-[14px] bg-[#C0DD97] text-[#173404] flex items-center justify-center text-[22px]">
                <i className="ti ti-wallet"></i>
              </div>
              <div>
                <div className="text-[16px] font-medium text-[#F5F3EC] group-hover:text-white flex items-center justify-between">
                  <span>Payout methods</span>
                  <i className="ti ti-arrow-right text-[14px] text-[#9A9892]"></i>
                </div>
                <div className="sub text-[12px] mt-1">
                  Manage bank ACH accounts, debit cards, and USDC wallets on Polygon.
                </div>
              </div>
            </div>

            <div
              onClick={onNavigateBilling}
              className="card p-5 border border-[#2A2A2A] hover:bg-[#181818] cursor-pointer transition-colors space-y-3 group"
            >
              <div className="w-11 h-11 rounded-[14px] bg-[#B5D4F4] text-[#042C53] flex items-center justify-center text-[22px]">
                <i className="ti ti-receipt"></i>
              </div>
              <div>
                <div className="text-[16px] font-medium text-[#F5F3EC] group-hover:text-white flex items-center justify-between">
                  <span>Billing and invoices</span>
                  <i className="ti ti-arrow-right text-[14px] text-[#9A9892]"></i>
                </div>
                <div className="sub text-[12px] mt-1">
                  Fund campaign balances and download official settlement invoices.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 4: Avatar Persona Customizer */}
      {profileTab === 'avatar' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[16px] font-medium text-[#F5F3EC]">Avatar customizer</div>
              <div className="sub text-[12px]">Choose your smiling persona and palette highlight.</div>
            </div>
            <button
              type="button"
              onClick={handleShuffleColor}
              className="pill text-[12px] py-1 px-3 min-h-[36px] cursor-pointer"
            >
              <i className="ti ti-dice-3"></i>
              <span>Shuffle color</span>
            </button>
          </div>

          {/* Color Swatches Grid */}
          <div className="card space-y-2">
            <div className="text-[13px] font-medium text-[#F5F3EC]">Highlight color</div>
            <div className="flex gap-2.5 flex-wrap pt-1">
              {AVATAR_COLORS.map((cHex) => {
                const isSelected = avatarPalette === cHex;
                return (
                  <button
                    key={cHex}
                    type="button"
                    onClick={() => onSelectPalette && onSelectPalette(cHex)}
                    aria-label={`Color ${cHex}`}
                    className="w-[32px] h-[32px] rounded-full border-2 border-[#0B0B0B] p-0 cursor-pointer transition-transform hover:scale-110"
                    style={{
                      backgroundColor: cHex,
                      boxShadow: isSelected ? '0 0 0 2px #F5F3EC' : 'none',
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Personas Grid */}
          <div className="card space-y-3">
            <div className="text-[13px] font-medium text-[#F5F3EC]">Face expressions</div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
              {AVATAR_PERSONAS.map((p, i) => {
                const isSelected = currentPersona.id === p.id;
                const previewColor = isSelected
                  ? avatarPalette
                  : AVATAR_COLORS[(i * 3 + 1) % AVATAR_COLORS.length];
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onSelectMood && onSelectMood(p.id)}
                    className={`bg-[#1C1C1C] rounded-[20px] p-3 flex flex-col items-center gap-2 border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#F5F3EC] text-[#F5F3EC]'
                        : 'border-transparent text-[#B9B7AF] hover:bg-[#242424]'
                    }`}
                  >
                    <SmileyAvatar
                      paletteId={previewColor}
                      personaId={p.id}
                      size={60}
                    />
                    <span className="text-[12px] font-medium">{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
