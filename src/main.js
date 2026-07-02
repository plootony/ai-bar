import './style.scss'
import { Mistral } from '@mistralai/mistralai';


let currentAgentId = '';
let currentSlot = 0;
let history = [];

const slots = document.querySelectorAll('.slot');
const barmenMessage = document.querySelector('.barmen-input');
const slot1 = slots[0];
const slot2 = slots[1];
const slot3 = slots[2];
const slot4 = slots[3];
let messages = [];

const AGENTS = [
    {
        id: 'ag_019f22921f0c75f7b561ab8f4bdeb5d8',
        name: 'Lou'
    },
    {
        id: 'ag_019f2449859474f7a183fdeae0cdfc03',
        name: 'Kenzi'
    },
    {
        id: 'ag_019f244cefaa77589b3713913dff7002',
        name: 'Vital'
    },
    {
        id: 'ag_019f244f88b2746f84f4a5156e55e0b5',
        name: 'Misha'
    }
]

slots.forEach((slot, key) => {
    slot.addEventListener('click', () => {
        currentAgentId = AGENTS[key].id;
        currentSlot = key;
    })
})

const client = new Mistral({
    apiKey: import.meta.env.VITE_MISTRAL_API_KEY,
});

async function main() {
    const historyText = history
        .map(h => `Автор: ${h.name}\nНастроение: ${h.emotion}\nТекст: ${h.text}`)
        .join('\n\n');

    const inputs = historyText
        ? [{ role: 'user', content: `${historyText}\n\n${messages[0].content}` }]
        : messages;

    const response = await client.beta.conversations.start({
        agentId: currentAgentId,
        inputs,
    });

    const raw = response.outputs[0].content.replace(/^```json\s*|```$/g, '').trim();
    const output = JSON.parse(raw);

    history.push({
        name: output.name,
        emotion: output.emotion,
        text: output.text
    });

    history = history.slice(-10);

    console.log(history);

    slots[currentSlot].children[0].textContent = output.text
    slots[currentSlot].children[2].textContent = output.emotion
}

barmenMessage.addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && e.shiftKey) {
        if (!currentAgentId) {
            console.warn('Сначала выберите персонажа, кликнув по нему');
            return;
        }

        messages = [
            { "role": "user", "content": `${barmenMessage.value}` }
        ]

        history.push({
            name: 'Бармен',
            emotion: '',
            text: barmenMessage.value
        });

        history = history.slice(-10);

        main();
    }
});