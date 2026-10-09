import React, { useState } from 'react';
import { Campaign, CampaignApplication, UserSocialLinks } from '../types/campaign';
import { Breadcrumbs } from './Breadcrumbs';
import {
  SmileyAvatar,
  AVATAR_PERSONAS,
  AVATAR_COLORS,
  DEFAULT_AVATAR_PALETTE,
  DEFAULT_AVATAR_MOOD,
} from './SmileyAvatar';
import { KredAnalyticsEngine } from './KredAnalyticsEngine';

interface ProfileViewProps {
  onBack: () => void;
  campaigns?: Campaign[];
  onNavigateCampaign?: (campaignId: string) => void;
  onNavigateAnalytics?: (campaignId: string) => void;
  onNavigatePayoutMethods?: () => void;
  onNavigateBilling?: () => void;
  onNavigateNotificationSettings?: () => void;
  onNavigateSettings?: () => void;
  onNavigateEarnings?: () => void;
  onNavigateSdk?: () => void;
  onNavigateDocs?: () => void;
  onOpenQr?: (campaign: Campaign) => void;
  onCreateCampaign?: () => void;
  onOpenOnboarding?: () => void;
  avatarPalette?: string;
  avatarMood?: string;
  onSelectPalette?: (palette: string) => void;
  onSelectMood?: (mood: string) => void;
  username?: string;
  onUpdateUsername?: (newUsername: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onBack,
  campaigns = [],
  onNavigateCampaign,
  onNavigateAnalytics,
  onNavigatePayoutMethods,
  onNavigateBilling,
  onNavigateNotificationSettings,
  onNavigateSettings,
  onNavigateEarnings,
  onNavigateSdk,
  onNavigateDocs,
  onOpenQr,
  onCreateCampaign,
  onOpenOnboarding,
  avatarPalette = DEFAULT_AVATAR_PALETTE,
  avatarMood = DEFAULT_AVATAR_MOOD,
  onSelectPalette,
  onSelectMood,
  username = 'alex',
  onUpdateUsername,
}) => {
  const [activeTab, setActiveTab] = useState<'created' | 'joined' | 'settings'>('created');
  const [showFounderAnalytics, setShowFounderAnalytics] = useState(false);
  const [showCreatorAnalytics, setShowCreatorAnalytics] = useState(false);
  const [expandedJoinedId, setExpandedJoinedId] = useState<string | null>(null);
  const [expandedCreatedId, setExpandedCreatedId] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Profile fields state
  const [displayName, setDisplayName] = useState('Alex Rivera');
  const [currentUsername, setCurrentUsername] = useState(username);
  const [bio, setBio] = useState('Mobile tech reviewer and developer. Testing indie apps with real audiences.');
  const [profileSaved, setProfileSaved] = useState(false);

  // Social accounts state
  const [socials, setSocials] = useState<UserSocialLinks>({
    twitter: '@alex_builds',
    tiktok: '@alex_clips',
    youtube: 'AlexTechReviews',
    instagram: '@alex.rivera',
    twitch: 'alex_live',
  });

  // Founder creator applications review state
  const [applications, setApplications] = useState<CampaignApplication[]>([
    {
      id: 'app_101',
      campaignId: 'pixelpop',
      creatorHandle: 'maya.makes',
      creatorName: '@maya.makes',
      primaryChannel: 'tiktok',
      followerCount: '120k followers',
      pitchNote: 'Daily indie mobile gaming streams. Would love to feature Pixel Pop on our Thursday lineup.',
      status: 'pending',
      submittedAt: '2026-09-28T14:20:00Z',
    },
    {
      id: 'app_102',
      campaignId: 'stride',
      creatorHandle: 'devon.art',
      creatorName: '@devon.art',
      primaryChannel: 'youtube',
      followerCount: '45k subscribers',
      pitchNote: 'Focusing on fitness lifestyle tech. Planning a dedicated review segment.',
      status: 'pending',
      submittedAt: '2026-10-01T09:15:00Z',
    },
  ]);

  const currentPersona =
    AVATAR_PERSONAS.find((p) => p.id === avatarMood) || AVATAR_PERSONAS[0];

  const createdCampaigns = campaigns.filter((c) => c.isCreatedByMe || !c.joined);
  const joinedCampaigns = campaigns.filter((c) => c.joined);

  const handleCopyLink = (c: Campaign) => {
    const slug = c.slug || c.id;
    const url = `https://kred.link/${slug}/${currentUsername}`;
    navigator.clipboard?.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 1200);
  };

  const handleAppDecision = (appId: string, decision: 'approved' | 'rejected') => {
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: decision } : a))
    );
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateUsername) {
      onUpdateUsername(currentUsername);
    }
    try {
      localStorage.setItem('kred_username', currentUsername);
      localStorage.setItem('kred_display_name', displayName);
      localStorage.setItem('kred_bio', bio);
      localStorage.setItem('kred_socials', JSON.stringify(socials));
    } catch {}
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 1500);
  };

  return (
    <div className="w-full max-w-[940px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 text-left select-none">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Home', icon: 'ti-home', onClick: onBack },
          { label: 'Profile & Settings', icon: 'ti-user', active: true },
        ]}
      />

      {/* Profile Header */}
      <div className="pt-2 pb-6 border-b border-[#27272A] flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 text-center sm:text-left">
        {/* Avatar with Glow Ring */}
        <div className="relative shrink-0">
          <div
            className="w-[100px] h-[100px] rounded-full p-[2px] flex items-center justify-center shadow-lg transition-transform hover:scale-105"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${avatarPalette}, #141414 80%)`,
            }}
          >
            <div className="w-full h-full rounded-full bg-[#121215] flex items-center justify-center overflow-hidden">
              <SmileyAvatar
                paletteId={avatarPalette}
                personaId={currentPersona.id}
                size={94}
              />
            </div>
          </div>
        </div>

        {/* User Info & Quick Stats */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-[26px] font-semibold tracking-tight text-[#F5F3EC]">
                  {displayName}
                </h1>
                <span className="chip py-0.5 px-2 bg-[#C7F26B]/15 text-[#C7F26B] font-mono text-[11px] font-medium">
                  @{currentUsername}
                </span>
              </div>
              <p className="text-[13px] text-[#A1A1AA] mt-1 max-w-[480px]">
                {bio}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-center sm:justify-end gap-2 pt-1 sm:pt-0">
              <button
                type="button"
                onClick={onNavigatePayoutMethods}
                className="pill text-[12px] min-h-[36px] px-3.5 cursor-pointer"
                title="Manage linked bank & payout methods"
              >
                <i className="ti ti-wallet"></i>
                <span>Payouts</span>
              </button>

              <button
                type="button"
                onClick={onNavigateBilling}
                className="pill text-[12px] min-h-[36px] px-3.5 cursor-pointer"
                title="Founder campaign escrow balance"
              >
                <i className="ti ti-receipt"></i>
                <span>Billing</span>
              </button>

              {onNavigateSdk && (
                <button
                  type="button"
                  onClick={onNavigateSdk}
                  className="pill text-[12px] min-h-[36px] px-3.5 cursor-pointer"
                  title="App SDK settings & API keys"
                >
                  <i className="ti ti-key text-[#FAC775]"></i>
                  <span>SDK & Keys</span>
                </button>
              )}

              {onNavigateDocs && (
                <button
                  type="button"
                  onClick={onNavigateDocs}
                  className="pill text-[12px] min-h-[36px] px-3.5 cursor-pointer"
                  title="Developer documentation"
                >
                  <i className="ti ti-book text-[#C7F26B]"></i>
                  <span>Docs</span>
                </button>
              )}

              {onOpenOnboarding && (
                <button
                  type="button"
                  onClick={onOpenOnboarding}
                  className="pill text-[12px] min-h-[36px] px-3 cursor-pointer"
                  title="Replay Onboarding Guide"
                >
                  <i className="ti ti-help"></i>
                  <span>Guide</span>
                </button>
              )}
            </div>
          </div>

          {/* Social Badges Row */}
          <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 flex-wrap">
            {socials.tiktok && (
              <span className="chip text-[11px] py-0.5 px-2 bg-[#1C1C20] text-[#A1A1AA] flex items-center gap-1.5">
                <i className="ti ti-brand-tiktok text-[#EE1D52]"></i>
                <span className="font-mono">{socials.tiktok}</span>
              </span>
            )}
            {socials.youtube && (
              <span className="chip text-[11px] py-0.5 px-2 bg-[#1C1C20] text-[#A1A1AA] flex items-center gap-1.5">
                <i className="ti ti-brand-youtube text-[#FF0000]"></i>
                <span className="font-mono">{socials.youtube}</span>
              </span>
            )}
            {socials.twitter && (
              <span className="chip text-[11px] py-0.5 px-2 bg-[#1C1C20] text-[#A1A1AA] flex items-center gap-1.5">
                <i className="ti ti-brand-x text-white"></i>
                <span className="font-mono">{socials.twitter}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Two Core Tabs: Created (Founder View) vs Joined (Creator Performance) vs Settings */}
      <div className="flex items-center gap-2 border-b border-[#27272A] pb-3 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('created')}
          className={`pill min-h-[40px] px-4 cursor-pointer text-[13px] font-medium ${
            activeTab === 'created' ? 'on' : 'gh text-[#A1A1AA]'
          }`}
        >
          <i className="ti ti-device-mobile"></i>
          <span>Created (Founder Analytics)</span>
          <span className="text-[11px] px-1.5 py-0.2 rounded-full font-mono bg-[#161616]">
            {createdCampaigns.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('joined')}
          className={`pill min-h-[40px] px-4 cursor-pointer text-[13px] font-medium ${
            activeTab === 'joined' ? 'on' : 'gh text-[#A1A1AA]'
          }`}
        >
          <i className="ti ti-link"></i>
          <span>Joined (Creator Performance)</span>
          <span className="text-[11px] px-1.5 py-0.2 rounded-full font-mono bg-[#161616]">
            {joinedCampaigns.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`pill min-h-[40px] px-4 cursor-pointer text-[13px] font-medium ${
            activeTab === 'settings' ? 'on' : 'gh text-[#A1A1AA]'
          }`}
        >
          <i className="ti ti-settings"></i>
          <span>Account & Social Links</span>
        </button>
      </div>

      {/* TAB 1: Created (Founder Analytics View) */}
      {activeTab === 'created' && (
        <div className="space-y-6 animate-[fade-in_0.15s_ease-out]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[16px] font-medium text-[#F5F3EC]">Your Founded Campaigns</div>
              <div className="text-[12px] text-[#A1A1AA]">
                Monitor real-time install attribution, escrow balances, and RavenCore SDK connectivity.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFounderAnalytics(!showFounderAnalytics)}
                className="pill out text-[12px] py-1.5 px-3.5 flex items-center gap-1.5 cursor-pointer font-medium"
              >
                <i className="ti ti-chart-bar text-[#C7F26B]"></i>
                <span>{showFounderAnalytics ? 'Hide Telemetry Charts' : 'View Founder Attribution Charts'}</span>
              </button>
              {onCreateCampaign && (
                <button
                  type="button"
                  onClick={onCreateCampaign}
                  className="pill on text-[12px] py-1.5 px-3.5 flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  <i className="ti ti-plus"></i>
                  <span>Create New</span>
                </button>
              )}
            </div>
          </div>

          {/* Founder Escrow & Telemetry KPI strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#161616] p-4 rounded-[20px] border border-[#2A2A2A] text-left">
            <div>
              <span className="text-[11.5px] text-[#A8A69E] block">Total Escrow Deposited</span>
              <span className="text-[20px] font-semibold font-mono text-[#F5F3EC] mt-0.5 block">$20,000.00</span>
              <span className="text-[10.5px] text-[#C7F26B] font-mono">100% Guaranteed</span>
            </div>
            <div>
              <span className="text-[11.5px] text-[#A8A69E] block">Settled to Creators</span>
              <span className="text-[20px] font-semibold font-mono text-[#C7F26B] mt-0.5 block">$14,580.00</span>
              <span className="text-[10.5px] text-[#A8A69E]">Via RavenCore attestation</span>
            </div>
            <div>
              <span className="text-[11.5px] text-[#A8A69E] block">Verified Mobile Installs</span>
              <span className="text-[20px] font-semibold font-mono text-[#B5D4F4] mt-0.5 block">5,240</span>
              <span className="text-[10.5px] text-[#A8A69E]">Hardware fingerprint checked</span>
            </div>
            <div>
              <span className="text-[11.5px] text-[#A8A69E] block">Active Creators</span>
              <span className="text-[20px] font-semibold font-mono text-[#FAC775] mt-0.5 block">68</span>
              <span className="text-[10.5px] text-[#A8A69E]">Promoting across TikTok & X</span>
            </div>
          </div>

          {/* Expandable Founder Analytics */}
          {showFounderAnalytics && (
            <div className="space-y-4 animate-[fade-in_0.2s_ease-out]">
              <div className="p-1 sm:p-2 bg-[#161616] rounded-[24px] border border-[#2A2A2A]">
                <KredAnalyticsEngine
                  campaigns={campaigns}
                  onNavigateEarnings={onNavigateEarnings}
                />
              </div>
            </div>
          )}

          {/* Founded Campaigns List with Founder Telemetry */}
          <div className="space-y-3">
            {createdCampaigns.map((camp) => (
              <div
                key={camp.id}
                className="card p-4 sm:p-5 bg-[#161616] border border-[#2A2A2A] rounded-[20px] space-y-3.5 text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-[14px] flex items-center justify-center text-[22px] shrink-0"
                      style={{ backgroundColor: camp.bg, color: camp.fg }}
                    >
                      <i className={`ti ${camp.icon}`}></i>
                    </div>
                    <div>
                      <div className="text-[16px] font-semibold text-[#F5F3EC]">{camp.name}</div>
                      <div className="text-[12px] text-[#A8A69E] flex items-center gap-2 mt-0.5">
                        <span>{camp.cat}</span>
                        <span>·</span>
                        <span className="font-mono text-[#C7F26B]">${camp.price} / verified install</span>
                      </div>
                    </div>
                  </div>

                  {/* RavenCore SDK status */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1C1C1C] text-[11px] font-mono border border-[#2A2A2A]">
                    <span className="w-2 h-2 rounded-full bg-[#C7F26B]" />
                    <span className="text-[#C7F26B]">RavenCore Active</span>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#1C1C1C] p-3 rounded-[14px] border border-[#2A2A2A]/40 text-[12px] font-mono">
                  <div>
                    <span className="text-[#A8A69E] block text-[11px]">Active Escrow</span>
                    <span className="text-[#F5F3EC] font-semibold">${camp.budget?.toLocaleString() || '5,000'}</span>
                  </div>
                  <div>
                    <span className="text-[#A8A69E] block text-[11px]">Verified Installs</span>
                    <span className="text-[#C7F26B] font-semibold">{camp.installsVerified || '0'}</span>
                  </div>
                  <div>
                    <span className="text-[#A8A69E] block text-[11px]">Active Creators</span>
                    <span className="text-[#F5F3EC] font-semibold">{camp.creators}</span>
                  </div>
                  <div>
                    <span className="text-[#A8A69E] block text-[11px]">Next Settlement</span>
                    <span className="text-[#B5D4F4] font-semibold">Friday 17:00 UTC</span>
                  </div>
                </div>

                {/* Founder Actions */}
                <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                  <span className="text-[11.5px] text-[#A8A69E] font-mono">
                    Key: {camp.sdkKey || 'kred_live_pixelpop7k2'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setExpandedCreatedId(expandedCreatedId === camp.id ? null : camp.id)}
                      className={`pill text-[12px] py-1 px-3 cursor-pointer font-medium flex items-center gap-1.5 ${
                        expandedCreatedId === camp.id ? 'on' : 'out'
                      }`}
                    >
                      <i className="ti ti-chart-bar text-[#C7F26B]"></i>
                      <span>{expandedCreatedId === camp.id ? 'Hide Graph' : 'Telemetry Graph'}</span>
                    </button>
                    {onNavigateAnalytics && (
                      <button
                        type="button"
                        onClick={() => onNavigateAnalytics(camp.id)}
                        className="pill text-[12px] py-1 px-3 out cursor-pointer font-medium"
                      >
                        <i className="ti ti-activity text-[#B5D4F4]"></i>
                        <span>Attribution</span>
                      </button>
                    )}
                    {onNavigateCampaign && (
                      <button
                        type="button"
                        onClick={() => onNavigateCampaign(camp.id)}
                        className="pill on text-[12px] py-1 px-3 cursor-pointer"
                      >
                        <span>Manage</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pending Creator Applications Review Queue */}
          <div className="card p-5 bg-[#141417] border border-[#27272A] rounded-[20px] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[15px] font-medium text-[#F5F3EC]">Creator Applications Queue</div>
                <div className="text-[12px] text-[#A1A1AA]">
                  Creators requesting access to your approval-required campaigns.
                </div>
              </div>
              <span className="chip text-[11px] py-0.5 px-2 bg-[#FAC775]/20 text-[#FAC775] font-mono">
                {applications.filter((a) => a.status === 'pending').length} pending
              </span>
            </div>

            <div className="space-y-2.5 pt-2">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="p-3.5 bg-[#18181C] rounded-[14px] border border-[#27272A]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[13.5px] text-[#F5F3EC]">{app.creatorName}</span>
                      <span className="chip text-[10.5px] py-0.2 px-2 bg-[#2A2A2A] text-[#A1A1AA] uppercase font-mono">
                        {app.primaryChannel} · {app.followerCount}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#A1A1AA] max-w-[480px]">
                      "{app.pitchNote}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    {app.status === 'pending' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAppDecision(app.id, 'rejected')}
                          className="pill out text-[12px] py-1 px-3 cursor-pointer"
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAppDecision(app.id, 'approved')}
                          className="pill on text-[12px] py-1 px-3 cursor-pointer font-medium"
                        >
                          Approve Creator
                        </button>
                      </>
                    ) : (
                      <span className={`chip text-[11px] py-0.5 px-2.5 font-mono ${
                        app.status === 'approved' ? 'bg-[#C7F26B]/20 text-[#C7F26B]' : 'bg-[#FF8A80]/20 text-[#FF8A80]'
                      }`}>
                        {app.status === 'approved' ? 'Approved' : 'Declined'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Joined (Creator Performance & Payments Analytics) */}
      {activeTab === 'joined' && (
        <div className="space-y-6 animate-[fade-in_0.15s_ease-out]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[16px] font-medium text-[#F5F3EC]">Creator Performance & Payments Analytics</div>
              <div className="text-[12px] text-[#A1A1AA]">
                Track personal shortened link clicks, verified install attestation, and Friday payment settlements.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowCreatorAnalytics(!showCreatorAnalytics)}
                className="pill out text-[12px] py-1.5 px-3.5 flex items-center gap-1.5 cursor-pointer font-medium"
              >
                <i className="ti ti-chart-line text-[#C7F26B]"></i>
                <span>{showCreatorAnalytics ? 'Hide Performance Chart' : 'View Performance Charts'}</span>
              </button>
              {onNavigateEarnings && (
                <button
                  type="button"
                  onClick={onNavigateEarnings}
                  className="pill on text-[12px] py-1.5 px-3.5 flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  <i className="ti ti-wallet"></i>
                  <span>Payouts & Ledger</span>
                </button>
              )}
            </div>
          </div>

          {/* Creator Performance & Payments KPI Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#161616] p-4 rounded-[20px] border border-[#2A2A2A] text-left">
            <div>
              <span className="text-[11.5px] text-[#A8A69E] block">Total Earnings</span>
              <span className="text-[20px] font-semibold font-mono text-[#C7F26B] mt-0.5 block">$648.20</span>
              <span className="text-[10.5px] text-[#A8A69E]">Across joined campaigns</span>
            </div>
            <div>
              <span className="text-[11.5px] text-[#A8A69E] block">Verified Installs</span>
              <span className="text-[20px] font-semibold font-mono text-[#F5F3EC] mt-0.5 block">248</span>
              <span className="text-[10.5px] text-[#C7F26B] font-mono">100% verified</span>
            </div>
            <div>
              <span className="text-[11.5px] text-[#A8A69E] block">Referral Link Clicks</span>
              <span className="text-[20px] font-semibold font-mono text-[#B5D4F4] mt-0.5 block">1,420</span>
              <span className="text-[10.5px] text-[#A8A69E]">17.5% conversion rate</span>
            </div>
            <div>
              <span className="text-[11.5px] text-[#A8A69E] block">Next Settlement</span>
              <span className="text-[20px] font-semibold font-mono text-[#FAC775] mt-0.5 block">Friday</span>
              <span className="text-[10.5px] text-[#A8A69E]">17:00 UTC · $184.50 pending</span>
            </div>
          </div>

          {/* Expandable Creator Performance Analytics */}
          {showCreatorAnalytics && (
            <div className="space-y-4 animate-[fade-in_0.2s_ease-out]">
              <div className="p-1 sm:p-2 bg-[#161616] rounded-[24px] border border-[#2A2A2A]">
                <KredAnalyticsEngine
                  campaigns={campaigns}
                  onNavigateEarnings={onNavigateEarnings}
                />
              </div>
            </div>
          )}

          {/* Joined Campaigns List */}
          <div className="space-y-3">
            {joinedCampaigns.length > 0 ? (
              joinedCampaigns.map((camp) => {
                const slug = camp.slug || camp.id;
                const linkUrl = `kred.link/${slug}/${currentUsername}`;
                const isCardExpanded = expandedJoinedId === camp.id;

                return (
                  <div
                    key={camp.id}
                    className="card p-4 sm:p-5 bg-[#161616] border border-[#2A2A2A] rounded-[20px] space-y-3.5 text-left"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-[14px] flex items-center justify-center text-[22px] shrink-0"
                          style={{ backgroundColor: camp.bg, color: camp.fg }}
                        >
                          <i className={`ti ${camp.icon}`}></i>
                        </div>
                        <div>
                          <div className="text-[16px] font-semibold text-[#F5F3EC]">{camp.name}</div>
                          <div className="text-[12px] text-[#A8A69E] mt-0.5">
                            ${camp.price} per verified install · Guaranteed Escrow
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setExpandedJoinedId(isCardExpanded ? null : camp.id)}
                          className={`pill text-[12px] py-1 px-3 cursor-pointer flex items-center gap-1.5 ${
                            isCardExpanded ? 'on font-medium' : 'out'
                          }`}
                        >
                          <i className="ti ti-chart-bar text-[#C7F26B]"></i>
                          <span>{isCardExpanded ? 'Hide Analytics' : 'Analytics Graph'}</span>
                        </button>
                        {onOpenQr && (
                          <button
                            type="button"
                            onClick={() => onOpenQr(camp)}
                            className="pill text-[12px] py-1 px-3 out cursor-pointer flex items-center gap-1.5"
                          >
                            <i className="ti ti-qrcode text-[#C7F26B]"></i>
                            <span>QR Code</span>
                          </button>
                        )}
                        {onNavigateAnalytics && (
                          <button
                            type="button"
                            onClick={() => onNavigateAnalytics(camp.id)}
                            className="pill text-[12px] py-1 px-3 out cursor-pointer flex items-center gap-1.5"
                          >
                            <i className="ti ti-activity text-[#B5D4F4]"></i>
                            <span>Attribution</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onNavigateCampaign && onNavigateCampaign(camp.id)}
                          className="pill on text-[12px] py-1 px-3 cursor-pointer"
                        >
                          <span>Details</span>
                        </button>
                      </div>
                    </div>

                    {/* Personal Shortened Referral Link Box with 1-click copy */}
                    <div className="p-2.5 pl-3.5 bg-[#1C1C1C] rounded-[14px] border border-[#2A2A2A]/60 flex items-center justify-between gap-2">
                      <span className="font-mono text-[13px] text-[#C7F26B] truncate">
                        {linkUrl}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyLink(camp)}
                        className="pill on text-[11.5px] py-1 px-3 cursor-pointer shrink-0 font-medium"
                      >
                        {copiedSlug === slug ? 'Copied!' : 'Copy Link'}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center bg-[#141417] border border-[#27272A] rounded-[20px] text-[#A1A1AA]">
                <i className="ti ti-speakerphone text-[24px] block mb-2 text-[#71717A]"></i>
                <div className="text-[14px] font-medium text-[#F5F3EC]">No joined campaigns yet</div>
                <div className="text-[12px] mt-1">Join active campaigns from the directory to start earning bounties.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Settings, Social Media Connections & Avatar */}
      {activeTab === 'settings' && (
        <div className="space-y-6 animate-[fade-in_0.15s_ease-out]">
          {/* Account Profile Form */}
          <form onSubmit={handleSaveProfile} className="card p-6 bg-[#141417] border border-[#27272A] rounded-[24px] space-y-4">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
              <div>
                <div className="text-[16px] font-medium text-[#F5F3EC]">Profile & Short Link Handle</div>
                <div className="text-[12px] text-[#A1A1AA]">
                  Your username determines vanity short URLs e.g. <span className="font-mono text-[#C7F26B]">kred.link/app/{currentUsername}</span>
                </div>
              </div>
              <button
                type="submit"
                className="pill on text-[12px] py-1.5 px-4 cursor-pointer font-medium"
              >
                {profileSaved ? 'Saved!' : 'Save changes'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-medium text-[#A1A1AA] mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[#18181C] border border-[#27272A] rounded-[12px] px-3.5 py-2 text-[13.5px] text-[#F5F3EC] focus:outline-none focus:border-[#388BFD]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#A1A1AA] mb-1">
                  Unique Username / Vanity Handle
                </label>
                <div className="flex items-center bg-[#18181C] border border-[#27272A] rounded-[12px] px-3 py-2 text-[13.5px] font-mono">
                  <span className="text-[#71717A]">@</span>
                  <input
                    type="text"
                    value={currentUsername}
                    onChange={(e) => setCurrentUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    className="w-full bg-transparent text-[#F5F3EC] focus:outline-none pl-1"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#A1A1AA] mb-1">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                className="w-full bg-[#18181C] border border-[#27272A] rounded-[12px] p-3 text-[13px] text-[#F5F3EC] focus:outline-none resize-none"
              />
            </div>

            {/* Social Media Link Connections */}
            <div className="pt-2 border-t border-[#27272A] space-y-3">
              <div className="text-[14px] font-medium text-[#F5F3EC]">
                Connected Social Channels
              </div>
              <p className="text-[12px] text-[#A1A1AA]">
                Shown to founders when applying to approval-required campaigns.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="flex items-center gap-2.5 bg-[#18181C] p-2.5 rounded-[12px] border border-[#27272A]">
                  <i className="ti ti-brand-tiktok text-[#EE1D52] text-[18px]"></i>
                  <input
                    type="text"
                    value={socials.tiktok || ''}
                    onChange={(e) => setSocials({ ...socials, tiktok: e.target.value })}
                    placeholder="TikTok handle"
                    className="flex-1 bg-transparent text-[12.5px] font-mono text-[#F5F3EC] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2.5 bg-[#18181C] p-2.5 rounded-[12px] border border-[#27272A]">
                  <i className="ti ti-brand-youtube text-[#FF0000] text-[18px]"></i>
                  <input
                    type="text"
                    value={socials.youtube || ''}
                    onChange={(e) => setSocials({ ...socials, youtube: e.target.value })}
                    placeholder="YouTube channel"
                    className="flex-1 bg-transparent text-[12.5px] font-mono text-[#F5F3EC] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2.5 bg-[#18181C] p-2.5 rounded-[12px] border border-[#27272A]">
                  <i className="ti ti-brand-x text-white text-[18px]"></i>
                  <input
                    type="text"
                    value={socials.twitter || ''}
                    onChange={(e) => setSocials({ ...socials, twitter: e.target.value })}
                    placeholder="Twitter/X handle"
                    className="flex-1 bg-transparent text-[12.5px] font-mono text-[#F5F3EC] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2.5 bg-[#18181C] p-2.5 rounded-[12px] border border-[#27272A]">
                  <i className="ti ti-brand-instagram text-[#E4405F] text-[18px]"></i>
                  <input
                    type="text"
                    value={socials.instagram || ''}
                    onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
                    placeholder="Instagram handle"
                    className="flex-1 bg-transparent text-[12.5px] font-mono text-[#F5F3EC] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </form>

          {/* Avatar Persona & Mood Selector */}
          <div className="card p-6 bg-[#141417] border border-[#27272A] rounded-[24px] space-y-4">
            <div className="text-[16px] font-medium text-[#F5F3EC]">Smiley Avatar Expression & Color</div>
            
            <div className="flex items-center gap-2.5 flex-wrap">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onSelectPalette && onSelectPalette(c)}
                  className={`w-8 h-8 rounded-full border-2 cursor-pointer transition-all ${
                    avatarPalette === c ? 'border-white scale-110 shadow-md' : 'border-transparent opacity-80'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              {AVATAR_PERSONAS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelectMood && onSelectMood(p.id)}
                  className={`p-3 rounded-[14px] border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                    avatarMood === p.id
                      ? 'bg-[#1C1C22] border-[#C7F26B] text-white'
                      : 'bg-[#18181C] border-[#27272A] text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  <SmileyAvatar paletteId={avatarPalette} personaId={p.id} size={28} />
                  <span className="text-[12.5px] font-medium">{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
