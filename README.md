# The Stellarc Dynamic

Hybrid orchestrator coordinating specialized agents for infrastructure, business, code, and deployment.

## Run

- Start: `npm start`

## Usage (example)

```js
const TheStellarcDynamic = require('./the_stellarc_dynamic');
(async () => {
  const orchestrator = new TheStellarcDynamic();
  const result = await orchestrator.executeDirective('Build and deploy a simple web service to Azure with a monetization plan');
  console.log(JSON.stringify(result, null, 2));
})();
```
