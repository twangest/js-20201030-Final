import RangePicker from "../../components/range-picker";
import SortableTable from "../../components/sortable-table";
import salesHeader from './sales-headers';
import header from "../dashboard/bestsellers-header";
import fetchJson from "../../utils/fetch-json";

export default class Page {
  element;
  subElements = [];
  components = {};
  dateFrom;
  dateTo;
  constructor() {

  }

  getTemplate(){
    return `
      <div class="sales full-height flex-column">
        <div class="content__top-panel">
          <h1 class="page-title">Продажи</h1>
          <div data-elem="rangePicker" class="rangepicker"></div>
        </div>
        <div data-elem="ordersContainer" class="full-height flex-column"></div>
      </div>
    `;
  }
  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.initComponents();
    this.renderComponents();
    return this.element;
  }

  initComponents() {
    const to = new Date();
    const from = new Date(to.getTime() - (30 * 24 * 60 * 60 * 1000));
    const rangePicker = new RangePicker({from, to});
    const sortableTable = new SortableTable(salesHeader, {
      url: `/api/rest/orders?createdAt_gte=${from.toISOString()}&createdAt_lte=${to.toISOString()}&_sort=createdAt&_order=desc&_start=0&_end=30`,
      isSortLocally: true
    });

    this.components['rangePicker'] = rangePicker;
    this.components['ordersContainer'] = sortableTable;
    this.initEventListeners();
  }

  renderComponents() {
    Object.keys(this.components).forEach((component) => {
      const root = this.subElements[component];
      const {element} = this.components[component];
      root.append(element);
    });
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
      this.element.remove()
    }
  }

  initEventListeners() {
    this.element.addEventListener('date-select', (event)=> {
      const {from, to} = event.detail;
      this.updateTableComponent(from, to);
    })
  }
  async updateTableComponent(from, to) {
    const data = await fetchJson(`${process.env.BACKEND_URL}api/rest/orders?createdAt_gte=${from.toISOString()}&createdAt_lte=${to.toISOString()}&_sort=createdAt&_order=desc&_start=0&_end=30`);
    this.components.ordersContainer.addRows(data);
  }
  destroy() {
    this.remove();

  }



}
