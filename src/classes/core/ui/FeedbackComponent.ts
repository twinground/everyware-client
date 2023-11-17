class FeedbackComponent {
  private _feedbackContainer: HTMLDivElement;
  private _likeBtn: HTMLDivElement;
  private _feedbackBtn: HTMLDivElement;
  private _likeNumber: HTMLDivElement;
  private _feedbackNumber: HTMLDivElement;
  public isRendered = false;
  constructor() {}

  private SetDomNodes() {
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
    this._likeNumber.innerText = "0";
    this._feedbackNumber.innerText = "0";

    this._likeBtn.appendChild(likeImage);
    this._feedbackBtn.appendChild(feedbackImage);
    this._likeBtn.appendChild(this._likeNumber);
    this._feedbackBtn.appendChild(this._feedbackNumber);

    this._feedbackContainer.append(...[this._likeBtn, this._feedbackBtn]);
    setTimeout(() => {
      this._feedbackContainer.classList.add("fade-in");
    }, 10);

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

  Render() {
    const container = this.SetDomNodes();

    document.body.appendChild(container);
    return container;
  }
}

export default FeedbackComponent;
