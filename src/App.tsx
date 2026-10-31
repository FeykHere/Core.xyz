import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { CoreLoadingScreen } from './components/CoreLoadingScreen';
import { KeySystemModal } from './components/KeySystemModal';
import { CoreWorkspace } from './components/CoreWorkspace';
import { PLATOBOOST_DEFAULT_KEY_TTL_MS } from './utils/coreAuth';

type AppStage = 'loading' | 'key_gate' | 'workspace';

export default function App() {
  const [stage, setStage] = useState<AppStage>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        return 'workspace';
      }
      if (params.get('stage') === 'key') {
        return 'key_gate';
      }
    }
    return 'loading';
  });

  const [keyExpiresAtMs, setKeyExpiresAtMs] = useState<number>(
    () => Date.now() + PLATOBOOST_DEFAULT_KEY_TTL_MS
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <AnimatePresence mode="wait">
        {stage === 'loading' && (
          <CoreLoadingScreen
            key="loader"
            onComplete={() => setStage('key_gate')}
          />
        )}

        {stage === 'key_gate' && (
          <KeySystemModal
            key="key_gate"
            onAuthorized={(_verifiedKey, expiresAtMs) => {
              setKeyExpiresAtMs(expiresAtMs ?? Date.now() + PLATOBOOST_DEFAULT_KEY_TTL_MS);
              setStage('workspace');
            }}
            onReplayIntro={() => setStage('loading')}
          />
        )}

        {stage === 'workspace' && (
          <CoreWorkspace
            key="workspace"
            keyExpiresAtMs={keyExpiresAtMs}
            onReplayIntro={() => setStage('loading')}
            onLockSession={() => setStage('key_gate')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

