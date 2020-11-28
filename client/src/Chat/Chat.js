function Chat(window, type, sender, context, thumbnail){
    this.msgContainer = undefined;
    if(type === 'remote')
    {
        this.msgContainer =
        '<div class="msg-container msg-remote">\n' +
        '         <div class="msg-box">\n' +
        '               <img class="user-img" src="//gravatar.com/avatar/00034587632094500000000000000000?d=retro" />\n' +
        '               <div class="flr">\n' +
        '                   <div class="messages">\n' +
        '                   <p class="msg">\n' +
        context +
        '                   </p>\n' +
        '                   </div>\n' +
        '                   <span class="timestamp"><span class="username">'+sender+'</span>&bull;<span class="posttime">3 minutes ago</span></span>\n' +
        '               </div>\n' +
        '         </div>\n' +
        '</div>';
    }
    else if (type === 'self')
    {
        this.msgContainer =
            '<div class="msg-container msg-self">\n' +
            '         <div class="msg-box">\n' +
            '               <div class="flr">\n' +
            '                   <div class="messages">\n' +
            '                   <p class="msg">\n' +
            context +
            '                   </p>\n' +
            '                   </div>\n' +
            '                   <span class="timestamp"><span class="username">'+sender+'</span>&bull;<span class="posttime">3 minutes ago</span></span>\n' +
            '               </div>\n' +
            '               <img class="user-img" src="//gravatar.com/avatar/00034587632094500000000000000000?d=retro" />\n' +
            '         </div>\n' +
            '</div>';
    }
    window.innerHTML += this.msgContainer;
}
