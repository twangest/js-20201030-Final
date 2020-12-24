const notifications = [];

export default class NotificationMessage {
  static lastNotification = null;
  constructor(message = '', {duration = 1000, type = 'success'} = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;

    if (NotificationMessage.lastNotification) {
      NotificationMessage.lastNotification.remove();
    }

    this.render();
  }
  get headerTemplate() {
    return ``;
    //return `<div class="notification-header">${this.type}</div>`;
  }
  get body() {
    return `
      <div class="notification__content notification-body">
            ${this.message}
      </div>
    `;
  }
  get template() {
    return `
      <div class="notification notification_${this.type}" style="--value:${this.duration}ms">
        <div class="timer"></div>
        <div class="inner-wrapper">
          ${this.headerTemplate}
          ${this.body}
        </div>
      </div>
    `;
  }
  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
  }
  show(outerElement = document.body) {
    this.element.classList.add('show')
    NotificationMessage.lastNotification = this;
    outerElement.append(this.element);
    setTimeout(() => {
      this.element.classList.remove('show')
      this.remove();
    }, this.duration);
  }
  remove() {
    this.element.remove();
  }
  destroy() {
    this.remove();
  }
}
