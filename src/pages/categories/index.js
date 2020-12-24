import fetchJson from '../../utils/fetch-json';
import Categories from '../../components/categories/index';

export default class Page {
  element;
  subElements = [];
  components = {};
  categories = [];

  constructor() {

  }

  async render() {
    const wrapper = document.createElement('div');

    this.initComponents();
    await this.renderComponents(wrapper);
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.initEventListeners();
    return this.element;
  }

  getTemplate() {
    return `
      <div class="categories">
        <div data-elem="categoriesContainer"></div>
      </div>
    `;
  }

  initComponents() {
    this.components.categories = new Categories();
  }
  async renderComponents(element) {
    const categoriesElement = await this.components.categories.render();
    element.append(categoriesElement);
    return element;
    // this.subElements = this.getSubElements(this.element)
  }
  initEventListeners() {
   this.element.querySelectorAll('.category').forEach(item => {
     item.addEventListener('click', this.toggleContainer);
   })
  }

  toggleContainer = (event) => {
    const element = event.currentTarget;
    element.classList.toggle('category_open');
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-elem]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.elem] = subElement;

      return accum;
    }, {});
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
  }
}
