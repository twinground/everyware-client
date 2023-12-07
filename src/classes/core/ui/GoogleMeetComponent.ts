import axios from "axios";
import { API_URL } from "../static";
import swal from "sweetalert";
import Timer from "./Timer";
// class

class GoogleMeetComponent {
  private _meetContainer: HTMLDivElement;
  private _meetBtn: HTMLDivElement;
  private _meetText: HTMLParagraphElement;
  private _timer: Timer;
  public isRendered = false;
  private boothId: number = -1; // request google meet about this booth id

  constructor() {
    this._timer = new Timer();
  }

  public async RequestGoogleMeet(meetLink: string) {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await axios.post(
        `${API_URL}/api/booths/${this.boothId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.isSuccess) {
        swal("", "예약에 성공했습니다!", "success", {
          buttons: {
            ok: {
              text: "ok",
              value: true,
            },
          },
        });
        this._timer.StartTimer(
          Number(response.data.result.timestamp),
          meetLink
        );
      }
    } catch (error) {
      if (error.response.status == 400) {
        // already booked
        swal("Oops!", "이미 예약한 대화가 존재합니다.", "error", {
          buttons: {
            ok: {
              text: "ok",
              value: true,
            },
          },
        });
      }

      if (error.response.status == 401) {
        // already booked
        swal("Oops!", "로그인이 필요한 기능입니다.", "error", {
          buttons: {
            login: {
              text: "로그인 하러가기",
              value: true,
            },
            no: {
              text: "다음에",
              value: false,
            },
          },
        }).then((value) => {
          if (value) {
            window.location.href = "http://everyware-test.shop/auth/auth.html";
          }
        });
      }
    }
  }

  private SetDomNodes(boothId: number, meetLink: string) {
    this.boothId = boothId;
    this._meetContainer = document.createElement("div");
    this._meetContainer.className = "meet-container";

    this._meetBtn = document.createElement("div");
    this._meetBtn.className = "meet-button";
    this._meetContainer.appendChild(this._meetBtn);

    this._meetBtn.onclick = () => {
      this.RequestGoogleMeet(meetLink);
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
    this.boothId = boothId;

    const container = this.SetDomNodes(boothId, meetLink);

    document.body.appendChild(container);
  }
}

export default GoogleMeetComponent;
