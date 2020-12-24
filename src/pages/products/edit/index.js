import ProductForm from "../../../components/product-form";

export default class Page {
  element;
  subElements = {};
  components = {};
  productId = '';

  constructor() {
    const pathname = window.location.pathname;
    this.productId = (pathname.includes('/products/add'))
        ? null
        : pathname.replace('/products/', '').trim();
  }

  get template() {
    return `
      <div class="products-edit">
        <div class="content__top-panel">
          <h1 class="page-title">
            <a href="/products" class="link">Товары</a> / Редактировать
          </h1>
        </div>
        <div class="content-box"></div>
      </div>
    `;
  }

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.initComponents();
    this.renderComponents();
    return this.element;
  }

  initComponents() {
    this.components.productForm = new ProductForm(this.productId);
  }

  async renderComponents() {
    const productElement = await this.components.productForm.render();
    this.element.querySelector('.content-box').append(productElement);
  }

  getSubElements($element) {
    const elements = $element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
    this.remove();
    this.subElements = null;
  }
}
