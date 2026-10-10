import React, { useState, useEffect } from 'react';
import { Breadcrumbs } from './Breadcrumbs';

interface SettingsViewProps {
  onBack: () => void;
  onNavigatePayoutMethods?: () => void;
  initialTab?: 'account' | 'preferences' | 'payment';
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onBack,
  onNavigatePayoutMethods,
  initialTab = 'account',
}) => {
  const [activeTab, setActiveTab] = useState<'account' | 'preferences' | 'payment'>(initialTab);

  // Profile Account state (Screenshot 1: Amara Bekele)
  const [firstName, setFirstName] = useState(() => localStorage.getItem('kred_fname') || 'Amara');
  const [lastName, setLastName] = useState(() => localStorage.getItem('kred_lname') || 'Bekele');
  const [username, setUsername] = useState(() => localStorage.getItem('kred_uname') || '@amara');
  const [bio, setBio] = useState(() => localStorage.getItem('kred_bio') || '');
  const [instagram, setInstagram] = useState(() => localStorage.getItem('kred_instagram') || 'instagram.com/');
  const [tiktok, setTiktok] = useState(() => localStorage.getItem('kred_tiktok') || 'tiktok.com/@');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // Preferences Display & Notification state (Screenshot 2)
  const [compactCards, setCompactCards] = useState(() => {
    return localStorage.getItem('kred_pref_compact') === 'true';
  });
  const [reduceMotion, setReduceMotion] = useState(() => {
    return localStorage.getItem('kred_pref_motion') === 'true';
  });
  const [campaignUpdates, setCampaignUpdates] = useState(() => {
    return localStorage.getItem('kred_pref_updates') !== 'false';
  });
  const [newRecs, setNewRecs] = useState(() => {
    return localStorage.getItem('kred_pref_recs') !== 'false';
  });
  const [creatorMessages, setCreatorMessages] = useState(() => {
    return localStorage.getItem('kred_pref_msgs') === 'true';
  });
  const [payoutAlerts, setPayoutAlerts] = useState(() => {
    return localStorage.getItem('kred_pref_payouts') !== 'false';
  });

  // Payment tab state (Screenshot 3)
  const [defaultPayoutMethod, setDefaultPayoutMethod] = useState(() => {
    return localStorage.getItem('kred_default_payout') || 'Bank account •••• 4821';
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(() => {
    return localStorage.getItem('kred_2fa') === 'true';
  });
  const [passkeysCount, setPasskeysCount] = useState(() => {
    return parseInt(localStorage.getItem('kred_passkeys_count') || '0', 10);
  });
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('kred_fname', firstName);
      localStorage.setItem('kred_lname', lastName);
      localStorage.setItem('kred_uname', username);
      localStorage.setItem('kred_bio', bio);
      localStorage.setItem('kred_instagram', instagram);
      localStorage.setItem('kred_tiktok', tiktok);
    } catch {}
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  const handleTogglePref = (
    key: string,
    setter: React.Dispatch<React.SetStateAction<boolean>>,
    val: boolean
  ) => {
    const next = !val;
    setter(next);
    try {
      localStorage.setItem(key, String(next));
    } catch {}
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2000);
  };

  return (
    <div className="w-full max-w-[1040px] mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Campaigns', icon: 'ti-speakerphone', onClick: onBack },
          { label: 'Settings', icon: 'ti-settings', active: true },
        ]}
      />

      {/* Header section from Screenshots */}
      <div className="space-y-1">
        <div className="text-[11px] font-mono tracking-wider uppercase text-[#388BFD]">
          WORKSPACE
        </div>
        <h1 className="text-[34px] sm:text-[38px] font-serif tracking-tight text-[#F4F2EC]">
          Settings
        </h1>
        <p className="text-[14px] text-[#9C9A92]">
          Manage your profile, preferences, and account access.
        </p>
      </div>

      {/* Segmented Underline Tabs: Account | Preferences | Payment (matching Screenshots) */}
      <div className="border-b border-[#222222] flex items-center gap-6 text-[14px]">
        <button
          type="button"
          onClick={() => setActiveTab('account')}
          className={`pb-3 font-medium transition-colors cursor-pointer relative ${
            activeTab === 'account'
              ? 'text-[#F4F2EC]'
              : 'text-[#9C9A92] hover:text-[#F4F2EC]'
          }`}
        >
          <span>Account</span>
          {activeTab === 'account' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#388BFD] rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preferences')}
          className={`pb-3 font-medium transition-colors cursor-pointer relative ${
            activeTab === 'preferences'
              ? 'text-[#F4F2EC]'
              : 'text-[#9C9A92] hover:text-[#F4F2EC]'
          }`}
        >
          <span>Preferences</span>
          {activeTab === 'preferences' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#388BFD] rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('payment')}
          className={`pb-3 font-medium transition-colors cursor-pointer relative ${
            activeTab === 'payment'
              ? 'text-[#F4F2EC]'
              : 'text-[#9C9A92] hover:text-[#F4F2EC]'
          }`}
        >
          <span>Payment</span>
          {activeTab === 'payment' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#388BFD] rounded-full" />
          )}
        </button>
      </div>

      {/* Save Notice Banner */}
      {isSavedNotice && (
        <div className="p-3 bg-[#141414] border border-[#388BFD]/50 rounded-[14px] text-[13px] text-[#F4F2EC] flex items-center gap-2 animate-[fade-in_0.15s_ease-out]">
          <i className="ti ti-check text-[#388BFD]"></i>
          <span>Settings saved successfully.</span>
        </div>
      )}

      {/* TAB 1: ACCOUNT (SCREENSHOT 1) */}
      {activeTab === 'account' && (
        <div className="space-y-6 animate-[fade-in_0.15s_ease-out]">
          <div>
            <h2 className="text-[20px] font-serif font-medium text-[#F4F2EC]">
              Your Profile
            </h2>
            <p className="text-[13px] text-[#9C9A92] mt-0.5">
              Keep the profile shown on campaign applications up to date.
            </p>
          </div>

          <form onSubmit={handleSaveAccount} className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-8 items-start">
              {/* Form inputs left */}
              <div className="space-y-4">
                {/* First name & Last name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[12.5px] text-[#9C9A92] block mb-1.5" htmlFor="first-name">
                      First name
                    </label>
                    <input
                      id="first-name"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full h-[44px] bg-[#0E0E0E] border border-[#222] rounded-[12px] px-3.5 text-[14px] text-[#F4F2EC] focus:border-[#388BFD] outline-none transition-colors"
                      placeholder="Amara"
                    />
                  </div>
                  <div>
                    <label className="text-[12.5px] text-[#9C9A92] block mb-1.5" htmlFor="last-name">
                      Last name
                    </label>
                    <input
                      id="last-name"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full h-[44px] bg-[#0E0E0E] border border-[#222] rounded-[12px] px-3.5 text-[14px] text-[#F4F2EC] focus:border-[#388BFD] outline-none transition-colors"
                      placeholder="Bekele"
                    />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="text-[12.5px] text-[#9C9A92] block mb-1.5" htmlFor="user-name">
                    Username
                  </label>
                  <input
                    id="user-name"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-[44px] bg-[#0E0E0E] border border-[#222] rounded-[12px] px-3.5 text-[14px] text-[#F4F2EC] focus:border-[#388BFD] outline-none transition-colors"
                    placeholder="@amara"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="text-[12.5px] text-[#9C9A92] block mb-1.5" htmlFor="user-bio">
                    Bio
                  </label>
                  <textarea
                    id="user-bio"
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-[#0E0E0E] border border-[#222] rounded-[12px] p-3.5 text-[14px] text-[#F4F2EC] focus:border-[#388BFD] outline-none transition-colors resize-y"
                    placeholder="Share a little about your background and interests."
                  />
                </div>

                {/* Social media links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[12.5px] text-[#9C9A92] block mb-1.5" htmlFor="user-ig">
                      Instagram
                    </label>
                    <input
                      id="user-ig"
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="w-full h-[44px] bg-[#0E0E0E] border border-[#222] rounded-[12px] px-3.5 text-[14px] text-[#F4F2EC] focus:border-[#388BFD] outline-none transition-colors"
                      placeholder="instagram.com/"
                    />
                  </div>
                  <div>
                    <label className="text-[12.5px] text-[#9C9A92] block mb-1.5" htmlFor="user-tiktok">
                      TikTok
                    </label>
                    <input
                      id="user-tiktok"
                      type="text"
                      value={tiktok}
                      onChange={(e) => setTiktok(e.target.value)}
                      className="w-full h-[44px] bg-[#0E0E0E] border border-[#222] rounded-[12px] px-3.5 text-[14px] text-[#F4F2EC] focus:border-[#388BFD] outline-none transition-colors"
                      placeholder="tiktok.com/@"
                    />
                  </div>
                </div>
              </div>

              {/* Avatar picture side (Screenshot 1) */}
              <div className="flex flex-col items-center justify-center p-6 bg-[#121212] rounded-[20px] border border-[#222] text-center space-y-3.5">
                <div className="w-[84px] h-[84px] rounded-full bg-[#388BFD] text-white flex items-center justify-center text-[34px] shadow-md">
                  <i className="ti ti-user" aria-hidden="true"></i>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Photo upload dialog (PNG or JPG under 2MB supported)')}
                  className="px-4 py-2 bg-[#222] hover:bg-[#2c2c2c] text-[#F4F2EC] text-[13px] font-medium rounded-full cursor-pointer transition-colors border border-[#333]"
                >
                  Change picture
                </button>
                <div className="text-[11.5px] text-[#777]">
                  JPG or PNG · 2 MB max
                </div>
              </div>
            </div>

            {/* Bottom action buttons */}
            <div className="flex items-center gap-3 pt-3">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#388BFD] hover:bg-[#2f75d3] text-white text-[13.5px] font-medium rounded-full cursor-pointer transition-colors shadow-sm"
              >
                Save changes
              </button>
              <button
                type="button"
                onClick={onBack}
                className="px-5 py-2.5 bg-[#141414] hover:bg-[#252525] text-[#F4F2EC] text-[13.5px] rounded-full cursor-pointer transition-colors border border-[#222222]"
              >
                Back to campaigns
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: PREFERENCES (SCREENSHOT 2) */}
      {activeTab === 'preferences' && (
        <div className="space-y-6 animate-[fade-in_0.15s_ease-out]">
          {/* Card 1: Display */}
          <div className="bg-[#121212] border border-[#222] rounded-[20px] p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="text-[17px] font-medium text-[#F4F2EC]">Display</h2>
              <p className="text-[12.5px] text-[#9C9A92] mt-0.5">Choose how KRED should look and feel.</p>
            </div>

            <div className="space-y-4 pt-1">
              {/* Compact campaign cards */}
              <div className="flex items-center justify-between gap-4 pt-3 border-t border-[#1F1F1F]">
                <div>
                  <div className="text-[13.5px] font-medium text-[#F4F2EC]">Compact campaign cards</div>
                  <div className="text-[12px] text-[#9C9A92]">Keep more campaigns visible at once.</div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={compactCards}
                  onClick={() => handleTogglePref('kred_pref_compact', setCompactCards, compactCards)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    compactCards ? 'bg-[#388BFD]' : 'bg-[#222222]'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      compactCards ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Reduce motion */}
              <div className="flex items-center justify-between gap-4 pt-3 border-t border-[#1F1F1F]">
                <div>
                  <div className="text-[13.5px] font-medium text-[#F4F2EC]">Reduce motion</div>
                  <div className="text-[12px] text-[#9C9A92]">Use calmer transitions across the app.</div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={reduceMotion}
                  onClick={() => handleTogglePref('kred_pref_motion', setReduceMotion, reduceMotion)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    reduceMotion ? 'bg-[#388BFD]' : 'bg-[#222222]'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      reduceMotion ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Notifications */}
          <div className="bg-[#121212] border border-[#222] rounded-[20px] p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="text-[17px] font-medium text-[#F4F2EC]">Notifications</h2>
              <p className="text-[12.5px] text-[#9C9A92] mt-0.5">
                Choose how you would like to be notified about updates and campaign activity.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              {/* Campaign updates */}
              <div className="flex items-center justify-between gap-4 pt-3 border-t border-[#1F1F1F]">
                <div>
                  <div className="text-[13.5px] font-medium text-[#F4F2EC]">Campaign updates</div>
                  <div className="text-[12px] text-[#9C9A92]">Changes to campaigns you joined.</div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={campaignUpdates}
                  onClick={() => handleTogglePref('kred_pref_updates', setCampaignUpdates, campaignUpdates)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    campaignUpdates ? 'bg-[#388BFD]' : 'bg-[#222222]'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      campaignUpdates ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* New recommendations */}
              <div className="flex items-center justify-between gap-4 pt-3 border-t border-[#1F1F1F]">
                <div>
                  <div className="text-[13.5px] font-medium text-[#F4F2EC]">New recommendations</div>
                  <div className="text-[12px] text-[#9C9A92]">Campaigns matched to your audience.</div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={newRecs}
                  onClick={() => handleTogglePref('kred_pref_recs', setNewRecs, newRecs)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    newRecs ? 'bg-[#388BFD]' : 'bg-[#222222]'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      newRecs ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Creator messages */}
              <div className="flex items-center justify-between gap-4 pt-3 border-t border-[#1F1F1F]">
                <div>
                  <div className="text-[13.5px] font-medium text-[#F4F2EC]">Creator messages</div>
                  <div className="text-[12px] text-[#9C9A92]">Direct outreach from campaign managers.</div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={creatorMessages}
                  onClick={() => handleTogglePref('kred_pref_msgs', setCreatorMessages, creatorMessages)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    creatorMessages ? 'bg-[#388BFD]' : 'bg-[#222222]'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      creatorMessages ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Payout alerts */}
              <div className="flex items-center justify-between gap-4 pt-3 border-t border-[#1F1F1F]">
                <div>
                  <div className="text-[13.5px] font-medium text-[#F4F2EC]">Payout alerts</div>
                  <div className="text-[12px] text-[#9C9A92]">Weekly settlements and attribution milestones.</div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={payoutAlerts}
                  onClick={() => handleTogglePref('kred_pref_payouts', setPayoutAlerts, payoutAlerts)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    payoutAlerts ? 'bg-[#388BFD]' : 'bg-[#222222]'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      payoutAlerts ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PAYMENT (SCREENSHOT 3) */}
      {activeTab === 'payment' && (
        <div className="space-y-6 animate-[fade-in_0.15s_ease-out]">
          {paymentNotice && (
            <div className="p-3 bg-[#141414] border border-[#388BFD]/50 rounded-[14px] text-[13px] text-[#F4F2EC] flex items-center gap-2">
              <i className="ti ti-check text-[#388BFD]"></i>
              <span>{paymentNotice}</span>
            </div>
          )}

          {/* Card 1: Payment */}
          <div className="bg-[#121212] border border-[#222] rounded-[20px] p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="text-[17px] font-medium text-[#F4F2EC]">Payment</h2>
              <p className="text-[12.5px] text-[#9C9A92] mt-0.5">
                Choose where your verified campaign rewards should go.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              {/* Default payout method */}
              <div className="flex items-center justify-between gap-4 pt-3 border-t border-[#1F1F1F]">
                <div>
                  <div className="text-[13.5px] font-medium text-[#F4F2EC]">Default payout method</div>
                  <div className="text-[12px] text-[#9C9A92]">{defaultPayoutMethod}</div>
                </div>
                {onNavigatePayoutMethods ? (
                  <button
                    type="button"
                    onClick={onNavigatePayoutMethods}
                    className="px-4 py-1.5 bg-[#222] hover:bg-[#222222] text-[#F4F2EC] text-[13px] rounded-full transition-colors border border-[#333] cursor-pointer"
                  >
                    Manage
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentNotice('Redirecting to payout method configuration...');
                      setTimeout(() => setPaymentNotice(null), 2500);
                    }}
                    className="px-4 py-1.5 bg-[#222] hover:bg-[#222222] text-[#F4F2EC] text-[13px] rounded-full transition-colors border border-[#333] cursor-pointer"
                  >
                    Manage
                  </button>
                )}
              </div>

              {/* Minimum payout */}
              <div className="flex items-center justify-between gap-4 pt-3 border-t border-[#1F1F1F]">
                <div>
                  <div className="text-[13.5px] font-medium text-[#F4F2EC]">Minimum payout</div>
                  <div className="text-[12px] text-[#9C9A92]">Payouts are released after you reach $50.00.</div>
                </div>
                <div className="text-[16px] font-semibold text-[#F4F2EC] font-mono">
                  $50.00
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Account access */}
          <div className="bg-[#121212] border border-[#222] rounded-[20px] p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="text-[17px] font-medium text-[#F4F2EC]">Account access</h2>
              <p className="text-[12.5px] text-[#9C9A92] mt-0.5">
                Protect your KRED account and manage sign-in methods.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              {/* Two-factor authentication */}
              <div className="flex items-center justify-between gap-4 pt-3 border-t border-[#1F1F1F]">
                <div>
                  <div className="text-[13.5px] font-medium text-[#F4F2EC]">Two-factor authentication</div>
                  <div className="text-[12px] text-[#9C9A92]">
                    {twoFactorEnabled ? '2FA is active via Authenticator app.' : 'Add an extra layer of security.'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !twoFactorEnabled;
                    setTwoFactorEnabled(next);
                    localStorage.setItem('kred_2fa', String(next));
                    setPaymentNotice(next ? 'Two-factor authentication enabled.' : 'Two-factor authentication disabled.');
                    setTimeout(() => setPaymentNotice(null), 3000);
                  }}
                  className="px-4 py-1.5 bg-[#222] hover:bg-[#222222] text-[#F4F2EC] text-[13px] rounded-full transition-colors border border-[#333] cursor-pointer"
                >
                  {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                </button>
              </div>

              {/* Passkeys */}
              <div className="flex items-center justify-between gap-4 pt-3 border-t border-[#1F1F1F]">
                <div>
                  <div className="text-[13.5px] font-medium text-[#F4F2EC]">Passkeys</div>
                  <div className="text-[12px] text-[#9C9A92]">
                    {passkeysCount > 0
                      ? `${passkeysCount} passkey configured. Sign in securely without a password.`
                      : 'Sign in securely without a password.'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = passkeysCount + 1;
                    setPasskeysCount(next);
                    localStorage.setItem('kred_passkeys_count', String(next));
                    setPaymentNotice('New biometric passkey registered successfully.');
                    setTimeout(() => setPaymentNotice(null), 3000);
                  }}
                  className="px-4 py-1.5 bg-[#222] hover:bg-[#222222] text-[#F4F2EC] text-[13px] rounded-full transition-colors border border-[#333] cursor-pointer"
                >
                  Add passkey
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
