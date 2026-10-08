/* MC Growth Consultancy: site-wide behaviour. Author: Martyn Cohen
   Menu, cookie choice, analytics after consent, booking widget on request, and the simple enquiry forms. */
(function(){
"use strict";
var CFG=window.SITE||{};
var $=function(s,r){return (r||document).querySelector(s)};

/* mobile menu */
var toggle=$(".nav-toggle"), nav=$(".site nav");
if(toggle&&nav)toggle.addEventListener("click",function(){
  var open=nav.classList.toggle("open"); toggle.setAttribute("aria-expanded",open?"true":"false");
});

/* cookie choice: analytics only loads after a yes */
var KEY="mcg-cookie-choice";
function read(){try{return localStorage.getItem(KEY)}catch(e){return null}}
function write(v){try{localStorage.setItem(KEY,v)}catch(e){}}
function analytics(){
  if(!CFG.analyticsId||location.protocol==="file:"||window.__ga)return; window.__ga=true;
  var s=document.createElement("script"); s.async=true; s.src="https://www.googletagmanager.com/gtag/js?id="+encodeURIComponent(CFG.analyticsId); document.head.appendChild(s);
  window.dataLayer=window.dataLayer||[]; window.gtag=function(){window.dataLayer.push(arguments)};
  window.gtag("js",new Date()); window.gtag("config",CFG.analyticsId,{anonymize_ip:true});
}
var choice=read(), bar=$("#cookie");
if(choice==="yes")analytics();
if(bar&&CFG.analyticsId&&!choice){
  bar.hidden=false; document.documentElement.classList.add("has-cookie");
  bar.addEventListener("click",function(e){
    var b=e.target.closest("[data-cookie]"); if(!b)return;
    var v=b.getAttribute("data-cookie"); write(v); bar.hidden=true; document.documentElement.classList.remove("has-cookie");
    if(v==="yes")analytics();
  });
}
document.addEventListener("click",function(e){
  if(e.target.closest("[data-cookie-reset]")){try{localStorage.removeItem(KEY)}catch(err){} location.reload()}
});

/* booking widget loads only when asked for */
document.addEventListener("click",function(e){
  var b=e.target.closest("[data-calendly]"); if(!b||!CFG.calendly)return;
  var box=document.getElementById(b.getAttribute("data-calendly")); if(!box||box.firstChild)return;
  if(CFG.preview){var n=document.createElement("p"); n.className="note center"; n.textContent="Preview only: the booking diary appears here on the live site."; box.appendChild(n); b.hidden=true; return}
  var f=document.createElement("iframe"); f.title="Book a call with Martyn Cohen"; f.loading="lazy"; f.src=CFG.calendly+"?hide_gdpr_banner=1";
  box.appendChild(f); b.hidden=true; box.scrollIntoView({block:"nearest"});
});

/* enquiry forms: posted to Netlify Forms when the site is live there */
[].forEach.call(document.querySelectorAll("form[data-simple]"),function(form){
  var err=$(".error",form), btn=$("button[type=submit]",form);
  form.addEventListener("submit",function(e){
    e.preventDefault();
    var bad=form.querySelector("input:invalid,select:invalid,textarea:invalid");
    if(bad){err.textContent=form.getAttribute("data-missing")||"Please fill in the fields marked *.";err.hidden=false;bad.focus();return}
    err.hidden=true;
    var finish=function(sent){
      var d=document.createElement("div"); d.className="done"; d.setAttribute("role","status");
      var h=document.createElement("h4"); h.textContent=form.getAttribute("data-thanks-title")||"Thanks, that's with me"; d.appendChild(h);
      var p=document.createElement("p"); p.textContent=form.getAttribute("data-thanks")||"I'll come back to you within one working day."; d.appendChild(p);
      if(!sent){var s=document.createElement("p"); s.className="small"; s.textContent="Preview only: nothing was sent because this page isn't online yet."; d.appendChild(s)}
      form.hidden=true; form.parentNode.insertBefore(d,form.nextSibling); d.scrollIntoView({block:"nearest"});
    };
    if(location.protocol==="file:"||CFG.preview){finish(false);return}
    var label=btn.textContent; btn.disabled=true; btn.textContent="Sending…";
    fetch(location.pathname,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams(new FormData(form)).toString()})
      .then(function(r){if(!r.ok)throw new Error(r.status);finish(true)})
      .catch(function(){btn.disabled=false;btn.textContent=label;err.textContent="Sorry, that didn't send. Please try again, or email "+(CFG.email||"me")+".";err.hidden=false});
  });
});
/* insights: filter the articles by topic */
var chips=document.querySelectorAll(".chip[data-cat]");
if(chips.length){
  var cards=document.querySelectorAll("#posts .post-card"), none=$("#posts-empty");
  [].forEach.call(chips,function(chip){
    chip.addEventListener("click",function(){
      var cat=chip.getAttribute("data-cat"), shown=0;
      [].forEach.call(chips,function(c){c.setAttribute("aria-pressed",c===chip?"true":"false")});
      [].forEach.call(cards,function(card){var on=!cat||card.getAttribute("data-cat")===cat; card.hidden=!on; if(on)shown++});
      if(none)none.hidden=shown>0;
    });
  });
}
})();
