// Agent.js
const OpenAI = require('openai');

class Agent {
  constructor(role, goal, tools, openaiApiKey, model) {
    this.role = role;
    this.goal = goal;
    this.tools = tools || [];
    this.openai = new OpenAI({ apiKey: openaiApiKey || process.env.OPENAI_API_KEY || '' });
    this.model = model || process.env.OPENAI_MODEL || 'gpt-4-0613';
    this.messages = [
      {
        role: 'system',
        content: `You are ${role}. Your goal is: ${goal}. Use provided functions when helpful. Reply concisely.`,
      },
    ];
  }

  async executeTask(task) {
    this.messages.push({ role: 'user', content: task });

    // Loop until model stops calling functions
    // Using legacy function-calling interface for broad compatibility
    while (true) {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: this.messages,
        functions: this.tools.map(t => t.getSchema()),
        function_call: 'auto',
      });

      const msg = response.choices?.[0]?.message;
      if (!msg) return '';
      this.messages.push(msg);

      if (msg.function_call) {
        const fn = msg.function_call.name;
        let args = {};
        try { args = JSON.parse(msg.function_call.arguments || '{}'); } catch {}
        const tool = this.tools.find(t => t.name === fn);
        if (!tool) {
          this.messages.push({ role: 'function', name: fn, content: JSON.stringify({ error: 'tool_not_found' }) });
          continue;
        }
        try {
          const result = await tool.execute(args);
          this.messages.push({ role: 'function', name: fn, content: JSON.stringify(result) });
        } catch (e) {
          this.messages.push({ role: 'function', name: fn, content: JSON.stringify({ error: String(e?.message || e) }) });
        }
      } else {
        return msg.content || '';
      }
    }
  }
}

module.exports = Agent;
