import fetchJson from '../../utils/fetch-json';
import Categories from '../../components/categories/index';
import Notification from '../../components/notification';

export default class Page {
  element;
  subElements = [];
  components = {};
  categories = [];

  constructor() {

  }

  async render() {
    this.initComponents();
    const wrapper = await this.renderComponents(document.createElement('div'));
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.initEventListeners();
    return this.element;
  }

  initComponents() {
    this.components.categories = new Categories();
  }

  showNotification = (message, type, duration = 2 * 1000) => {
    this.components.notification = new Notification(message, {type, duration});
    this.components.notification.show();
  };

  async renderComponents(element) {
    const categoriesElement = await this.components.categories.render();
    element.append(categoriesElement);
    return element;
  }

  changeArrayOrder(srcArray = [], {from, to} = {}) {
    if (!srcArray.length || typeof from === 'undefined' || typeof to === 'undefined') {
      return;
    }
    const item = srcArray.splice(from, 1);
    srcArray.splice(to, 0, item[0]);
  }

  mapSubcategoryArray(item, index) {
    return {
      id: item.id,
      weight: index
    };

  }

  onChangeSubcategoryOrder = async (event) => {
    const element = event.target.closest('.category');
    const categoryId = element.dataset.id;
    const category = this.components.categories.categories.find(item => item.id === categoryId);
    this.changeArrayOrder(category.subcategories, event.detail);
    const requestParams = category.subcategories.map(this.mapSubcategoryArray);
    try {
      const response = await fetchJson('/api/rest/subcategories', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestParams)
      });
      this.showNotification('Category order saved', 'success', 2 * 1000);
    } catch (e) {
      console.error(e);
      this.showNotification(e, 'error');
    }
  };

  initEventListeners() {
    this.element.querySelectorAll('.category').forEach(item => {
      const headerElement = item.querySelector('header');
      headerElement.addEventListener('click', this.toggleContainer);
    });

    Object.entries(this.components.categories.subcategories).forEach(([key, item]) => {
      item.element.addEventListener('sortable-list-reorder', this.onChangeSubcategoryOrder);
    });

  }

  toggleContainer = (event) => {
    const element = event.currentTarget.closest('.category');
    element.classList.toggle('category_open');
  };

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
    this.components = null;
    this.subElements = null;
    this.element = null;
  }
}
