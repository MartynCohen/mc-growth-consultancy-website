/* MC Growth Consultancy: jobs board and businesses for sale pages. Author: Martyn Cohen
   Listings are in listings-data.js. Forms post to Netlify Forms when the site is hosted on Netlify. */
(function(){
"use strict";
var $=function(id){return document.getElementById(id)};
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function fmt(iso){return new Date(iso+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short"})}
function fill(sel,items){items.forEach(function(v){var o=document.createElement("option");o.textContent=v;sel.appendChild(o)})}

var CFG=window.MCG||{}, LIVE=CFG.mode==="live";
var REGIONS=["North East","North West","Yorkshire","East Midlands","West Midlands","East of England","London","South East","South West","Wales","Scotland","Northern Ireland"];
var CATS=["Fitting and installation","Estimating and surveying","Showroom and retail sales","Trade and field sales","Contracts and management","Warehouse and logistics","Apprenticeships","Office and support"];
var TYPES=["Permanent","Self-employed or subcontract","Apprenticeship","Temporary or contract","Part time"];
var BIZ=["Retail","Contract","Distribution and trade counter","Specialist services"];
var BANDS=["Up to £500k","£500k to £1m","£1m to £3m","£3m and above"];

var JOBS=[],SALES=[];   /* listings live in assets/listings-data.js */
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
/* Live pages post to Netlify Forms. The prototype, and a page opened straight from a folder, send nothing. */
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
      :'<li class="empty">'+(JOBS.length?"No roles match that search. Clear a filter, or register your CV and we'll get in touch when something comes up."
        :"No live roles right now. Post yours free below, or register your CV and we'll get in touch when something comes up.")+'</li>';
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
      ? '<p class="small">This role was filled on '+fmt(j.filled)+'. Register your CV and we\'ll get in touch about similar jobs.</p><div class="dlg-foot"><button class="btn line" type="button" data-apply="">Register your CV</button></div>'
      : '<div class="dlg-foot"><button class="btn" type="button" data-apply="'+esc(j.id)+'">Apply for this job</button><span class="small">Applications go to MC Growth Consultancy, who pass them to the employer.</span></div>';
    openDlg(j.title,j.who+" · "+j.town+", "+j.region,
      '<dl class="kv"><dt>Pay</dt><dd>'+esc(j.pay)+'</dd><dt>Contract</dt><dd>'+esc(j.type)+'</dd><dt>Hours</dt><dd>'+esc(j.hours||"")+'</dd><dt>Posted</dt><dd>'+fmt(j.posted)+'</dd><dt>Closes</dt><dd>'+(j.filled?'Filled '+fmt(j.filled):fmt(j.closes))+'</dd></dl>'+
      '<div><h4>The role</h4><p>'+esc(j.summary)+'</p></div>'+
      '<div><h4>What you\'ll do</h4><ul class="dots">'+li(j.duties)+'</ul></div>'+
      '<div><h4>What you\'ll need</h4><ul class="dots">'+li(j.needs)+'</ul></div>'+
      sampleTag(j)+foot);
  };
  var openApply=function(id){
    var j=find(id);
    openDlg(j?"Apply: "+j.title:"Register your CV", j?j.who+" · "+j.town+", "+j.region:"We'll get in touch when a flooring role fits",
     '<form id="apply-form" name="job-application" method="POST" data-netlify="true" netlify-honeypot="bot-field" enctype="multipart/form-data" novalidate>'+HIDDEN("job-application")+'<div class="fgrid">'+
     '<div><label for="a-name">Full name *</label><input type="text" id="a-name" name="name" required autocomplete="name"></div>'+
     '<div><label for="a-phone">Mobile *</label><input type="tel" id="a-phone" name="phone" required autocomplete="tel"></div>'+
     '<div><label for="a-email">Email *</label><input type="email" id="a-email" name="email" required autocomplete="email"></div>'+
     '<div><label for="a-town">Town or postcode *</label><input type="text" id="a-town" name="town" required></div>'+
     '<div class="full"><label for="a-cv">Your CV<span class="hint">PDF or Word. No CV? Tell us about your experience below instead.</span></label><input type="file" id="a-cv" name="cv-file" accept=".pdf,.doc,.docx"></div>'+
     '<div class="full"><label for="a-note">'+(j?"Anything you'd like the employer to know":"What kind of role are you after?")+'</label><textarea id="a-note" name="message" rows="3"></textarea></div>'+
     (j?'<div class="full"><label class="check" for="a-share"><input type="checkbox" id="a-share" name="consent-share-with-employer" required> Share my details with the employer for this role. *</label></div>':'')+
     '<div class="full"><label class="check" for="a-pool"><input type="checkbox" id="a-pool" name="consent-keep-on-file"'+(j?'':' required')+'> Keep my details for up to 12 months and contact me about other flooring roles.'+(j?'':' *')+'</label></div>'+
     '<p class="small full">We only use your details for recruitment. See our <a href="https://www.mcgrowthconsultancy.co.uk/" target="_blank" rel="noopener">privacy policy</a>.</p>'+
     '<p class="error full" id="apply-error" role="alert" hidden></p>'+
     '<div class="full"><button class="btn" type="submit">'+(j?"Send application":"Register my CV")+'</button></div>'+
     '</div></form>'+
     '');
    $("apply-form").addEventListener("submit",function(e){
      e.preventDefault(); var form=this;
      if(!check(form,"apply-error","Fill in your name, mobile, email and town, and tick the consent box."))return;
      var email=$("a-email").value;
      submit(form,"job-application","apply-error",{job:j?j.title+" ("+j.id+")":"CV registration"},function(){
        done(form,j?"Application received":"CV registered",(j?"We'll pass your details to the employer within one working day.":"We'll be in touch when a role comes up that fits.")+(LIVE?"":" A confirmation would be emailed to "+email+"."),false);
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
    if(!hasJd&&!$("p-nojd").checked){var er=$("post-error");er.textContent="Add a job description. Upload a file, paste at least a few lines of it, or tick the box and we'll help you write one.";er.hidden=false;$("p-jdfile").focus();return}
    var who=$("p-anon").checked?"Employer name withheld":$("p-company").value;
    var prev=document.createElement("div");
    prev.innerHTML='<p class="small" style="margin-bottom:6px">How it will look once approved:</p><ul class="joblist" style="border:1px solid var(--line);background:var(--paper)"><li style="border:0"><div class="job'+($("p-featured").checked?' featured':'')+'" style="cursor:default">'+
      '<span><span class="t">'+esc($("p-title").value)+' <span class="pill hold">Awaiting approval</span></span><span class="who">'+esc(who)+' · '+esc($("p-town").value)+', '+esc($("p-region").value)+'</span>'+
      '<span class="tags"><span class="pill">'+esc($("p-type").value)+'</span><span class="pill">'+esc($("p-cat").value)+'</span></span></span>'+
      '<span><span class="pay">'+esc($("p-pay").value)+'</span><span class="dates">Closes '+fmt($("p-close").value)+'</span></span></div></li></ul>';
    submit(form,"post-a-job","post-error",null,function(){
      done(form,"Thanks, we've got it",hasJd?"We'll check your advert and publish it within one working day. You'll get an email when it's live."
        :"We'll call you about the job description first, then get your advert live.",true,prev);
    });
  });
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
    $("sale-list").innerHTML=rows.length?rows.map(saleCard).join(""):'<p class="empty">Nothing on the market matches that right now. Register as a buyer below and we\'ll tell you when something does.</p>';
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
      done(form,"You're registered",(soon?"We'll tell you as soon as "+ref+" is released, and call you in the meantime to understand what you're looking for."
        :ref?"We'll call you about "+ref+" and send the NDA within one working day.":"We'll call you within one working day to understand what you're looking for."));
    });
  });
  $("seller-form").addEventListener("submit",function(e){
    e.preventDefault(); var form=this;
    if(!check(form,"seller-error","Add your name, a number to call and an email address."))return;
    var guide=$("v-guide").checked;
    submit(form,"seller-enquiry","seller-error",null,function(){
      done(form,"Thanks, that's with us","Martyn will call you within one working day. The conversation is confidential and commits you to nothing."+(guide?" The valuation guide will follow by email.":""));
    });
  });
  renderSales();
}
})();
