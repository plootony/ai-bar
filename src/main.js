import './style.scss'
import { Mistral } from '@mistralai/mistralai';



// Первый персонаж
const slot1 = document.querySelector('.slot--1');
const slot1Bubble = document.querySelector('.slot--1 .bubble');
const slot1Person = document.querySelector('.slot--1 .person');
const slot1PersonEmotion = document.querySelector('.slot--1 .person .emotion');

const barmenMessage = document.querySelector('.bubble--barmen textarea');

const client = new Mistral({
    apiKey: import.meta.env.VITE_MISTRAL_API_KEY,
});

let messages = [
    { "role": "user", "content": "Hello!" }
];

async function main() {
    const response = await client.beta.conversations.start({
        agentId: 'ag_019f22921f0c75f7b561ab8f4bdeb5d8',
        agentVersion: 9,
        inputs: messages,
    });
    slot1Bubble.textContent = JSON.parse(response.outputs[0].content).text
    slot1PersonEmotion.innerHTML = JSON.parse(response.outputs[0].content).emotion

    console.log(slot1Bubble.textContent);

}




barmenMessage.addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && e.shiftKey) {
        messages = [
            { "role": "user", "content": `${barmenMessage.value}` }
        ]

        main();
    }
});