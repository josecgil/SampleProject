import "./message-input.css";

import Events from "../Events.js"

export default class MessageInput {
    constructor (data) {
        const bus=data.bus;
        const div=data.DOMElement;
        const inputText=div.querySelectorAll("input[type=text]")[0];
        const inputButton=div.querySelectorAll("input[type=submit]")[0];
        inputButton.addEventListener('click', function(event) {
            event.preventDefault();
            bus.trigger(Events.MESSAGE_SENT, inputText.value);
        });
    }
}
window.MessageInput=MessageInput;
