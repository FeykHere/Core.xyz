import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { CoreLoadingScreen } from './components/CoreLoadingScreen';
import { KeySystemModal } from './components/KeySystemModal';
import { CoreWorkspace } from './components/CoreWorkspace';

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
            onAuthorized={() => setStage('workspace')}
            onReplayIntro={() => setStage('loading')}
          />
        )}

        {stage === 'workspace' && (
          <CoreWorkspace
            key="workspace"
            onReplayIntro={() => setStage('loading')}
            onLockSession={() => setStage('key_gate')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
