const messageInput = require('./message-input');
const raySim = require('../../../lib/ray-sim');

test('on click message is Sent', (done) => {
    var MESSAGE_INPUT_HTML =
        `<div class="message-input" data-ray-component="MessageInput">
         <input type="text"  placeholder="Insert text here...">
         <input type="submit" value="Submit">
     </div>`;
    const EXPECTED_MESSAGE = "message from test";

    var raySim = new RaySimNS.RaySim();
    raySim.setHtml(MESSAGE_INPUT_HTML);
    raySim.bus.on("message.sent", (text) => {
        expect(EXPECTED_MESSAGE).toBe(text);
        done();
    });
    raySim.start();
    const inputText = div.querySelectorAll("input[type=text]");
    const inputButton = div.querySelectorAll("input[type=submit]");

    inputText.value = EXPECTED_MESSAGE;
    inputButton.click();
    raySim.end();
});