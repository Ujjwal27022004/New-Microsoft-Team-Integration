import restify from 'restify';
import { BotFrameworkAdapter } from 'botbuilder';
import { TeamsBot } from './TeamsBot.js';

// Create HTTP server
const server = restify.createServer();
server.listen(3978, () => console.log('✅ Bot is running on http://localhost:3978'));

// Initialize Adapter
const adapter = new BotFrameworkAdapter({
    appId: '73fb8e83-7bc3-4e93-93bf-86e94c658db7',
    appPassword: 'bmH8Q~BkLrM8etk9DSKZvmNTYE4bRrI4H6j1pa6m'
});

// Create Bot Instance
const bot = new TeamsBot();

// Handle incoming Teams requests
server.post('/api/messages', async (req, res) => {
    try {
       
        await adapter.processActivity(req, res, async (context) => {
            // console.log("context is ",context)
            try {
                await bot.run(context);
            } catch (botError) {
                console.error("❌ Error inside bot.run():", botError);
                if (!res.headersSent) {
                    await context.sendActivity("⚠️ An error occurred while processing your request.");
                }
            }
        });
    } catch (error) {
        console.error('❌ Error processing message is:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Handle Jira Webhook Events
server.post('/jira-webhook', async (req, res) => {
    try {
        const issueData = req.body; // Incoming webhook data
        await bot.sendJiraNotification(issueData);
        res.send(200);
    } catch (error) {
        console.error('❌ Error processing webhook:', error);
        res.status(500).send({ error: 'Webhook Processing Error' });
    }
});
