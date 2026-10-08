/* MC Growth Consultancy: settings and listings for the jobs board and businesses for sale pages
   Author: Martyn Cohen

   This is the only file to edit when a listing changes. After editing, run build.py.
   - Add a job: copy one of the entries under "jobs", change the details and give it a new id. Add "real": true.
   - Close a job: add "filled": "YYYY-MM-DD" to it. It shows as filled, then delete the entry a fortnight later.
   - Feature a job: add "featured": true.
   - Listings without "real": true are placeholders and carry a Sample tag.
     Set showSamples to false to hide every placeholder in one go before the pages go live.
   - Business statuses: "Available", "Under offer", "Coming soon", "Sold".
   Keep business listings anonymous: region not town, turnover band not figure. */
window.PAGE_CFG = {
  mode: "live",
  brand: "MC Growth Consultancy",
  email: "Martyn@MCGrowthConsultancy.co.uk",
  privacy: "privacy.html",
  formAttrs: ' data-netlify="true" netlify-honeypot="bot-field"',
  showSamples: true,
  jobs: [
    {
      "id": "j1",
      "title": "Contracts Manager",
      "who": "Commercial flooring contractor",
      "town": "Manchester",
      "region": "North West",
      "cat": "Contracts and management",
      "type": "Permanent",
      "pay": "£45,000 to £55,000 + vehicle",
      "hours": "Monday to Friday",
      "posted": "2026-10-06",
      "closes": "2026-11-05",
      "featured": true,
      "summary": "Run a portfolio of education and healthcare flooring projects from order through to handover, with a settled team of fitters and a full order book behind you.",
      "duties": [
        "Plan and programme up to a dozen live projects",
        "Manage subcontract fitting teams and site quality",
        "Own client relationships with main contractors",
        "Control variations, valuations and final accounts"
      ],
      "needs": [
        "Three years or more running commercial flooring contracts",
        "Confident with programmes, RAMS and site meetings",
        "SMSTS and a full driving licence"
      ]
    },
    {
      "id": "j2",
      "title": "Carpet and Vinyl Fitter",
      "who": "Independent flooring retailer",
      "town": "Leicester",
      "region": "East Midlands",
      "cat": "Fitting and installation",
      "type": "Permanent",
      "pay": "£32,000 to £38,000 + van",
      "hours": "Monday to Friday, some Saturdays",
      "posted": "2026-10-05",
      "closes": "2026-11-04",
      "summary": "Employed fitting role with a family retailer. Domestic work, a steady diary and a van and fuel card provided.",
      "duties": [
        "Fit carpet, vinyl and LVT in customers' homes",
        "Prepare subfloors properly before fitting",
        "Look after the van, tools and stock",
        "Leave every job tidy and every customer happy"
      ],
      "needs": [
        "Time served or NVQ Level 2 in floorcovering",
        "Tidy work and good manners in people's homes",
        "Full driving licence"
      ]
    },
    {
      "id": "j3",
      "title": "Estimator and Surveyor",
      "who": "Contract flooring business",
      "town": "Leeds",
      "region": "Yorkshire",
      "cat": "Estimating and surveying",
      "type": "Permanent",
      "pay": "£34,000 to £40,000",
      "hours": "Monday to Friday",
      "posted": "2026-10-02",
      "closes": "2026-11-01",
      "summary": "Measure from drawings and on site, price accurately and get quotes out quickly for a busy contracts team.",
      "duties": [
        "Take off quantities from drawings and site surveys",
        "Build priced quotations and tender returns",
        "Check moisture and subfloor conditions on site",
        "Hand over clear job packs to the contracts team"
      ],
      "needs": [
        "Experience estimating in flooring or a related trade",
        "Comfortable with take-off software and spreadsheets",
        "An eye for the detail that protects margin"
      ]
    },
    {
      "id": "j4",
      "title": "Showroom Sales Consultant",
      "who": "Carpet and flooring showroom",
      "town": "Norwich",
      "region": "East of England",
      "cat": "Showroom and retail sales",
      "type": "Permanent",
      "pay": "£26,000 basic, £38,000 on target",
      "hours": "Five days including Saturdays",
      "posted": "2026-10-01",
      "closes": "2026-10-31",
      "summary": "Help customers choose the right floor, book the measure and follow every quote through to an order.",
      "duties": [
        "Welcome and advise customers in the showroom",
        "Prepare quotes and follow them up",
        "Book surveys and fitting dates",
        "Keep displays and samples looking sharp"
      ],
      "needs": [
        "Retail sales experience, ideally in flooring or home interiors",
        "Comfortable asking for the order",
        "Organised with paperwork and follow-up calls"
      ]
    },
    {
      "id": "j5",
      "title": "Subcontract LVT Fitters",
      "who": "Flooring contractor",
      "town": "Birmingham",
      "region": "West Midlands",
      "cat": "Fitting and installation",
      "type": "Self-employed or subcontract",
      "pay": "£220 to £260 a day",
      "hours": "Ongoing work, weekly payment",
      "posted": "2026-09-29",
      "closes": "2026-10-29",
      "summary": "Regular new build and refurbishment work for experienced LVT fitters. Materials supplied, payment weekly.",
      "duties": [
        "Fit click and glue-down LVT to a high standard",
        "Apply screeds and smoothing compounds",
        "Work to programme on occupied and new build sites"
      ],
      "needs": [
        "Own tools, transport and public liability insurance",
        "CSCS card",
        "Proven LVT and subfloor preparation experience"
      ]
    },
    {
      "id": "j6",
      "title": "Area Sales Manager",
      "who": "Flooring manufacturer",
      "town": "Home based, Midlands territory",
      "region": "East Midlands",
      "cat": "Trade and field sales",
      "type": "Permanent",
      "pay": "£42,000 to £50,000 + car + bonus",
      "hours": "Monday to Friday, field based",
      "posted": "2026-09-28",
      "closes": "2026-10-28",
      "summary": "Grow an established territory of independent retailers and contractors for a well known flooring brand.",
      "duties": [
        "Manage and grow around 120 existing accounts",
        "Open new retail and contract accounts",
        "Place displays and train showroom staff",
        "Report on pipeline and territory performance"
      ],
      "needs": [
        "Field sales experience in flooring or interiors",
        "A track record of account growth",
        "Full driving licence"
      ]
    },
    {
      "id": "j7",
      "title": "Apprentice Floor Layer",
      "who": "Flooring contractor",
      "town": "Cardiff",
      "region": "Wales",
      "cat": "Apprenticeships",
      "type": "Apprenticeship",
      "pay": "Apprenticeship rate, rising on qualification",
      "hours": "Monday to Friday plus block release",
      "posted": "2026-09-24",
      "closes": "2026-10-24",
      "summary": "Learn the trade properly alongside experienced fitters, working towards an NVQ Level 2 in floorcovering.",
      "duties": [
        "Assist fitters on domestic and commercial jobs",
        "Learn subfloor preparation and fitting methods",
        "Attend college on block release"
      ],
      "needs": [
        "Reliable, on time and keen to learn a trade",
        "Happy with physical work",
        "Able to get to the depot for 7.30am"
      ]
    },
    {
      "id": "j8",
      "title": "Warehouse Operative and Delivery Driver",
      "who": "Flooring distributor",
      "town": "Newcastle upon Tyne",
      "region": "North East",
      "cat": "Warehouse and logistics",
      "type": "Permanent",
      "pay": "£25,500 to £27,500",
      "hours": "Monday to Friday, 7am start",
      "posted": "2026-09-22",
      "closes": "2026-10-22",
      "summary": "Pick, cut and load carpet and vinyl orders, then deliver to trade customers across the region.",
      "duties": [
        "Pick and cut orders accurately",
        "Load vehicles and deliver to trade customers",
        "Keep the warehouse safe and tidy"
      ],
      "needs": [
        "Full driving licence, 3.5 tonne experience helpful",
        "Counterbalance or side loader licence an advantage",
        "Fit enough for a physical job"
      ]
    },
    {
      "id": "j9",
      "title": "Branch Manager",
      "who": "Flooring trade counter",
      "town": "Sheffield",
      "region": "Yorkshire",
      "cat": "Contracts and management",
      "type": "Permanent",
      "pay": "£38,000 to £44,000 + bonus",
      "hours": "Monday to Friday, alternate Saturdays",
      "posted": "2026-09-08",
      "closes": "2026-10-08",
      "filled": "2026-10-02",
      "summary": "Lead a team of six at a busy trade counter serving fitters and contractors.",
      "duties": [
        "Run the branch day to day",
        "Grow trade accounts",
        "Manage stock and margin"
      ],
      "needs": [
        "Trade counter or branch management experience"
      ]
    },
    {
      "id": "j10",
      "title": "Fitter's Mate",
      "who": "Independent flooring retailer",
      "town": "Reading",
      "region": "South East",
      "cat": "Fitting and installation",
      "type": "Permanent",
      "pay": "£24,500 to £26,000",
      "hours": "Monday to Friday",
      "posted": "2026-09-10",
      "closes": "2026-10-10",
      "filled": "2026-09-29",
      "summary": "Support a senior fitter on domestic carpet and vinyl jobs, with training towards fitting on your own.",
      "duties": [
        "Help with uplift, prep and fitting",
        "Load and unload the van"
      ],
      "needs": [
        "Willing to learn",
        "Reliable timekeeping"
      ]
    }
  ],
  sales: [
    {
      "ref": "MCGC-0726-01",
      "real": true,
      "title": "Specialist commercial flooring contractor",
      "region": "South East",
      "biz": "Contract",
      "band": "£1m to £3m",
      "status": "Available",
      "tenure": "Leasehold",
      "team": "Small employed core plus subcontract fitters",
      "est": "5 years or more",
      "reason": "Shareholders' personal plans",
      "suits": "A bolt-on for a regional or national flooring, interiors or facilities group, or a platform for buy and build."
    },
    {
      "ref": "MCGC-SMPL-01",
      "title": "Contract flooring business, education and healthcare",
      "region": "West Midlands",
      "biz": "Contract",
      "band": "£1m to £3m",
      "status": "Available",
      "tenure": "Leasehold",
      "team": "9 employed plus subcontract fitters",
      "est": "15 to 20 years",
      "reason": "Owners stepping back",
      "suits": "A regional contractor or interiors group adding a new territory."
    },
    {
      "ref": "MCGC-SMPL-02",
      "title": "Carpet and flooring retailer with in-home service",
      "region": "East of England",
      "biz": "Retail",
      "band": "Up to £500k",
      "status": "Under offer",
      "tenure": "Leasehold",
      "team": "3 employed",
      "est": "10 to 15 years",
      "reason": "Relocation",
      "suits": "An owner operator who wants an established name and diary."
    },
    {
      "ref": "MCGC-SMPL-03",
      "title": "Flooring trade counter and distributor",
      "region": "Yorkshire",
      "biz": "Distribution and trade counter",
      "band": "£1m to £3m",
      "status": "Available",
      "tenure": "Freehold, available separately",
      "team": "11 employed",
      "est": "30 years or more",
      "reason": "Retirement",
      "suits": "A distributor wanting local stockholding and an account base."
    },
    {
      "ref": "MCGC-SMPL-04",
      "title": "Design-led flooring showroom",
      "region": "London",
      "biz": "Retail",
      "band": "£1m to £3m",
      "status": "Available",
      "tenure": "Leasehold",
      "team": "8 employed",
      "est": "10 to 15 years",
      "reason": "Owner pursuing other interests",
      "suits": "A retailer or interiors business adding a premium brand."
    },
    {
      "ref": "MCGC-SMPL-05",
      "title": "Domestic and light commercial flooring contractor",
      "region": "Wales",
      "biz": "Contract",
      "band": "Up to £500k",
      "status": "Sold",
      "tenure": "Leasehold",
      "team": "4 employed",
      "est": "20 years or more",
      "reason": "Retirement",
      "suits": ""
    }
  ]
};
