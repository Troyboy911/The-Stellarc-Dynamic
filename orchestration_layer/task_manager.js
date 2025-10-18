class TaskManager {
    async orchestrate(agentTeam = [], tasks = []) {
        // If we have Agent instances (with executeTask), assign tasks round-robin
        let idx = 0;
        for (const task of tasks) {
            const taskText = typeof task === 'string' ? task : (task?.description || JSON.stringify(task));
            const agent = agentTeam[idx % Math.max(agentTeam.length, 1)];
            if (agent && typeof agent.executeTask === 'function') {
                console.log(`▶ Assigning to ${agent.role}: ${taskText}`);
                try {
                    const result = await agent.executeTask(taskText);
                    console.log(`✔ ${agent.role} completed: ${String(result).slice(0, 200)}`);
                } catch (e) {
                    console.error(`✖ ${agent.role} failed:`, e?.message || e);
                }
            } else {
                console.log(`▶ Orchestrating task: ${taskText}`);
            }
            idx++;
        }
        console.log(`✔ Orchestration complete for ${tasks.length} tasks with ${agentTeam.length} agents.`);
    }
}

module.exports = TaskManager;
