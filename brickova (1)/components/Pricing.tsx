
import React from 'react';
import { motion } from 'framer-motion';

const Pricing: React.FC = () => {
  const plans = [
    {
      name: 'Basic Agent',
      price: '₹499',
      period: '/ month',
      description: 'Best for new agents getting started.',
      features: [
        'List up to 5 properties',
        'Manage leads',
        'Full CRM access',
        'Property dashboard',
      ],
      recommended: false,
      buttonText: 'Choose Plan',
    },
    {
      name: 'Pro Agent',
      price: '₹999',
      period: '/ month',
      description: 'Most popular plan for active real estate agents.',
      features: [
        'List up to 20 properties',
        'Full CRM access',
        'Track leads easily',
        'Performance insights',
        'Featured listings',
      ],
      recommended: true,
      buttonText: 'Choose Plan',
    },
    {
      name: 'Agency Plan',
      price: '₹2999',
      period: '/ month',
      description: 'Built for agencies managing multiple agents.',
      features: [
        'Unlimited property listings',
        'Team management',
        'Shared agency dashboard',
        'Performance insights',
        'Priority support',
      ],
      recommended: false,
      buttonText: 'Choose Plan',
    },
  ];

  return (
    <div className="py-20 px-6 max-w-7xl mx-auto space-y-16">
      <div className="text-center space-y-4">
        <h2 className="text-4xl md:text-6xl font-[900] text-navy uppercase tracking-tighter">
          Strategic <span className="text-gold">Growth</span> Plans
        </h2>
        <p className="text-navy-muted font-black uppercase tracking-[0.4em] text-[10px] md:text-[12px] max-w-2xl mx-auto">
          Choose the professional tier that aligns with your asset management goals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative flex flex-col p-10 rounded-[3rem] border-2 transition-all duration-500 group ${
              plan.recommended
                ? 'bg-navy border-navy text-white shadow-premium scale-105 z-10'
                : 'bg-white border-beige-200 text-navy hover:border-gold/30 shadow-soft'
            }`}
          >
            {plan.recommended && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gold text-navy text-[9px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-full shadow-soft">
                Recommended
              </div>
            )}

            <div className="space-y-6 flex-1">
              <div className="space-y-2">
                <h3 className={`text-xl font-black uppercase tracking-tight ${plan.recommended ? 'text-gold' : 'text-navy'}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-[900] tracking-tighter">{plan.price}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest opacity-60`}>
                    {plan.period}
                  </span>
                </div>
                <p className={`text-[11px] font-medium leading-relaxed ${plan.recommended ? 'text-white/60' : 'text-navy-muted'}`}>
                  {plan.description}
                </p>
              </div>

              <div className={`h-px w-full ${plan.recommended ? 'bg-white/10' : 'bg-beige-100'}`}></div>

              <ul className="space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.recommended ? 'bg-gold/20 text-gold' : 'bg-navy/5 text-navy'}`}>
                      <i className="fa-solid fa-check text-[10px]"></i>
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              className={`mt-10 w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 ${
                plan.recommended
                  ? 'bg-gold text-navy hover:bg-white shadow-soft'
                  : 'bg-navy text-white hover:bg-navy-ultra shadow-navy'
              }`}
            >
              {plan.buttonText}
            </button>
          </motion.div>
        ))}
      </div>

      <div className="text-center pt-10">
        <p className="text-[10px] font-black text-navy-muted uppercase tracking-[0.2em]">
          All plans include access to our verified property network and standard support.
        </p>
      </div>
    </div>
  );
};

export default Pricing;
