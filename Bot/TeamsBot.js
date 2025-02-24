import { TeamsActivityHandler, CardFactory } from "botbuilder";
import axios from "axios";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const JIRA_BASE_URL = "https://ujjwal27022004.atlassian.net/rest/api/3";
const JIRA_AUTH = {
    auth: {
        username: "ujjwal27022004@gmail.com",
        password: "ATATT3xFfGF0pVftmqKAXkKPnrCdWyd9xirEl3gh-pN8jHD3ao-o8mDk4ivLctOvvc-bwmOSixBnbRiEtv4rQyA5Q8bYXkYrTEtplRMKpRXg75SD8omTXcuahgoq-nUPlwCBS2DgQUb3eB2LGgd38dOFjcPsn1AQDGjMZYS5u58xTFNXxYx1_Qg=8F03938D"
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

function stripHtml(html) {
    return html.replace(/<[^>]*>/g, ''); // Removes all HTML tags
}

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
            console.log(userMessage)
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













    async handleTeamsMessagingExtensionFetchTask(context, action) {
        const selectedMessage = action.messagePayload.body.content || "";


        if (action.commandId === "Add_comment") {
            const issueKey = ""; // Ensure issue key is passed
            return {
                task: {
                    type: "continue",
                    value: {
                        title: "Add Comment",
                        height: 300,
                        width: 500,
                        card: CardFactory.adaptiveCard(this.getCommentCard(issueKey))
                    }
                }
            };
        }
        else if (action.commandId === "resolve_issue") {
            return {
                task: {
                    type: "continue",
                    value: {
                        title: "Resolve Jira Issue",
                        height: 400,
                        width: 500,
                        card: CardFactory.adaptiveCard(this.getResolveIssueCard())
                    }
                }
            };
        }
        return {
            task: {
                type: "continue",
                value: {
                    title: "Create Jira Issue",
                    height: 500,
                    width: 600,
                    card: CardFactory.adaptiveCard(this.getCreateIssueForm(selectedMessage)),
                }
            }
        };
    }

    // Handle form submission
    async handleTeamsMessagingExtensionSubmitAction(context, action) {

        if (action.data.action === "addComment") {
            return await this.handleAddComment(context, action);
        } 
        else  if (action.data.action === "fetchIssueStatuses") {
            const { issueKey } = action.data;
    
            if (!issueKey) {
                return {
                    composeExtension: {
                        type: "message",
                        text: "⚠️ Please enter an Issue Key first."
                    }
                };
            }
    
            const statuses = await this.fetchIssueStatuses(issueKey);
    
            if (statuses.length === 0) {
                return {
                    composeExtension: {
                        type: "message",
                        text: "❌ Failed to fetch statuses. Check the issue key."
                    }
                };
            }
    
            return {
                task: {
                    type: "continue",
                    value: {
                        title: "Update Issue Status",
                        height: 400,
                        width: 500,
                        card: CardFactory.adaptiveCard(this.getUpdateStatusCard(issueKey, statuses))
                    }
                }
            };
        } else if (action.data.action === "resolveIssue") {
            return await this.handleResolveIssue(context, action);
        }
        
        else {

            const { description, issueType } = action.data;
            try {
                // Call the backend API with only the required fields
                const response = await fetch("http://localhost:5000/create-jira-issue", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ description, issueType }) // Send only required fields
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const issueData = await response.json();
                console.log("Received issueData from API:", issueData.issue.key); // Debugging


                // Send a confirmation card back to Teams chat
                return {
                    composeExtension: {
                        type: "result",
                        attachmentLayout: "list",
                        attachments: [
                            CardFactory.adaptiveCard(this.getJiraIssueCard(issueData.issue.key, issueType, description))
                        ]
                    }
                };
            } catch (error) {
                return {
                    composeExtension: {
                        type: "message",
                        text: `❌ Failed to create Jira Issue: ${error.message}`
                    }
                };
            }
        }
    }


   
    

    // Adaptive Card for "Create Issue" Form
    getCreateIssueForm(preFilledDescription = "") {
        return {
            type: "AdaptiveCard",
            body: [

                {
                    type: "TextBlock", text: "Create Jira Issue", weight: "Bolder", size: "Medium", color: "Good", wrap: "true"
                },

                { type: "TextBlock", text: "Project", weight: "Bolder" },
                {
                    type: "Input.ChoiceSet",
                    id: "priority",
                    choices: [
                        { title: "Project1", value: "Project1" },
                        { title: "Project2", value: "Project2" },
                        { title: "Project3", value: "Project3" }
                    ],
                    value: "Project1"
                },

                { type: "TextBlock", text: "Issue Type", weight: "Bolder" },
                {
                    type: "Input.ChoiceSet",
                    id: "issueType",
                    choices: [
                        { title: "Task", value: "Task" },
                        { title: "Bug", value: "Bug" },
                        { title: "Story", value: "Story" }
                    ],
                    value: "Task"
                },

                { type: "TextBlock", text: "Title", weight: "Bolder" },
                { type: "Input.Text", id: "title", placeholder: "Enter issue title" },
                { type: "TextBlock", text: "Description", weight: "Bolder" },
                {
                    type: "Input.Text",
                    id: "description",

                    value: stripHtml(preFilledDescription),
                    height: "stretch",
                    "isMultiline": true,


                },

                {
                    "type": "TextBlock",
                    "text": "Attachments",
                    "weight": "Bolder",
                    "spacing": "medium"
                  },
                  {
                    "type": "ActionSet",
                    "actions": [
    
                        {
                            "type": "Action.Submit",
                            "title": "Create",
                            "style": "positive",
                            "data": { "action": "createIssue" }
                        },
                      {
                        "type": "Action.OpenUrl",
                        "title": "📎 Upload from OneDrive",
                        "url": "https://onedrive.live.com"
                      }
                    ]
                  }
    
            ],
            actions: [{ type: "Action.Submit", title: "Create", style: "positive" }],
            // actions: [{ type: "Action.Submit", title: "Create",style:"positive" }],
            version: "1.4"

        }
    }


    // Adaptive Card to Display Created Issue
    getJiraIssueCard(issueKey, title, description) {
        return {
            type: "AdaptiveCard",
            body: [
                { type: "TextBlock", color: "Good", text: `✅ Jira Issue Created: ${issueKey}`, weight: "Bolder", size: "Medium" },
                { type: "TextBlock", text: `**Title:** ${title}` },
                { type: "TextBlock", text: `**Description:** ${description}` },
                { type: "TextBlock", text: `[View Issue](https://ujjwal27022004.atlassian.net/browse/${issueKey})`, color: "Accent" }
            ],

            actions: [
                {
                    type: "Action.Submit",
                    title: "Add Comment",
                    data: { "action": "openCommentCard", "issueKey": issueKey }
                }
            ],
            version: "1.4"
        };
    }


    getCommentCard(issueKey) {
        return {
            type: "AdaptiveCard",
            body: [
                { type: "TextBlock", text: "Issue Key:", weight: "Bolder" },
                { type: "Input.Text", id: "issueKey", placeholder: "Enter issue key", value: issueKey },
                { type: "TextBlock", text: "Enter your comment:", weight: "Bolder" },
                { type: "Input.Text", id: "commentText", placeholder: "Type your comment here..." }
            ],
            actions: [
                {
                    type: "Action.Submit",
                    title: "Submit Comment",
                    data: { action: "addComment" }
                }
            ],
            version: "1.4"
        };
    }



    async handleAddComment(context, action) {
        const { issueKey, commentText } = action.data;

        // Validate input
        if (!issueKey || !commentText) {
            return {
                composeExtension: {
                    type: "message",
                    text: "⚠️ Please enter both an Issue Key and a Comment."
                }
            };
        }

        const jiraUrl = `https://ujjwal27022004.atlassian.net/rest/api/3/issue/${issueKey}/comment`;
        const auth = Buffer.from(`ujjwal27022004@gmail.com:ATATT3xFfGF0pVftmqKAXkKPnrCdWyd9xirEl3gh-pN8jHD3ao-o8mDk4ivLctOvvc-bwmOSixBnbRiEtv4rQyA5Q8bYXkYrTEtplRMKpRXg75SD8omTXcuahgoq-nUPlwCBS2DgQUb3eB2LGgd38dOFjcPsn1AQDGjMZYS5u58xTFNXxYx1_Qg=8F03938D`).toString("base64");

        try {
            const jiraResponse = await axios.post(
                jiraUrl,
                {
                    body: {
                        type: "doc",
                        version: 1,
                        content: [
                            {
                                type: "paragraph",
                                content: [{ type: "text", text: commentText }]
                            }
                        ]
                    }
                },
                {
                    headers: {
                        Authorization: `Basic ${auth}`,
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    }
                }
            );

            console.log("Jira API Response:", jiraResponse.data);

            return {
                composeExtension: {
                    type: "result",
                    attachmentLayout: "list",
                    attachments: [
                        {
                            contentType: "application/vnd.microsoft.card.adaptive",
                            content: {
                                type: "AdaptiveCard",
                                version: "1.4",
                                body: [
                                    {
                                        type: "TextBlock",
                                        size: "Medium",
                                        weight: "Bolder",
                                        text: "✅ Comment Added Successfully"
                                    },
                                    {
                                        type: "TextBlock",
                                        text: `**Issue:** ${issueKey}`,
                                        wrap: true
                                    },
                                    {
                                        type: "TextBlock",
                                        text: `**Comment:** ${commentText}`,
                                        wrap: true
                                    }
                                ],
                                actions: [
                                    {
                                        type: "Action.OpenUrl",
                                        title: "View Issue",
                                        url: `https://ujjwal27022004.atlassian.net/browse/${issueKey}`
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        } catch (error) {
            console.error("Error adding comment:", error.response ? error.response.data : error.message);

            return {
                composeExtension: {
                    type: "message",
                    text: `❌ Failed to add comment: ${error.response ? error.response.data.errorMessages[0] : error.message}`
                }
            };
        }
    }


    getResolveIssueCard() {
        return {
            type: "AdaptiveCard",
            body: [
                { type: "TextBlock", text: "Resolve Jira Issue", weight: "Bolder", size: "Medium" },
                { type: "TextBlock", text: "Enter Issue Key:", weight: "Bolder" },
                { type: "Input.Text", id: "issueKey", placeholder: "Enter issue key" }
            ],
            actions: [
                {
                    type: "Action.Submit",
                    title: "Get Status",
                    data: { action: "fetchIssueStatuses" }
                }
            ],
            version: "1.4"
        };
    }
    

    async fetchIssueStatuses(issueKey) {
        const jiraUrl = `https://ujjwal27022004.atlassian.net/rest/api/3/issue/${issueKey}/transitions`;
        const auth = Buffer.from(`ujjwal27022004@gmail.com:ATATT3xFfGF0pVftmqKAXkKPnrCdWyd9xirEl3gh-pN8jHD3ao-o8mDk4ivLctOvvc-bwmOSixBnbRiEtv4rQyA5Q8bYXkYrTEtplRMKpRXg75SD8omTXcuahgoq-nUPlwCBS2DgQUb3eB2LGgd38dOFjcPsn1AQDGjMZYS5u58xTFNXxYx1_Qg=8F03938D`).toString("base64");
    
        try {
            const response = await axios.get(jiraUrl, {
                headers: {
                    Authorization: `Basic ${auth}`,
                    Accept: "application/json"
                }
            });
    
            const statuses = response.data.transitions.map(transition => ({
                title: transition.name,
                value: transition.id
            }));
    
            return statuses;
        } catch (error) {
            console.error("Error fetching issue statuses:", error.response ? error.response.data : error.message);
            return [];
        }
    }

    getUpdateStatusCard(issueKey, statuses) {
        return {
            type: "AdaptiveCard",
            body: [
                { type: "TextBlock", text: "Update Jira Issue Status", weight: "Bolder", size: "Medium" },
                { type: "TextBlock", text: `Issue Key: ${issueKey}`, weight: "Bolder" },
                {
                    type: "Input.ChoiceSet",
                    id: "selectedStatus",
                    title: "Select New Status",
                    choices: statuses
                }
            ],
            actions: [
                {
                    type: "Action.Submit",
                    title: "Update Status",
                    data: { action: "resolveIssue", issueKey: issueKey }
                }
            ],
            version: "1.4"
        };
    }


    async handleResolveIssue(context, action) {
        const { issueKey, selectedStatus } = action.data;
    
        if (!issueKey || !selectedStatus) {
            return {
                composeExtension: {
                    type: "message",
                    text: "⚠️ Please select a status."
                }
            };
        }
    
        const jiraUrl = `https://ujjwal27022004.atlassian.net/rest/api/3/issue/${issueKey}/transitions`;
        const auth = Buffer.from(`ujjwal27022004@gmail.com:ATATT3xFfGF0pVftmqKAXkKPnrCdWyd9xirEl3gh-pN8jHD3ao-o8mDk4ivLctOvvc-bwmOSixBnbRiEtv4rQyA5Q8bYXkYrTEtplRMKpRXg75SD8omTXcuahgoq-nUPlwCBS2DgQUb3eB2LGgd38dOFjcPsn1AQDGjMZYS5u58xTFNXxYx1_Qg=8F03938D`).toString("base64");
    
        try {
            await axios.post(jiraUrl, {
                transition: { id: selectedStatus }
            }, {
                headers: {
                    Authorization: `Basic ${auth}`,
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }
            });
    
            return {
                composeExtension: {
                    type: "message",
                    text: `✅ Issue ${issueKey} has been updated successfully.`
                }
            };
        } catch (error) {
            console.error("Error updating issue:", error.response ? error.response.data : error.message);
    
            return {
                composeExtension: {
                    type: "message",
                    text: `❌ Failed to update issue: ${error.message}`
                }
            };
        }
    }
    
    

}
