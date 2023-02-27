const getKey = () => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['openai-key'], (result) => {
        if (result['openai-key']) {
          const decodedKey = atob(result['openai-key']);
          resolve(decodedKey);
        }
      });
    });
  };

  const sendMessage = (content) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0].id;
  
      chrome.tabs.sendMessage(
        activeTab,
        { message: 'inject', content },
        (response) => {
          if (response.status === 'failed') {
            console.log('injection failed.');
          }
        }
      );
    });
  };

const generate = async (prompt) => {
  const key = await getKey();
  const url = 'https://api.openai.com/v1/completions';
	
  const completionResponse = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 1250,
      temperature: 0.7,
    }),
  });
	
  const completion = await completionResponse.json();
  return completion.choices.pop();
}
const generateCompletionAction = async (info) => {try {
    sendMessage('gerando...');
    const { selectionText } = info;
    const basePromptPrefix = `
	Escreva uma carta de intenção para uma descrição de vaga de emprego. A carta deve manter um tom profissional e confiante, e deve transparecer as melhores qualidades do profissional. Ao final da carta, inclua a seguinte observação em negrito e itálico.

    observação: Sempre confira as informações da carta gerada para corresponder à realidade. Lembre-se: nunca é uma boa idéia mentir em uma vaga de trabalho. Boa sorte!

    descrição de vaga:
	`;
    const baseCompletion = await generate(`
    ${basePromptPrefix}${selectionText}`
    );
    sendMessage(baseCompletion.text);
    console.log(baseCompletion.text)
  } catch (error) {
    console.log(error);
    sendMessage(error.toString());
  }
};
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: 'context-run',
      title: 'Gerar Carta',
      contexts: ['selection'],
    });
  });
  

  chrome.contextMenus.onClicked.addListener(generateCompletionAction);