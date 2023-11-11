// TODO : this is temp chat box -> woo hyeong will make new ui again
//class

import Socket from "../../network/SocketClient";

class ChatBox {
  private _expoName: string;
  private _userName: string;
  private _container: HTMLDivElement;
  private _textFieldDOM: HTMLInputElement;
  private _chatPageTextWrapper: HTMLDivElement;
  private _sendButtonDOM: HTMLDivElement;
  private _sizeToggleButtonDOM: HTMLElement;
  private _socket?: Socket;
  private _isOn: boolean;
  private _isDefault: boolean;

  constructor(expoName, userName, socket?: Socket) {
    // if you have parent out of this class turn _isDefault to false and call InputChatBox with parent element
    this._isDefault = true;

    this._expoName = expoName;
    this._userName = userName;

    const tempParent = document.createElement("div");

    this._container = document.createElement("div");
    this._sizeToggleButtonDOM = document.createElement("div");
    const displayPage = document.createElement("div");
    this._chatPageTextWrapper = document.createElement("div");
    const inputPage = document.createElement("div");
    this._textFieldDOM = document.createElement("input");
    this._textFieldDOM.setAttribute("type", "text");
    this._sendButtonDOM = document.createElement("div");

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

    //add event listener on button
    this._sendButtonDOM.addEventListener("click", () => {
      if (this._textFieldDOM.value != "") {
        this.Send(this._userName, this._textFieldDOM.value);

        //TODO test code for console, should be deleted
        this.AddRecievedChat(this._userName, this._textFieldDOM.value);
        //-------------------------------------------------------------
      }

      this._textFieldDOM.value = "";
      this._textFieldDOM.focus();
    });

    this._textFieldDOM.addEventListener("keyup", (event) => {
      // event.key === 'Enter'는 엔터 키를 눌렀을 때를 확인

      if (event.key === "Enter") {
        if (this._textFieldDOM.value != "") {
          this.Send(this._userName, this._textFieldDOM.value);

          //TODO test code for console, should be deleted
          this.AddRecievedChat(this._userName, this._textFieldDOM.value);
          //-------------------------------------------------------------
        }

        this._textFieldDOM.value = "";
        this._textFieldDOM.focus();
      }
    });

    if (this._isDefault) {
      document.body.appendChild(tempParent);
      this.InputChatBox(tempParent);
    }
  }

  //TODO ChatBox클래스의 _TextFieldDOM과 _userName을 통해 패킷 전송!
  //send함수 내에 소켓 전송 함수 구현하면 댐
  private Send(name: string, text: string) {
    console.log(name);
    console.log(text);
  }

  //TODO 소켓을 통해 전달받은 메시지에서 유저 이름과 채팅 내용을 UI(chatPageContainerDOM에 추가
  //이 함수를 소켓 이벤트 맵에서 추가해서 사용하면될듯!
  private AddRecievedChat(name, message) {
    const text = document.createElement("span");
    text.classList.add("chat-recived-text");
    text.textContent = `${name} : ${message}`;
    this._chatPageTextWrapper.appendChild(text);
    //chat-page-scroll option
    this._chatPageTextWrapper.scrollTop =
      this._chatPageTextWrapper.scrollHeight;
  }

  //TODO 이렇게 만든 컨테이너를 Parent컨테이너에 집어넣는 함수 왜 만들었냐 바깥에서 넣을 수 있게!
  public InputChatBox(parent: HTMLElement) {
    parent.appendChild(this._container);
  }
}

export default ChatBox;
