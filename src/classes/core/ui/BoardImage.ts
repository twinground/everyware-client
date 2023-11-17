class BoardImage {
  constructor() {}

  SetDomNodes(src: string) {
    const imageContainer = document.createElement("div");
    imageContainer.className = "board-image-container";
    const image = document.createElement("img");
    image.className = "board-image";
    image.src = src;

    const closeBtn = document.createElement("div");
    closeBtn.className = "close-icon";
    closeBtn.addEventListener("click", () => {
      this.RemoveDomNodes("board-image-container");
    });

    imageContainer.appendChild(image);
    imageContainer.appendChild(closeBtn);
    return imageContainer;
  }

  RemoveDomNodes(className: string) {
    let node = document.querySelector(`.${className}`);
    if (node && node.parentNode) {
      node.parentNode.removeChild(node);
    }
  }

  Render(src: string) {
    const container = this.SetDomNodes(src);
    document.body.appendChild(container);
  }
}

export default BoardImage;
