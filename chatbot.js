let chatbox;
window.addEventListener('DOMContentLoaded', function () {
  $('#myPopup').hide();
  $('#feature').hide();
  const url = new URL(window.location.href);
  // Get the query parameters
  const queryParams = new URLSearchParams(url.search);
  console.log("=================================================");
  console.log(queryParams);
  // Access individual query parameters
  const maxed_check = queryParams.get('maxed');
  if (maxed_check) {
    console.log("===maxed======");
    $('#myPopup').hide();
    $('#feature').show();

    class Chatbox {
      constructor() {
        this.args = {
          openButton: document.querySelector('.chatbox__button'),
          chatBox: document.querySelector('.chatbox__support'),
          sendButton: document.querySelector('.send__button'),
        };

        this.state = false;
        this.expanded = false;
        this.bubbleVisible = false;
        this.messages = [];
      }


      popUp(ai_message) {
        console.log('popUp', this.args);
        const { openButton, chatBox, sendButton } = this.args;
        chatBox.classList.add('chatbox--active');
        let msg2 = { name: 'Sam', message: ai_message };
        this.messages.push(msg2);
        this.updateChatText(chatBox);

      }

      bubbleUp(ai_message) {
        console.log('bubbleUp')
        let s = document.getElementById('myPopup')
                // Convert the URL to a clickable link
        const messageWithLink = ai_message.replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank">$1</a>'
        );
        s.innerHTML = `${messageWithLink}
          <button onclick="window.inside_bubble_button(chatbox,'${ai_message}');removex();">開啟對話</button>
          `
        //   var containerElement = document.getElementById("yourElementId");
        //   containerElement.innerHTML = message;
        //   containerElement.style.whiteSpace = "nowrap";
        //   containerElement.style.display = "inline";
        $('#myPopup').show();
        $('#closebub').show();
        $('.chatbox__support').removeClass('chatbox--active');
      }


      display() {
        const { openButton, chatBox, sendButton } = this.args;

        openButton.addEventListener('click', () => this.toggleState(chatBox));

        sendButton.addEventListener('click', () => this.onSendButton(chatBox));

        const node = chatBox.querySelector('input');
        node.addEventListener('keyup', ({ key }) => {
          if (key === 'Enter') {
            this.onSendButton(chatBox);
          }
        });
      }

      toggleState(chatbox) {
        this.state = !this.state;

        // show or hides the box
        if (this.state) {
          chatbox.classList.add('chatbox--active');
        } else {
          chatbox.classList.remove('chatbox--active');
        }
        this.expanded = this.state
        if (this.expanded) {
          this.bubbleVisible = false;
        }
        return this.expanded;
      }

      onSendButton(chatbox) {
        var textField = chatbox.querySelector('input');
        let text1 = textField.value;
        if (text1 === '') {
          return;
        }

        let msg1 = { name: 'User', message: text1 };
        this.messages.push(msg1);
        this.updateChatText(chatbox);
        textField.value = '';

        fetch('https://www.oimax.in/chat_gpt_query', {
          method: 'POST',
          body: JSON.stringify({ message: text1 }),
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then((r) => r.json())
          .then((r) => {
            let msg2 = { name: 'Sam', message: r.message };
            this.messages.push(msg2);
            this.updateChatText(chatbox);
            textField.value = '';
          })
          .catch((error) => {
            console.error('Error:', error);
            this.updateChatText(chatbox);
            textField.value = '';
          });
      }

      updateChatText(chatbox) {
        var html = '';
        this.messages
          .slice()
          .reverse()
          .forEach(function (item, index) {
            if (item.name === 'Sam') {
              html +=
                '<div class="messages__item messages__item--visitor">' +
                item.message +
                '</div>';
            } else {
              html +=
                '<div class="messages__item messages__item--operator">' +
                item.message +
                '</div>';
            }
          });

        const chatmessage = chatbox.querySelector('.chatbox__messages');
        chatmessage.innerHTML = html;
      }
    }


    function handleReload() {
      chatbox = new Chatbox();
      chatbox.display();
      console.log('loaded')
      let counter = 0;
      const intervalId = setInterval(() => {
        console.log('Interval running...', counter);
        //  clearInterval(intervalId);
        fetch('https://www.oimax.in/initial_query', {
          method: 'POST',
          body: JSON.stringify({ session_identifier: getCookie() }),
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then((r) => r.json())
          .then((r) => {
            let msg2 = { name: 'Sam', message: r.ai_result };
            console.log("======")
            console.log(r);
            console.log(msg2)

            if (r.use_status === 0) {
              let msg2 = { name: 'Sam', message: r.ai_result };

              if (r.action_type == "bubble") {
                // let st = chatbox.toggleState(chatbox.args.chatBox);
                console.log("toggle state - action bubble", chatbox.expanded, chatbox.bubbleVisible);
                if (!chatbox.expanded || chatbox.bubbleVisible) {
                  console.log("Action bubble 2222222 entered false")
                  chatbox.bubbleUp(r.ai_result);
                  chatbox.bubbleVisible = true
                }

                else {
                  console.log("Going here if bubble already up instead of replacing?")
                }

              } else {
                console.log("Enter else i.e., action type is expand and status of expand", chatbox.expanded)
                if (!chatbox.expanded) {
                  $('#myPopup').hide();
                  chatbox.popUp(r.ai_result);
                  chatbox.expanded = true
                }
                else {
                  console.log("Do nothing because already expanded")
                }

              }

            } else {
              // Do nothing
            }

          })
          .catch((error) => {
            console.error('Error:', error);
            this.updateChatText(chatbox);
            textField.value = '';
          });


        counter++;
        if (counter >= 2000) {
          //   clearInterval(intervalId);
          console.log('Interval continue');
        }
      }, 4000);
    }

    function getCookie() {

      const cookies = document.cookie.split(";"); // split cookies by semicolon
      let session_id = null;

      cookies.forEach(cookie => {
        const [name, value] = cookie.split("=");
        if (name.trim() === "session_id") {
          session_id = value;
        }

      });
      console.log(session_id, "ideeeeeeeeeeeee");
      return session_id;
    }

    function setSessionId(sessionId, expirationDays) {

      var d = new Date();
      d.setTime(d.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
      var expires = "expires=" + d.toUTCString();
      document.cookie = "session_id" + "=" + sessionId + ";" + expires + ";path=/";

    }

    window.inside_bubble_button = function (chatbox, ai_result) {
      console.log("INside bubble button exectuted !!");
      console.log(ai_result);
      // const chatbox = new Chatbox();
      chatbox.popUp(ai_result);
      chatbox.expanded = true;
      chatbox.bubbleVisible = false;
      $('#myPopup').hide();
    }


    $(document).ready(function () {
      handleReload()
      $('#myPopup').hide();
      //            setSessionId("S-1234", 1)
    })

    // You can initialize and interact with your chatbot here

    //////////////////////////////////////////////////////////////////////////////////////

    // Code for adding the chatbot HTML to the page
    var chatboxHTML = `
    <!-- OP b3 -->
    <div id="feature">
        <div class="container">
            <div class="chatbox">
                <div class="chatbox__support">
                    <div class="chatbox__header">
                        <div class="chatbox__image--header">
                            <img src="https://img.icons8.com/color/48/000000/circled-user-female-skin-type-5--v1.png" alt="image">
                            <!-- <img src="https://cdn.jsdelivr.net/gh/optimus-ohya/oimax_chat@latest/frontend/images/oi.png" alt="image"> -->
                        </div>
                        <div class="chatbox__content--header">
                            <p class="chatbox__heading--header">Study Central AI 助手</p>
                        </div>
                        <div><img src="https://cdn.jsdelivr.net/gh/optimus-ohya/oimax_chat@latest/frontend/images/close.png" onclick="document.getElementById('chatbox1').click()" class="close-btn" alt="image">
                        </div>
                    </div>
                    <hr class="hr-line">
                    <div class="chatbox__messages" style="">
                        <div></div>
                    </div>
                    <div class="chatbox__footer">
                        <input type="text" placeholder="輸入對話內容">
                        <button class="chatbox__send--footer send__button">送出</button>
                    </div>
                    <div class="chatbox__footer2">
                        <p>AI powered by Optimus ONE</p>
                    </div>
                </div>
                <div class="op_box">
                    <div class="bubble" style="display: none;">
                        <div class="bubble_text" id="myPopup">Hello World! Hello World! Hello World! Hello World! Hello World! Hello
                            World! Hello World!" <a href="#">test Link</a><button onclick="window.inside_bubble_button(chatbox,'Hello this is message for action 7');removex();">點我傳送</button>
                        </div>
                        <div class="bubble_closebt"><img src="https://cdn.jsdelivr.net/gh/optimus-ohya/oimax_chat@latest/frontend/images/close.png" onclick="myFunction()" class="close-bbl" alt="image" id="closebub"></div>
                    </div>
                    <div class="chatbox__button">
                        <button onclick="close_obtn()" id="chatbox1"><img src="https://cdn.jsdelivr.net/gh/optimus-ohya/oimax_chat@latest/frontend/images/oi.png"></button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.4/jquery.min.js"></script>
    <script src="app.js"></script>
      `;

    // Append the chatbox HTML to the body element
    document.body.insertAdjacentHTML('beforeend', chatboxHTML);

    // Code for closing the popup on click
    function close_popup() {
      var popup = document.getElementById('myPopup');
      popup.style.display = 'none';
    }
  }
});


// Code for closing the Button on click mobiles
function close_obtn() {
  var btnopn = document.getElementById('chatbox1');
  var popup = document.getElementById('myPopup');
  var closeBtn = document.getElementById('closebub');

  // Add the logic to hide the bubble
  popup.style.display = 'none';
  closeBtn.style.display = 'none';

  if ($('btnopn').hasClass('hide-chat')) {
    btnopn.classList.add('hide-chat');
  }
  else {
    btnopn.classList.remove('hide-chat');
  }
}

function myFunction() {
  var x = document.getElementById("myPopup");
  var y = document.getElementById("closebub");
  if (x.style.display === "none") {
    x.style.display = "block";
    y.style.display = "block";
  } else {
    x.style.display = "none";
    y.style.display = "none";
  }
}


function removex() {
  $('#closebub').hide();
}
