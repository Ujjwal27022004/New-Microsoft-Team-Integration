import restify from 'restify';
import { BotFrameworkAdapter } from 'botbuilder';
import { TeamsBot } from './TeamsBot.js';

// Create HTTP server
const server = restify.createServer();
server.listen(3978, () => console.log('✅ Bot is running on http://localhost:3978'));

// Initialize Adapter
const adapter = new BotFrameworkAdapter({
    appId: '0bc21a2c-b9c1-4bd5-9989-0c5aaf324d64',
    appPassword: 'oHN8Q~Mg5z_RJxzZ6cvpax1Wzdf_l1rwCUoK_bbl'
});

// Create Bot Instance
const bot = new TeamsBot();

// Handle incoming Teams requests
server.post('/api/messages', async (req, res) => {
    try {
       
        await adapter.processActivity(req, res, async (context) => {
            await bot.run(context);
        });
    } catch (error) {
        console.error('❌ Error processing message:', error);
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
