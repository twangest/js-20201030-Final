import fetchJson from '../../utils/fetch-json.js';

export default class SortableTable {
  subElements = {};
  data = [];
  loading = false;
  step = 30;
  start = 0;

  constructor (header = [], {
    url = '',
    sorted = {
      id: header.find(item => item.sortable).id,
      order: 'desc'
    },
    isSortLocally: isSortLocally = false,
    start = 0,
    step = 30,
    end = start + step,
    requestParams={}
  } = {}) {
    this.header = header;
    this.url = new URL(url, process.env.BACKEND_URL);
    this.sorted = sorted;
    this.isSortLocaly = isSortLocally;
    this.start = start;
    this.step = step;
    this.end = end;
    this.requestParams = requestParams;
    this.render();
  }

  async render() {
    const {id, order} = this.sorted;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    const element = wrapper.firstElementChild;
    this.element = element;
    this.subElements = this.getSubElements(element);

    const data = await this.loadData({
      id,
      order,
      start: this.start,
      end: this.end,
    });

    this.renderRows(data);
    this.initEventListeners();
    return this.element

  }

  renderRows(data) {
    if (data.length) {
      this.element.classList.remove('sortable-table_empty');
      this.addRows(data);
    } else {
      this.element.classList.add('sortable-table_empty');
    }
  }

  addRows(data) {
    this.data = data;
    this.subElements.body.innerHTML = this.getTableRows(data);
  }
  clearUrlParams() {
    this.url.searchParams.forEach((value, key) => {
      this.url.searchParams.delete(key)
    });
  }
  async loadData({
      id = this.sorted.id,
      order = this.sorted.order,
      start = this.start,
      end = this.end,
      requestParams = this.requestParams
    }) {
    this.element.classList.add('sortable-table_loading');
    this.clearUrlParams();
    this.url.searchParams.set('_embed', 'subcategory.category');
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);
    if (Object.keys(requestParams).length) {
      Object.entries(requestParams).forEach(([key, value]) => {
        if (typeof value !== 'undefined') {
          this.url.searchParams.set(key, value);
        }
      })
    }
    try {
      const data = await fetchJson(this.url.toString());
      this.element.classList.remove('sortable-table_loading');
      return data;
    } catch (e) {
      throw e;
    }
  }


  headerItemTemplate({id, sortable, title}) {
    const order = this.sorted.id === id ? this.sorted.order : 'asc';
    return `
      <div class="sortable-table__cell"
           data-element="${id}"
           data-id="${id}"
           data-sortable="${sortable}"
           data-order="${order}"
      >
        <span>${title}</span>
        ${this.arrowTemplate(id)}
      </div>
    `;
  }

  arrowTemplate(id) {
    const isOrderExist = this.sorted.id === id ? this.sorted.order : '';

    return isOrderExist
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`
      : '';
  }

  get headerTemplate() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.header.map(item => this.headerItemTemplate(item)).join('')}
      </div>
    `;
  }

  getTableBody() {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTableRows(this.data)}
      </div>`;
  }

  getTableRows(data) {
    return data.map(item => {
      return `
         <a href="/products/${item.id}" class="sortable-table__row">
            ${this.getTableRow(item)}
         </a>
      `;
    }).join('');
  }

  getTableRow(item) {
    return this.header.map(cell => {
      return cell.template
        ? cell.template(item[cell.id])
        : `<div class="sortable-table__cell">${item[cell.id]}</div>`;
    }).join('');
  }

  get template() {
    return `
      <div class="sortable-table">
        ${this.headerTemplate}
        ${this.getTableBody()}

        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          <p>Не найдено товаров удовлетворяющих выбранному критерию</p>
          <button data-element="clearFilters" type="button" class="button-primary-outline" >
            Очистить фильтры
          </button>
        </div>
      </div>
    `;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  update(data) {
    if (!data.length && !this.element.classList.contains('sortable-table_empty')) {
      this.element.classList.add('sortable-table_empty');
      return;
    }
    if (this.element.classList.contains('sortable-table_empty')) {
      this.element.classList.remove('sortable-table_empty');
    }
    const rows = document.createElement('div');

    this.data = [...this.data, ...data];
    rows.innerHTML = this.getTableRows(data);

    this.subElements.body.append(...rows.childNodes);
  }

  async sortOnServer(id, order, start, end, requestParams) {
    const data = await this.loadData({id, order, start, end, requestParams});
    this.renderRows(data);
  }

  sort(id, order) {
    const sortedData = this.sortData(id, order);
    this.renderRows(sortedData);
  }

  sortData(field, order) {
    const arr = [...this.data];
    const column = this.header.find(item => item.id === field);
    const {sortType, customSorting} = column;
    const sortOrder = {
      'asc': 1,
      'desc': -1
    };
    const direction = sortOrder[order];
    return arr.sort((a, b) => {
      switch (sortType) {
      case 'number':
        return direction * (a[field] - b[field]);
      case 'string' :
        return direction * a[field].localeCompare(b[field], ['ru', 'en']);
      case 'custom':
        return direction * customSorting(a, b);
      default:
        return direction * (a[field] - b[field]);
      }
    });
  }

  onSortClick = (event) => {
    const column = event.target.closest('.sortable-table__cell[data-id]');
    const {id, order, sortable} = column.dataset;
    const isSorting = sortable === 'true';
    const orderList = {
      'asc': 'desc',
      'desc': 'asc'
    };
    const newOrder = !order ? 'desc' : orderList[order];

    if (isSorting) {
      this.sorted = {
        id,
        order: newOrder
      };
      column.dataset.order = newOrder;
      column.append(this.subElements.arrow);
      if (this.isSortLocaly) {
        this.sort(id, order);
      } else {
        this.sortOnServer(id, order, 0, this.end);
      }
    }
  };

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onSortClick);
    document.addEventListener('scroll', this.onWindowScroll);
  }

  onWindowScroll = async () => {
    const { bottom } = this.element.getBoundingClientRect();
    const { id, order } = this.sorted;

    if (bottom < document.documentElement.clientHeight && !this.loading && !this.isSortLocally) {
      this.start = this.end;
      this.end = this.start + this.step;

      this.loading = true;

      const data = await this.loadData({id, order, start: this.start, end: this.end});

      this.update(data);

      this.loading = false;
    }
  };

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }

}
