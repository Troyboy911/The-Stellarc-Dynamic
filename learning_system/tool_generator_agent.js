// learning_system/tool_generator_agent.js
const fs = require('fs').promises;
const path = require('path');
const { Tool } = require('../toolRegistry');
const OpenAI = require('openai');

class ToolGeneratorAgent {
  constructor(toolRegistry, openaiApiKey) {
    this.toolRegistry = toolRegistry;
    this.openai = new OpenAI({ apiKey: openaiApiKey || process.env.OPENAI_API_KEY || '' });
  }

  async createNewTool({ name, description, paramsExample, expectedOutput, tests = [] }) {
    // 1) Design schema prompt
    const schema = await this._designSchema(name, description, paramsExample);
    // 2) Generate code
    const code = await this._generateCode(name, description, schema, expectedOutput);
    // 3) Write file under tools/generated/
    const toolPath = path.join(__dirname, `../tools/generated/${name}.js`);
    await fs.mkdir(path.dirname(toolPath), { recursive: true });
    await fs.writeFile(toolPath, code);
    // 4) Load the tool module
    const toolModule = require(toolPath);
    const toolInstance = new Tool(toolModule.name, toolModule.description, toolModule.parameters, toolModule.execute);
    // 5) Optionally run basic tests
    const testResults = [];
    for (const t of tests) {
      try {
        const res = await toolInstance.execute(t.input);
        testResults.push({ name: t.name, ok: t.validate(res) === true });
      } catch (e) {
        testResults.push({ name: t.name, ok: false, error: e?.message || String(e) });
      }
    }
    // 6) Register if tests pass (or no tests provided)
    const allOk = testResults.every(r => r.ok) || tests.length === 0;
    if (allOk) this.toolRegistry.register(toolInstance);
    return { schema, toolPath, registered: allOk, testResults };
  }

  async _designSchema(name, description, paramsExample) {
    const prompt = `Design a JSON Schema for a function tool. Name: ${name}. Description: ${description}. Given example params: ${JSON.stringify(paramsExample)}. Return ONLY the JSON schema object.`;
    const resp = await this.openai.chat.completions.create({
      model: 'gpt-4-0613',
      messages: [{ role: 'user', content: prompt }]
    });
    let text = resp.choices?.[0]?.message?.content || '{}';
    try { return JSON.parse(text); } catch { return { type: 'object', properties: {} }; }
  }

  async _generateCode(name, description, schema, expectedOutput) {
    const prompt = `Create a Node.js module exporting a Tool definition with fields: name, description, parameters (JSON Schema), and async execute(args). Name: ${name}. Description: ${description}. Parameters: ${JSON.stringify(schema)}. Execute should return a JSON object like: ${JSON.stringify(expectedOutput)}. Avoid external deps unless necessary.`;
    const resp = await this.openai.chat.completions.create({
      model: 'gpt-4-0613',
      messages: [{ role: 'user', content: prompt }]
    });
    const code = resp.choices?.[0]?.message?.content || '';
    // Strip code fences if present
    return code.replace(/^```[\s\S]*?\n/, '').replace(/```\s*$/, '');
  }
}

module.exports = { ToolGeneratorAgent };
