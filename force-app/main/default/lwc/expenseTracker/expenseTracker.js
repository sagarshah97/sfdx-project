import { LightningElement, wire, track } from "lwc";

const columns = [
  { label: "Type", fieldName: "Type" },
  { label: "Amount", fieldName: "Amount", type: "currency" }
];

export default class ExpenseTracker extends LightningElement {
  error;
  amount;
  type;
  outputList = [];
  columns = columns;

  @track chartConfiguration;
  @track data = [];

  get isData() {
    return this.data.length > 0;
  }

  get disableChart() {
    let result = true;

    if (this.data.length > 0) {
      result = false;
    }

    return result;
  }

  get disableAdd() {
    let result = true;

    if (this.amount && this.type) {
      result = false;
    }

    return result;
  }

  inputAmount(event) {
    const amount = event.detail.value;
    const reg = new RegExp(/^\d*(\.\d+)?$/);
    if (reg.test(amount)) {
      this.amount = event.detail.value;
    } else {
      this.showToast();
      this.amount = null;
    }
  }

  inputType(event) {
    this.type = event.detail.value;
  }

  handleAddData() {
    this.chartConfiguration = null;
    this.data = [
      ...this.data,
      { Amount: Number(this.amount), Type: this.type }
    ];
    this.amount = null;
    this.type = null;
  }

  currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  });

  handleShowChart() {
    this.showGraph();
  }

  showGraph() {
    if (this.data) {
      let chartData = [];
      let chartLabels = [];
      this.data.forEach((opp) => {
        chartData.push(opp.Amount);
        chartLabels.push(opp.Type);
      });

      const chartConfiguration = {
        type: "line",
        data: {
          labels: chartLabels,
          datasets: [
            {
              label: "Expense",
              lineTension: 0,
              barPercentage: 0.5,
              barThickness: 6,
              maxBarThickness: 8,
              minBarLength: 2,
              backgroundColor: "green",
              data: chartData
            }
          ]
        },
        options: {}
      };

      this.chartConfiguration = chartConfiguration;
      this.formatOutput();
      this.error = undefined;
    }
  }

  formatOutput() {
    this.data.forEach((obj) => {
      let outputObj = {
        Type: obj.Type,
        Amount: this.currencyFormatter.format(obj.Amount)
      };
      this.outputList.push(outputObj);
    });
    this.sendOutput();
  }

  sendOutput() {
    let output = { data: this.outputList };
    this.dispatchEvent(
      new CustomEvent("pass", {
        detail: output
      })
    );
  }

  showToast() {
    const event = new ShowToastEvent({
      title: "Error!",
      message: "Please enter amount in numbers",
      variant: "error",
      mode: "dismissable"
    });
    this.dispatchEvent(event);
  }
}