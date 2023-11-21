import axios from "axios";
import { API_URL } from "../static";
import swal from "sweetalert";
// class
import FormComponent from "./FormComponent";

class FeedbackComponent {
  private _feedbackContainer: HTMLDivElement;
  private _likeBtn: HTMLDivElement;
  private _feedbackBtn: HTMLDivElement;
  private _likeNumber: HTMLDivElement;
  private _feedbackNumber: HTMLDivElement;
  public isRendered = false;
  private boothId: number = -1;

  constructor() {}

  private CheckToken(): string {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      // login needed
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
          //window.location.href = ""
        }
      });
      return "";
    }

    return token;
  }

  private async RequestLike() {
    const token = this.CheckToken();
    if (token != "") {
      console.log(`${API_URL}/api/likes/${this.boothId}`);
      const response = await axios.post(
        `${API_URL}/api/likes/${this.boothId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);
      this._likeNumber.innerText = response.data;
      // if success, alert

      if (response.data.state == 400) {
        // if fail, fail alert
        alert("권한이 없습니다.");
      }
    }
  }

  private RequestForm() {
    const token = this.CheckToken();
    if (token != "") {
      const feedbackForm = new FormComponent();
      feedbackForm.Render(this.boothId, token);
    }
  }

  private SetDomNodes(boothId: number) {
    this.boothId = boothId;
    this._feedbackContainer = document.createElement("div");
    this._feedbackContainer.className = "feedback-container";

    this._likeBtn = document.createElement("div");
    this._feedbackBtn = document.createElement("div");
    this._likeBtn.className = "feedback-children";
    this._feedbackBtn.className = "feedback-children";

    const likeImage = document.createElement("img");
    const feedbackImage = document.createElement("img");
    likeImage.src = "./images/heart.png";
    likeImage.style.width = "70%";
    likeImage.style.height = "70%";
    feedbackImage.src = "./images/feedback.png";
    feedbackImage.style.width = "60%";
    feedbackImage.style.height = "60%";
    feedbackImage.style.marginTop = "0.2rem";

    this._likeNumber = document.createElement("div");
    this._feedbackNumber = document.createElement("div");
    this._likeNumber.className = "like-number-text";
    this._feedbackNumber.className = "feedback-number-text";

    this._likeBtn.appendChild(likeImage);
    this._feedbackBtn.appendChild(feedbackImage);
    this._likeBtn.appendChild(this._likeNumber);
    this._feedbackBtn.appendChild(this._feedbackNumber);

    this._feedbackContainer.append(...[this._likeBtn, this._feedbackBtn]);
    setTimeout(() => {
      this._feedbackContainer.classList.add("fade-in");
    }, 10);

    // Get likes and comments info from api server
    axios.get(`${API_URL}/api/likes/${this.boothId}`).then((res) => {
      this._likeNumber.innerText = res.data.data;
    });
    axios.get(`${API_URL}/api/comments/${this.boothId}`).then((res) => {
      console.log(res);
      this._feedbackNumber.innerText = "" + res.data.data.length;
    });

    // enroll event listener
    this._likeBtn.onclick = () => {
      this.RequestLike();
    };
    this._feedbackBtn.onclick = () => {
      this.RequestForm();
    };
    this._feedbackBtn.addEventListener("click", () => {});

    return this._feedbackContainer;
  }

  RemoveDomNodes(className: string) {
    this._feedbackContainer.classList.remove("fade-in");

    setTimeout(() => {
      let node = document.querySelector(`.${className}`);
      if (node && node.parentNode) {
        node.parentNode.removeChild(node);
      }
    }, 500);
  }

  Render(boothId: number) {
    const container = this.SetDomNodes(boothId);

    document.body.appendChild(container);
    return container;
  }
}

export default FeedbackComponent;
