import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { CoreLoadingScreen } from './components/CoreLoadingScreen';
import { KeySystemModal } from './components/KeySystemModal';
import { CoreWorkspace } from './components/CoreWorkspace';
import {
  PLATOBOOST_DEFAULT_KEY_TTL_MS,
  SavedKeyRecord,
  evaluateSavedKeySession,
} from './utils/coreAuth';

type AppStage = 'loading' | 'key_gate' | 'workspace';

const SAVED_KEY_STORAGE_KEY = 'core_xyz_saved_key_v44';

function loadSavedKeyRecord(): SavedKeyRecord | null {
  try {
    const raw = window.localStorage.getItem(SAVED_KEY_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedKeyRecord;
  } catch {
    return null;
  }
}

function saveKeyRecord(record: SavedKeyRecord | null): void {
  try {
    if (!record || !record.rememberKey) {
      window.localStorage.removeItem(SAVED_KEY_STORAGE_KEY);
    } else {
      window.localStorage.setItem(SAVED_KEY_STORAGE_KEY, JSON.stringify(record));
    }
  } catch {
    // Ignore storage quota errors in restricted frames
  }
}

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

  const [rememberKey, setRememberKey] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const existing = loadSavedKeyRecord();
      if (existing && typeof existing.rememberKey === 'boolean') {
        return existing.rememberKey;
      }
    }
    return true;
  });

  const [expiredNotice, setExpiredNotice] = useState<string | null>(null);

  const [keyExpiresAtMs, setKeyExpiresAtMs] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const existing = loadSavedKeyRecord();
      if (existing && existing.expiresAtMs) {
        return existing.expiresAtMs;
      }
    }
    return Date.now() + PLATOBOOST_DEFAULT_KEY_TTL_MS;
  });

  const handleLoaderComplete = () => {
    const record = loadSavedKeyRecord();
    const evaluation = evaluateSavedKeySession(record, Date.now());
    if (evaluation.status === 'valid' && evaluation.record) {
      setExpiredNotice(null);
      setKeyExpiresAtMs(evaluation.record.expiresAtMs);
      setStage('workspace');
      return;
    }
    if (evaluation.status === 'expired') {
      saveKeyRecord(null);
      setExpiredNotice(evaluation.notificationMessage);
      setStage('key_gate');
      return;
    }
    setExpiredNotice(null);
    setStage('key_gate');
  };

  const handleSimulateExpiredSavedKey = () => {
    const expiredRecord: SavedKeyRecord = {
      key: 'KEY_PLATOBOOST_EXPIRED_DEMO',
      savedAtMs: Date.now() - 48 * 3600 * 1000,
      expiresAtMs: Date.now() - 1000,
      rememberKey: true,
    };
    saveKeyRecord(expiredRecord);
    const evaluation = evaluateSavedKeySession(expiredRecord, Date.now());
    saveKeyRecord(null);
    setExpiredNotice(evaluation.notificationMessage);
    setStage('key_gate');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <AnimatePresence mode="wait">
        {stage === 'loading' && (
          <CoreLoadingScreen
            key="loader"
            onComplete={handleLoaderComplete}
          />
        )}

        {stage === 'key_gate' && (
          <KeySystemModal
            key="key_gate"
            rememberKey={rememberKey}
            onToggleRememberKey={(next) => {
              setRememberKey(next);
              if (!next) {
                saveKeyRecord(null);
              }
            }}
            expiredNotificationMessage={expiredNotice}
            onAuthorized={(verifiedKey, expiresAtMs, shouldRemember) => {
              const finalExpires = expiresAtMs ?? Date.now() + PLATOBOOST_DEFAULT_KEY_TTL_MS;
              const finalRemember = shouldRemember ?? rememberKey;
              setKeyExpiresAtMs(finalExpires);
              setRememberKey(finalRemember);
              setExpiredNotice(null);
              if (finalRemember && verifiedKey) {
                saveKeyRecord({
                  key: verifiedKey,
                  savedAtMs: Date.now(),
                  expiresAtMs: finalExpires,
                  rememberKey: true,
                });
              } else {
                saveKeyRecord(null);
              }
              setStage('workspace');
            }}
            onReplayIntro={() => setStage('loading')}
          />
        )}

        {stage === 'workspace' && (
          <CoreWorkspace
            key="workspace"
            keyExpiresAtMs={keyExpiresAtMs}
            rememberKey={rememberKey}
            onToggleRememberKey={(next) => {
              setRememberKey(next);
              if (!next) {
                saveKeyRecord(null);
              } else {
                saveKeyRecord({
                  key: 'KEY_PLATOBOOST_ACTIVE_SESSION',
                  savedAtMs: Date.now(),
                  expiresAtMs: keyExpiresAtMs,
                  rememberKey: true,
                });
              }
            }}
            onReplayIntro={() => setStage('loading')}
            onLockSession={() => {
              setExpiredNotice(null);
              setStage('key_gate');
            }}
            onSimulateExpiredKey={handleSimulateExpiredSavedKey}
          />
        )}
      </AnimatePresence>
    </div>
  );
}


