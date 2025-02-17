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
import Navigation from "./sample/Navigation"; // New Navigation Component

import * as microsoftTeams from "@microsoft/teams-js";

export default function App() {
  const { loading, theme, themeString, teamsUserCredential } = useTeamsUserCredential({
    initiateLoginEndpoint: config.initiateLoginEndpoint,
    clientId: config.clientId,
  });

  useEffect(() => {
    // Initialize the Microsoft Teams SDK
    microsoftTeams.initialize(() => {
      // Set the frame context to ensure the app is viewed as a tab
      microsoftTeams.getContext((context) => {
        console.log("Teams Context:", context);

        // Notify Teams that the app has successfully initialized
        microsoftTeams.app.notifySuccess();

        // Only set the frame context once the SDK is initialized
        if (context) {
          microsoftTeams.app.setFrameContext({
            frameContext: "content", // Ensures it's in a tab view
            hideDefaultAppBar: true, // Hides the default Teams navbar
          });
        }
      });
    });
  }, []);

  return (
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
            <>
              <Navigation /> {/* Add navigation */}
              <Routes>
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/termsofuse" element={<TermsOfUse />} />
                <Route path="/tab" element={<Tab />} />
                <Route path="/message-extension" element={<MessageExtension />} />
                <Route path="/bot" element={<Bot />} />
                <Route path="/meeting-extension" element={<MeetingExtension />} />
                <Route path="*" element={<Navigate to="/tab" />} />
              </Routes>
            </>
          )}
        </Router>
      </FluentProvider>
    </TeamsFxContext.Provider>
  );
}
