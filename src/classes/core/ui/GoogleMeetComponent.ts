import axios from "axios";
import { API_URL } from "../static";
import swal from "sweetalert";
// class

class GoogleMeetComponent {
  private _meetContainer: HTMLDivElement;
  private _meetBtn: HTMLDivElement;
  private _meetText: HTMLParagraphElement;
  public isRendered = false;
  private boothId: number = -1; // request google meet about this booth id

  constructor() {}

  private SetDomNodes(boothId: number, meetLink: string) {
    this.boothId = boothId;
    this._meetContainer = document.createElement("div");
    this._meetContainer.className = "meet-container";

    this._meetBtn = document.createElement("div");
    this._meetBtn.className = "meet-button";
    this._meetContainer.appendChild(this._meetBtn);

    this._meetBtn.onclick = () => {
      window.open(meetLink);
    };

    this._meetText = document.createElement("p");
    this._meetText.className = "meet-text";
    this._meetText.innerText = "개발자와 1대1 대화하기";
    this._meetBtn.appendChild(this._meetText);

    setTimeout(() => {
      this._meetContainer.classList.add("fade-in-button");
      this._meetContainer.style.bottom = "1rem";
    }, 10);

    return this._meetContainer;
  }

  RemoveDomNodes(className: string) {
    this._meetContainer.style.bottom = "-5rem";
    this._meetContainer.classList.remove("fade-in-button");

    setTimeout(() => {
      let node = document.querySelector(`.${className}`);
      if (node && node.parentNode) {
        node.parentNode.removeChild(node);
      }
    }, 500);
  }

  Render(boothId: number, meetLink: string) {
    const container = this.SetDomNodes(boothId, meetLink);

    document.body.appendChild(container);
  }
}

export default GoogleMeetComponent;
