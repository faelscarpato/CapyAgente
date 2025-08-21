import { dispatchTool } from "./tools";
import { getGemini } from "./gemini";

export async function runAgent(goal: string, userInput?: string) {
  const model = getGemini();
  const history: any[] = userInput ? [{ role: "user", content: userInput }] : [];
  let result: any = null;

  for (let i = 0; i < 4; i++) {
    const plan = await model.generateContent(
`Objetivo: "${goal}"
Histórico: ${JSON.stringify(history).slice(0,2000)}

Responda SOMENTE JSON:
{"action":"<capyresumo|capyslide|capypdf|finalizar>","args":{...},"thought":"..."}
`);
    let step = JSON.parse(plan.response.text());

    if (step.action === "finalizar") {
      result = step.args?.result ?? "Finalizado.";
      break;
    }

    const toolRes = await dispatchTool({ name: step.action, input: step.args });
    history.push({ role: "tool", content: toolRes });

    const decide = await model.generateContent(
`Ferramenta "${step.action}" retornou:
${JSON.stringify(toolRes).slice(0,2000)}

Se o objetivo foi atingido, responda:
{"action":"finalizar","args":{"result":"<markdown para o usuário>"}}
Senão, escolha a próxima ferramenta (mesmo formato JSON).`
    );
    step = JSON.parse(decide.response.text());
    if (step.action === "finalizar") {
      result = step.args.result;
      break;
    }
  }

  return { goal, result, history };
}
