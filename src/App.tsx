import React, { useState } from 'react';
import { BaristaOSProvider, useBaristaOS } from './context/BaristaOSContext';
import { TopNav } from './components/TopNav';
import { Sidebar } from './components/Sidebar';
import { DailyQCView } from './components/DailyQC/DailyQCView';
import { DialInModal } from './components/DailyQC/DialInModal';
import { ShotTimerModal } from './components/DailyQC/ShotTimerModal';
import { RecipesView } from './components/Recipes/RecipesView';
import { TrainingView } from './components/Training/TrainingView';
import { ExamsView } from './components/Exams/ExamsView';
import { EquipmentView } from './components/Equipment/EquipmentView';
import { InventoryView } from './components/Inventory/InventoryView';
import { ChecklistsView } from './components/Checklists/ChecklistsView';
import { StaffPerformanceView } from './components/Staff/StaffPerformanceView';
import { ProductivityView } from './components/Analytics/ProductivityView';
import { SubscriptionView } from './components/Subscription/SubscriptionView';
import { SubscriptionModal } from './components/Subscription/SubscriptionModal';
import { OfflineIndicator } from './components/Offline/OfflineIndicator';
import { OfflineSyncModal } from './components/Offline/OfflineSyncModal';
import { EspressoRecipe } from './types';

const MainContent: React.FC = () => {
  const { 
    activeTab, 
    quickShotTimerOpen, 
    setQuickShotTimerOpen,
    showSubscriptionModal,
    setShowSubscriptionModal,
    showOfflineSyncModal,
    setShowOfflineSyncModal
  } = useBaristaOS();

  const [dialInModalOpen, setDialInModalOpen] = useState(false);
  const [shotTimerOpen, setShotTimerOpen] = useState(false);
  const [dialInPrefillData, setDialInPrefillData] = useState<{
    timeSeconds?: number;
    yieldGrams?: number;
    yieldOut?: number;
    doseIn?: number;
    tdsPercent?: number;
    recipeId?: string;
    adjustmentsMade?: string;
  } | undefined>(undefined);

  const handleOpenDialIn = (prefill?: {
    timeSeconds?: number;
    yieldGrams?: number;
    yieldOut?: number;
    doseIn?: number;
    tdsPercent?: number;
    recipeId?: string;
    adjustmentsMade?: string;
  }) => {
    if (prefill) {
      const normalized = {
        ...prefill,
        yieldGrams: prefill.yieldGrams ?? prefill.yieldOut
      };
      setDialInPrefillData(normalized);
    } else {
      setDialInPrefillData(undefined);
    }
    setDialInModalOpen(true);
  };

  const handleDialInWithRecipe = (recipe: EspressoRecipe) => {
    handleOpenDialIn({
      recipeId: recipe.id,
      doseIn: recipe.recommendedDose,
      yieldOut: recipe.targetYield
    } as any);
  };

  const handleShotTimerExport = (data: { timeSeconds: number; yieldGrams: number }) => {
    handleOpenDialIn({
      timeSeconds: data.timeSeconds,
      yieldGrams: data.yieldGrams
    });
  };

  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-100 overflow-hidden font-sans select-none antialiased">
      {/* Primary Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Zone */}
        <TopNav
          onOpenDialInModal={() => handleOpenDialIn(undefined)}
          onOpenShotTimer={() => setShotTimerOpen(true)}
          onOpenLicenseModal={() => setShowSubscriptionModal(true)}
        />

        {/* Scrollable Viewport Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'qc-dialin' && (
              <DailyQCView
                onOpenDialInModal={handleOpenDialIn}
                onOpenShotTimer={() => setShotTimerOpen(true)}
              />
            )}

            {activeTab === 'recipes' && (
              <RecipesView onOpenDialInWithRecipe={handleDialInWithRecipe} />
            )}

            {activeTab === 'training' && <TrainingView />}

            {activeTab === 'exams' && <ExamsView />}

            {activeTab === 'equipment' && <EquipmentView />}

            {activeTab === 'inventory' && <InventoryView />}

            {activeTab === 'checklists' && <ChecklistsView />}

            {activeTab === 'staff' && <StaffPerformanceView />}

            {activeTab === 'productivity' && <ProductivityView />}

            {activeTab === 'subscription' && <SubscriptionView />}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <DialInModal
        isOpen={dialInModalOpen}
        onClose={() => setDialInModalOpen(false)}
        initialData={dialInPrefillData}
      />

      <ShotTimerModal
        isOpen={shotTimerOpen || quickShotTimerOpen}
        onClose={() => {
          setShotTimerOpen(false);
          setQuickShotTimerOpen(false);
        }}
        onOpenDialInModalWithData={handleShotTimerExport}
      />

      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />

      {/* Offline Storage & Service Worker Sync Modal */}
      <OfflineSyncModal
        isOpen={showOfflineSyncModal}
        onClose={() => setShowOfflineSyncModal(false)}
      />

      {/* Floating Offline Status Toast */}
      <OfflineIndicator onOpenSyncModal={() => setShowOfflineSyncModal(true)} />
    </div>
  );
};

export default function App() {
  return (
    <BaristaOSProvider>
      <MainContent />
    </BaristaOSProvider>
  );
}
