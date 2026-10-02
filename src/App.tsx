import React, { useState, useEffect, useCallback } from 'react';
import { Campaign } from './types/campaign';
import { INITIAL_CAMPAIGNS, linkOf } from './data/campaigns';
import { Header } from './components/Header';
import { CampaignsList } from './components/CampaignsList';
import { DiscoverView } from './components/DiscoverView';
import { CampaignDetail } from './components/CampaignDetail';
import { CampaignAnalyticsView } from './components/CampaignAnalyticsView';
import { EarningsView } from './components/EarningsView';
import { ProfileView } from './components/ProfileView';
import { CreateCampaignView } from './components/CreateCampaignView';
import { PayoutMethodsView } from './components/PayoutMethodsView';
import { BillingView } from './components/BillingView';
import { NotificationSettingsView } from './components/NotificationSettingsView';
import { QrCodeModal } from './components/QrCodeModal';
import { JoinedSuccessModal } from './components/JoinedSuccessModal';
import { Toast } from './components/Toast';
import { Confetti } from './components/Confetti';
import {
  DEFAULT_AVATAR_PALETTE,
  DEFAULT_AVATAR_MOOD,
} from './components/SmileyAvatar';
import { INITIAL_NOTIFICATIONS } from './components/NotificationsDropdown';
import { UserRole } from './types/campaign';

const STORAGE_KEY = 'kred_campaigns_app_v11';

