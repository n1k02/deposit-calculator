import { useState } from "react";
import "./App.css";

interface Income {
  daily: number;
  income30: number;
  income31: number;
}

function calcIncome(amount: number, ratePercent: number, taxPercent: number = 0): Income {
  const annual = amount * (ratePercent / 100);
  const daily = annual / 365;
  const taxMultiplier = 1 - (taxPercent / 100);
  
  return {
    daily: daily * taxMultiplier,
    income30: daily * 30 * taxMultiplier,
    income31: daily * 31 * taxMultiplier,
  };
}

const moneyFormatter = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function App() {
  const [total, setTotal] = useState<number>(1000000);

  const [fixed, setFixed] = useState<number>(0);

  const [fixedRate, setFixedRate] = useState<number>(16.5);
  const [savingsRate, setSavingsRate] = useState<number>(10.0);
  const [incomeTax, setIncomeTax] = useState<number>(12.0);

  // Dynamic step calculation for better slider control
  const getSliderStep = (total: number) => {
    if (total <= 1000) return 1;
    if (total <= 10000) return 10;
    if (total <= 100000) return 100;
    if (total <= 1000000) return 500;
    return 1000;
  };

  const sliderStep = getSliderStep(total);

  const savings = total - fixed;

  const fixedIncome = calcIncome(fixed, fixedRate, incomeTax);
  const savingsIncome = calcIncome(savings, savingsRate, incomeTax);

  const totalDaily = fixedIncome.daily + savingsIncome.daily;
  const total30 = fixedIncome.income30 + savingsIncome.income30;
  const total31 = fixedIncome.income31 + savingsIncome.income31;

  return (
    <div className="page">
      <h1>Bank accounts</h1>

      {/* Controls */}
      <div className="controls">
        <label>
          Total amount:
          <input
            type="text"
            value={total.toLocaleString('en-US')}
            onChange={(e) => {
              const cleanValue = e.target.value.replace(/[^0-9]/g, '');
              const v = Number(cleanValue) || 0;
              setTotal(v);
              if (fixed > v) setFixed(v);
            }}
            placeholder="Enter total amount"
          />
        </label>

        <label>
          Income Tax Rate (%):
          <input
            type="number"
            step={0.1}
            value={incomeTax}
            onChange={(e) => setIncomeTax(Number(e.target.value))}
            className="tax-input"
          />
        </label>

        <div className="slider-block">
          <div className="slider-labels">
            <span>Fixed: {moneyFormatter.format(fixed)} ({total > 0 ? ((fixed / total) * 100 >= 0.1 ? ((fixed / total) * 100).toFixed(1) : ((fixed / total) * 100).toFixed(3)) : '0'}%)</span>
            <span>Savings: {moneyFormatter.format(savings)} ({total > 0 ? ((savings / total) * 100 >= 0.1 ? ((savings / total) * 100).toFixed(1) : ((savings / total) * 100).toFixed(3)) : '0'}%)</span>
          </div>

          <input
            type="range"
            min={0}
            max={total}
            step={sliderStep}
            value={fixed}
            onChange={(e) => {
              const value = Number(e.target.value);
              const halfTotal = Math.round(total / 2);
              
              // Snap to exact 50% if close
              if (Math.abs(value - halfTotal) <= sliderStep / 2) {
                setFixed(halfTotal);
              }
              // Snap to 100% if close to maximum
              else if (Math.abs(value - total) <= sliderStep) {
                setFixed(total);
              }
              // Snap to 0% if close to minimum
              else if (value <= sliderStep / 2) {
                setFixed(0);
              }
              else {
                setFixed(value);
              }
            }}
            className="amount-slider"
          />
          
          <div className="slider-info">
            <small>Step: {moneyFormatter.format(sliderStep)}</small>
          </div>
        </div>
      </div>

      {/* Table */}
      <table className="accounts-table">
        <thead>
          <tr>
            <th>Who</th>
            <th>Amount</th>
            <th>Rate</th>
            <th>Net daily profit (after tax)</th>
            <th>30d (after tax)</th>
            <th>31d (after tax)</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>fixed</td>
            <td>
              <input
                type="text"
                value={fixed.toLocaleString('en-US')}
                onChange={(e) => {
                  const cleanValue = e.target.value.replace(/[^0-9]/g, '');
                  const v = Number(cleanValue) || 0;
                  if (v <= total && v >= 0) {
                    setFixed(v);
                  }
                }}
                className="amount-input"
                placeholder="0"
              />
            </td>
            <td>
              <input
                type="number"
                step={0.1}
                value={fixedRate}
                onChange={(e) => setFixedRate(Number(e.target.value))}
                className="rate-input"
              />{" "}
              %
            </td>
            <td>{moneyFormatter.format(fixedIncome.daily)}</td>
            <td>{moneyFormatter.format(fixedIncome.income30)}</td>
            <td>{moneyFormatter.format(fixedIncome.income31)}</td>
          </tr>

          <tr>
            <td>savings</td>
            <td>
              <input
                type="text"
                value={savings.toLocaleString('en-US')}
                onChange={(e) => {
                  const cleanValue = e.target.value.replace(/[^0-9]/g, '');
                  const v = Number(cleanValue) || 0;
                  const newFixed = total - v;
                  if (newFixed >= 0 && newFixed <= total) {
                    setFixed(newFixed);
                  }
                }}
                className="amount-input"
                placeholder="0"
              />
            </td>
            <td>
              <input
                type="number"
                step={0.1}
                value={savingsRate}
                onChange={(e) => setSavingsRate(Number(e.target.value))}
                className="rate-input"
              />{" "}
              %
            </td>
            <td>{moneyFormatter.format(savingsIncome.daily)}</td>
            <td>{moneyFormatter.format(savingsIncome.income30)}</td>
            <td>{moneyFormatter.format(savingsIncome.income31)}</td>
          </tr>
        </tbody>

        <tfoot>
          <tr>
            <th>Total</th>
            <th>{moneyFormatter.format(total)}</th>
            <th></th>
            <th>{moneyFormatter.format(totalDaily)}</th>
            <th>{moneyFormatter.format(total30)}</th>
            <th>{moneyFormatter.format(total31)}</th>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
