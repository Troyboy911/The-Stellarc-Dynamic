class CodeExecution {
    async execute(description) {
        console.log('💻 CodeExecution generating source code...');
        const source = `// generated from directive\nmodule.exports = function run(){ console.log('Hello from generated app'); };`;
        return { source_code: { 'app.js': source } };
    }
}

module.exports = CodeExecution;
