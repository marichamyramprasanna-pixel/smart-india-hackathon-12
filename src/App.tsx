import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { DemoScenarioProvider } from './context/DemoScenarioContext'
import { InvestigationProvider } from './context/InvestigationContext'
import { SentinelAIProvider } from './context/SentinelAIContext'
import { AppShell } from './components/layout/AppShell'

// Page components
import { OverviewPage } from './pages/OverviewPage'
import { LiveNetworkPage } from './pages/LiveNetworkPage'
import { ThreatDetectionPage } from './pages/ThreatDetectionPage'
import { Network3DPage } from './pages/Network3DPage'
import { AttackGraphPage } from './pages/AttackGraphPage'
import { AttackTimelinePage } from './pages/AttackTimelinePage'
import { DevicesPage } from './pages/DevicesPage'
import { DeviceDetailPage } from './pages/DeviceDetailPage'
import { BlockedDevicesPage } from './pages/BlockedDevicesPage'
import { DeletedDevicesPage } from './pages/DeletedDevicesPage'
import { AIAnalysisPage } from './pages/AIAnalysisPage'
import { AIChatPage } from './pages/AIChatPage'
import { ReportsPage } from './pages/ReportsPage'
import { SettingsPage } from './pages/SettingsPage'
import { FaqLandingPage } from './pages/FaqLandingPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 mins
    },
  },
})

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <DemoScenarioProvider>
            <InvestigationProvider>
              <SentinelAIProvider>
                <BrowserRouter>
                  <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={<AppShell />}>
                      <Route index element={<OverviewPage />} />
                      <Route path="live" element={<LiveNetworkPage />} />
                      <Route path="threats" element={<ThreatDetectionPage />} />
                      <Route path="network-3d" element={<Network3DPage />} />
                      <Route path="attack-graph" element={<AttackGraphPage />} />
                      <Route path="timeline" element={<AttackTimelinePage />} />
                      <Route path="devices" element={<DevicesPage />} />
                      <Route path="devices/:id" element={<DeviceDetailPage />} />
                      <Route path="blocked-devices" element={<BlockedDevicesPage />} />
                      <Route path="deleted-devices" element={<DeletedDevicesPage />} />
                      <Route path="ai-analysis" element={<AIAnalysisPage />} />
                      <Route path="ai-chat" element={<AIChatPage />} />
                      <Route path="reports" element={<ReportsPage />} />
                      <Route path="settings" element={<SettingsPage />} />
                      <Route path="faq" element={<FaqLandingPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Route>
                  </Routes>
                </BrowserRouter>
              </SentinelAIProvider>
            </InvestigationProvider>
          </DemoScenarioProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
