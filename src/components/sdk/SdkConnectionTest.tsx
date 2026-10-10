import React, { useState, useEffect, useRef } from 'react';

export interface CheckItem {
  id: string;
  label: string;
  state: 'pending' | 'running' | 'pass' | 'fail' | 'skipped';
  detail?: string;
  log?: string[];
  fix?: string[];
  ms?: number;
}

export interface TestRunRecord {
  id: string;
  at: string;
  result: 'passed' | 'failed' | 'cancelled';
  version: string;
  platform: string;
  by: string;
  ms: number;
  checks: CheckItem[];
}

export interface SdkConnectionTestProps {
  platform: 'ios' | 'and' | 'android';
  appKey: string;
  appName?: string;
  status: 'idle' | 'testing' | 'ok' | 'later';
  onStatus: (status: 'idle' | 'testing' | 'ok') => void;
  onSkip?: () => void;
  simulate?: boolean;
  className?: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getInitialChecks = (platform: string): Omit<CheckItem, 'state'>[] => [
  { id: 'detect', label: 'SDK detected' },
  { id: 'key', label: 'App key matches this app' },
  { id: 'version', label: 'SDK version supported' },
  { id: 'consent', label: 'Consent hook connected' },
  { id: 'session', label: 'Install session created' },
  { id: 'source', label: platform === 'ios' ? 'Source sheet shown' : 'Install referrer read' },
  { id: 'event', label: 'Test event received' },
  { id: 'confirm', label: 'Server confirmation received' },
];

async function simulateCheckStep(
  checkId: string,
  scenario: string,
  platform: string,
  appKey: string
): Promise<{ state: 'pass' | 'fail'; detail: string; log: string[]; fix?: string[] }> {
  await sleep(400 + Math.random() * 400);

  const pass = (detail: string, log: string[]) => ({
    state: 'pass' as const,
    detail,
    log,
  });

  const fail = (detail: string, log: string[], fix: string[]) => ({
    state: 'fail' as const,
    detail,
    log,
    fix,
  });

  switch (checkId) {
    case 'detect':
      return pass(
        `Umi SDK ${platform === 'ios' ? 'iOS' : 'Android'} found in a sandbox build`,
        ['GET /v1/sdk/config 200 (device_handshake_ok)']
      );
    case 'key':
      if (scenario === 'bad_key') {
        return fail(
          `The key ${appKey.slice(0, 12)}… was issued for a different app (com.other.app).`,
          ['POST /v1/sdk/session 401 key does not match bundle id'],
          [
            'Copy the key shown above into your configure call.',
            'Make sure the key is for this campaign’s registered app.',
            'Rebuild and run the app once, then retry.',
          ]
        );
      }
      return pass('Key matches the registered app', ['POST /v1/sdk/session 200']);
    case 'version':
      if (scenario === 'outdated') {
        return fail(
          'Found version 0.9.2. The minimum supported version is 1.0.0.',
          ['GET /v1/sdk/config 200 min_sdk_version=1.0.0'],
          ['Update the package to 1.0.0 or later.', 'Rebuild and run the app once, then retry.']
        );
      }
      return pass('Version 1.0.3 is supported', ['GET /v1/sdk/config 200 min_sdk_version=1.0.0']);
    case 'consent':
      if (scenario === 'no_consent') {
        return fail(
          'No consent callback is registered. Events would not be sent where consent is required.',
          ['consent: state unknown, queue held'],
          [
            'Call setConsent when the user makes a choice.',
            'Show your own consent screen or use the built-in sheet.',
            'Retry once the callback is wired.',
          ]
        );
      }
      return pass('Consent state granted for the test device', ['consent: granted']);
    case 'session':
      return pass('Install session s_8f3k created', ['POST /v1/sdk/session 200']);
    case 'source':
      return pass(
        platform === 'ios'
          ? 'Source sheet was shown and skipped'
          : 'Install referrer read once (none present)',
        [
          platform === 'ios'
            ? 'ui: source sheet displayed'
            : 'referrer: no value, install stays unattributed',
        ]
      );
    case 'event':
      return pass('account_completed received, marked as test', [
        'POST /v1/sdk/events 200 account_completed (sandbox_tag)',
      ]);
    case 'confirm':
      if (scenario === 'no_confirm') {
        return fail(
          'No confirmation from your server within 30 seconds.',
          ['waiting for POST /v1/server/confirm', 'timeout after 30 s'],
          [
            'Call POST /v1/server/confirm with the same external ID.',
            'Sign the request with your secret key. Never put it in the app.',
            'Check your server logs for 401 or 404 responses, then retry.',
          ]
        );
      }
      return pass('Founder server confirmed the same external ID', [
        'POST /v1/server/confirm 200 (hmac_verified)',
      ]);
    default:
      return pass('Step completed', []);
  }
}

export const SdkConnectionTest: React.FC<SdkConnectionTestProps> = ({
  platform,
  appKey,
  appName = 'your app',
  status,
  onStatus,
  onSkip,
  simulate = true,
  className = '',
}) => {
  const normPlatform = platform === 'and' ? 'android' : platform;

  const [phase, setPhase] = useState<'waiting' | 'nosignal' | 'detected' | 'running' | 'done'>('waiting');
  const [scenario, setScenario] = useState<string>('pass');
  const [listenSeconds, setListenSeconds] = useState(0);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [checks, setChecks] = useState<CheckItem[]>([]);
  const [runHistory, setRunHistory] = useState<TestRunRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedCheckId, setExpandedCheckId] = useState<string | null>(null);
  const [copiedReport, setCopiedReport] = useState(false);

