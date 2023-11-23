import axios from "axios";
import { API_URL } from "../static";
import swal from "sweetalert";

class FormComponent {
  public boothId: number;
  constructor() {}

  private async RequestFormSubmit(
    data: any,
    token: string,
    feedbackNumber: HTMLDivElement
  ) {
    const response = await axios.post(
      `${API_URL}/api/comments/${this.boothId}`,
      data,
      {
        // config filed
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.state == 201) {
      swal("", "소중한 의견 감사드립니다 :)", "success", {
        buttons: {
          ok: {
            text: "ok",
            value: false,
          },
        },
      });
      feedbackNumber.innerText = response.data.data.count;
    }

    if (response.data.state === 400) {
      swal("Fail!", "권한이 없습니다.", "error", {
        buttons: {
          ok: {
            text: "ok",
            value: false,
          },
        },
      });
    }
  }

  private SetDomNodes(
    boothId: number,
    token: string,
    feedbackNumber: HTMLDivElement
  ) {
    let rateData = -1;
    this.boothId = boothId;
    const formContainer = document.createElement("div");
    formContainer.className = "form-container";

    // rate title
    const rateTitle = document.createElement("div");
    rateTitle.className = "form-rate-title";
    rateTitle.innerText = "이 전시 작품에 대해 얼마나 만족하시나요?";
    formContainer.appendChild(rateTitle);
    // rate button
    const rateButtonContainer = document.createElement("div");
    rateButtonContainer.className = "form-rate-button-container";
    for (let i = 1; i < 6; i++) {
      const rateButton = document.createElement("input");
      rateButton.className = "form-rate-button";
      rateButton.type = "button";
      rateButton.value = i + "";
      rateButtonContainer.appendChild(rateButton);
      rateButton.onclick = () => {
        const rateBtns = document.getElementsByClassName("form-rate-button");
        for (let btn of rateBtns) {
          btn.classList.remove("clicked-state");
        }
        rateButton.classList.add("clicked-state");
        rateData = Number(rateButton.value);
      };
    }
    formContainer.appendChild(rateButtonContainer);

    // rate description
    const rateDescriptionContainer = document.createElement("div");
    rateDescriptionContainer.className = "form-rate-description-container";
    const notLike = document.createElement("p");
    notLike.innerText = "1 - 별로..";
    const like = document.createElement("p");
    like.innerText = "5 - 최고!!";
    rateDescriptionContainer.appendChild(notLike);
    rateDescriptionContainer.appendChild(like);
    formContainer.appendChild(rateDescriptionContainer);

    // suggestion title
    const suggestionTitle = document.createElement("div");
    suggestionTitle.className = "form-suggestion-title";
    suggestionTitle.innerText =
      "제품 개선을 위해 편하게 피드백을 남겨주세요! (선택)";
    formContainer.appendChild(suggestionTitle);

    // suggestion text area
    const suggestionTextarea = document.createElement("input");
    suggestionTextarea.className = "form-suggestion-textarea";
    suggestionTextarea.type = "textarea";
    formContainer.appendChild(suggestionTextarea);

    // submit button
    const submitBtn = document.createElement("div");
    submitBtn.className = "form-submit-button";
    submitBtn.innerText = "제출하기";
    formContainer.appendChild(submitBtn);

    // absolute exit button
    const exitBtn = document.createElement("div");
    exitBtn.className = "form-exit-button";
    formContainer.appendChild(exitBtn);

    // enroll event listener
    // submit event
    submitBtn.onclick = () => {
      // post form data
      const data = {
        rate: rateData,
        comment: suggestionTextarea.value,
      };
      this.RequestFormSubmit(data, token, feedbackNumber);

      this.RemoveDomNodes("form-container");
    };

    // exit button event
    exitBtn.onclick = () => {
      this.RemoveDomNodes("form-container");
    };

    return formContainer;
  }

  RemoveDomNodes(className: string) {
    let node = document.querySelector(`.${className}`);
    if (node && node.parentNode) {
      node.parentNode.removeChild(node);
    }
  }

  Render(boothId: number, token: string, feedbackNumber: HTMLDivElement) {
    const container = this.SetDomNodes(boothId, token, feedbackNumber);

    document.body.appendChild(container);
    return container;
  }
}

export default FormComponent;
