/* MC Growth Consultancy: jobs board and businesses for sale behaviour. Author: Martyn Cohen
   Listings and settings are in listings-data.js. Forms post to Netlify Forms when the site is hosted on Netlify. */
(function(){
"use strict";
var $=function(id){return document.getElementById(id)};
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function fmt(iso){return new Date(iso+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short"})}
function fill(sel,items){items.forEach(function(v){var o=document.createElement("option");o.textContent=v;sel.appendChild(o)})}

var CFG=window.PAGE_CFG||{}, LIVE=CFG.mode==="live";
var BRAND=esc(CFG.brand||"us"), PRIVACY=CFG.privacy||"#";
var REGIONS=["North East","North West","Yorkshire","East Midlands","West Midlands","East of England","London","South East","South West","Wales","Scotland","Northern Ireland"];
var CATS=["Fitting and installation","Estimating and surveying","Showroom and retail sales","Trade and field sales","Contracts and management","Warehouse and logistics","Apprenticeships","Office and support"];
var TYPES=["Permanent","Self-employed or subcontract","Apprenticeship","Temporary or contract","Part time"];
var BIZ=["Retail","Contract","Distribution and trade counter","Specialist services"];
var BANDS=["Up to £500k","£500k to £1m","£1m to £3m","£3m and above"];

var JOBS=[],SALES=[];   /* listings live in listings-data.js */
if(CFG.jobs)JOBS=CFG.jobs;
if(CFG.sales)SALES=CFG.sales;
if(CFG.showSamples===false){JOBS=JOBS.filter(function(x){return x.real});SALES=SALES.filter(function(x){return x.real})}
var hasJobs=!!$("page-jobs"), hasSale=!!$("page-sale");

/* ---------- prototype only: both pages in one file, switched by the address hash ---------- */
if(hasJobs&&hasSale){
  var route=function(){
    var sale=location.hash.replace("#","")==="businesses-for-sale";
    $("page-jobs").hidden=sale; $("page-sale").hidden=!sale;
    [["tab-jobs",!sale],["nav-jobs",!sale],["tab-sale",sale],["nav-sale",sale]].forEach(function(r){
      var el=$(r[0]); if(!el)return;
      r[1]?el.setAttribute("aria-current","page"):el.removeAttribute("aria-current");
    });
  };
  window.addEventListener("hashchange",function(){route();window.scrollTo(0,0)});
  document.addEventListener("click",function(e){
    var g=e.target.closest("[data-go]"); if(!g)return;
    var name=g.getAttribute("data-go");
    if(location.hash.replace("#","")!==name){location.hash=name}else{route()} window.scrollTo(0,0);
  });
  route();
}
document.addEventListener("click",function(e){
  var s=e.target.closest("[data-scroll]"); if(s){var t=$(s.getAttribute("data-scroll")); if(t)t.scrollIntoView({behavior:"smooth",block:"start"})}
});
if($("toggle-notes"))$("toggle-notes").addEventListener("click",function(){
  var on=$("app").classList.toggle("notes-on");
  this.setAttribute("aria-pressed",on?"true":"false"); this.textContent="Build notes: "+(on?"on":"off");
});

/* ---------- shared form helpers ---------- */
function check(form,errId,msg){
  var err=$(errId), bad=form.querySelector("input:invalid,select:invalid,textarea:invalid");
  if(bad){err.textContent=msg;err.hidden=false;bad.focus();return false}
  err.hidden=true;return true;
}
/* The prototype, and a page opened straight from a folder, send nothing. Live pages post each form to the site's form handler. */
var sentHow="prototype";
function send(form,name,extra){
  if(!LIVE){sentHow="prototype";return Promise.resolve()}
  if(location.protocol==="file:"){sentHow="preview";return Promise.resolve()}
  var fd=new FormData(form); fd.set("form-name",name);
  if(extra)Object.keys(extra).forEach(function(k){fd.set(k,extra[k])});
  var opts=form.querySelector("input[type=file]")?{method:"POST",body:fd}
    :{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams(fd).toString()};
  return fetch(location.pathname,opts).then(function(r){if(!r.ok)throw new Error("HTTP "+r.status);sentHow="sent"});
}
function submit(form,name,errId,extra,onOk){
  var btn=form.querySelector("button[type=submit]"), label=btn.textContent, err=$(errId);
  btn.disabled=true; btn.textContent="Sending…";
  send(form,name,extra).then(function(){btn.disabled=false;btn.textContent=label;onOk()})
    .catch(function(){btn.disabled=false;btn.textContent=label;
      err.textContent="Sorry, that didn't send. Please try again"+(CFG.email?", or email "+CFG.email:"")+".";err.hidden=false});
}
function done(form,title,text,again,extra){
  var d=document.createElement("div");d.className="done";d.setAttribute("role","status");
  var h=document.createElement("h4");h.textContent=title;d.appendChild(h);
  var p=document.createElement("p");p.textContent=text;d.appendChild(p);
  if(extra)d.appendChild(extra);
  if(sentHow!=="sent"){var s=document.createElement("p");s.className="small";
    s.textContent=sentHow==="preview"?"Preview only: nothing was sent because this page isn't online yet.":"Prototype only: nothing has been sent.";d.appendChild(s)}
  if(again!==false){var b=document.createElement("button");b.type="button";b.className="linkbtn";b.style.justifySelf="start";b.textContent="Start again";
    b.addEventListener("click",function(){d.remove();form.reset();form.hidden=false;if(hasJobs)setDefaults()});d.appendChild(b)}
  form.hidden=true;form.parentNode.insertBefore(d,form.nextSibling);
  d.scrollIntoView({block:"nearest"});
}
var HIDDEN=function(name){return '<input type="hidden" name="form-name" value="'+name+'"><p hidden><label>Leave this empty <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>'};
function sampleTag(x){return x.real?'':'<p><span class="pill sample">Sample listing</span></p>'}
function setDefaults(){
  var t=new Date(),max=new Date(t.getTime()+30*864e5),iso=function(d){return d.toISOString().slice(0,10)};
  $("p-close").min=iso(t);$("p-close").max=iso(max);$("p-close").value=iso(max);
}

/* ================= jobs board ================= */
if(hasJobs){
  fill($("f-cat"),CATS); fill($("f-region"),REGIONS); fill($("f-type"),TYPES);
  fill($("p-cat"),CATS); fill($("p-region"),REGIONS); fill($("p-type"),TYPES);
  var jobRow=function(j){
    var tags='<span class="pill">'+esc(j.type)+'</span><span class="pill">'+esc(j.cat)+'</span>';
    var state=j.filled?'<span class="pill">Filled '+fmt(j.filled)+'</span>':(j.featured?'<span class="pill gold">Featured</span>':'');
    var dates=j.filled?'Role closed':'Posted '+fmt(j.posted)+' · Closes '+fmt(j.closes);
    return '<li><button type="button" class="job'+(j.featured?' featured':'')+(j.filled?' filled':'')+'" data-job="'+esc(j.id)+'">'+
      '<span><span class="t">'+esc(j.title)+' '+state+'</span><span class="who">'+esc(j.who)+' · '+esc(j.town)+', '+esc(j.region)+'</span><span class="tags">'+tags+'</span></span>'+
      '<span><span class="pay">'+esc(j.pay)+'</span><span class="dates">'+dates+'</span></span></button></li>';
  };
  var renderJobs=function(){
    var kw=$("f-kw").value.trim().toLowerCase(),cat=$("f-cat").value,reg=$("f-region").value,typ=$("f-type").value,showFilled=$("f-filled").checked;
    var rows=JOBS.filter(function(j){
      if(j.filled&&!showFilled)return false;
      if(cat&&j.cat!==cat)return false; if(reg&&j.region!==reg)return false; if(typ&&j.type!==typ)return false;
      if(kw&&(j.title+" "+j.who+" "+j.town+" "+j.region+" "+j.summary).toLowerCase().indexOf(kw)<0)return false;
      return true;
    }).sort(function(a,b){
      var ra=a.filled?2:(a.featured?0:1), rb=b.filled?2:(b.featured?0:1);
      return ra-rb || (a.posted<b.posted?1:-1);
    });
    var live=rows.filter(function(j){return !j.filled}).length, samples=JOBS.some(function(j){return !j.real});
    $("job-count").textContent=live+(live===1?" live role":" live roles")+(samples?" (sample listings)":"");
    $("job-list").innerHTML=rows.length?rows.map(jobRow).join("")
      :'<li class="empty">'+(JOBS.length?"No roles match that search. Clear a filter, or register your CV and I'll get in touch when something comes up."
        :"No live roles right now. Post yours free below, or register your CV and I'll get in touch when something comes up.")+'</li>';
  };
  ["input","change"].forEach(function(ev){$("job-filters").addEventListener(ev,renderJobs)});
  $("f-filled").addEventListener("change",renderJobs);
  $("job-filters").addEventListener("submit",function(e){e.preventDefault()});

  /* dialog: job detail and apply */
  var dlg=$("dlg");
  var openDlg=function(title,sub,html){$("dlg-title").textContent=title;$("dlg-sub").textContent=sub;$("dlg-body").innerHTML=html;if(!dlg.open)dlg.showModal();dlg.scrollTop=0};
  $("dlg-close").addEventListener("click",function(){dlg.close()});
  dlg.addEventListener("click",function(e){if(e.target===dlg)dlg.close()});
  var li=function(a){return (a||[]).map(function(x){return "<li>"+esc(x)+"</li>"}).join("")};
  var find=function(id){return JOBS.filter(function(x){return x.id===id})[0]};
  var openJob=function(id){
    var j=find(id); if(!j)return;
    var foot=j.filled
      ? '<p class="small">This role was filled on '+fmt(j.filled)+'. Register your CV and I\'ll get in touch about similar jobs.</p><div class="dlg-foot"><button class="btn line" type="button" data-apply="">Register your CV</button></div>'
      : '<div class="dlg-foot"><button class="btn" type="button" data-apply="'+esc(j.id)+'">Apply for this job</button><span class="small">Applications come to me first and I pass them on to the employer.</span></div>';
    openDlg(j.title,j.who+" · "+j.town+", "+j.region,
      '<dl class="kv"><dt>Pay</dt><dd>'+esc(j.pay)+'</dd><dt>Contract</dt><dd>'+esc(j.type)+'</dd><dt>Hours</dt><dd>'+esc(j.hours||"")+'</dd><dt>Posted</dt><dd>'+fmt(j.posted)+'</dd><dt>Closes</dt><dd>'+(j.filled?'Filled '+fmt(j.filled):fmt(j.closes))+'</dd></dl>'+
      '<div><h4>The role</h4><p>'+esc(j.summary)+'</p></div>'+
      '<div><h4>What you\'ll do</h4><ul class="dots">'+li(j.duties)+'</ul></div>'+
      '<div><h4>What you\'ll need</h4><ul class="dots">'+li(j.needs)+'</ul></div>'+
      sampleTag(j)+foot);
  };
  var openApply=function(id){
    var j=find(id);
    openDlg(j?"Apply: "+j.title:"Register your CV", j?j.who+" · "+j.town+", "+j.region:"I'll get in touch when a flooring role fits",
     '<form id="apply-form" name="job-application" method="POST"'+(CFG.formAttrs||"")+' enctype="multipart/form-data" novalidate>'+HIDDEN("job-application")+'<div class="fgrid">'+
     '<div><label for="a-name">Full name *</label><input type="text" id="a-name" name="name" required autocomplete="name"></div>'+
     '<div><label for="a-phone">Mobile *</label><input type="tel" id="a-phone" name="phone" required autocomplete="tel"></div>'+
     '<div><label for="a-email">Email *</label><input type="email" id="a-email" name="email" required autocomplete="email"></div>'+
     '<div><label for="a-town">Town or postcode *</label><input type="text" id="a-town" name="town" required></div>'+
     '<div class="full"><label for="a-cv">Your CV<span class="hint">PDF or Word. No CV? Tell me about your experience below instead.</span></label><input type="file" id="a-cv" name="cv-file" accept=".pdf,.doc,.docx"></div>'+
     '<div class="full"><label for="a-note">'+(j?"Anything you'd like the employer to know":"What kind of role are you after?")+'</label><textarea id="a-note" name="message" rows="3"></textarea></div>'+
     (j?'<div class="full"><label class="check" for="a-share"><input type="checkbox" id="a-share" name="consent-share-with-employer" required> Share my details with the employer for this role. *</label></div>':'')+
     '<div class="full"><label class="check" for="a-pool"><input type="checkbox" id="a-pool" name="consent-keep-on-file"'+(j?'':' required')+'> Keep my details for up to 12 months and contact me about other flooring roles.'+(j?'':' *')+'</label></div>'+
     '<p class="small full">I only use your details for recruitment. See the <a href="'+esc(PRIVACY)+'" target="_blank" rel="noopener">privacy policy</a>.</p>'+
     '<p class="error full" id="apply-error" role="alert" hidden></p>'+
     '<div class="full"><button class="btn" type="submit">'+(j?"Send application":"Register my CV")+'</button></div>'+
     '</div></form>'+
     (CFG.notes?'<aside class="bn">Applications are stored with '+BRAND+' and forwarded to the employer. The two consents are recorded separately: sharing with this employer, and joining the candidate pool for 12 months. The privacy policy needs a recruitment section before launch.</aside>':''));
    $("apply-form").addEventListener("submit",function(e){
      e.preventDefault(); var form=this;
      if(!check(form,"apply-error","Fill in your name, mobile, email and town, and tick the consent box."))return;
      var email=$("a-email").value;
      submit(form,"job-application","apply-error",{job:j?j.title+" ("+j.id+")":"CV registration"},function(){
        done(form,j?"Application received":"CV registered",(j?"I'll pass your details to the employer within one working day.":"I'll be in touch when a role comes up that fits.")+(LIVE?"":" A confirmation would be emailed to "+email+"."),false);
      });
    });
  };
  document.addEventListener("click",function(e){
    var b=e.target.closest("[data-job]"); if(b){openJob(b.getAttribute("data-job"));return}
    var a=e.target.closest("[data-apply]"); if(a){openApply(a.getAttribute("data-apply"))}
  });
  $("btn-cv").addEventListener("click",function(){openApply("")});

  /* post a job */
  setDefaults();
  $("post-form").addEventListener("submit",function(e){
    e.preventDefault(); var form=this;
    if(!check(form,"post-error","Some required details are missing. Check the fields marked * and tick the posting terms."))return;
    var hasJd=$("p-jdfile").files.length>0||$("p-jdtext").value.trim().length>=150;
    if(!hasJd){var er=$("post-error");er.textContent="Add a job description. Upload a file, paste it in, or build one with the job description builder.";er.hidden=false;$("p-jdtext").focus();return}
    var who=$("p-anon").checked?"Employer name withheld":$("p-company").value;
    var prev=document.createElement("div");
    prev.innerHTML='<p class="small" style="margin-bottom:6px">How it will look once approved:</p><ul class="joblist" style="border:1px solid var(--line);background:var(--paper)"><li style="border:0"><div class="job'+($("p-featured").checked?' featured':'')+'" style="cursor:default">'+
      '<span><span class="t">'+esc($("p-title").value)+' <span class="pill hold">Awaiting approval</span></span><span class="who">'+esc(who)+' · '+esc($("p-town").value)+', '+esc($("p-region").value)+'</span>'+
      '<span class="tags"><span class="pill">'+esc($("p-type").value)+'</span><span class="pill">'+esc($("p-cat").value)+'</span></span></span>'+
      '<span><span class="pay">'+esc($("p-pay").value)+'</span><span class="dates">Closes '+fmt($("p-close").value)+'</span></span></div></li></ul>';
    submit(form,"post-a-job","post-error",null,function(){
      done(form,"Thanks, I've got it","I'll check your advert and publish it within one working day. You'll get an email when it's live.",true,prev);
    });
  });

  /* ---------- job description builder ----------
     Follows one template for every role: title, reporting line, location and hours, salary and
     benefits, role purpose, key responsibilities, key measures, decision-making authority, skills and experience,
     progression. Suggestions come from a flooring role library, so it works on any host with no running cost. */
  var JD_LIB={};
  JD_LIB[CATS[0]]={purpose:"To fit floorcoverings to a standard that needs no return visit, leaving every customer happy to recommend us.",
    duties:["Fit carpet, vinyl, LVT and laminate to manufacturer guidance and British Standards (BS 5325 and BS 8203)","Assess and prepare subfloors, including moisture testing, smoothing compounds and plyboarding","Check the job sheet, plan and materials before leaving so each job is completed in one visit","Protect the customer's home or site and leave it clean and tidy","Report anything that affects the job, such as damp, uneven floors or short materials, before work starts","Look after the van, tools and stock, and return unused materials","Complete job sheets, photos and customer sign-off the same day","Follow site rules, risk assessments and safe working practices"],
    kpis:["Jobs completed first time with no call-back","Customer reviews and complaints","Jobs completed within the time allowed","Material wastage against plan","Vehicle, tool and paperwork checks up to date"],
    essential:["Time-served floor layer or NVQ Level 2 in floorcovering","Proven experience fitting carpet, vinyl and LVT","Confident preparing subfloors","Full UK driving licence","Polite, tidy and reliable in customers' homes","Able to work alone and manage your own time"],
    desirable:["CSCS card","Experience with safety flooring, including cap and cove","Wood or design floor experience","Experience training a mate or apprentice"]};
  JD_LIB[CATS[1]]={purpose:"To measure and price work accurately and quickly, so we win the right jobs at the right margin and they run without surprises.",
    duties:["Carry out site and home surveys, recording measurements, subfloor condition and moisture readings","Take off quantities from drawings and specifications","Produce clear, accurate quotations and tender returns within agreed turnaround times","Plan materials to minimise waste and specify the right preparation","Follow up every quote and record the outcome","Hand over complete job packs to the fitters or contracts team","Keep price files, supplier costs and labour rates up to date","Flag risks and likely variations before the job starts"],
    kpis:["Quote turnaround time","Quote conversion rate","Estimated against actual margin on completed jobs","Remedial costs caused by measuring or specification errors","Tender deadlines met"],
    essential:["Experience estimating or surveying in flooring","Able to read drawings and take off accurately","Good knowledge of floorcoverings, subfloor preparation and fitting methods","Confident with estimating software and spreadsheets","Clear written and spoken communication","Full UK driving licence"],
    desirable:["Experience with flooring take-off software","Background as a floor layer","Commercial tendering experience","CSCS card"]};
  JD_LIB[CATS[2]]={purpose:"To turn showroom visitors and enquiries into delighted customers, giving honest advice and following every quote through to an order.",
    duties:["Welcome every customer, understand what they need and recommend the right floor","Book home measures and, where required, carry them out","Prepare accurate quotes on the day and follow up every one","Hit agreed sales, margin and add-on targets, including underlay, accessories and fitting","Keep customers informed from order through to fitting","Keep the showroom, displays and samples clean, priced and up to date","Record enquiries, quotes and orders accurately on the system","Handle queries and complaints promptly and fairly"],
    kpis:["Sales against target","Quote conversion rate","Average order value and margin","Underlay and accessory sales per order","Customer reviews"],
    essential:["Sales experience in retail, ideally flooring or home interiors","Confident asking for the order and following up","Accurate with measurements, quotes and paperwork","Comfortable using a computer system for quotes and orders","Friendly, well presented and reliable","Able to work weekends on a rota"],
    desirable:["Flooring product knowledge","Experience measuring in customers' homes","Full UK driving licence","Experience with social media or local marketing"]};
  JD_LIB[CATS[3]]={purpose:"To grow profitable sales across the territory by looking after existing accounts properly and opening new ones.",
    duties:["Manage and grow existing accounts through regular, planned visits","Find and open new accounts","Present ranges, place displays and samples, and train customers' staff","Agree and deliver account plans with key customers","Hit agreed sales, margin and new account targets","Keep the CRM up to date with visits, opportunities and forecasts","Resolve order, delivery and credit queries with the internal team","Report on competitor and market activity"],
    kpis:["Sales and margin against target","New accounts opened and trading","Visits and calls completed against plan","Displays placed","Debtor days across the ledger"],
    essential:["Field sales or account management experience, ideally in flooring or interiors","A track record of hitting targets","Organised territory planning and CRM use","Confident negotiating price and terms","Self-motivated and able to work alone","Full UK driving licence"],
    desirable:["Existing relationships with flooring retailers or contractors in the area","Specification sales experience","Experience launching new ranges"]};
  JD_LIB[CATS[4]]={purpose:"To deliver projects safely, on time and on margin, and to lead the team so the business runs well without the owner in every decision.",
    duties:["Plan and programme labour, materials and plant across live projects","Manage fitters and subcontractors, including quality checks and site inspections","Own client relationships and attend site and progress meetings","Control costs, variations, applications for payment and final accounts","Produce and enforce RAMS and make sure every site works safely","Review estimated against actual margin on each job and act on the gaps","Recruit, train and develop the team","Report weekly on programme, margin and risks"],
    kpis:["Projects completed on programme","Margin achieved against estimate","Snagging and remedial costs","Health and safety incidents and audit results","Client retention and repeat work"],
    essential:["Experience managing flooring contracts, or a flooring branch or team","Strong planning and organisational skills","Commercial awareness of margin, variations and cash","Confident leading fitters and subcontractors","Good knowledge of floorcoverings and subfloor preparation","Full UK driving licence"],
    desirable:["SMSTS or SSSTS","CSCS card","Experience with main contractors and housebuilders","Experience with job management software"]};
  JD_LIB[CATS[5]]={purpose:"To get the right materials to the right job or customer, on time and undamaged.",
    duties:["Receive, check and put away deliveries accurately","Pick, cut and label orders for fitters and customers","Load vehicles safely and deliver to sites and customers","Keep stock records accurate and report shortages or damage","Carry out regular stock counts","Keep the warehouse, racking and yard safe and tidy","Carry out daily vehicle and equipment checks","Help fitters and trade customers at the counter"],
    kpis:["Orders picked and delivered on time","Picking and cutting errors","Stock count accuracy","Damages and write-offs","Vehicle and equipment checks completed"],
    essential:["Warehouse or delivery experience","Full UK driving licence","Able to carry out a physical role, lifting and handling flooring safely with training","Accurate with paperwork and counting","Reliable timekeeping","Helpful with customers and colleagues"],
    desirable:["Counterbalance, reach or side loader licence","Experience cutting carpet and vinyl","Flooring product knowledge","C1 category on your driving licence"]};
  JD_LIB[CATS[6]]={purpose:"To learn the floor laying trade properly, on the job and at college, and become a qualified fitter.",
    duties:["Assist qualified fitters on domestic and commercial jobs","Learn to prepare subfloors, including uplift, cleaning and smoothing compounds","Learn to fit carpet, vinyl and LVT under supervision","Load, unload and look after tools, materials and the van","Keep work areas safe, clean and tidy","Attend college or the training centre on block release and complete coursework on time","Keep your apprenticeship logbook up to date with your mentor","Follow instructions and safe working practices at all times"],
    kpis:["Attendance and timekeeping","College attendance and coursework completed on time","Skills signed off in the logbook each quarter","Feedback from fitters and customers","Progress towards NVQ Level 2"],
    essential:["Keen to learn a trade and willing to work hard","Reliable, punctual and able to follow instructions","Comfortable with physical work","Polite and presentable in customers' homes","Able to travel to the depot for an early start","Basic maths for measuring and working out areas"],
    desirable:["Some experience of practical or site work","Provisional or full driving licence","Interested in a long-term career in flooring"]};
  JD_LIB[CATS[7]]={purpose:"To keep customers informed, fitters organised and paperwork accurate so the business runs smoothly every day.",
    duties:["Answer calls, emails and enquiries promptly and book surveys","Schedule fitters and keep the diary full and realistic","Order materials and chase deliveries so every job is ready to go","Keep customers updated on dates and any changes","Raise quotes and invoices and take payments accurately","Keep customer and job records up to date on the system","Chase outstanding quotes, balances and reviews","Support the owner or manager with reports and administration"],
    kpis:["Enquiries answered and surveys booked within target","Diary utilisation for the fitting teams","Jobs delayed by missing materials","Outstanding balances and debtor days","Customer reviews received"],
    essential:["Experience in an office, scheduling or customer service role","Organised and calm under pressure","Confident on the phone","Accurate with figures and data entry","Good working knowledge of email, spreadsheets and business software","Able to prioritise a busy workload"],
    desirable:["Experience in flooring, construction or another trade business","Experience with accounting or job management software","Credit control experience"]};
  var JD_BENEFITS=["Company van","Fuel card","Company car or car allowance","Bonus or commission","Workplace pension","Tools and uniform provided","Training and qualifications paid for","Staff discount","Phone and laptop or tablet"];
  var JD_STEPS=["The basics","Pay and benefits","The role","The person","Your job description"];

  var jdChecks=function(list,key,ticked){
    return '<div class="jd-list">'+list.map(function(x,i){return '<label class="check"><input type="checkbox" data-list="'+key+'" value="'+esc(x)+'"'+(i<ticked?' checked':'')+'> <span>'+esc(x)+'</span></label>'}).join('')+'</div>';
  };
  var jdField=function(id,label,attrs,hint){return '<div><label for="'+id+'">'+label+(hint?'<span class="hint">'+hint+'</span>':'')+'</label><input type="text" id="'+id+'" '+(attrs||'')+'></div>'};
  var jdArea=function(id,label,rows,hint,ph){return '<div class="full"><label for="'+id+'">'+label+(hint?'<span class="hint">'+hint+'</span>':'')+'</label><textarea id="'+id+'" rows="'+rows+'"'+(ph?' placeholder="'+esc(ph)+'"':'')+'></textarea></div>'};
  var jdRoleParts=function(cat){
    var L=JD_LIB[cat]||JD_LIB[CATS[0]];
    $("jd-purpose").value=L.purpose;
    $("jd-duties").innerHTML=jdChecks(L.duties,"duties",6);
    $("jd-kpis").innerHTML=jdChecks(L.kpis,"kpis",3);
    $("jd-essential").innerHTML=jdChecks(L.essential,"essential",4);
    $("jd-desirable").innerHTML=jdChecks(L.desirable,"desirable",2);
  };
  var jdPicked=function(key,ownId){
    var a=[].slice.call(document.querySelectorAll('#jd-form input[data-list="'+key+'"]:checked')).map(function(i){return i.value});
    $(ownId).value.split(/\n+/).forEach(function(l){l=l.replace(/^[\s\-•*]+/,"").trim();if(l)a.push(l.charAt(0).toUpperCase()+l.slice(1))});
    return a;
  };
  var jdText=function(){
    var v=function(id){return $(id).value.trim()}, out=[], bullets=function(a){return a.map(function(x){return "- "+x}).join("\n")};
    var cap=function(s){return s.charAt(0).toUpperCase()+s.slice(1)}, stop=function(s){s=cap(s);return /[.!?]$/.test(s)?s:s+"."};
    var benefits=[].slice.call(document.querySelectorAll('#jd-form input[data-list="benefits"]:checked')).map(function(i){return i.value});
    if(v("jd-benefits-own"))benefits.push(v("jd-benefits-own"));
    benefits=benefits.map(function(x,i){return i?x.charAt(0).toLowerCase()+x.slice(1):cap(x)});
    out.push("JOB DESCRIPTION","");
    out.push("Job title: "+v("jd-title"));
    if(v("jd-company"))out.push("Business: "+v("jd-company"));
    out.push("Location and hours: "+stop(v("jd-town"))+(v("jd-hours")?" "+stop(v("jd-hours")):""));
    if($("jd-type").value)out.push("Contract: "+$("jd-type").value);
    if(v("jd-reports"))out.push("Reports to: "+v("jd-reports"));
    if(v("jd-manages"))out.push("Responsible for: "+v("jd-manages"));
    out.push("Salary: "+v("jd-pay"));
    if(benefits.length)out.push("Benefits: "+benefits.join(", "));
    if(v("jd-holiday"))out.push("Holiday: "+cap(v("jd-holiday")));
    if(v("jd-about"))out.push("","ABOUT US",stop(v("jd-about")));
    if(v("jd-purpose"))out.push("","ROLE PURPOSE",stop(v("jd-purpose")));
    var d=jdPicked("duties","jd-duties-own"); if(d.length)out.push("","KEY RESPONSIBILITIES",bullets(d));
    var k=jdPicked("kpis","jd-kpis-own"); if(k.length)out.push("","HOW SUCCESS IS MEASURED",bullets(k));
    if(v("jd-decide")||v("jd-signoff")){out.push("","DECISION-MAKING AUTHORITY");if(v("jd-decide"))out.push("Can decide alone: "+stop(v("jd-decide")));if(v("jd-signoff"))out.push("Needs sign-off: "+stop(v("jd-signoff")))}
    var e=jdPicked("essential","jd-essential-own"), w=jdPicked("desirable","jd-desirable-own");
    if(e.length||w.length){out.push("","SKILLS AND EXPERIENCE");if(e.length)out.push("Essential",bullets(e));if(w.length)out.push("Desirable",bullets(w))}
    if(v("jd-person"))out.push("","THE PERSON",stop(v("jd-person")));
    if(v("jd-progress"))out.push("","PROGRESSION",stop(v("jd-progress")));
    return out.join("\n");
  };
  var openJd=function(){
    var opt=function(list,sel){return list.map(function(x){return '<option'+(x===sel?' selected':'')+'>'+esc(x)+'</option>'}).join('')};
    var cat=$("p-cat").value||CATS[0];
    openDlg("Build a job description","Answer a few questions and it writes itself. You can edit every word.",
     '<form id="jd-form" novalidate>'+
     '<ol class="jd-steps" id="jd-steps">'+JD_STEPS.map(function(s,i){return '<li'+(i===0?' class="on"':'')+'><span>'+(i+1)+'</span> '+s+'</li>'}).join('')+'</ol>'+
     '<div class="jd-step" data-step="0"><div class="fgrid">'+
       jdField("jd-title","Job title *",'required placeholder="e.g. Carpet and Vinyl Fitter"')+
       '<div><label for="jd-cat">Type of role *</label><select id="jd-cat">'+opt(CATS,cat)+'</select></div>'+
       jdField("jd-company","Business name")+
       jdField("jd-town","Where is the role based? *",'required placeholder="Town or city"')+
       '<div><label for="jd-type">Contract</label><select id="jd-type"><option value="">Choose one</option>'+opt(TYPES,$("p-type").value)+'</select></div>'+
       jdField("jd-hours","Hours",'placeholder="e.g. Monday to Friday, 8am to 5pm"')+
       jdField("jd-reports","Who will they report to?",'placeholder="e.g. Contracts Director"')+
       jdField("jd-manages","Who reports to them?",'placeholder="Leave blank if nobody"')+
       jdArea("jd-about","About the business",2,"A couple of lines on what you do and who for.","e.g. Family-run flooring retailer with two showrooms, fitting for homeowners and local builders since 1998.")+
     '</div></div>'+
     '<div class="jd-step" data-step="1" hidden><div class="fgrid">'+
       '<div class="full">'+jdField("jd-pay","Salary or rate *",'required placeholder="e.g. £32,000 to £38,000"',"A band works better than a single figure.").replace(/^<div>|<\/div>$/g,'')+'</div>'+
       '<div class="full"><span class="label">What comes with it?</span>'+jdChecks(JD_BENEFITS,"benefits",0)+'</div>'+
       jdField("jd-holiday","Holiday",'value="28 days including bank holidays"')+
       jdField("jd-benefits-own","Anything else?",'placeholder="e.g. early finish on Fridays"')+
     '</div></div>'+
     '<div class="jd-step" data-step="2" hidden><div class="fgrid">'+
       jdArea("jd-purpose","Why does this role exist?",3,"I've suggested a starting point. Make it yours.")+
       '<div class="full"><span class="label">What will they be doing day to day?<span class="hint">Tick what applies. Six to eight is plenty.</span></span><div id="jd-duties"></div></div>'+
       jdArea("jd-duties-own","Add your own",2,"One per line.")+
       '<div class="full"><span class="label">How will you know they\'re doing well?<span class="hint">The numbers that matter. Most job descriptions miss this.</span></span><div id="jd-kpis"></div></div>'+
       jdArea("jd-kpis-own","Add your own measures",2,"One per line.")+
       jdField("jd-decide","What can they decide alone?",'placeholder="e.g. day to day scheduling, goodwill up to £100"')+
       jdField("jd-signoff","What needs your sign-off?",'placeholder="e.g. discounts below margin, spend over £500"')+
     '</div></div>'+
     '<div class="jd-step" data-step="3" hidden><div class="fgrid">'+
       '<div class="full"><span class="label">What is essential?<span class="hint">Only what the job really needs.</span></span><div id="jd-essential"></div></div>'+
       jdArea("jd-essential-own","Add your own",2,"One per line.")+
       '<div class="full"><span class="label">What would be a bonus?</span><div id="jd-desirable"></div></div>'+
       jdArea("jd-desirable-own","Add your own",2,"One per line.")+
       jdArea("jd-person","What kind of person does well in your business?",2,"","e.g. Someone who takes pride in a tidy job and speaks up early when something isn't right.")+
       jdArea("jd-progress","Where could this role lead?",2,"","e.g. Lead fitter within two years, with training paid for.")+
     '</div></div>'+
     '<div class="jd-step" data-step="4" hidden>'+
       '<label for="jd-out">Your job description<span class="hint">Edit anything you like, then add it to your advert.</span></label><textarea id="jd-out" rows="18"></textarea>'+
       '<p class="small" id="jd-copied" hidden>Copied.</p>'+
     '</div>'+
     '<p class="error" id="jd-error" role="alert" hidden></p>'+
     '<div class="dlg-foot"><button class="btn line" type="button" id="jd-back" hidden>Back</button><button class="btn" type="button" id="jd-next">Next</button><button class="btn line" type="button" id="jd-copy" hidden>Copy</button></div>'+
     '</form>');
    $("jd-title").value=$("p-title").value; $("jd-company").value=$("p-company").value; $("jd-town").value=$("p-town").value; $("jd-pay").value=$("p-pay").value;
    jdRoleParts(cat);
    $("jd-cat").addEventListener("change",function(){jdRoleParts(this.value)});
    var step=0, last=JD_STEPS.length-1;
    var show=function(n){
      step=n;
      [].forEach.call(document.querySelectorAll("#jd-form .jd-step"),function(s){s.hidden=+s.getAttribute("data-step")!==n});
      [].forEach.call($("jd-steps").children,function(li,i){li.className=i===n?"on":(i<n?"done":"")});
      $("jd-back").hidden=n===0; $("jd-copy").hidden=n!==last; $("jd-error").hidden=true;
      $("jd-next").textContent=n===last?"Use this job description":(n===last-1?"Write my job description":"Next");
      dlg.scrollTop=0;
    };
    var need=function(msg,el){var e=$("jd-error");e.textContent=msg;e.hidden=false;if(el)el.focus();return false};
    var valid=function(){
      if(step===0){if(!$("jd-title").value.trim())return need("Add the job title.",$("jd-title"));if(!$("jd-town").value.trim())return need("Add where the role is based.",$("jd-town"))}
      if(step===1&&!$("jd-pay").value.trim())return need("Add the salary or rate. A range is fine.",$("jd-pay"));
      if(step===2&&jdPicked("duties","jd-duties-own").length<3)return need("Pick or add at least three things they'll be doing.");
      return true;
    };
    $("jd-back").addEventListener("click",function(){show(step-1)});
    $("jd-form").addEventListener("submit",function(e){e.preventDefault()});
    $("jd-copy").addEventListener("click",function(){
      var ta=$("jd-out"), ok=function(){$("jd-copied").hidden=false};
      if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(ta.value).then(ok,function(){ta.focus();ta.select()})}else{ta.focus();ta.select()}
    });
    $("jd-next").addEventListener("click",function(){
      if(step<last){ if(!valid())return; if(step===last-1)$("jd-out").value=jdText(); show(step+1); return }
      /* hand the result back to the advert form */
      $("p-jdtext").value=$("jd-out").value;
      $("p-title").value=$("jd-title").value; $("p-town").value=$("jd-town").value; $("p-pay").value=$("jd-pay").value; $("p-cat").value=$("jd-cat").value;
      if($("jd-type").value)$("p-type").value=$("jd-type").value;
      if($("jd-company").value&&!$("p-company").value)$("p-company").value=$("jd-company").value;
      if(!$("p-summary").value.trim())$("p-summary").value=$("jd-purpose").value.trim();
      dlg.close();
      var note=$("jd-added"); if(note)note.hidden=false;
      $("post-error").hidden=true;
      $("p-jdtext").scrollIntoView({block:"center"}); $("p-jdtext").focus({preventScroll:true});
    });
  };
  document.addEventListener("click",function(e){ if(e.target.closest("[data-jd]"))openJd() });
  renderJobs();
}

/* ================= businesses for sale ================= */
if(hasSale){
  fill($("s-type"),BIZ); fill($("s-region"),REGIONS); fill($("s-band"),BANDS);
  fill($("b-type"),BIZ); fill($("b-region"),REGIONS); fill($("v-type"),BIZ.concat(["Other"])); fill($("v-band"),BANDS);
  SALES.filter(function(s){return s.status!=="Sold"}).forEach(function(s){var o=document.createElement("option");o.value=s.ref;o.textContent=s.ref+" · "+s.title;$("b-listing").appendChild(o)});
  var ORDER={"Available":0,"Under offer":1,"Coming soon":2,"Sold":3};
  var row=function(k,v){return v?'<dt>'+k+'</dt><dd>'+esc(v)+'</dd>':''};
  var saleCard=function(s){
    var cls={"Available":"ok","Under offer":"hold","Coming soon":"soon"}[s.status]||"";
    var label={"Available":"Request the sale brief","Under offer":"Join the reserve list","Coming soon":"Tell me when it's live"}[s.status];
    var action=s.status==="Sold"?'<p class="suits">Sold. Register as a buyer to hear about similar businesses.</p>'
      :(s.status==="Coming soon"?'<p class="suits">Being prepared for sale. Full details follow once the sale brief is signed off.</p>':'')+
       '<p class="suits"><strong>Would suit:</strong> '+esc(s.suits)+'</p><button class="btn sm'+(s.status==="Available"?'':' line')+'" type="button" data-ref="'+esc(s.ref)+'">'+label+'</button>';
    return '<article class="card'+(s.status==="Sold"?' sold':'')+'"><div class="top"><span class="ref">Ref '+esc(s.ref)+'</span><span class="pill '+cls+'">'+esc(s.status)+'</span></div>'+
      '<div><h3>'+esc(s.title)+'</h3><p class="where">'+esc(s.region)+' · '+esc(s.biz)+'</p></div>'+
      '<dl class="kv">'+row("Turnover",s.band)+row("Established",s.est)+row("Team",s.team)+row("Premises",s.tenure)+row("Reason for sale",s.reason)+'</dl>'+
      action+sampleTag(s)+'</article>';
  };
  var renderSales=function(){
    var t=$("s-type").value,r=$("s-region").value,b=$("s-band").value;
    var rows=SALES.map(function(s,i){s.i=i;return s}).filter(function(s){return(!t||s.biz===t)&&(!r||s.region===r)&&(!b||s.band===b)}).sort(function(x,y){return ORDER[x.status]-ORDER[y.status]||x.i-y.i});
    $("sale-list").innerHTML=rows.length?rows.map(saleCard).join(""):'<p class="empty">Nothing on the market matches that right now. Register as a buyer below and I\'ll tell you when something does.</p>';
  };
  $("sale-filters").addEventListener("change",renderSales);
  $("sale-filters").addEventListener("submit",function(e){e.preventDefault()});
  document.addEventListener("click",function(e){
    var b=e.target.closest("[data-ref]"); if(!b)return;
    $("b-listing").value=b.getAttribute("data-ref");
    $("buyer-form").hidden||$("buyer-form").scrollIntoView({behavior:"smooth",block:"center"});
    $("b-name").focus({preventScroll:true});
  });
  $("buyer-form").addEventListener("submit",function(e){
    e.preventDefault(); var form=this;
    if(!check(form,"buyer-error","Add your name, email and phone, and tick the NDA box."))return;
    var ref=$("b-listing").value, soon=SALES.some(function(s){return s.ref===ref&&s.status==="Coming soon"});
    submit(form,"buyer-registration","buyer-error",null,function(){
      done(form,"You're registered",(soon?"I'll tell you as soon as "+ref+" is released, and call you in the meantime to understand what you're looking for."
        :ref?"I'll call you about "+ref+" and send the NDA within one working day.":"I'll call you within one working day to understand what you're looking for."));
    });
  });
  $("seller-form").addEventListener("submit",function(e){
    e.preventDefault(); var form=this;
    if(!check(form,"seller-error","Add your name, a number to call and an email address."))return;
    var guide=$("v-guide").checked;
    submit(form,"seller-enquiry","seller-error",null,function(){
      done(form,"Thanks, that's with me","I'll call you within one working day. The conversation is confidential and commits you to nothing."+(guide?" The valuation guide will follow by email.":""));
    });
  });
  renderSales();
}
})();
