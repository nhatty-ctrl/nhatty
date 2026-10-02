import React, { useState } from 'react';
import { Breadcrumbs } from './Breadcrumbs';

export interface PayoutMethod {
  id: string;
  type: 'bank' | 'card' | 'usdc';
  title: string;
  subtitle: string;
  details: string;
  isDefault: boolean;
  verified: boolean;
}

interface PayoutMethodsViewProps {
  onBack: () => void;
  availableBalance?: number;
  onInitiateWithdraw?: () => void;
}

export const PayoutMethodsView: React.FC<PayoutMethodsViewProps> = ({
  onBack,
  availableBalance = 248.6,
  onInitiateWithdraw,
}) => {
  const [methods, setMethods] = useState<PayoutMethod[]>([
    {
      id: 'pm_1',
      type: 'bank',
      title: 'JPMorgan Chase · Checking',
      subtitle: 'Account ending in 5821 · Routing ••••4321',
      details: 'Arrives in 1 to 2 business days on Friday settlements.',
      isDefault: true,
      verified: true,
    },
    {
      id: 'pm_2',
      type: 'card',
      title: 'Visa Debit · Personal',
      subtitle: 'Card ending in 4242 · Expires 08/28',
      details: 'Instant transfer on Friday settlement schedule.',
      isDefault: false,
      verified: true,
    },
    {
      id: 'pm_3',
      type: 'usdc',
      title: 'USDC Wallet · Polygon',
      subtitle: '0x71C...4e8B',
      details: 'Direct on-chain payout with zero exchange fees.',
      isDefault: false,
      verified: true,
    },
  ]);

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [addType, setAddType] = useState<'bank' | 'card' | 'usdc'>('bank');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form states
  const [bankRouting, setBankRouting] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankHolder, setBankHolder] = useState('Alex Rivera');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [walletAddr, setWalletAddr] = useState('');
  const [formError, setFormError] = useState('');

  const handleSetDefault = (id: string) => {
    setMethods((prev) =>
      prev.map((m) => ({
        ...m,
        isDefault: m.id === id,
      }))
    );
  };

  const handleDeleteMethod = (id: string) => {
    setMethods((prev) => prev.filter((m) => m.id !== id));
    setConfirmDeleteId(null);
  };

  const handleAddNewMethod = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (addType === 'bank') {
      if (bankRouting.trim().length < 9) {
        setFormError('Enter a valid 9-digit routing number.');
        return;
      }
      if (bankAccount.trim().length < 4) {
        setFormError('Enter a valid account number.');
        return;
      }
      const newPm: PayoutMethod = {
        id: `pm_${Date.now()}`,
        type: 'bank',
        title: 'New Bank Account',
        subtitle: `Account ending in ${bankAccount.slice(-4)}`,
        details: 'Arrives in 1 to 2 business days on Friday settlements.',
        isDefault: methods.length === 0,
        verified: true,
      };
      setMethods((prev) => [...prev, newPm]);
    } else if (addType === 'card') {
      if (cardNumber.trim().length < 15) {
        setFormError('Enter a valid 16-digit debit card number.');
        return;
      }
      const newPm: PayoutMethod = {
        id: `pm_${Date.now()}`,
        type: 'card',
        title: 'Debit Card',
        subtitle: `Card ending in ${cardNumber.slice(-4)} · Exp ${cardExpiry || '12/28'}`,
        details: 'Instant transfer on Friday settlement schedule.',
        isDefault: methods.length === 0,
        verified: true,
      };
      setMethods((prev) => [...prev, newPm]);
    } else {
      if (!walletAddr.startsWith('0x') || walletAddr.length < 20) {
        setFormError('Enter a valid EVM address starting with 0x.');
        return;
      }
      const newPm: PayoutMethod = {
        id: `pm_${Date.now()}`,
        type: 'usdc',
        title: 'USDC Wallet · Polygon',
        subtitle: `${walletAddr.slice(0, 6)}...${walletAddr.slice(-4)}`,
        details: 'Direct on-chain payout with zero exchange fees.',
        isDefault: methods.length === 0,
        verified: true,
      };
      setMethods((prev) => [...prev, newPm]);
    }

    setIsAddingNew(false);
    setBankRouting('');
    setBankAccount('');
    setCardNumber('');
    setWalletAddr('');
  };

  return (
    <div className="w-full max-w-[940px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Breadcrumb with icons */}
      <Breadcrumbs
        items={[
          { label: 'Profile', icon: 'ti-user', onClick: onBack },
          { label: 'Payout methods', icon: 'ti-wallet', active: true },
        ]}
      />

      {/* Top Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-1">
          <div>
            <h1 className="text-[28px] font-medium tracking-[-0.5px] text-[#F5F3EC]">
              Payout methods
            </h1>
            <p className="text-[13px] text-[#9A9892] mt-1">
              Select or add how your verified install bounties are settled every Friday.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="pill on min-h-[44px] px-4 self-start sm:self-auto cursor-pointer"
          >
            <i className={`ti ${isAddingNew ? 'ti-x' : 'ti-plus'}`} aria-hidden="true"></i>
            <span>{isAddingNew ? 'Cancel' : 'Add payout method'}</span>
          </button>
        </div>
      </div>

      {/* Available Balance & Settlement Schedule Banner */}
      <div className="bg-[#161616] rounded-[20px] p-5 border border-[#2A2A2A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="sub text-[12px]">Available balance</div>
          <div className="text-[32px] font-medium tracking-[-0.6px] text-[#F5F3EC] mt-0.5">
            ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[12px] text-[#C7F26B] flex items-center gap-1.5 mt-1 font-medium">
            <i className="ti ti-calendar" aria-hidden="true"></i>
            <span>Settles every Friday at 17:00 UTC</span>
          </div>
        </div>

        {availableBalance >= 20 ? (
          <button
            type="button"
            onClick={onInitiateWithdraw}
            className="pill on min-h-[44px] px-5 self-start sm:self-auto cursor-pointer"
          >
            <i className="ti ti-arrow-down-right" aria-hidden="true"></i>
            <span>Withdraw now</span>
          </button>
        ) : (
          <div className="text-right sm:text-right text-[12px] text-[#9A9892]">
            Minimum payout is $20.00. Current balance will carry over until threshold is reached.
          </div>
        )}
      </div>

      {/* Add New Method Form (when opened) */}
      {isAddingNew && (
        <form
          onSubmit={handleAddNewMethod}
          className="card border border-[#F5F3EC]/20 space-y-4 animate-[fade-in_0.2s_ease-out]"
        >
          <div className="text-[16px] font-medium text-[#F5F3EC]">Add new payout method</div>

          {/* Type Selector */}
          <div className="flex gap-2">
            {[
              { id: 'bank', label: 'Bank account', icon: 'ti-building-bank' },
              { id: 'card', label: 'Debit card', icon: 'ti-credit-card' },
              { id: 'usdc', label: 'USDC wallet', icon: 'ti-coin' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setAddType(t.id as any);
                  setFormError('');
                }}
                className={`pill flex-1 justify-center min-h-[44px] ${
                  addType === t.id ? 'on' : 'bg-[#1C1C1C] text-[#B9B7AF]'
                }`}
              >
                <i className={`ti ${t.icon}`} aria-hidden="true"></i>
                <span className="text-[13px]">{t.label}</span>
              </button>
            ))}
          </div>

          {addType === 'bank' ? (
            <div className="space-y-3">
              <div>
                <label className="fl" htmlFor="bank-holder">Account holder name</label>
                <input
                  id="bank-holder"
                  className="in"
                  value={bankHolder}
                  onChange={(e) => setBankHolder(e.target.value)}
                  placeholder="Full legal name"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="fl" htmlFor="bank-routing">Routing number (9 digits)</label>
                  <input
                    id="bank-routing"
                    className="in"
                    maxLength={9}
                    value={bankRouting}
                    onChange={(e) => setBankRouting(e.target.value)}
                    placeholder="123456789"
                  />
                </div>
                <div>
                  <label className="fl" htmlFor="bank-account">Account number</label>
                  <input
                    id="bank-account"
                    className="in"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    placeholder="••••••••5821"
                  />
                </div>
              </div>
            </div>
          ) : addType === 'card' ? (
            <div className="space-y-3">
              <div>
                <label className="fl" htmlFor="card-number">Debit card number</label>
                <input
                  id="card-number"
                  className="in"
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4000 1234 5678 9010"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="fl" htmlFor="card-expiry">Expires (MM/YY)</label>
                  <input
                    id="card-expiry"
                    className="in"
                    maxLength={5}
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="08/28"
                  />
                </div>
                <div>
                  <label className="fl" htmlFor="card-cvc">CVC</label>
                  <input
                    id="card-cvc"
                    className="in"
                    maxLength={4}
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    placeholder="123"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="fl" htmlFor="wallet-addr">Polygon / Arbitrum EVM address</label>
              <input
                id="wallet-addr"
                className="in font-mono text-[13px]"
                value={walletAddr}
                onChange={(e) => setWalletAddr(e.target.value)}
                placeholder="0x71C...4e8B"
              />
              <span className="sub mt-1 block">Payouts are sent in USDC directly to this address.</span>
            </div>
          )}

          {formError && (
            <div className="text-[13px] text-[#FF8A80] pt-1">
              {formError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="pill min-h-[44px] px-4 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="pill on min-h-[44px] px-5 cursor-pointer font-medium"
            >
              Save payout method
            </button>
          </div>
        </form>
      )}

      {/* Methods List */}
      <div className="space-y-3">
        <div className="text-[15px] font-medium text-[#F5F3EC]">Saved payout methods</div>

        {methods.map((method) => (
          <div
            key={method.id}
            className={`card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border transition-all ${
              method.isDefault ? 'border-[#C7F26B]/50 bg-[#181818]' : 'border-transparent'
            }`}
          >
            {/* Left Info */}
            <div className="flex items-start gap-3.5 min-w-0">
              <div
                className="w-11 h-11 rounded-[14px] flex items-center justify-center text-[22px] shrink-0"
                style={{
                  backgroundColor: method.type === 'bank' ? '#B5D4F4' : method.type === 'card' ? '#FAC775' : '#C0DD97',
                  color: method.type === 'bank' ? '#042C53' : method.type === 'card' ? '#412402' : '#173404',
                }}
              >
                <i
                  className={`ti ${
                    method.type === 'bank'
                      ? 'ti-building-bank'
                      : method.type === 'card'
                      ? 'ti-credit-card'
                      : 'ti-coin'
                  }`}
                  aria-hidden="true"
                ></i>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[15px] font-medium text-[#F5F3EC]">
                    {method.title}
                  </span>
                  {method.isDefault && (
                    <span className="chip text-[11px] py-0.5 px-2 bg-[#C7F26B] text-[#16140F] font-semibold flex items-center gap-1">
                      <i className="ti ti-check" aria-hidden="true"></i>
                      <span>Default</span>
                    </span>
                  )}
                  {method.verified && (
                    <span className="chip text-[11px] py-0.5 px-2 bg-[#1C1C1C] text-[#C7F26B] flex items-center gap-1">
                      <i className="ti ti-circle-check" aria-hidden="true"></i>
                      <span>Verified</span>
                    </span>
                  )}
                </div>

                <div className="text-[13px] text-[#B9B7AF] mt-0.5">{method.subtitle}</div>
                <div className="text-[12px] text-[#9A9892] mt-0.5">{method.details}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              {!method.isDefault && (
                <button
                  type="button"
                  onClick={() => handleSetDefault(method.id)}
                  className="ol min-h-[38px] px-3 text-[12px] cursor-pointer"
                >
                  Make default
                </button>
              )}

              {methods.length > 1 && (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(method.id)}
                  className="pill min-h-[38px] px-2.5 text-[#9A9892] hover:text-[#FF8A80] cursor-pointer"
                  aria-label="Remove method"
                >
                  <i className="ti ti-trash text-[16px]"></i>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Rules Notice */}
      <div className="card space-y-2 text-[13px] text-[#9A9892]">
        <div className="text-[14px] font-medium text-[#F5F3EC]">Settlement terms and rules</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 bg-[#1C1C1C] rounded-[14px]">
            <div className="font-medium text-[#F5F3EC]">Minimum payout</div>
            <div className="mt-1">$20.00 required before automatic weekly release.</div>
          </div>
          <div className="p-3 bg-[#1C1C1C] rounded-[14px]">
            <div className="font-medium text-[#F5F3EC]">Verification window</div>
            <div className="mt-1">14 days per install before transitioning to awaiting payout.</div>
          </div>
          <div className="p-3 bg-[#1C1C1C] rounded-[14px]">
            <div className="font-medium text-[#F5F3EC]">Schedule</div>
            <div className="mt-1">Every Friday at 17:00 UTC directly to your default method.</div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="card w-full max-w-[380px] bg-[#161616] border border-[#2A2A2A] rounded-[20px] p-5 space-y-3">
            <div className="text-[16px] font-medium text-[#F5F3EC]">Remove payout method?</div>
            <div className="text-[13px] text-[#9A9892]">
              Weekly settlements will route to your remaining default method.
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="pill min-h-[44px] px-4 cursor-pointer"
              >
                Keep
              </button>
              <button
                type="button"
                onClick={() => handleDeleteMethod(confirmDeleteId)}
                className="pill on min-h-[44px] px-4 cursor-pointer bg-[#FF8A80]! text-[#16140F]!"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
