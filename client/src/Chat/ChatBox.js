
function ChatBox() {
    var dom = document.createElement('div');
    dom.setAttribute("class", "chat-box");
    this.dom = dom;
    this.chatSet = [];
    let windowContent =
        '<div class="chat-window">\n' +
        '</div>' +
        '<form class="chat-input" onsubmit="return false;">\n' +
        '   <input type="text" autocomplete="on" placeholder="Type a message" />\n' +
        '   <button>\n' +
        '       <svg style="width:24px;height:24px" viewBox="0 0 24 24"><path fill="rgba(0,0,0,.38)" d="M17,12L12,17V14H8V10H12V7L17,12M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5M12,4.15L5,8.09V15.91L12,19.85L19,15.91V8.09L12,4.15Z" /></svg>\n' +
        '   </button>\n' +
        '</form>';
    dom.innerHTML = windowContent;
    this.chatWindow = document.getElementsByClassName('chat-window')[0];
}

ChatBox.prototype = {
    createRemoteBubble: function(sender, context, thumbnail){
        let chat = new Chat(this.chatWindow, 'remote', sender, context, thumbnail);
        this.chatSet.push(chat);
    },
    createSelfBubble: function(sender, context, thumbnail)
    {
        let chat = new Chat(this.chatWindow, 'self', sender, context, thumbnail);
        this.chatSet.push(chat);
    }
}

export {ChatBox};
