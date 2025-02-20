import { TeamsActivityHandler, CardFactory } from "botbuilder";
import axios from "axios";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const JIRA_BASE_URL = "https://ujjwal27022004.atlassian.net/rest/api/3";
const JIRA_AUTH = {
    auth: {
        username: "ujjwal27022004@gmail.com",
        password: "ATATT3xFfGF0...YOUR_API_TOKEN"
    }
};

const genAI = new GoogleGenerativeAI('AIzaSyAX3ip1tiKjvkO1ziMrLLQiSz3qPJ2DUAA');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

let adminConfig = { fields: ["summary", "description", "status"] };

const intents = {
    "jira_status": ["check jira", "jira status", "issue status"],
    "create_issue": ["create issue", "new jira", "add bug"],
    "faq": ["help", "support", "how to"],
    "general": ["hello", "hi", "who are you"]
};

export class TeamsBot extends TeamsActivityHandler {
    constructor() {
        super();

        this.onMessage(async (context, next) => {
            // Handle form submissions
            if (context.activity.value) {
                const formData = context.activity.value;
                if (formData.action === "createIssue") {
                    return this.handleIssueCreation(context, formData);
                }
            }

            // Handle text commands
            const userMessage = context.activity.text.toLowerCase();
            const intent = this.detectIntent(userMessage);

            let response;
            if (intent === "create_issue") {
                await this.sendIssueCreationCard(context);
            } else if (intent === "jira_status") {
                const match = userMessage.match(/project=(\w+)/);
                if (match) {
                    const projectId = match[1];
                    response = await this.fetchJiraIssues(projectId);
                } else {
                    response = "Please provide a project ID. Example: 'jira status project=ABC'";
                }
                await context.sendActivity(response);
            } else if (intent === "faq") {
                response = "Here are some FAQs:\n1. How to create a Jira issue?\n2. How to check status?\n3. How to integrate Teams bot?";
                await context.sendActivity(response);
            } else if (intent === "general") {
                response = "Hello! I am your Project Assistant. How can I help you today?";
                await context.sendActivity(response);
            } else {
                response = await this.getAIResponse(userMessage);
                await context.sendActivity(response);
            }

            await next();
        });
    }

    async sendIssueCreationCard(context) {
        const card = CardFactory.adaptiveCard({
            $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
            type: "AdaptiveCard",
            version: "1.2",
            body: [
                {
                    type: "TextBlock",
                    size: "Medium",
                    weight: "Bolder",
                    text: "🛠️ Create New Jira Issue",
                    wrap: true
                },
                {
                    type: "Input.Text",
                    id: "title",
                    placeholder: "Enter issue title",
                    label: "Title",
                    isRequired: true
                },
                {
                    type: "Input.Text",
                    id: "description",
                    placeholder: "Describe the issue...",
                    label: "Description",
                    isMultiline: true,
                    isRequired: true
                },
                {
                    type: "Input.ChoiceSet",
                    id: "priority",
                    label: "Priority",
                    value: "Medium",
                    choices: [
                        { title: "🔥 High", value: "High" },
                        { title: "🟡 Medium", value: "Medium" },
                        { title: "🟢 Low", value: "Low" }
                    ]
                }
            ],
            actions: [
                {
                    type: "Action.Submit",
                    title: "Create Issue",
                    data: { action: "createIssue" }
                }
            ]
        });

        await context.sendActivity({ attachments: [card] });
    }

    async handleIssueCreation(context, formData) {
        try {
            const issueDescription = formData.description;
            const issueType = formData.priority; // Assuming 'priority' from the form is used as 'issueType'
    
            // Send request to your backend API
            const response = await axios.post("http://localhost:5000/create-jira-issue", {
                description: issueDescription,
                issueType: issueType
            });
    
            await context.sendActivity(`✅ ${response.data.message}\nIssue: ${JSON.stringify(response.data.issue, null, 2)}`);
        } catch (error) {
            console.error("❌ Error creating Jira issue:", error.response?.data || error.message);
            await context.sendActivity("❌ Failed to create issue. Please check the server logs.");
        }
    }
    
    

    detectIntent(userMessage) {
        for (const [intent, keywords] of Object.entries(intents)) {
            if (keywords.some(keyword => userMessage.includes(keyword))) {
                return intent;
            }
        }
        return "unknown";
    }

    async getAIResponse(prompt) {
        try {
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.error("Error generating AI response:", error);
            return "Sorry, I couldn't process your request.";
        }
    }

    async fetchJiraIssues(projectId) {
        try {
            const response = await axios.get(`${JIRA_BASE_URL}/search?jql=project=${projectId}`, JIRA_AUTH);
            const issues = response.data.issues.map(issue => `🔹 ${issue.key}: ${issue.fields.summary}`).join("\n");

            return `✅ Issues for Project ${projectId}:\n${issues || "No issues found."}`;
        } catch (error) {
            console.error("❌ Error fetching Jira issues:", error.response?.data || error.message);
            return "❌ Failed to fetch issues.";
        }
    }

    async sendJiraNotification(issueData) {
        const { key, fields } = issueData.issue;
        const notificationFields = adminConfig.fields.map(field => `${field}: ${fields[field]}`).join("\n");

        const card = {
            type: "AdaptiveCard",
            body: [{ type: "TextBlock", text: `🚀 Jira Issue Updated: ${key}\n${notificationFields}` }],
            actions: [{ type: "Action.OpenUrl", title: "View Issue", url: `${JIRA_BASE_URL}/browse/${key}` }],
            $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
            version: "1.2"
        };

        await this.sendToTeams(CardFactory.adaptiveCard(card));
    }

    async sendToTeams(card) {
        const conversationId = "YOUR_TEAMS_CONVERSATION_ID";
        await axios.post(`https://smba.trafficmanager.net/amer/v3/conversations/${conversationId}/activities`, {
            type: "message",
            attachments: [{ contentType: "application/vnd.microsoft.card.adaptive", content: card }]
        }, { headers: { Authorization: `Bearer YOUR_BOT_TOKEN` } });
    }

    async updateAdminConfig(newConfig) {
        adminConfig = newConfig;
    }
}
