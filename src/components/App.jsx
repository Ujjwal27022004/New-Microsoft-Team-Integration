import { useEffect } from "react";
import {
  FluentProvider,
  teamsLightTheme,
  teamsDarkTheme,
  teamsHighContrastTheme,
  Spinner,
  tokens,
} from "@fluentui/react-components";
import { HashRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { useTeamsUserCredential } from "@microsoft/teamsfx-react";
import Privacy from "./Privacy";
import TermsOfUse from "./TermsOfUse";
import Tab from "./Tab";
import MessageExtension from "./sample/MessageExtension";
import Bot from "./sample/Bot";
import MeetingExtension from "./sample/MeetingExtension";
import { TeamsFxContext } from "./Context";
import config from "./sample/lib/config";
import Navigation from "./sample/Navigation"; // Sidebar Navigation

import * as microsoftTeams from "@microsoft/teams-js";
import AdminConfig from "./sample/AdminConfig";
import AdminPanel from "./sample/AdminPanel";

export default function App() {
  const { loading, theme, themeString, teamsUserCredential } = useTeamsUserCredential({
    initiateLoginEndpoint: config.initiateLoginEndpoint,
    clientId: config.clientId,
  });



  useEffect(() => {
    microsoftTeams.app.initialize().then(() => {
        microsoftTeams.app.enableFullScreen();
    }).catch(err => console.log("Error enabling fullscreen:", err));
}, []);

  


  return (
    <div style={{ backgroundColor: theme === "contrast" ? "#2B2B2B" : "#FFFFFF" }}>
    <TeamsFxContext.Provider value={{ theme, themeString, teamsUserCredential }}>
      <FluentProvider
        theme={
          themeString === "dark"
            ? teamsDarkTheme
            : themeString === "contrast"
            ? teamsHighContrastTheme
            : {
                ...teamsLightTheme,
                colorNeutralBackground3: "#eeeeee",
              }
        }
        style={{ background: tokens.colorNeutralBackground3 }}
      >
        <Router>
          {loading ? (
            <Spinner style={{ margin: 100 }} />
          ) : (
            <div className="flex h-screen">
              <Navigation /> {/* Static Sidebar */}
              <div className="flex-1 p-6 bg-gray-100" style={{ marginLeft: "250px" }}>
                <Routes>
                <Route path="/home" element={<Privacy />} />
                    <Route path="/dashboard" element={<MessageExtension />} />
                    <Route path="/settings" element={<MeetingExtension />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/termsofuse" element={<TermsOfUse />} />
                  <Route path="/tab" element={<Tab />} />
                  <Route path="/message-extension" element={<MessageExtension />} />
                  <Route path="/bot" element={<Bot />} />
                  <Route path="/meeting-extension" element={<MeetingExtension />} />
                  <Route path="/adminconfig" element={<AdminPanel />} />
                  <Route path="*" element={<Navigate to="/tab" />} />
                </Routes>
              </div>
            </div>
          )}
        </Router>
      </FluentProvider>
    </TeamsFxContext.Provider>
    </div>
    
  );
}
