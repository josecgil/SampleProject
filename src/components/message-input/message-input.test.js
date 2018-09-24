import Events from "../Events.js"
const MessageInput = require('./message-input');
const RaySim = require('../../../lib/ray-sim');

let raySim;

beforeEach(function() {
    raySim=new RaySimNS.RaySim();
});

afterEach(function() {
    raySim.end();
});

test('on click message is Sent', (done) => {

    raySim.setHtml(
    `<div class="message-input" data-ray-component="MessageInput">
            <input type="text"  placeholder="Insert text here...">
            <input type="submit" value="Submit">
         </div>`
    );

    const EXPECTED_MESSAGE = "message from test";
    raySim.bus.on(Events.MESSAGE_SENT, (text) => {
        expect(EXPECTED_MESSAGE).toBe(text);
        done();
    });

    const inputText = document.querySelectorAll("input[type=text]")[0];
    inputText.value = EXPECTED_MESSAGE;
    const inputButton = document.querySelectorAll("input[type=submit]")[0];

    raySim.start();
    raySim.fireEvent(inputButton, "click");

});