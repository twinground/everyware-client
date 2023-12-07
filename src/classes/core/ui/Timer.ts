class Timer {
  private _timerContainer: HTMLDivElement;

  private _hourCol: HTMLDivElement;
  private _hourText: HTMLParagraphElement;
  private _hourLabel: HTMLParagraphElement;

  private _minCol: HTMLDivElement;
  private _minText: HTMLParagraphElement;
  private _minLabel: HTMLParagraphElement;

  private _secCol: HTMLDivElement;
  private _secText: HTMLParagraphElement;
  private _secLabel: HTMLParagraphElement;
  constructor() {}

  SetDomNodes() {
    this._timerContainer = document.createElement("div");
    this._timerContainer.className = "timer-container";

    this._hourCol = document.createElement("div");
    this._hourLabel = document.createElement("p");
    this._hourText = document.createElement("p");
    this._hourCol.className = "clock-col";
    this._hourLabel.className = "clock-label";
    this._hourLabel.innerText = "HOUR";
    this._hourText.className = "clock-hours clock-timer blinking";

    this._hourCol.append(...[this._hourText, this._hourLabel]);

    this._minCol = document.createElement("div");
    this._minLabel = document.createElement("p");
    this._minText = document.createElement("p");
    this._minCol.className = "clock-col";
    this._minLabel.className = "clock-label";
    this._minLabel.innerText = "MIN";
    this._minText.className = "clock-minutes clock-timer blinking";

    this._minCol.append(...[this._minText, this._minLabel]);

    this._secCol = document.createElement("div");
    this._secLabel = document.createElement("p");
    this._secText = document.createElement("p");
    this._secCol.className = "clock-col";
    this._secLabel.className = "clock-label";
    this._secLabel.innerText = "SEC";
    this._secText.className = "clock-seconds clock-timer blinking";

    this._secCol.append(...[this._secText, this._secLabel]);

    this._timerContainer.append(...[this._hourCol, this._minCol, this._secCol]);

    document.body.appendChild(this._timerContainer);
  }

  RemoveDomNodes(className: string) {
    setTimeout(() => {
      let node = document.querySelector(`.${className}`);
      if (node && node.parentNode) {
        node.parentNode.removeChild(node);
      }
    }, 500);
  }

  Render(delta: number) {
    const hour = Math.floor(delta / (60 * 60));
    const minutes = Math.floor(delta / 60);
    const sec = delta % 60;

    this._hourText.innerText = `${hour}`;
    this._minText.innerText = `${minutes}`;
    this._secText.innerText = `${sec}`;
  }

  StartTimer(reserved: number, meetLink: string) {
    //let delta = reserved - Math.floor(Date.now() / 1000);
    let delta = 10; // TODO : Hard coding

    this.SetDomNodes();
    const timeInterval = setInterval(() => {
      this.Render(delta);
      delta -= 1;
    }, 1000);

    // clear timeout after then
    setTimeout(() => {
      clearInterval(timeInterval);
      window.open(meetLink);
      this.RemoveDomNodes("timer-container");
    }, delta * 1000);
  }
}

export default Timer;