  const cancelRef = useRef(false);
  const startTimeRef = useRef(0);

  // Timer while in "waiting"
  useEffect(() => {
    if (phase !== 'waiting') return;
    setListenSeconds(0);
    const interval = setInterval(() => setListenSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [phase]);

  // Transition from waiting to detected or nosignal
  useEffect(() => {
    if (phase === 'waiting') {
      if (scenario === 'no_signal' && listenSeconds >= 8) {
        setPhase('nosignal');
      } else if (scenario !== 'no_signal' && listenSeconds >= 3) {
        setPhase('detected');
      }
    }
  }, [listenSeconds, phase, scenario]);

  // Reset when platform or scenario changes
  useEffect(() => {
    setPhase('waiting');
    setChecks([]);
    setHasAgreed(false);
    onStatus('idle');
  }, [platform, scenario]);

  const handleStartTest = async () => {
    cancelRef.current = false;
    startTimeRef.current = Date.now();

    const initial = getInitialChecks(normPlatform).map((c) => ({
      ...c,
      state: 'pending' as const,
    }));
    setChecks(initial);
    setPhase('running');
    onStatus('testing');

    let hasFailed = false;

    for (let i = 0; i < initial.length && !cancelRef.current; i++) {
      if (hasFailed) {
        initial[i] = { ...initial[i], state: 'skipped' };
        setChecks([...initial]);
        continue;
      }

      initial[i] = { ...initial[i], state: 'running' };
      setChecks([...initial]);

      const stepStart = Date.now();
      const res = await simulateCheckStep(initial[i].id, scenario, normPlatform, appKey);

      initial[i] = {
        ...initial[i],
        ...res,
        ms: Date.now() - stepStart,
      };

      if (res.state === 'fail') {
        hasFailed = true;
      }
      setChecks([...initial]);
    }

    const duration = Date.now() - startTimeRef.current;
    const finalResult = cancelRef.current ? 'cancelled' : hasFailed ? 'failed' : 'passed';

    setRunHistory((prev) => [
      {
        id: 'run_' + (prev.length + 1),
        at: new Date().toLocaleString([], {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        result: finalResult,
        version: scenario === 'outdated' ? '0.9.2' : '1.0.3',
        platform: normPlatform === 'ios' ? 'iOS' : 'Android',
        by: 'You',
        ms: duration,
        checks: [...initial],
      },
      ...prev,
    ]);

    setPhase('done');
    const firstFail = initial.find((c) => c.state === 'fail');
    setExpandedCheckId(firstFail ? firstFail.id : null);
    onStatus(finalResult === 'passed' ? 'ok' : 'idle');
  };

  const failedCount = checks.filter((c) => c.state === 'fail').length;
  const passedCount = checks.filter((c) => c.state === 'pass').length;
  const resolvedCount = checks.filter((c) => c.state !== 'pending' && c.state !== 'running').length;
  const isAllPassed = phase === 'done' && failedCount === 0 && passedCount === checks.length;

  const handleCopyReport = async () => {
    const reportText = [
      `Umi SDK connection test for ${appName} (${normPlatform === 'ios' ? 'iOS' : 'Android'}, sandbox)`,
      ...checks.map(
        (c) =>
          `${c.state === 'pass' ? 'PASS' : c.state === 'fail' ? 'FAIL' : 'SKIP'}  ${c.label}${
            c.detail ? ': ' + c.detail : ''
          }`
      ),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(reportText);
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2000);
    } catch {}
  };

  const renderCheckIcon = (state: CheckItem['state']) => {
    switch (state) {
      case 'pass':
        return <i className="ti ti-circle-check text-[18px] text-[#C9B8FF]" aria-hidden="true" />;
      case 'fail':
        return <i className="ti ti-alert-circle text-[18px] text-[#FF8A80]" aria-hidden="true" />;
      case 'running':
        return <i className="ti ti-loader-2 spin text-[18px] text-[#F4F2EC]" aria-hidden="true" />;
      case 'skipped':
        return <i className="ti ti-minus text-[18px] text-[#5C5A54]" aria-hidden="true" />;
      default:
        return <i className="ti ti-circle text-[18px] text-[#3A3A3A]" aria-hidden="true" />;
    }
  };

  const getStateLabel = (state: CheckItem['state']) => {
    switch (state) {
      case 'pass':
        return 'Passed';
      case 'fail':
        return 'Needs attention';
      case 'running':
        return 'Running';
      case 'skipped':
        return 'Skipped';
      default:
        return 'Waiting';
    }
  };

  const btnPill =
    'inline-flex items-center gap-1.5 text-[12.5px] font-semibold py-2 px-4 rounded-full bg-[#141414] hover:bg-[#1B1B1B] text-[#F4F2EC] border border-[#222222] cursor-pointer transition-colors';

  return (
    <div className={`edge fld rounded-[20px] overflow-hidden ${className}`} aria-live="polite">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[#222222]">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-9 h-9 rounded-[12px] bg-[#141414] flex items-center justify-center text-[#C9B8FF] shrink-0">
            <i className="ti ti-plug-connected text-[18px]" aria-hidden="true"></i>
          </span>
          <div className="min-w-0">
            <div className="text-[14px] font-medium text-[#F4F2EC]">Connection test</div>
            <div className="sub text-[12px] text-[#9A9892] truncate">
              Checks that your app talks to Umi correctly
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="chip text-[11px] py-0.5 px-2 bg-[#141414] text-[#C9B8FF]">Sandbox</span>
          <button
            type="button"
            className={btnPill}
            onClick={() => setShowHistory((prev) => !prev)}
            aria-expanded={showHistory}
          >
            <i className="ti ti-history text-[13px]" aria-hidden="true"></i>
            <span>Test runs{runHistory.length ? ` (${runHistory.length})` : ''}</span>
          </button>
        </div>
      </div>

      {/* Simulator bar */}
      {simulate && (
        <div className="flex items-center gap-2 px-5 py-2 border-b border-dashed border-[#2A2A2A] bg-[#0B0B0B]">
          <span className="text-[11px] tracking-[0.1em] uppercase text-[#9C9A92]">
            Simulator · test scenario
          </span>
          <select
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            className="bg-[#141414] text-[#F4F2EC] text-[12px] rounded-full border border-[#222222] px-3 py-1 outline-none"
            aria-label="Simulated scenario"
          >
            <option value="pass">All checks pass</option>
            <option value="no_signal">No signal from the SDK</option>
            <option value="bad_key">Wrong app key</option>
            <option value="outdated">Outdated SDK version</option>
            <option value="no_consent">Consent hook missing</option>
            <option value="no_confirm">Server never confirms</option>
          </select>
        </div>
      )}

      {/* Test Runs History Drawer */}
      {showHistory && (
        <div className="px-5 py-4 border-b border-[#222222] bg-[#0B0B0B]">
          {runHistory.length === 0 ? (
            <div className="text-center py-6">
              <i className="ti ti-clipboard-off text-[26px] text-[#5C5A54]" aria-hidden="true"></i>
              <div className="text-[14px] font-medium text-[#F4F2EC] mt-2">No test runs yet</div>
              <div className="sub text-[12.5px] text-[#9A9892] mt-1">
                Every run is saved here with its result, platform, and duration.
              </div>
            </div>
          ) : (
            <div role="table" aria-label="Test runs" className="text-[12.5px] space-y-2">
              <div role="row" className="grid grid-cols-[1.2fr_.8fr_.7fr_.7fr_.5fr] gap-2 pb-2 text-[#9C9A92] border-b border-[#1B1B1B]">
                <span>When</span>
                <span>Result</span>
                <span>Platform</span>
                <span>SDK</span>
                <span>Time</span>
              </div>
              {runHistory.map((run) => (
                <div
                  key={run.id}
                  role="row"
                  className="grid grid-cols-[1.2fr_.8fr_.7fr_.7fr_.5fr] gap-2 py-1.5 text-[#F4F2EC] border-b border-[#1B1B1B]/40 last:border-0"
                >
                  <span className="truncate">{run.at} · {run.by}</span>
                  <span
                    className={
                      run.result === 'passed'
                        ? 'text-[#C9B8FF] font-medium'
                        : run.result === 'failed'
                        ? 'text-[#FF8A80] font-medium'
                        : 'text-[#9C9A92]'
                    }
                  >
                    {run.result === 'passed' ? 'Passed' : run.result === 'failed' ? 'Failed' : 'Cancelled'}
                  </span>
                  <span>{run.platform}</span>
                  <span className="font-mono text-[11px]">{run.version}</span>
                  <span className="font-mono text-[11px]">{(run.ms / 1000).toFixed(1)} s</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Body per Phase */}
      <div className="px-5 py-6">
        {/* Phase: Waiting */}
        {phase === 'waiting' && (
          <div className="text-center max-w-[420px] mx-auto py-2">
            <span className="inline-flex w-12 h-12 rounded-full bg-[#141414] items-center justify-center text-[#9A9892]">
              <i className="ti ti-plug-off text-[22px]" aria-hidden="true"></i>
            </span>
            <div className="text-[16px] font-medium text-[#F4F2EC] mt-3">
              No SDK detected yet
            </div>
            <p className="sub text-[13px] text-[#9A9892] mt-1 leading-relaxed">
              Add the package, start it with your key, then run your app once on a device or simulator. We detect it automatically.
            </p>
            <div className="inline-flex items-center gap-2 mt-4 text-[12.5px] text-[#B8B6AE]">
              <i className="ti ti-loader-2 spin text-[14px]" aria-hidden="true"></i>
              <span>Listening for {appName} · {listenSeconds}s</span>
            </div>
            <div className="flex justify-center gap-2 mt-4">
              <button
                type="button"
                className={btnPill}
                onClick={() => setListenSeconds(0)}
              >
                Check again
              </button>
              {onSkip && (
                <button
                  type="button"
                  className="btn bg-transparent border-0 text-[#B8B6AE] hover:text-[#F4F2EC] cursor-pointer"
                  onClick={onSkip}
                >
                  Do this later
                </button>
              )}
            </div>
          </div>
        )}

        {/* Phase: No Signal Warning */}
        {phase === 'nosignal' && (
          <div className="max-w-[520px] mx-auto py-2">
            <div className="flex items-start gap-3">
              <i className="ti ti-alert-triangle text-[22px] text-[#FAC775] mt-0.5 shrink-0" aria-hidden="true"></i>
              <div>
                <div className="text-[16px] font-medium text-[#F4F2EC]">
                  Still no signal after 8 seconds
                </div>
                <p className="sub text-[13px] text-[#9C9A92] mt-1">
                  The most common causes, in order:
                </p>
              </div>
            </div>

            <ol className="mt-3 space-y-2 text-[13px] text-[#B8B6AE] list-decimal pl-9 leading-relaxed">
              <li>The app has not been run since the SDK was added. Build and launch it once.</li>
              <li>The key is not the one shown above. Use the key for this campaign.</li>
              <li>The device is offline, or a firewall blocks api.umi.so.</li>
              <li>You ran a production build. The test listens for sandbox builds only.</li>
            </ol>

            <div className="flex gap-2 mt-4 pl-9">
              <button
                type="button"
                className={btnPill}
                onClick={() => {
                  setScenario('pass');
                  setPhase('waiting');
                }}
              >
                Try again
              </button>
              {onSkip && (
                <button
                  type="button"
                  className="btn bg-transparent border-0 text-[#B8B6AE] hover:text-[#F4F2EC] cursor-pointer"
                  onClick={onSkip}
                >
                  Do this later
                </button>
              )}
            </div>
          </div>
        )}

        {/* Phase: Detected -> Agreement Modal */}
        {phase === 'detected' && (
          <div className="max-w-[560px] mx-auto py-2 space-y-4">
            <div className="flex items-center gap-3">
              <i className="ti ti-circle-check text-[22px] text-[#C9B8FF] shrink-0" aria-hidden="true"></i>
              <div>
                <div className="text-[16px] font-medium text-[#F4F2EC]">SDK detected</div>
                <div className="sub text-[12.5px] text-[#9C9A92]">
                  {normPlatform === 'ios' ? 'iOS' : 'Android'} · version {scenario === 'outdated' ? '0.9.2' : '1.0.3'} · sandbox build
                </div>
              </div>
            </div>

            <div className="edge rounded-[16px] p-4 bg-[#0E0E0E] space-y-3">
              <div className="text-[13.5px] font-medium text-[#F4F2EC]">Before we test</div>
              <ul className="space-y-1.5 text-[13px] text-[#B8B6AE] leading-relaxed">
                <li className="flex gap-2">
                  <i className="ti ti-check text-[#C9B8FF] mt-0.5 shrink-0" aria-hidden="true"></i>
                  <span>We send sandbox events from your connected app to Umi. No real users, rewards, or money are affected.</span>
                </li>
                <li className="flex gap-2">
                  <i className="ti ti-check text-[#C9B8FF] mt-0.5 shrink-0" aria-hidden="true"></i>
                  <span>Test events are marked as test and deleted after 30 days.</span>
                </li>
                <li className="flex gap-2">
                  <i className="ti ti-check text-[#C9B8FF] mt-0.5 shrink-0" aria-hidden="true"></i>
                  <span>We ask your server to confirm one test event, using your secret key once.</span>
                </li>
                <li className="flex gap-2">
                  <i className="ti ti-check text-[#C9B8FF] mt-0.5 shrink-0" aria-hidden="true"></i>
                  <span>The run is saved to your audit trail with your name and time.</span>
                </li>
              </ul>

              <label className="flex items-start gap-2.5 pt-2 cursor-pointer text-[13px] text-[#F4F2EC] select-none">
                <input
                  type="checkbox"
                  checked={hasAgreed}
                  onChange={(e) => setHasAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#C9B8FF] shrink-0"
                />
                <span>I agree to run these sandbox tests for {appName}.</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!hasAgreed}
                onClick={handleStartTest}
                className={`h-[42px] px-6 rounded-full font-semibold text-[13.5px] transition-all ${
                  hasAgreed
                    ? 'bg-[#F4F2EC] text-black cursor-pointer hover:bg-white shadow-sm'
                    : 'bg-[#1B1B1B] text-[#5C5A54] cursor-not-allowed'
                }`}
              >
                I agree, start testing
              </button>
              {onSkip && (
                <button
                  type="button"
                  className="btn bg-transparent border-0 text-[#B8B6AE] hover:text-[#F4F2EC] cursor-pointer"
                  onClick={onSkip}
                >
                  Do this later
                </button>
              )}
            </div>
          </div>
        )}

        {/* Phase: Running or Done */}
        {(phase === 'running' || phase === 'done') && (
          <div className="space-y-4">
            {/* Status notification banner on finish */}
            {phase === 'done' && (
              <div
                className={`rounded-[16px] p-4 flex items-start gap-3 border ${
                  isAllPassed
                    ? 'border-[#C9B8FF]/40 bg-[#C9B8FF]/10'
                    : 'border-[#FF8A80]/40 bg-[#FF8A80]/10'
                }`}
                role="status"
              >
                <i
                  className={`ti ${
                    isAllPassed ? 'ti-circle-check text-[#C9B8FF]' : 'ti-alert-circle text-[#FF8A80]'
                  } text-[22px] shrink-0 mt-0.5`}
                  aria-hidden="true"
                />
                <div className="flex-1">
                  <div className="text-[15px] font-medium text-[#F4F2EC]">
                    {isAllPassed
                      ? 'All checks passed. Your SDK is ready.'
                      : `${failedCount} check needs attention`}
                  </div>
                  <div className="sub text-[12.5px] text-[#9A9892] mt-0.5 leading-relaxed">
                    {isAllPassed
                      ? `${passedCount} of ${checks.length} passed in ${(
                          (runHistory[0]?.ms || 0) / 1000
                        ).toFixed(1)} seconds.`
                      : 'Fix it and run the test again. Nothing was charged and no rewards were created.'}
                  </div>
                </div>
              </div>
            )}

            {/* Progress bar during run */}
            {phase === 'running' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[12.5px] text-[#B8B6AE]">
                  <span>Running {Math.min(resolvedCount + 1, checks.length)} of {checks.length}</span>
                  <button
                    type="button"
                    className="text-[#9C9A92] hover:text-[#F4F2EC] cursor-pointer bg-transparent border-0"
                    onClick={() => {
                      cancelRef.current = true;
                    }}
                  >
                    Cancel
                  </button>
                </div>
                <div
                  className="h-1.5 rounded-full bg-[#1B1B1B] overflow-hidden"
                  role="progressbar"
                  aria-valuenow={resolvedCount}
                  aria-valuemin={0}
                  aria-valuemax={checks.length}
                >
                  <div
                    className="h-full bg-[#C9B8FF] transition-all duration-300 rounded-full"
                    style={{ width: `${(resolvedCount / Math.max(checks.length, 1)) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Checklist of 8 items */}
            <ul className="divide-y divide-[#1B1B1B] border border-[#222222] rounded-[16px] overflow-hidden list-none p-0 m-0">
              {checks.map((item) => {
                const isExpanded = expandedCheckId === item.id;
                return (
                  <li key={item.id} className="bg-[#0E0E0E]">
                    <button
                      type="button"
                      disabled={!item.detail}
                      onClick={() => setExpandedCheckId(isExpanded ? null : item.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer disabled:cursor-default bg-transparent border-0 transition-colors hover:bg-[#141414]"
                      aria-expanded={isExpanded}
                    >
                      {renderCheckIcon(item.state)}
                      <span className="flex-1 text-[13.5px] text-[#F4F2EC]">{item.label}</span>
                      <span
                        className={`text-[12px] font-mono ${
                          item.state === 'fail' ? 'text-[#FF8A80]' : 'text-[#9C9A92]'
                        }`}
                      >
                        {getStateLabel(item.state)}
                        {item.ms ? ` · ${(item.ms / 1000).toFixed(1)} s` : ''}
                      </span>
                      {item.detail && (
                        <i
                          className={`ti ${
                            isExpanded ? 'ti-chevron-up' : 'ti-chevron-down'
                          } text-[14px] text-[#9C9A92]`}
                          aria-hidden="true"
                        />
                      )}
                    </button>

                    {/* Expandable Details, logs, and remediation steps */}
                    {isExpanded && item.detail && (
                      <div className="px-4 pb-4 pl-[44px] space-y-2 border-t border-[#181818] pt-2">
                        <div className="text-[13px] text-[#B8B6AE] leading-relaxed">{item.detail}</div>
                        {item.log && item.log.length > 0 && (
                          <div className="code mt-2 text-[11.5px] p-2.5 rounded-[12px] bg-[#070707] border border-[#1F1F1F]">
                            {item.log.join('\n')}
                          </div>
                        )}
                        {item.fix && item.fix.length > 0 && (
                          <div className="pt-2">
                            <div className="text-[11px] tracking-[0.08em] uppercase text-[#9C9A92] font-semibold mb-1">
                              How to fix
                            </div>
                            <ol className="list-decimal pl-4 space-y-1 text-[12.5px] text-[#B8B6AE] leading-relaxed">
                              {item.fix.map((fStep, sIdx) => (
                                <li key={sIdx}>{fStep}</li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Actions on Finish */}
            {phase === 'done' && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  className={btnPill}
                  onClick={() => {
                    setScenario(isAllPassed ? scenario : 'pass');
                    setPhase('detected');
                    setHasAgreed(false);
                    onStatus('idle');
                  }}
                >
                  <i className="ti ti-refresh text-[13px]" aria-hidden="true"></i>
                  <span>Run again</span>
                </button>

                <button
                  type="button"
                  className={btnPill}
                  onClick={handleCopyReport}
                >
                  <i className="ti ti-copy text-[13px]" aria-hidden="true"></i>
                  <span>{copiedReport ? 'Copied' : 'Copy report'}</span>
                </button>

                {status === 'ok' && (
                  <span className="sub text-[12.5px] text-[#C9B8FF] pl-2 font-medium">
                    ✓ Verified. Ready to fund campaign.
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer disclaimer */}
      <div className="px-5 py-3 border-t border-[#222222] flex items-center gap-2 text-[11.5px] text-[#9C9A92]">
        <i className="ti ti-shield-lock text-[13px] text-[#C9B8FF]" aria-hidden="true"></i>
        <span>Runs use test data only and are saved to your audit trail. Only admins can run tests.</span>
      </div>
    </div>
  );
};
