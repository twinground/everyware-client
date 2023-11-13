// TODO : this is temp chat box -> woo hyeong will make new ui again
//class

import { IChatMessage } from "../../../interfaces/IPacket";
import Socket from "../../network/SocketClient";

class ChatBox {
  private _expoName: string;
  private _userName: string;
  private _parent: HTMLElement;
  private _container: HTMLDivElement;
  private _textFieldDOM: HTMLInputElement;
  private _chatPageTextWrapper: HTMLDivElement;
  private _sendButtonDOM: HTMLDivElement;
  private _sizeToggleButtonDOM: HTMLElement;
  private _openChatButtonDOM: HTMLDivElement;
  private _socket?: Socket;
  private _isOn: boolean;
  private _isDefault: boolean;

  constructor(expoName, userName, socket?: Socket) {
    // if you have parent out of this class turn _isDefault to false and call InputChatBox with parent element
    this._isDefault = true;
    this._isOn = false;
    this._expoName = expoName;
    this._userName = userName;
    if (socket) {
      this._socket = socket;
      this._socket.On("chatMessage").Add((data: IChatMessage) => {
        this.AddRecievedChat(data.session_id.slice(0, 5), data.message);
      });
    }

    const tempParent = document.createElement("div");

    this._container = document.createElement("div");
    this._sizeToggleButtonDOM = document.createElement("div");
    const textXDiv = document.createElement("div");
    textXDiv.textContent = "x";
    textXDiv.classList.add("unclickable");
    this._sizeToggleButtonDOM.appendChild(textXDiv);
    const displayPage = document.createElement("div");
    this._chatPageTextWrapper = document.createElement("div");
    const inputPage = document.createElement("div");
    this._textFieldDOM = document.createElement("input");
    this._textFieldDOM.setAttribute("type", "text");
    this._sendButtonDOM = document.createElement("div");
    this._sendButtonDOM.textContent = "전송";

    // add classs
    tempParent.classList.add("temp-chat-parent");
    this._container.classList.add("chat-container");
    this._sizeToggleButtonDOM.classList.add("size-toggle-button");
    displayPage.classList.add("chat-display-page");
    this._chatPageTextWrapper.classList.add("chat-page-text-wrapper");
    inputPage.classList.add("chat-input-page");
    this._textFieldDOM.classList.add("chat-text-field");
    this._sendButtonDOM.classList.add("chat-send-button");

    //컴포넌트 동적 할당
    this._container.appendChild(this._sizeToggleButtonDOM);
    this._container.appendChild(displayPage);
    displayPage.appendChild(this._chatPageTextWrapper);
    this._container.appendChild(inputPage);
    inputPage.appendChild(this._textFieldDOM);
    inputPage.appendChild(this._sendButtonDOM);

    //create open button
    this._openChatButtonDOM = document.createElement("div");
    this._openChatButtonDOM.classList.add("open-chat-button");
    const openButtonIcon = document.createElement("img");
    this._openChatButtonDOM.appendChild(openButtonIcon);
    openButtonIcon.src = "/images/chat-button.png";

    //add event listener on button
    this._sendButtonDOM.addEventListener("click", () => {
      if (this._textFieldDOM.value != "") {
        this.SendChatMessage(this._userName, this._textFieldDOM.value);
      }

      this._textFieldDOM.value = "";
      this._textFieldDOM.focus();
    });

    this._textFieldDOM.addEventListener("keyup", (event) => {
      // event.key === 'Enter'는 엔터 키를 눌렀을 때를 확인

      if (event.key === "Enter") {
        if (this._textFieldDOM.value != "") {
          this.SendChatMessage(this._userName, this._textFieldDOM.value);
        }

        this._textFieldDOM.value = "";
        this._textFieldDOM.focus();
      }
    });

    this._sizeToggleButtonDOM.addEventListener("click", () => {
      this.CloseChatUI();
    });

    this._openChatButtonDOM.addEventListener("click", () => {
      this.OpenChatUI();
    });

    if (this._isDefault) {
      this._parent = tempParent;
      document.body.appendChild(this._parent);
      document.body.prepend(this._parent);
      this.InputChatBox(this._parent);
    }

    this.CloseChatUI();
  }

  //TODO ChatBox클래스의 _TextFieldDOM과 _userName을 통해 패킷 전송!
  //send함수 내에 소켓 전송 함수 구현하면 댐
  private SendChatMessage(_name: string, text: string) {
    if (this._socket) {
      const chatData: IChatMessage = {
        session_id: this._socket.id,
        expo_name: this._expoName,
        message: text,
      };
      this._socket.Send(4, chatData);
    }
  }

  //TODO 소켓을 통해 전달받은 메시지에서 유저 이름과 채팅 내용을 UI(chatPageContainerDOM에 추가
  //이 함수를 소켓 이벤트 맵에서 추가해서 사용하면될듯!
  private AddRecievedChat(name, message) {
    const text = document.createElement("span");
    text.classList.add("chat-recived-text");
    text.textContent = `${name} : ${message}`;
    if (this._chatPageTextWrapper.children.length > 200) {
      this._chatPageTextWrapper.removeChild(
        this._chatPageTextWrapper.children[0]
      );
    }
    this._chatPageTextWrapper.appendChild(text);
    //chat-page-scroll option
    this._chatPageTextWrapper.scrollTop =
      this._chatPageTextWrapper.scrollHeight;
  }

  //TODO 이렇게 만든 컨테이너를 Parent컨테이너에 집어넣는 함수 왜 만들었냐 바깥에서 넣을 수 있게!
  public InputChatBox(parent: HTMLElement) {
    parent.appendChild(this._container);
  }

  private CloseChatUI() {
    this._isOn = false;
    this._parent.style.animation = "shrink 0.5s ease-in-out forwards";
    setTimeout(() => {
      this._parent.removeChild(this._container);
      this._parent.appendChild(this._openChatButtonDOM);
      this._parent.classList.add("temp-chat-parent-transform");
      this._parent.style.animation = "expand 0.5s ease-in-out forwards";
    }, 1300);
  }

  private OpenChatUI() {
    this._isOn = true;
    this._parent.style.animation = "shrink 0.5s ease-in-out forwards";
    setTimeout(() => {
      this._parent.removeChild(this._openChatButtonDOM);
      this._parent.classList.remove("temp-chat-parent-transform");
      this._parent.appendChild(this._container);
      this._parent.style.animation = "expand 0.5s ease-in-out forwards";
    }, 1300);
  }
}

export default ChatBox;
