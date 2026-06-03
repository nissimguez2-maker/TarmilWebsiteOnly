import { Navigate, Route, Routes } from 'react-router-dom';
import { WebPlannerScreen } from './screens/web/WebPlannerScreen';
import { InfoPage } from './screens/web/InfoPage';

/**
 * Web-only route table.
 *
 * The planner is the whole product, so it owns `/`. The native app, the
 * social / forums / tools surfaces, and the old app-vs-web ModeToggle were all
 * dropped in the web extraction. `/web` redirects to `/` for any in-flight links.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<WebPlannerScreen />} />
      <Route path="/info" element={<InfoPage />} />
      <Route path="/web" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
