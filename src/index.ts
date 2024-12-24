import { Context, Next } from 'hono';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import OpenAI from 'openai';
import { verifyClerkSessionToken } from './utils';

export type Bindings = {
	OPEN_AI_KEY: string;
	CORS_ORIGIN: string;
	CLERK_JWT_KEY: string;
	AI: Ai;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('/*', async (c, next) => {
	const corsMiddleware = cors({
		origin: c.env.CORS_ORIGIN, //Allow requests from your next.js app
		allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests', 'Content-Type', 'Authorization'], // Add content-type to the allowed headers to fix CORS
		allowMethods: ['POST', 'GET', 'OPTIONS'],
		maxAge: 600,
		credentials: true,
	});

	return corsMiddleware(c, next);
});

app.get('/', (c) => {
	return new Response('hello world');
});

const authMiddleware = async (c: Context<{ Bindings: Bindings }>, next: Next) => {
	const { error } = await verifyClerkSessionToken(c.req.header('Authorization'), c.env.CLERK_JWT_KEY, c.env.CORS_ORIGIN);
	if (error !== null) {
		return new Response(error, { status: 401 });
	}
	await next();
};

app.post('/translateDocument', authMiddleware, async (c) => {
	const { documentData, targetLang } = await c.req.json();

	// Generate a summary of the document
	const summaryResponse = await c.env.AI.run('@cf/facebook/bart-large-cnn', {
		input_text: documentData,
		max_length: 1000,
	});

	// translate the summary into another language
	const response = await c.env.AI.run('@cf/meta/m2m100-1.2b', {
		text: summaryResponse.summary,
		source_lang: 'english',
		target_lang: targetLang,
	});

	return new Response(JSON.stringify(response));
});

app.post('/chatToDocument', authMiddleware, async (c) => {
	const openai = new OpenAI({
		apiKey: c.env.OPEN_AI_KEY,
	});

	const { documentData, question } = await c.req.json();
	const chatCompletion = await openai.chat.completions.create({
		messages: [
			{
				role: 'system',
				content: `You are an assistant helping the user to chat to a document, I am providing a JSON fole of the markdown for the document. Using this, answer the users question in the clearest way possible, the document is about ${documentData}`,
			},
			{
				role: 'user',
				content: `My question is: ${question}`,
			},
		],
		model: 'gpt-4o',
		temperature: 0.5,
	});

	const response = chatCompletion.choices[0].message.content;

	return c.json({ message: response });
});

export default app;
