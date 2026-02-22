import { useState, useEffect, useCallback } from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";
import {
  getPendingAnswers,
  getPendingCompletions,
  removePendingAnswer,
  removePendingCompletion,
  hasPendingSync,
} from "@/lib/offlineStore";
import { useTranslation } from "react-i18next";

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation('common');

  const syncPending = useCallback(async () => {
    const pending = await hasPendingSync();
    if (!pending || !navigator.onLine) return;

    setSyncing(true);
    try {
      const answers = await getPendingAnswers();
      for (const answer of answers) {
        try {
          await apiService.submitAnswer(
            answer.attemptId,
            answer.questionId,
            answer.selectedAnswerIndex,
            answer.selectedAnswerIndexes
          );
          await removePendingAnswer(answer.key);
        } catch {
          break;
        }
      }

      const completions = await getPendingCompletions();
      for (const completion of completions) {
        try {
          await apiService.completeQuiz(completion.attemptId, completion.timeSpent);
          await removePendingCompletion(completion.key);
        } catch {
          break;
        }
      }

      const stillPending = await hasPendingSync();
      if (!stillPending) {
        toast({
          title: t('feedback.synced'),
          description: t('feedback.syncedDesc'),
        });
      }
    } catch {
      // Will retry on next online event
    } finally {
      setSyncing(false);
    }
  }, [toast, t]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      syncPending();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (navigator.onLine) {
      syncPending();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [syncPending]);

  if (!isOffline && !syncing) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg border-2 px-4 py-2 shadow-lg bg-background">
      {syncing ? (
        <>
          <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
          <span className="text-sm font-medium text-blue-600">{t('status.syncing')}</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-600">
            {t('status.offline')}
          </span>
        </>
      )}
    </div>
  );
}