export default function App() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.campaigns) && parsed.campaigns.length > 0) {
          return parsed.campaigns;
        }
      }
    } catch (e) {
      console.warn('Failed to load campaigns from storage', e);
    }
    return INITIAL_CAMPAIGNS;
  });

  // Account balances
  const [balance, setBalance] = useState(248.6);
  const [campaignBalance, setCampaignBalance] = useState(3420.0);

  // Avatar customization
  const [avatarPalette, setAvatarPalette] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('kred_avatar_palette');
      if (stored && stored.startsWith('#')) return stored;
      return DEFAULT_AVATAR_PALETTE;
    } catch {
      return DEFAULT_AVATAR_PALETTE;
    }
  });

  const [avatarMood, setAvatarMood] = useState<string>(() => {
    try {
      return localStorage.getItem('kred_avatar_mood') || DEFAULT_AVATAR_MOOD;
    } catch {
      return DEFAULT_AVATAR_MOOD;
    }
  });

  const handleSelectPalette = (pal: string) => {
    setAvatarPalette(pal);
    try {
      localStorage.setItem('kred_avatar_palette', pal);
    } catch {}
  };

  const handleSelectMood = (mood: string) => {
    setAvatarMood(mood);
    try {
      localStorage.setItem('kred_avatar_mood', mood);
    } catch {}
  };

  // User Role Workspace (Finding 8 & 10)
  const [userRole, setUserRole] = useState<UserRole>('creator');

  // Navigation tab states
  const [currentTab, setCurrentTab] = useState<
    'campaigns' | 'discover' | 'earnings' | 'analytics' | 'profile' | 'create' | 'payout-methods' | 'billing' | 'notification-settings'
  >('campaigns');
  const [filterTab, setFilterTab] = useState<'open' | 'joined'>('open');
  const [activeDetailId, setActiveDetailId] = useState<string | null>(null);
  const [activeAnalyticsId, setActiveAnalyticsId] = useState<string | null>(null);

  // Notifications read map
  const [readMap, setReadMap] = useState<Record<number, boolean>>({
    3: true,
    4: true,
    8: true,
  });

  const handleMarkRead = (id: number) => {
    setReadMap((prev) => ({ ...prev, [id]: true }));
  };

  const handleMarkAllRead = () => {
    const next: Record<number, boolean> = {};
    INITIAL_NOTIFICATIONS.forEach((n) => {
      next[n.id] = true;
    });
    setReadMap(next);
    setToastMessage('All notifications marked as read');
  };

  // Badge count strictly scoped to the active role (Finding 8)
  const creatorUnread = INITIAL_NOTIFICATIONS.filter((n) => n.r === 'creator' && !readMap[n.id]).length;
  const founderUnread = INITIAL_NOTIFICATIONS.filter((n) => n.r === 'founder' && !readMap[n.id]).length;
  const unreadCount = userRole === 'creator' ? creatorUnread : founderUnread;

  // Modals & Feedback
  const [qrCampaign, setQrCampaign] = useState<Campaign | null>(null);
  const [justJoinedCampaign, setJustJoinedCampaign] = useState<Campaign | null>(null);
  const [isFreshJoin, setIsFreshJoin] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confettiOrigin, setConfettiOrigin] = useState<{ x: number; y: number } | null>(null);
  const [confettiColors, setConfettiColors] = useState<string[] | undefined>(undefined);

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          campaigns,
        })
      );
    } catch (e) {
      console.warn('Failed to save state to localStorage', e);
    }
  }, [campaigns]);

  // Handle URL Hash Routing (Direct to page, no overlay display!)
  const parseHash = useCallback(() => {
    const hash = window.location.hash || '#/';
    if (hash.startsWith('#/analytics/')) {
      const id = hash.replace('#/analytics/', '');
      setActiveAnalyticsId(id);
      setActiveDetailId(null);
      setCurrentTab('analytics');
    } else if (hash.startsWith('#/analytics')) {
      setActiveAnalyticsId(null);
      setActiveDetailId(null);
      setCurrentTab('analytics');
    } else if (hash.startsWith('#/c/')) {
      const id = hash.replace('#/c/', '');
      setActiveDetailId(id);
      setActiveAnalyticsId(null);
    } else if (hash.startsWith('#/create')) {
      setActiveDetailId(null);
      setActiveAnalyticsId(null);
      setCurrentTab('create');
    } else if (hash.startsWith('#/discover')) {
      setActiveDetailId(null);
      setActiveAnalyticsId(null);
      setCurrentTab('discover');
    } else if (hash.startsWith('#/earnings')) {
      setActiveDetailId(null);
      setActiveAnalyticsId(null);
      setCurrentTab('earnings');
    } else if (hash.startsWith('#/payout-methods')) {
      setActiveDetailId(null);
      setActiveAnalyticsId(null);
      setCurrentTab('payout-methods');
    } else if (hash.startsWith('#/billing')) {
      setActiveDetailId(null);
      setActiveAnalyticsId(null);
      setCurrentTab('billing');
    } else if (hash.startsWith('#/notification-settings')) {
      setActiveDetailId(null);
      setActiveAnalyticsId(null);
      setCurrentTab('notification-settings');
    } else if (hash.startsWith('#/profile')) {
      setActiveDetailId(null);
      setActiveAnalyticsId(null);
      setCurrentTab('profile');
    } else {
      setActiveDetailId(null);
      setActiveAnalyticsId(null);
      setCurrentTab('campaigns');
    }
  }, []);

  useEffect(() => {
    parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  }, [parseHash]);

  const handleNavigateTab = (
    tab: 'campaigns' | 'discover' | 'earnings' | 'analytics' | 'profile' | 'create' | 'payout-methods' | 'billing' | 'notification-settings'
  ) => {
    setActiveDetailId(null);
    setActiveAnalyticsId(null);
    setCurrentTab(tab);
    if (tab === 'discover') {
      window.location.hash = '#/discover';
    } else if (tab === 'earnings') {
      window.location.hash = '#/earnings';
    } else if (tab === 'analytics') {
      window.location.hash = '#/analytics';
    } else if (tab === 'payout-methods') {
      window.location.hash = '#/payout-methods';
    } else if (tab === 'billing') {
      window.location.hash = '#/billing';
    } else if (tab === 'notification-settings') {
      window.location.hash = '#/notification-settings';
    } else if (tab === 'profile') {
      window.location.hash = '#/profile';
    } else if (tab === 'create') {
      window.location.hash = '#/create';
    } else {
      window.location.hash = '#/';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateDetail = (id: string) => {
    setActiveAnalyticsId(null);
    setActiveDetailId(id);
    window.location.hash = `#/c/${id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateAnalytics = (id: string) => {
    setActiveDetailId(null);
    setActiveAnalyticsId(id);
    window.location.hash = `#/analytics/${id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromDetail = () => {
    setActiveDetailId(null);
    setActiveAnalyticsId(null);
    window.location.hash =
      currentTab === 'discover'
        ? '#/discover'
        : currentTab === 'earnings'
        ? '#/earnings'
        : currentTab === 'profile'
        ? '#/profile'
        : currentTab === 'create'
        ? '#/create'
        : '#/';
  };

  // Join Campaign Flow
  const handleJoin = (campaign: Campaign, targetEl?: HTMLElement) => {
    const isNowJoined = !campaign.joined;

    if (isNowJoined) {
      setConfettiColors([
        campaign.bg || '#C7F26B',
        '#ffffff',
        campaign.fg || '#16140F',
        '#C7F26B',
      ]);

      if (targetEl) {
        const rect = targetEl.getBoundingClientRect();
        setConfettiOrigin({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      } else {
        setConfettiOrigin({
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        });
      }

      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === campaign.id
            ? { ...c, joined: true, creators: c.creators + 1 }
            : c
        )
      );

      setIsFreshJoin(true);
      setJustJoinedCampaign(campaign);
      setToastMessage(`Joined ${campaign.name}. Tracking link ready.`);
    } else {
      setJustJoinedCampaign(null);
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === campaign.id
            ? { ...c, joined: false, creators: Math.max(1, c.creators - 1) }
            : c
        )
      );
      setToastMessage(`Left ${campaign.name}.`);
    }
  };

  // Copy Link Handler
  const handleCopyLink = async (campaign: Campaign) => {
    const url = `https://${linkOf(campaign)}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setToastMessage('Tracking link copied to clipboard');
    } catch {
      setToastMessage(`Link: ${linkOf(campaign)}`);
    }
  };

  // Create Campaign Callback
  const handleCreateCampaign = (newCamp: Campaign) => {
    setCampaigns((prev) => [newCamp, ...prev]);
    setToastMessage(`Campaign published. Live in marketplace.`);
  };

  // Withdraw simulation
  const handleExecuteWithdraw = () => {
    if (balance <= 0) {
      setToastMessage('No available balance to withdraw');
      return;
    }
    const amountStr = `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    setBalance(0);
    setToastMessage(`Withdrawal of ${amountStr} scheduled for Friday settlement`);
  };

  // Add funds simulation
  const handleExecuteAddFunds = (amount: number) => {
    setCampaignBalance((prev) => prev + amount);
    setToastMessage(`Funded $${amount.toLocaleString('en-US')} to campaign balance`);
  };

  const activeCampaign = activeDetailId
    ? campaigns.find((c) => c.id === activeDetailId) || null
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0B0B] text-[#F5F3EC] relative overflow-x-hidden selection:bg-[#C7F26B]/30 selection:text-white">
      {/* Edge-to-Edge Topbar: spans corner-to-corner */}
      <Header
        currentTab={currentTab}
        onNavigate={handleNavigateTab}
        onNavigateCampaign={handleNavigateDetail}
        avatarPalette={avatarPalette}
        avatarMood={avatarMood}
        unreadCount={unreadCount}
        readMap={readMap}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
        balance={balance}
        userRole={userRole}
        onRoleChange={setUserRole}
      />

      {/* Main Full-Width Content Container */}
      <main className="flex-1 pb-20 sm:pb-12">
        {activeCampaign ? (
          /* Campaign Detail View */
          <CampaignDetail
            campaign={activeCampaign}
            allCampaigns={campaigns}
            onJoin={handleJoin}
            onOpenQr={(c) => {
              setIsFreshJoin(false);
              setQrCampaign(c);
            }}
            onCopyLink={handleCopyLink}
            onShare={() => handleCopyLink(activeCampaign)}
            onNavigateDetail={handleNavigateDetail}
            onNavigateAnalytics={handleNavigateAnalytics}
            onNavigateEarnings={() => handleNavigateTab('earnings')}
            onBack={handleBackFromDetail}
            isOwner={userRole === 'founder' || !activeCampaign.joined}
          />
        ) : currentTab === 'payout-methods' ? (
          /* Dedicated Payout Methods Page */
          <PayoutMethodsView
            onBack={() => handleNavigateTab('profile')}
            availableBalance={balance}
            onInitiateWithdraw={handleExecuteWithdraw}
          />
        ) : currentTab === 'billing' ? (
          /* Dedicated Billing Page */
          <BillingView
            onBack={() => handleNavigateTab('profile')}
            balance={campaignBalance}
            onAddFunds={handleExecuteAddFunds}
          />
        ) : currentTab === 'notification-settings' ? (
          /* Dedicated Notification Settings Page */
          <NotificationSettingsView
            onBack={() => handleNavigateTab('profile')}
          />
        ) : currentTab === 'analytics' ? (
          /* DEDICATED Campaign Analytics for specific app */
          <CampaignAnalyticsView
            campaigns={campaigns}
            initialCampaignId={activeAnalyticsId}
            onNavigateCampaign={handleNavigateDetail}
            onBack={() => handleNavigateTab('profile')}
            onCreateCampaign={() => handleNavigateTab('create')}
            onNavigateEarnings={() => handleNavigateTab('earnings')}
          />
        ) : currentTab === 'earnings' ? (
          /* DEDICATED Earnings Page */
          <EarningsView
            campaigns={campaigns}
            onNavigateCampaign={handleNavigateDetail}
            onBack={() => handleNavigateTab('campaigns')}
            onWithdraw={() => handleNavigateTab('payout-methods')}
            onBrowseCampaigns={() => handleNavigateTab('campaigns')}
          />
        ) : currentTab === 'create' ? (
          /* Create Campaign Flow */
          <CreateCampaignView
            onBack={() => handleNavigateTab('campaigns')}
            onCreate={handleCreateCampaign}
          />
        ) : currentTab === 'discover' ? (
          /* Discover View */
          <DiscoverView
            campaigns={campaigns}
            onJoin={handleJoin}
            onNavigateDetail={handleNavigateDetail}
          />
        ) : currentTab === 'profile' ? (
          /* Profile & App Analytics Launcher */
          <ProfileView
            onBack={() => handleNavigateTab('campaigns')}
            campaigns={campaigns}
            onNavigateCampaign={handleNavigateDetail}
            onNavigateAnalytics={handleNavigateAnalytics}
            onNavigatePayoutMethods={() => handleNavigateTab('payout-methods')}
            onNavigateBilling={() => handleNavigateTab('billing')}
            onNavigateNotificationSettings={() => handleNavigateTab('notification-settings')}
            onCreateCampaign={() => handleNavigateTab('create')}
            avatarPalette={avatarPalette}
            avatarMood={avatarMood}
            onSelectPalette={handleSelectPalette}
            onSelectMood={handleSelectMood}
          />
        ) : (
          /* Campaigns Marketplace List */
          <CampaignsList
            campaigns={campaigns}
            filterTab={filterTab}
            setFilterTab={setFilterTab}
            onJoin={handleJoin}
            onOpenQr={(c) => {
              setIsFreshJoin(false);
              setQrCampaign(c);
            }}
            onCopyLink={handleCopyLink}
            onShare={() => {}}
            onNavigateDetail={handleNavigateDetail}
            onNavigateAnalytics={handleNavigateAnalytics}
          />
        )}
      </main>

      {/* Mobile Bottom Tab Bar with Role-Aware Destinations (Finding 10 & 18) */}
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0E0E0E]/95 backdrop-blur-md border-t border-[#2A2A2A] px-2 py-1.5 flex items-center justify-around select-none"
        aria-label="Mobile Navigation"
      >
        <button
          onClick={() => handleNavigateTab('campaigns')}
          className={`flex flex-col items-center gap-1 py-1 px-3 border-0 bg-transparent cursor-pointer min-h-[44px] justify-center ${
            currentTab === 'campaigns' ? 'text-[#F5F3EC]' : 'text-[#9A9892]'
          }`}
        >
          <i className="ti ti-speakerphone text-[18px]"></i>
          <span className="text-[10px] font-medium">Campaigns</span>
        </button>

        <button
          onClick={() => handleNavigateTab('discover')}
          className={`flex flex-col items-center gap-1 py-1 px-3 border-0 bg-transparent cursor-pointer min-h-[44px] justify-center ${
            currentTab === 'discover' ? 'text-[#F5F3EC]' : 'text-[#9A9892]'
          }`}
        >
          <i className="ti ti-compass text-[18px]"></i>
          <span className="text-[10px] font-medium">Discover</span>
        </button>

        {userRole === 'creator' ? (
          <button
            onClick={() => handleNavigateTab('earnings')}
            className={`flex flex-col items-center gap-1 py-1 px-3 border-0 bg-transparent cursor-pointer min-h-[44px] justify-center ${
              currentTab === 'earnings' ? 'text-[#F5F3EC]' : 'text-[#9A9892]'
            }`}
          >
            <i className="ti ti-coin text-[18px]"></i>
            <span className="text-[10px] font-medium">Earnings</span>
          </button>
        ) : (
          <button
            onClick={() => handleNavigateTab('create')}
            className={`flex flex-col items-center gap-1 py-1 px-3 border-0 bg-transparent cursor-pointer min-h-[44px] justify-center ${
              currentTab === 'create' ? 'text-[#F5F3EC]' : 'text-[#9A9892]'
            }`}
          >
            <i className="ti ti-plus text-[18px]"></i>
            <span className="text-[10px] font-medium">Create</span>
          </button>
        )}

        <button
          onClick={() => handleNavigateTab('profile')}
          className={`flex flex-col items-center gap-1 py-1 px-3 border-0 bg-transparent cursor-pointer min-h-[44px] justify-center ${
            currentTab === 'profile' ? 'text-[#F5F3EC]' : 'text-[#9A9892]'
          }`}
        >
          <i className="ti ti-user text-[18px]"></i>
          <span className="text-[10px] font-medium">Profile</span>
        </button>
      </nav>

      {/* Immediate Post-Join Modal surfacing link and scannable QR (Finding 11) */}
      <JoinedSuccessModal
        campaign={justJoinedCampaign}
        isOpen={!!justJoinedCampaign}
        onClose={() => setJustJoinedCampaign(null)}
        onCopyLink={handleCopyLink}
        onViewCampaign={handleNavigateDetail}
      />

      {/* QR Code Modal */}
      <QrCodeModal
        campaign={qrCampaign}
        isOpen={!!qrCampaign}
        onClose={() => setQrCampaign(null)}
        onCopy={handleCopyLink}
        onShare={() => {}}
        isFreshJoin={isFreshJoin}
      />

      <Confetti
        origin={confettiOrigin}
        colors={confettiColors}
        onComplete={() => {
          setConfettiOrigin(null);
          setConfettiColors(undefined);
        }}
      />

      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
