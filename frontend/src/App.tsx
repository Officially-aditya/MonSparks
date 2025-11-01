import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Web3Provider } from "./context/Web3Context";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import QuestCenter from "./pages/QuestCenter";
import BridgePanel from "./pages/BridgePanel";
import ActivityFeed from "./pages/ActivityFeed";
import Missions from "./pages/Missions";

const App: React.FC = () => {
  return (
    <Web3Provider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/quests" element={<QuestCenter />} />
            <Route path="/missions" element={<Missions />} />
            <Route path="/bridge" element={<BridgePanel />} />
            <Route path="/activity" element={<ActivityFeed />} />
          </Routes>
        </Layout>
      </Router>
    </Web3Provider>
  );
};

export default App;
