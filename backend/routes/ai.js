const express = require("express");
const prisma = require("../lib/prisma");
// const { GoogleGenerativeAI } = require("@google/generative-ai");
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
// const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

const Groq = require('groq-sdk')
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// const Anthropic = require("@anthropic-ai/sdk");

const router = express.Router();
// const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

router.post("/categorize", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "task text is required" });
    }
       const message = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          max_tokens: 100,
          messages: [
            {
              role: "user",
              content: `Categorize this task into ONE tag: work, personal, urgent, or health.
    Also pick priority: high, medium, or low.
    Task: "${text}"
    Reply ONLY as JSON like: {"tag":"work","priority":"high"}`,
            },
          ],
        }); 

//     const result =
//       await model.generateContent(`Categorize this task into ONE tag: work, personal, urgent, or health.
// Also pick priority: high, medium, or low.Task: "${text}" Reply ONLY as JSON like: {"tag":"work","priority":"high"}`);
    
const raw = message.choices[0].message.content;
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    const validTags = ["work", "personal", "urgent", "health"];
    const validPriorities = ["high", "medium", "low"];
    res.json({
      tag: validTags.includes(parsed.tag) ? parsed.tag : "personal",
      priority: validPriorities.includes(parsed.priority)
        ? parsed.priority
        : "medium",
    });
  } catch (err) {
    return res.status(500).json({ error: `Internal Error ${err.message}` });
  }
});

router.post("/suggest", async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.user.id, done: false },
      select: { text: true },
      take: 10,
    });
    const taskList = tasks.map((t) => t.text).join(", ") || "none";
    const message = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `My current open tasks are: ${taskList}.
Suggest 3 new productive tasks I should add.
Each suggestion on a new line starting with "• ".
Keep suggestions short and actionable.`,
        },
      ],
    });

//     const reply =
//       await model.generateContent(`My current open tasks are: ${taskList}.
// Suggest 3 new productive tasks I should add.
// Each suggestion on a new line starting with "• ".
// Keep suggestions short and actionable.`);

    const text = message.choices[0].message.content;
    const suggestion = text
      .split("\n")
      .filter((t) => t.trim().startsWith("•"))
      .map((t) => t.replace("•", "").trim())
      .filter(Boolean);

    res.json({ suggestion });
  } catch (err) {
    return res.status(500).json({ error: `Internal Error ${err.message}` });
  }
});

router.post("/tip", async (req, res) => {
  try {
    const { taskId } = req.body;
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return res.status(404).json({ error: `task not found` });
    }

    if (task.userId !== req.user.id) {
      return res.status(403).json({ error: "Not allowed" });
    }

  const message = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: `For this task: "${task.text}", give ONE short actionable tip to complete it faster. Max 20 words. No preamble.`,
        },
      ],
    }); 

    // const tipData = await model.generateContent(
    //   `For this task: "${task.text}", give ONE short actionable tip to complete it faster. Max 20 words. No preamble.`,
    // );
    const tip = message.choices[0].message.content;
    const update = await prisma.task.update({
      where: { id: taskId },
      data: { aiNote: tip },
    });

    res.json({ tip, task: update });
  } catch (err) {
    return res.status(500).json({ error: `Internal Error ${err.message}` });
  }
});

router.post("/analyze", async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.user.id, done: false },
    });
    if (!tasks.length) {
      return res.status(404).json({ error: "No task found" });
    }
    const taskList = tasks
      .map((t) => `"${t.text}" (${t.priority} priority, ${t.tag})`)
      .join(", ");

    const message = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: `Here are my tasks: ${taskList}.
Give a 2 sentence productivity insight and clearly state which ONE task I should focus on first and why. Be direct and brief.`,
        },
      ],
    }); 

//     const insightData =
//       await model.generateContent(`Here are my tasks: ${taskList}.
// Give a 2 sentence productivity insight and clearly state which ONE task I should focus on first and why. Be direct and brief.`);
    
const insight = message.choices[0].message.content;
    res.json({ insight });
  } catch (err) {
    return res.status(500).json({ error: `Internal Error ${err.message}` });
  }
});
module.exports = router;
