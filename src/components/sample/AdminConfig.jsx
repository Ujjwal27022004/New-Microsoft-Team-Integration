import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Checkbox,
  PrimaryButton,
  DefaultButton,
  Stack,
  TextField,
} from "@fluentui/react";

export default function AdminConfig() {
  const [config, setConfig] = useState({
    issueKey: false,
    summary: false,
    status: false,
    priority: false,
    description: false,
  });
  const [customField, setCustomField] = useState("");
  const API_URL = "http://localhost:5000/api/admin/config"; // Update with your backend API

  // Fetch latest schema from backend
  const fetchConfig = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/latest-notification-schema");
      setConfig(response.data || {}); // Set latest config
    } catch (error) {
      console.error("Error fetching config:", error);
    }
  };

  // Save updated schema to backend
  const saveConfig = async () => {
    try {
        // Prepare the request body
        const updatedConfig = {
            schemaId: 1,
            fields: {
                issueKey: config.issueKey ?? false,
                summary: config.summary ?? false,
                status: config.status ?? false,
                priority: config.priority ?? false,
                description: config.description ?? false
            },
            templateName: "Updated Schema Template",
            summary: config.summary ? 1 : 0,
            status: config.status ? 1 : 0,
            priority: config.priority ? 1 : 0,
            description: config.description ? 1 : 0,
            issueUrl: config.issueUrl ? 1 : 0
        };
        console.log("Updated Config:", updatedConfig);

        await axios.put("http://localhost:5000/api/admin/update-notification-schema", updatedConfig);
        alert("Configuration saved successfully!");
    } catch (error) {
        console.error("Error saving config:", error);
        alert("Failed to save configuration.");
    }
  };

  // Handle checkbox toggles
  const handleCheckboxChange = (field, checked) => {
    setConfig((prev) => ({ ...prev, [field]: checked }));
  };

  useEffect(() => {
    fetchConfig(); // Load config on component mount
  }, []);

  return (
    <Stack
      tokens={{ childrenGap: 15 }}
      styles={{
        root: {
          width: 400,
          padding: 20,
          background: "#f3f2f1",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <h2 style={{ fontSize: "18px", fontWeight: "bold" }}>
        Admin Notification Configuration
      </h2>

      {/* Checkboxes for selected fields */}
      {["issueKey", "summary", "status", "priority", "description"].map(
        (field) => (
          <Checkbox
            key={field}
            label={field}
            checked={config[field]}
            onChange={(e, checked) => handleCheckboxChange(field, checked)}
          />
        )
      )}

      {/* Input for Custom Field */}
      <TextField
        label="Custom Field"
        placeholder="Enter Custom Field"
        value={customField}
        onChange={(e, newValue) => setCustomField(newValue)}
      />

      {/* Buttons */}
      <Stack horizontal tokens={{ childrenGap: 10 }}>
        <PrimaryButton onClick={saveConfig} text="Save Config" />
        <DefaultButton onClick={fetchConfig} text="Refresh" />
      </Stack>
    </Stack>
  );
}
