import React, { useState } from 'react';

interface MortgageCalculatorProps {
  propertyPrice: number;
  currencySymbol: string;
}

const MortgageCalculator: React.FC<MortgageCalculatorProps> = ({ propertyPrice, currencySymbol }) => {
  const [downPaymentPercent, setDownPaymentPercent] = useState(25);
  const [interestRate, setInterestRate] = useState(8.2);
  const [tenureYears, setTenureYears] = useState(20);

  const downPaymentAmount = (propertyPrice * downPaymentPercent) / 100;
  const loanAmount = propertyPrice - downPaymentAmount;

  const calculateEMI = () => {
    const monthlyRate = interestRate / 12 / 100;
    const numberOfMonths = tenureYears * 12;
    if (monthlyRate === 0) return loanAmount / numberOfMonths;
    const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths)) / (Math.pow(1 + monthlyRate, numberOfMonths) - 1);
    return emi;
  };

  const emi = calculateEMI();
  const totalRepayment = emi * (tenureYears * 12);
  const totalInterest = totalRepayment - loanAmount;

  // Utility to calculate percentage for dynamic dark track fill
  const getPercentage = (value: number, min: number, max: number) => {
    return ((value - min) / (max - min)) * 100;
  };

  const navyColor = '#0f172a';
  const beigeColor = '#e9e6df';

  const rangeStyle = (percentage: number) => ({
    background: `linear-gradient(to right, ${navyColor} 0%, ${navyColor} ${percentage}%, ${beigeColor} ${percentage}%, ${beigeColor} 100%)`
  });

  return (
    <div className="bg-beige-50 rounded-2xl border-2 border-beige-200 p-6 md:p-8 space-y-6 md:space-y-8 shadow-inner">
      <div className="flex items-center gap-4 border-b border-beige-200 pb-4 md:pb-5">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-navy shadow-soft border border-beige-100">
          <i className="fa-solid fa-landmark-dome text-gold text-sm"></i>
        </div>
        <div>
          <h3 className="text-[10px] md:text-[11px] font-black text-navy uppercase tracking-[0.15em]">Institutional Finance</h3>
          <p className="text-[7px] md:text-[8px] font-bold text-navy-muted uppercase tracking-[0.3em] mt-0.5">Investment Schema</p>
        </div>
      </div>

      <div className="space-y-6 md:space-y-8">
        {/* Capital Equity Slider */}
        <div className="space-y-4">
          <div className="flex justify-between items-end text-[9px] md:text-[10px] font-black uppercase tracking-widest">
            <span className="text-navy-muted opacity-60 lowercase">Capital Equity (Down)</span>
            <span className="text-navy bg-white px-2 py-0.5 rounded border border-beige-200 shadow-soft">{downPaymentPercent}%</span>
          </div>
          <div className="space-y-2.5">
             <input 
               type="range" min="10" max="90" step="1" 
               className="w-full h-1.5 appearance-none cursor-pointer rounded-full transition-all"
               style={rangeStyle(getPercentage(downPaymentPercent, 10, 90))}
               value={downPaymentPercent} onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
             />
             <div className="flex justify-between text-[8px] md:text-[9px] font-black text-gold tracking-tight">
                <span>{currencySymbol}{Math.round(downPaymentAmount || 0).toLocaleString('en-IN')}</span>
                <span className="opacity-40 uppercase tracking-widest text-[7px]">Bal: {currencySymbol}{Math.round(loanAmount || 0).toLocaleString('en-IN')}</span>
             </div>
          </div>
        </div>

        {/* Interest Protocol Slider */}
        <div className="space-y-4">
          <div className="flex justify-between items-end text-[9px] md:text-[10px] font-black uppercase tracking-widest">
            <span className="text-navy-muted opacity-60 lowercase">Interest Protocol</span>
            <span className="text-navy bg-white px-2 py-0.5 rounded border border-beige-200 shadow-soft">{interestRate}% p.a.</span>
          </div>
          <input 
            type="range" min="1" max="18" step="0.1" 
            className="w-full h-1.5 appearance-none cursor-pointer rounded-full transition-all"
            style={rangeStyle(getPercentage(interestRate, 1, 18))}
            value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))}
          />
        </div>

        {/* Amortization Period Slider */}
        <div className="space-y-4">
          <div className="flex justify-between items-end text-[9px] md:text-[10px] font-black uppercase tracking-widest">
            <span className="text-navy-muted opacity-60 lowercase">Amortization Period</span>
            <span className="text-navy bg-white px-2 py-0.5 rounded border border-beige-200 shadow-soft">{tenureYears} Yrs</span>
          </div>
          <input 
            type="range" min="5" max="35" step="1" 
            className="w-full h-1.5 appearance-none cursor-pointer rounded-full transition-all"
            style={rangeStyle(getPercentage(tenureYears, 5, 35))}
            value={tenureYears} onChange={(e) => setTenureYears(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <div className="bg-white p-6 md:p-8 rounded-xl border border-gold/20 space-y-2 shadow-elevated text-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-navy/5"></div>
          <span className="text-[9px] md:text-[10px] font-black text-navy-muted uppercase tracking-[0.4em] block opacity-60">Monthly Outlay</span>
          <div className="text-2xl md:text-3xl font-[950] text-navy tracking-tighter group-hover:scale-105 transition-transform duration-500">{currencySymbol}{Math.round(emi || 0).toLocaleString('en-IN')}</div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/80 p-4 rounded-lg border border-beige-200 text-center shadow-soft">
            <span className="text-[7px] md:text-[8px] font-black text-navy-muted uppercase tracking-[0.15em] block mb-1 opacity-50">Total Interest</span>
            <div className="text-[10px] md:text-[12px] font-[900] text-navy tracking-tight">{currencySymbol}{Math.round(totalInterest || 0).toLocaleString('en-IN')}</div>
          </div>
          <div className="bg-white/80 p-4 rounded-lg border border-beige-200 text-center shadow-soft">
            <span className="text-[7px] md:text-[8px] font-black text-navy-muted uppercase tracking-[0.15em] block mb-1 opacity-50">Protocol Total</span>
            <div className="text-[10px] md:text-[12px] font-[900] text-navy tracking-tight">{currencySymbol}{Math.round(totalRepayment || 0).toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      <p className="text-[7px] md:text-[8px] text-navy-muted font-bold tracking-[0.05em] text-center opacity-40 uppercase leading-relaxed px-4">
        Indicative estimates subject to final credit audit.
      </p>
    </div>
  );
};

export default MortgageCalculator;