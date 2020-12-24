// import ProductForm from "../../../components/product-form";
import DoubleSlider from "../../../components/double-slider";
import productHeader from "./products-header";
import SortableTable from "../../../components/sortable-table";

export default class Page {
  element;
  emptyPlaceholder;
  subElements = {};
  components = {};
  min = 0;
  max = 4000;

  get topPanel() {
    return `
      <div class="content__top-panel">
        <h1 class="page-title">Товары</h1>
        <a href="/products/add" class="button-primary">Добавить товар</a>
      </div>
      `;
  }

  get contentBox() {
    return `
    <div class="content-box content-box_small">
      <form class="form-inline">
        <div class="form-group">
          <label class="form-label">Сортировать по:</label>
          <input type="text" data-element="filterName" class="form-control" placeholder="Название товара">
        </div>
        <div class="form-group" data-element="sliderContainer">
            <label class="form-label">Цена:</label>
        </div>
        <div class="form-group">
          <label class="form-label">Статус:</label>
          <select class="form-control" data-element="filterStatus">
            <option value="" selected="">Любой</option>
            <option value="1">Активный</option>
            <option value="0">Неактивный</option>
          </select>
        </div>
      </form>
    </div>
    `;
  }

  get template() {
    return `
      <div class='products-list'>
        ${this.topPanel}
        ${this.contentBox}
        <div data-element="productsContainer" class="products-list__container"
      </div>
    `;
  }

  setEmptyPlaceholderElement() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
    <div data-element="emptyPlaceholder" className="sortable-table__empty-placeholder">
      <div>
        <p>Не найдено товаров удовлетворяющих выбранному критерию</p>
        <button data-element="clearFilters" type="button" className="button-primary-outline" >Очистить фильтры</button>
      </div>
    </div>
    `;
    this.emptyPlaceholder = wrapper.firstElementChild;
  }

  async render() {
    this.setEmptyPlaceholderElement();

    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    this.initComponents();
    await this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  initComponents() {
    const productId = '101-planset-lenovo-yt3-x90l-64-gb-3g-lte-cernyj';

    this.components.productList = new SortableTable(productHeader, {
      url: '/api/rest/products',
    });
    // this.components.productFrom = new ProductForm(productId);
    this.components.doubleSlider = new DoubleSlider({min: this.min, max: this.max});

  }

  renderComponents() {
    this.subElements.productsContainer.append(this.components.productList.element);
    this.subElements.sliderContainer.append(this.components.doubleSlider.element);
  }

  initEventListeners() {
    this.subElements.filterName.addEventListener('input', this.onFilterName);
    this.subElements.filterStatus.addEventListener('change', this.onFilterStatus);
    this.subElements.sliderContainer.addEventListener('range-select', this.onRangeSelect);

    this.components.productList.subElements.clearFilters
      .addEventListener('click', this.onClearFilters);
  }

  onFilterName = async (event) => {
    const title_like = event.target.value;
    await this.filterProductList({title_like});
  };

  onFilterStatus = async (event) => {
    const status = event.target.value;
    await this.filterProductList({status});
  };

  onRangeSelect = async (event) => {
    const {from, to} = event.detail;
    this.min = from;
    this.max = to;
    await this.filterProductList();
  };

  onClearFilters = async (event) => {
    this.subElements.filterName.value = '';
    this.subElements.filterStatus.value = '';
    this.min = 0;
    this.max = 4000;
    this.components.doubleSlider.clearSelected();
    await this.filterProductList();
  };

  filterProductList = async (params) => {
    //Fixme: Правильно выставить параметры price_gte и price_lte
    // слетают при сортировке цены
    const data = await this.components.productList.loadData({
      ...params,
      price_gte: this.min,
      price_lte: this.max,
    });
    await this.components.productList.renderRows(data);
  };


  getSubElements($element) {
    const elements = $element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, this.subElements);
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
    this.emptyPlaceholder = null;
  }
}
