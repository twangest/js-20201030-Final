import fetchJson from '../../utils/fetch-json';
import SortableList from "../sortable-list";
export default class Categories {
  element;
  subElements = [];
  categories = [];
  subcategories = [];
  constructor() {
    this.url = new URL('/api/rest/categories', process.env.BACKEND_URL);
  }

  async loadData() {
    this.url.searchParams.set('_sort', 'weight');
    this.url.searchParams.set('_refs', 'subcategory');
    this.categories = await fetchJson(this.url);
  }

  async render() {
    await this.loadData();
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
    const categories = this.element.querySelectorAll('[data-id]');
    categories.forEach( item => {
      const listElement = item.querySelector('.subcategory-list');
      const categoryId = item.dataset.id;
      const categoryData = this.categories.find( element => element.id === categoryId);
      if (categoryData) {
        const e = this.getSubCategories(categoryData);
        listElement.append(e);
      }
    });
    this.subElements = this.getSubElements(this.element);
    return this.element;
  }

  getTemplate() {
    return `
      <div class="categories">
        <div class="content__top-panel">
          <h1 class="block-title">Категории товаров</h1>
        </div>
        <div data-elem="categoriesContainer">
          ${this.getCategories()}
        </div>
      </div>
    `;
  }

  getCategories() {
    if (!this.categories.length) {
      return '';
    }
    const template = [...this.categories].reduce((accum, item) => {
      accum.push(`
        <div class="category category_open" data-id="${item.id}">
          <header class="category__header">${item.title}</header>
          <div class="category__body">
            <div class="subcategory-list"></div>
          </div>
        </div>
      `);
      return accum;
    }, []).join('');
    return template;
  }

  getSubCategories(item) {
    const subcategories = item.subcategories.map( value => {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = `
        <li class="categories__sortable-list-item" data-id="${value.id} data-grab-handle="">
          <strong>${value.title}</strong>
          <span><b>${value.count}</b> products</span>
        </li>
      `;
      return wrapper.firstElementChild;
    })
    const sortableList = new SortableList({items: subcategories});
    this.subcategories[item.id] = sortableList;
    return sortableList.element;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-elem]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
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
