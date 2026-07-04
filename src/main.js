import './style.scss'
import { Mistral } from '@mistralai/mistralai';


let currentAgentId = 'ag_019f2d0f980c77f285166e0fc0d77460';
let currentSlot = 0;
let target = null;
let conversationId = null;
let loopTimeoutId = null;

const slots = document.querySelectorAll('.slot');
const barmenMessage = document.querySelector('.barmen-input');
const slot1 = slots[0];
const slot2 = slots[1];
const slot3 = slots[2];
const slot4 = slots[3];
let messages = [];

let persons = ['Lou', 'Kenzi', 'Vital', 'Misha'];
let currentPerson = null;
let lastDialog = '';
let lastTarget = '';

const client = new Mistral({
    apiKey: import.meta.env.VITE_MISTRAL_API_KEY,
});




slots.forEach((slot, key) => {
    slot.addEventListener('click', () => {
        currentPerson = persons[key]
        currentSlot = key;
    })
})

async function main() {
    const response = conversationId
        ? await client.beta.conversations.append({
            conversationId,
            conversationAppendRequest: { inputs: messages },
        })
        : await client.beta.conversations.start({
            agentId: currentAgentId,
            inputs: messages,
        });
    conversationId = response.conversationId ?? conversationId;

    const output = JSON.parse(response.outputs[0].content)
    console.log(output);

    if (loopTimeoutId) clearTimeout(loopTimeoutId);
    loopTimeoutId = setTimeout(() => {
        main();
    }, 5000)

    const avatar = output.avatar.trim().toLowerCase();

    if (avatar === 'lu') { currentSlot = 0; }
    else if (avatar === 'kenzi') { currentSlot = 1; }
    else if (avatar === 'vital') { currentSlot = 2; }
    else if (avatar === 'misha') { currentSlot = 3; }
    else {
        console.warn('Неизвестный avatar от модели:', output.avatar);
        return; // не рендерим в случайный слот
    }

    document.querySelector('.step').innerHTML = output.avatar;
    slots[currentSlot].children[0].textContent = output.text
    slots[currentSlot].children[2].textContent = output.emotion

    lastDialog = output.text;
    lastTarget = output.avatar

    messages = [
        { "role": "user", "content": `Автор сообщения: ${output.avatar}; Кому предназначено сообщение: - случайный аватар; Текст сообщения: ${lastDialog}` }
    ]



}

barmenMessage.addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && e.shiftKey) {
        if (!currentAgentId) {
            console.warn('Сначала выберите персонажа, кликнув по нему');
            return;
        }

        if (loopTimeoutId) clearTimeout(loopTimeoutId);

        messages = [
            { "role": "user", "content": `Автор сообщения: barmen; Кому предназначено сообщение: ${currentPerson}; Текст сообщения: ${barmenMessage.value}` }
        ]
        main();


    }
});