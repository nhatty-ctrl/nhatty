import React, { useState } from 'react';
import { EmptyStateCard, SystemBanner, MetricSkeleton, TableSkeleton } from './EnterpriseStates';
import { Breadcrumbs } from '../Breadcrumbs';

interface StatesGalleryViewProps {
  onBack?: () => void;
  onNavigateTab?: (tab: string) => void;
}

interface GalleryItem {
  group: 'Empty' | 'Loading' | 'Errors' | 'System';
  where: string;
  card?: {
    icon: string;
    tone?: 'neutral' | 'accent' | 'warn' | 'error';
    title: string;
    body: string;
    primary?: { label: string; icon?: string; onClick?: () => void };
    secondary?: { label: string; icon?: string; onClick?: () => void };
    requestId?: string;
    compact?: boolean;
  };
  custom?: React.ReactNode;
}

export const StatesGalleryView: React.FC<StatesGalleryViewProps> = ({
  onBack,
  onNavigateTab,
}) => {
  const [activeGroup, setActiveGroup] = useState<'Empty' | 'Loading' | 'Errors' | 'System'>('Empty');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const GALLERY_ITEMS: GalleryItem[] = [
    // Empty Group
    {
      group: 'Empty',
      where: 'Founder · Campaigns',
      card: {
        icon: 'ti-speakerphone',
        title: 'No campaigns yet',
        body: 'Create your first campaign. You choose the in-app event that counts and a hard budget.',
        primary: {
          label: 'Create a campaign',
          icon: 'ti-plus',
          onClick: () => (onNavigateTab ? onNavigateTab('create') : showToast('Navigating to Create Campaign')),
        },
      },
    },
    {
      group: 'Empty',
      where: 'Creator · Joined',
      card: {
        icon: 'ti-link',
        title: 'No joined campaigns yet',
        body: 'Join a campaign to get your tracked link and QR code.',
        primary: {
          label: 'Browse open campaigns',
          onClick: () => (onNavigateTab ? onNavigateTab('campaigns') : showToast('Browsing campaigns')),
        },
      },
    },
    {
      group: 'Empty',
      where: 'Founder · Analytics',
      card: {
        icon: 'ti-chart-bar',
        title: 'No results yet',
        body: 'Results appear after your first qualified outcome. Run the SDK test to confirm events reach Umi.',
        primary: {
          label: 'Test your SDK',
          onClick: () => (onNavigateTab ? onNavigateTab('sdk') : showToast('Opening SDK test')),
        },
        secondary: {
          label: 'Read the docs',
          onClick: () => (onNavigateTab ? onNavigateTab('docs') : showToast('Opening Documentation')),
        },
      },
    },
    {
      group: 'Empty',
      where: 'Founder · SDK keys',
      card: {
        icon: 'ti-key',
        title: 'No keys for this app',
        body: 'Create a public key for your app and a secret key for your server. The secret key never goes in the app.',
        primary: {
          label: 'Create keys',
          icon: 'ti-plus',
          onClick: () => (onNavigateTab ? onNavigateTab('sdk') : showToast('Creating new key pair')),
        },
      },
    },
    {
      group: 'Empty',
      where: 'Creator · Earnings',
      card: {
        icon: 'ti-coin',
        title: 'No earnings yet',
        body: 'Earnings show here once an outcome is confirmed. They are held, then released after review.',
        primary: {
          label: 'Copy your link',
          onClick: () => showToast('Copied tracking link'),
        },
      },
    },
    {
      group: 'Empty',
      where: 'Creator · Payouts',
      card: {
        icon: 'ti-building-bank',
        title: 'Payouts not set up',
        body: 'Connect a payout account to withdraw. Money you earn stays safe until you finish.',
        primary: {
          label: 'Set up payouts',
          onClick: () => (onNavigateTab ? onNavigateTab('payout-methods') : showToast('Setting up payouts')),
        },
      },
    },
    {
      group: 'Empty',
      where: 'Notifications',
      card: {
        icon: 'ti-bell-off',
        title: 'You are all caught up',
        body: 'New approvals, payouts and test results will appear here.',
      },
    },
    {
      group: 'Empty',
      where: 'Settings · Team',
      card: {
        icon: 'ti-users',
        title: 'Just you for now',
        body: 'Invite teammates and give each a role: admin, developer or viewer.',
        primary: {
          label: 'Invite a teammate',
          icon: 'ti-user-plus',
          onClick: () => showToast('Invite modal opened'),
        },
      },
    },
    {
      group: 'Empty',
      where: 'Settings · Audit log',
      card: {
        icon: 'ti-clipboard-list',
        title: 'No activity recorded',
        body: 'Sign-ins, key changes, test runs and campaign edits are logged here with who and when.',
      },
    },
    {
      group: 'Empty',
      where: 'Settings · Webhooks',
      card: {
        icon: 'ti-webhook',
        title: 'No webhook endpoints',
        body: 'Add an endpoint to receive confirmed outcomes and payout events on your server.',
        primary: {
          label: 'Add endpoint',
          onClick: () => showToast('Adding webhook endpoint'),
        },
      },
    },
    {
      group: 'Empty',
      where: 'Billing · Invoices',
      card: {
        icon: 'ti-receipt',
        title: 'No invoices yet',
        body: 'Invoices and receipts appear after your first charge.',
      },
    },
    {
      group: 'Empty',
      where: 'Any list · Search',
      card: {
        icon: 'ti-search-off',
        title: 'No results for “pixel”',
        body: 'Check the spelling or try fewer words.',
        secondary: {
          label: 'Clear search',
          onClick: () => showToast('Search cleared'),
        },
      },
    },
    {
      group: 'Empty',
      where: 'Any list · Filters',
      card: {
        icon: 'ti-filter-off',
        title: 'Nothing matches these filters',
        body: 'Remove a filter to see more campaigns.',
        secondary: {
          label: 'Reset filters',
          onClick: () => showToast('Filters reset'),
        },
      },
    },

    // Loading Group
    {
      group: 'Loading',
      where: 'Analytics · Summary',
      custom: <MetricSkeleton />,
    },
    {
      group: 'Loading',
      where: 'Campaign list, team, audit log',
      custom: <TableSkeleton rows={4} />,
    },

    // Errors Group
    {
      group: 'Errors',
      where: 'Any page · Load failed',
      card: {
        icon: 'ti-alert-circle',
        tone: 'error',
        title: 'We could not load this',
        body: 'Something went wrong on our side. Your data is safe.',
        primary: {
          label: 'Try again',
          icon: 'ti-refresh',
          onClick: () => showToast('Retrying page load…'),
        },
        secondary: {
          label: 'Contact support',
          onClick: () => showToast('Opening support chat'),
        },
        requestId: 'req_8f3k2a',
      },
    },
    {
      group: 'Errors',
      where: 'Any action · Save failed',
      card: {
        icon: 'ti-device-floppy',
        tone: 'error',
        title: 'Changes were not saved',
        body: 'Nothing was changed. Check your connection and try again.',
        primary: {
          label: 'Retry save',
          onClick: () => showToast('Retrying save action…'),
        },
        requestId: 'req_2m9q7c',
        compact: true,
      },
    },
    {
      group: 'Errors',
      where: 'Roles · No access',
      card: {
        icon: 'ti-lock',
        tone: 'warn',
        title: 'You do not have access',
        body: 'Your role is Viewer. Ask an admin to change your role to run SDK tests or edit keys.',
        primary: {
          label: 'Request access',
          onClick: () => showToast('Access request submitted to admin'),
        },
        secondary: {
          label: 'Go back',
          onClick: onBack || (() => showToast('Going back')),
        },
      },
    },
    {
      group: 'Errors',
      where: 'Auth · Session expired',
      card: {
        icon: 'ti-clock-exclamation',
        tone: 'warn',
        title: 'Your session expired',
        body: 'For your security you were signed out after a period of inactivity. Unsaved changes are kept for 10 minutes.',
        primary: {
          label: 'Sign in again',
          onClick: () => showToast('Re-authenticating session…'),
        },
      },
    },
    {
      group: 'Errors',
      where: 'API · Rate limited',
      card: {
        icon: 'ti-gauge',
        tone: 'warn',
        title: 'Too many requests',
        body: 'Please wait 30 seconds before trying again.',
        primary: {
          label: 'Try again in 30s',
          onClick: () => showToast('Rate limit reset in 28s'),
        },
        compact: true,
      },
    },
    {
      group: 'Errors',
      where: 'Routing · 404',
      card: {
        icon: 'ti-map-off',
        title: 'Page not found',
        body: 'The page moved or never existed.',
        primary: {
          label: 'Go to campaigns',
          onClick: () => (onNavigateTab ? onNavigateTab('campaigns') : showToast('Navigating to Campaigns')),
        },
      },
    },
    {
      group: 'Errors',
      where: 'SDK · Disconnected',
      card: {
        icon: 'ti-plug-off',
        tone: 'warn',
        title: 'SDK stopped reporting',
        body: 'No events from your app for 24 hours. Campaigns keep running, but new outcomes will not be counted.',
        primary: {
          label: 'Run the SDK test',
          onClick: () => (onNavigateTab ? onNavigateTab('sdk') : showToast('Opening SDK connection test')),
        },
        secondary: {
          label: 'View status page',
          onClick: () => showToast('Redirecting to status page'),
        },
      },
    },
    {
      group: 'Errors',
      where: 'Payouts · Failed',
      card: {
        icon: 'ti-cash-off',
        tone: 'error',
        title: 'Payout failed',
        body: 'The bank returned the transfer. Your money is safe. Update your payout details and we will retry.',
        primary: {
          label: 'Update payout details',
          onClick: () => (onNavigateTab ? onNavigateTab('payout-methods') : showToast('Updating payout details')),
        },
      },
    },

    // System Group
    {
      group: 'System',
      where: 'App shell · Offline',
      custom: (
        <SystemBanner
          icon="ti-wifi-off"
          tone="warn"
          text="You are offline. Changes will sync when you reconnect."
        />
      ),
    },
    {
      group: 'System',
      where: 'App shell · Degraded service',
      custom: (
        <SystemBanner
          icon="ti-alert-triangle"
          tone="warn"
          text="Payouts are delayed. We are working on it."
          action={{
            label: 'View status',
            onClick: () => showToast('Opening Umi system health status'),
          }}
        />
      ),
    },
    {
      group: 'System',
      where: 'Billing · Past due',
      custom: (
        <SystemBanner
          icon="ti-credit-card-off"
          tone="error"
          text="Your last payment failed. Campaigns pause on Oct 17."
          action={{
            label: 'Update card',
            onClick: () => (onNavigateTab ? onNavigateTab('billing') : showToast('Opening billing cards')),
          }}
        />
      ),
    },
    {
      group: 'System',
      where: 'App shell · New version',
      custom: (
        <SystemBanner
          icon="ti-refresh"
          tone="accent"
          text="A new version is available."
          action={{
            label: 'Reload',
            onClick: () => showToast('App refreshed with v2.4.1 assets'),
          }}
        />
      ),
    },
    {
      group: 'System',
      where: 'Whole app · Maintenance',
      card: {
        icon: 'ti-tools',
        title: 'Back soon',
        body: 'Scheduled maintenance until 14:00 UTC. Campaigns and tracking keep running.',
        secondary: {
          label: 'View status page',
          onClick: () => showToast('Opening status page'),
        },
      },
    },
  ];

  const GROUPS: Array<'Empty' | 'Loading' | 'Errors' | 'System'> = ['Empty', 'Loading', 'Errors', 'System'];
  const currentItems = GALLERY_ITEMS.filter((item) => item.group === activeGroup);

  return (
    <div className="min-h-screen bg-black text-[#F4F2EC] select-none text-left">
      {/* Toast Feedback */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-[#141414] border border-[#C9B8FF] text-[#F4F2EC] px-4 py-2.5 rounded-full text-[13px] shadow-2xl flex items-center gap-2 animate-[fade-in_0.15s_ease-out]">
          <i className="ti ti-circle-check text-[#C9B8FF]"></i>
          <span>{toast}</span>
        </div>
      )}

      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        {/* Breadcrumb with Back Navigation */}
        <Breadcrumbs
          items={[
            {
              label: 'Campaigns',
              icon: 'ti-speakerphone',
              onClick: onBack || (() => onNavigateTab && onNavigateTab('campaigns')),
            },
            { label: 'States Gallery', icon: 'ti-cube', active: true },
          ]}
        />

        {/* Gallery Headline */}
        <div>
          <p className="text-[12px] tracking-[0.12em] uppercase text-[#9C9A92] font-semibold m-0">
            Enterprise design system
          </p>
          <h1 className="font-serif font-medium tracking-[-1px] text-[36px] sm:text-[44px] leading-[1.05] mt-2 mb-2 text-[#F4F2EC]">
            States gallery
          </h1>
          <p className="text-[15px] text-[#B8B6AE] max-w-[640px] m-0 leading-relaxed">
            Every empty, loading, error, and system state built from unified components so they all read and interact with the same enterprise fidelity.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 pt-2" role="tablist">
          {GROUPS.map((g) => {
            const count = GALLERY_ITEMS.filter((i) => i.group === g).length;
            const isActive = activeGroup === g;
            return (
              <button
                key={g}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveGroup(g)}
                className={`pill ${isActive ? 'on font-semibold' : 'out hover:bg-[#1B1B1B]'}`}
              >
                <span>{g}</span>
              </button>
            );
          })}
        </div>

        {/* States Cards 2-Column Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start pt-2">
          {currentItems.map((item, idx) => (
            <div key={`${item.where}-${idx}`} className="space-y-2">
              <div className="text-[11.5px] tracking-[0.1em] uppercase text-[#6F6D66] font-mono pl-1">
                {item.where}
              </div>
              {item.card ? (
                <EmptyStateCard
                  {...item.card}
                  compact={item.card.compact ?? true}
                />
              ) : (
                item.custom
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
