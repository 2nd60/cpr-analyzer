export const COACHING_TIPS = {
  gross_profit_margin: {
    why: "Gross profit margin is the engine of your shop's financial health — it's what's left after paying your technicians and parts costs, and it's what covers all your overhead and produces net profit. Low GP% is the #1 reason shops struggle despite high revenue.",
    causes: [
      "Parts matrix is missing, wrong, or being overridden manually by service advisors on high-cost items",
      "Technicians are underbilling hours — one lost hour per day per tech costs $234,000+ in annual revenue at a $150 labor rate",
      "Diagnostic work billed at standard door rate instead of a premium rate (1.5x), destroying margin on the highest-skill work",
      "Labor guide times applied as-is without a matrix bump, ignoring that the average vehicle on the road is 12+ years old",
    ],
    tips: [
      "Pull your management software's end-of-day report weekly and target 55–65% overall GP, with parts at 50–55% and labor at 65%+ as separate line items.",
      "Set a diagnostic labor rate at 1.5x your standard rate — diagnostic work has zero parts revenue and higher technician cost, so billing it at door rate guarantees a money-losing bay.",
      "Apply a 20% labor matrix bump to all labor guide times in your shop management software — a 3-hour job becomes 3.6 hours, accounting for aged vehicles, rust, and missing specialty tools.",
      "If GP% is consistently below 50%, audit your parts matrix first — it's the fastest fix with the biggest payoff and requires no customer-facing change.",
    ],
    quickWin: "Log into your shop management software today and pull your parts GP% and labor GP% separately. If either is below 50%, you've just identified exactly where the leak is.",
  },

  hours_per_ro: {
    why: "Hours presented per vehicle measures how thoroughly your technicians are inspecting each car — a shop that finds and presents 8+ hours per vehicle has a full pipeline of recommended work, giving service advisors something to sell beyond the original complaint.",
    causes: [
      "Technicians are doing incomplete DVIs — checking only what's easy to see rather than a full multi-point inspection",
      "DVIs are being completed but findings are being filtered before reaching the service advisor — techs self-editing what they think will sell",
      "No inspection process enforced — advisors writing up vehicles without requiring a completed DVI from the technician",
      "Technicians are paid flat rate with no incentive tied to inspection thoroughness",
    ],
    tips: [
      "Require a completed DVI on every vehicle before the service advisor can close the repair order — no exceptions.",
      "Track hours presented per RO by technician weekly — a tech presenting less than 5 hours per vehicle is under-inspecting, not under-closing.",
      "Tie a portion of technician compensation or bonuses to DVI completion rate and hours found per vehicle.",
      "Review declined repairs as a team monthly — if hours presented is high but close ratio is low, the issue is presentation, not inspection.",
    ],
    quickWin: "Pull this week's repair orders and calculate total hours presented divided by total ROs. If below 6 hours per vehicle, your technicians are leaving findings on the table before the advisor ever sees them.",
  },

  effective_labor_rate: {
    why: "Effective labor rate (ELR) is the actual revenue collected per billed labor hour across your entire shop — it reveals whether your posted rate is real or just theoretical, and exposes discounting, free labor, and unbilled time hiding in your numbers.",
    causes: [
      "Labor rate was set by calling competitors and pricing in the middle rather than calculating backwards from your desired gross profit margin",
      "Diagnostic and testing work billed at the same rate as basic mechanical work, diluting ELR on your highest-cost jobs",
      "Service advisors discounting labor on the fly or giving away diagnostic time to close a job",
      "No labor matrix applied — book time used as-is for vehicles that are 12+ years old and corroded",
    ],
    tips: [
      "Calculate your minimum labor rate correctly: divide your actual labor cost per hour by (1 minus your target GP%). If you want 65% labor GP and your tech costs $42/hour, your minimum rate is $120.",
      "Implement three labor rates — basic maintenance, standard repair, and diagnostic/testing — and set the testing rate at 1.5x your standard rate.",
      "Raise your rate gradually if significantly below target: $10/month is far easier for customers to absorb than a single large jump.",
      "Require technicians to clock in and out on every job — one missing hour per tech per day costs roughly $4,500/week in lost revenue across a 3-tech shop.",
    ],
    quickWin: "Run this formula now: take your actual labor cost per hour (loaded), divide by 0.35 (targeting 65% GP). That's your minimum door rate. Compare it to what you're actually charging.",
  },

  labor_profit_pct: {
    why: "Labor profit percentage is the gross margin your shop captures on every hour of work sold — top-performing shops hit 65.9% while the bottom tier averages 55.6%, a gap that translates directly to tens of thousands in lost annual profit on the same volume of work.",
    causes: [
      "Technician efficiency is low — if techs are billing 30 out of 40 available hours, you're paying for 40 and selling 30",
      "No labor matrix in use — booking guide times on aged vehicles without a 20% bump means you're absorbing all complexity at no charge",
      "High-cost technicians assigned to low-margin jobs — pairing your highest-paid tech with basic oil changes destroys labor GP",
      "Technician compensation structure misaligned — flat salary with no performance tie means efficiency has no incentive",
    ],
    tips: [
      "Implement a 20% labor matrix bump in your shop software for all standard repairs — this single change recovers margin lost to vehicle age and complexity without raising your posted rate.",
      "Track technician productivity (hours billed vs. hours available) weekly, not monthly — one hour lost per day per tech is over $200K in annual revenue at a $150 rate.",
      "Assign jobs strategically — your highest-efficiency tech on your highest-margin jobs; entry-level techs on basic maintenance.",
      "Tie a portion of technician compensation to efficiency scores to create alignment between what the tech bills and what the shop collects.",
    ],
    quickWin: "Check last week's timesheet: how many hours were each of your techs on the clock vs. how many hours did they bill? That productivity percentage is your fastest labor margin lever.",
  },

  parts_profit_pct: {
    why: "Parts gross profit percentage is the single most common place shops leak money — 67% of shops achieve only 30–49% GP on parts against a benchmark of 50–55%, and it's the easiest problem to fix because the solution lives entirely inside your shop management software.",
    causes: [
      "Parts matrix is missing or set incorrectly — most shops say they 'double parts' but then manually discount high-cost items like catalytic converters and engines",
      "Charging actual part numbers instead of menu pricing — when customers can look up your exact part number, price transparency destroys your margin",
      "No tiered matrix — marking up every part the same way means leaving money on cheap parts and giving it away on expensive ones",
      "Tires, batteries, and dealer parts excluded from margin targets without a clear pricing strategy",
    ],
    tips: [
      "Set up a tiered parts matrix in your shop management software — parts under $10 can carry a 3x multiplier; a $1,500 catalytic converter might be 1.3x.",
      "Switch to menu pricing for common services using internal part numbers — this removes the customer's ability to price-shop your exact part number online.",
      "Run your end-of-day parts GP% report every day for two weeks — the act of measuring it alone will change behavior at the service desk.",
      "Don't exclude dealer or high-cost parts from your matrix targets — apply the appropriate tier rather than abandoning margin entirely.",
    ],
    quickWin: "Log into your shop management software and verify your parts matrix is actually turned on and applied. Pull one week of parts GP%. If it's below 45%, your matrix is either off or being overridden.",
  },

  avg_ticket: {
    why: "Average repair order (ARO) is the fastest lever to grow revenue without adding a single new customer — a 10% ARO improvement on 1,100 cars per year generates over $70,000 in added gross sales.",
    causes: [
      "Technicians doing incomplete DVIs — presenting 1.5 hours of findings instead of 5–7 means the service advisor has nothing to sell beyond the original complaint",
      "Service advisors not presenting everything estimated — pre-qualifying what they think the customer will approve instead of letting the customer decide",
      "No follow-up system for declined repairs — 52% of customers will return for declined work if contacted before leaving",
      "No maintenance trigger at write-up — service advisors aren't checking mileage-based maintenance schedules at check-in",
    ],
    tips: [
      "At check-in, photograph the odometer and use the mileage to pull the vehicle's maintenance history — catch deferred maintenance before the car ever goes in the bay.",
      "Require 100% DVI completion on every vehicle and 100% presentation of every finding — the technician finds it, the advisor presents it, the customer decides.",
      "When a customer declines a repair at pickup, ask them to book the follow-up appointment before they leave — your closing rate is 52% if they commit in the moment.",
      "Track ARO weekly by service advisor, not just shop-wide — advisor-level data reveals who's pre-filtering, and you can coach to the gap.",
    ],
    quickWin: "Pull the last 30 repair orders and compare average hours found vs. average hours sold. If close ratio is above 80%, your techs aren't finding enough. If below 40%, your advisors aren't presenting enough.",
  },
}
