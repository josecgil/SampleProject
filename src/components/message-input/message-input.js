import "./message-input.css";

export default class MessageInput {
    constructor (data) {
        const bus=data.bus;
        const div=data.DOMElement;
        const inputText=div.querySelectorAll("input[type=text]");
        const inputButton=div.querySelectorAll("input[type=submit]");
        inputButton.addEventListener('click', function(event) {
            event.preventDefault();
            bus.trigger("message.send", inputText.value);
        });
    }
}