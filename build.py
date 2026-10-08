#!/usr/bin/env python3
"""Builds the MC Growth Consultancy website from src/ into site/.

    python3 build.py            build the live site into site/
    python3 build.py --preview  also write preview/ for a click-through preview (no analytics, forms send nothing)

Edit pages in src/pages, posts in src/blog, styles in src/css, settings in src/site.json, listings in
src/js/listings-data.js. Never edit site/ by hand: it is rebuilt every time.
Author: Martyn Cohen"""
import datetime, html, json, os, re, shutil, sys
ROOT=os.path.dirname(os.path.abspath(__file__)); SRC=os.path.join(ROOT,'src')
rd=lambda *p: open(os.path.join(SRC,*p),encoding='utf-8').read()
CFG=json.loads(rd('site.json')); QUOTES=json.loads(rd('testimonials.json'))
POSTS=json.loads(rd('blog','posts.json')) if os.path.exists(os.path.join(SRC,'blog','posts.json')) else []
POSTS.sort(key=lambda p:p['date'],reverse=True)
esc=lambda s: html.escape(s,quote=True)
NAV=[('recruitment','Recruitment','recruitment.html'),('sales','Business Sales','business-sales.html'),('growth','Growth','growth.html'),
     ('systems','Systems & AI','systems-and-ai.html'),('jobs','Jobs Board','jobs.html'),('insights','Insights','blog/index.html'),('about','About','about.html')]

def icon(name,cls='icon'): return '<span class="%s"><svg><use href="#i-%s"/></svg></span>'%(cls,name)
def nice_date(iso): d=datetime.date.fromisoformat(iso); return '%d %s %d'%(d.day,d.strftime('%B'),d.year)

def quote(key,cls=''):
    q=QUOTES[key]; paras=''.join('<p>%s</p>'%esc(x) for x in q['text'])
    src='<em>%s</em>'%esc(q['source']) if q.get('source') else ''
    return '<figure class="qcard %s"><blockquote>%s</blockquote><footer><strong>%s</strong><span>%s</span>%s</footer></figure>'%(cls,paras,esc(q['name']),esc(q['role']),src)

def post_card(p,root):
    img=p.get('thumb') or p.get('image')
    thumb=('<div class="thumb" style="background-image:url(\'%sassets/img/%s\')"></div>'%(root,img)) if img else '<div class="thumb none"><img src="%sassets/img/mc-logo.png" alt=""></div>'%root
    return ('<a class="post-card" data-cat="%s" href="%sblog/%s.html">%s<div class="body"><p class="cat">%s</p><h3>%s</h3><p>%s</p><p class="meta">%s · %d min read</p></div></a>'
            %(esc(p['category']),root,p['slug'],thumb,esc(p['category']),esc(p['title']),esc(p['summary']),nice_date(p['date']),p.get('mins',3)))

def cat_chips():
    cats=[]
    for p in POSTS:
        if p['category'] not in cats: cats.append(p['category'])
    return '<div class="chips" role="group" aria-label="Filter articles by topic"><button class="chip" type="button" data-cat="" aria-pressed="true">All</button>%s</div>'%''.join(
        '<button class="chip" type="button" data-cat="%s" aria-pressed="false">%s</button>'%(esc(c),esc(c)) for c in sorted(cats))

def header(nav,root):
    items=''.join('<li><a href="%s%s"%s>%s</a></li>'%(root,h,' aria-current="page"' if k==nav else '',esc(l)) for k,l,h in NAV)
    return '''<a class="skip" href="#main">Skip to content</a>
<header class="site">
  <div class="wrap">
    <a class="logo" href="%sindex.html"><img src="%sassets/img/mc-logo.png" alt="" width="168" height="171"><span>MC Growth Consultancy</span></a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
    <nav id="site-nav" aria-label="Main">
      <ul>%s<li><a class="btn" href="%scontact.html#book">Book a Call</a></li></ul>
    </nav>
  </div>
</header>'''%(root,root,items,root)

def footer(root):
    c=CFG; legal='MC Growth Consultancy is the trading name of Martyn Cohen.'
    if c.get('vatNumber'): legal+=' VAT registration number '+esc(c['vatNumber'])+'.'
    if c.get('tradingAddress'): legal+=' '+esc(c['tradingAddress'])+'.'
    L=lambda href,label: '<li><a href="%s%s">%s</a></li>'%(root,href,label)
    return '''<footer>
  <div class="wrap">
    <div class="cols">
      <div class="brand"><strong>MC Growth Consultancy</strong><span>Clarity. Empathy. Structure.</span><p>%s</p></div>
      <div><h4>How I help</h4><ul>%s%s%s%s</ul></div>
      <div><h4>Explore</h4><ul>%s%s%s%s</ul></div>
      <div><h4>Contact</h4><ul><li><a href="tel:%s">%s</a></li><li><a href="mailto:%s">Email me</a></li><li><a href="%s" target="_blank" rel="noopener">LinkedIn</a></li>%s</ul></div>
    </div>
    <div class="row base">
      <span>&copy; %s MC Growth Consultancy. All rights reserved.</span>
      <ul><li><a href="%sprivacy.html">Privacy</a></li><li><a href="%sterms.html">Terms</a></li><li><button class="linkbtn" type="button" data-cookie-reset>Cookie choices</button></li></ul>
    </div>
  </div>
</footer>'''%(legal,L('recruitment.html','Recruitment'),L('business-sales.html','Business sales'),L('growth.html','Growth and performance'),L('systems-and-ai.html','Systems and AI'),
              L('jobs.html','Jobs board'),L('businesses-for-sale.html','Businesses for sale'),L('blog/index.html','Insights'),L('about.html','About Martyn'),
              c['phoneIntl'],c['phone'],c['email'],c['linkedin'],L('contact.html#book','Book a call'),c['year'],root,root)

def tokens(body,root):
    body=body.replace('{{root}}',root).replace('{{phone}}',CFG['phone']).replace('{{phoneIntl}}',CFG['phoneIntl']).replace('{{email}}',CFG['email']).replace('{{calendly}}',CFG['calendly'])
    body=body.replace('{{linkedin}}',CFG['linkedin']).replace('{{facebook}}',CFG['facebook']).replace('{{instagram}}',CFG['instagram']).replace('{{linkedinCompany}}',CFG['linkedinCompany'])
    body=re.sub(r'\{\{q:([a-z]+)(?: ([a-z ]+))?\}\}',lambda m: quote(m.group(1),m.group(2) or ''),body)
    body=re.sub(r'\{\{icon:([a-z]+)(?: (sm))?\}\}',lambda m: icon(m.group(1),'icon sm' if m.group(2) else 'icon'),body)
    body=body.replace('{{latest_posts}}',''.join(post_card(p,root) for p in POSTS[:3]))
    body=body.replace('{{all_posts}}',''.join(post_card(p,root) for p in POSTS))
    body=body.replace('{{post_count}}',str(len(POSTS))).replace('{{cat_chips}}',cat_chips())
    left=re.findall(r'\{\{[^}]+\}\}',body); assert not left, left
    return body

def layout(meta,body,path,preview=False):
    depth=path.count('/'); root='../'*depth
    if path=='404.html' and not preview: root='/'      # the not-found page can be served at any depth
    title=meta['title'] if meta.get('fulltitle') else meta['title']+' | MC Growth Consultancy'
    if preview=='fragment': title='MC Growth Consultancy Website'      # the preview's own name where it is hosted
    pretty=re.sub(r'(^|/)index\.html$',r'\1',path); pretty=re.sub(r'\.html$','',pretty)
    canon=CFG['url']+'/'+pretty
    site_cfg={'email':CFG['email'],'calendly':CFG['calendly'],'analyticsId':'' if preview else CFG['analyticsId'],'preview':preview}
    scripts=''.join('<script src="%sassets/js/%s"></script>\n'%(root,s) for s in meta.get('scripts','').split())
    extra=''
    if 'pages.js' in meta.get('scripts',''):
        extra='\n'+rd('dialog.html')
        if meta.get('main')=='page-jobs' and not preview:
            extra+='''\n<!-- Netlify only detects forms that exist in the page source. The application form is built by script, so this hidden copy declares it. -->
<form name="job-application" data-netlify="true" netlify-honeypot="bot-field" enctype="multipart/form-data" hidden>
  <input name="bot-field"><input name="job"><input name="name"><input name="phone"><input name="email"><input name="town">
  <input type="file" name="cv-file"><textarea name="message"></textarea>
  <input type="checkbox" name="consent-share-with-employer"><input type="checkbox" name="consent-keep-on-file">
</form>'''
    body=tokens(body,root)
    if not preview: body=body.replace(' method="POST"',' method="POST" data-netlify="true" netlify-honeypot="bot-field"')
    lds=[meta['jsonld']] if meta.get('jsonld') else []
    faqs=re.findall(r'<details>\s*<summary>(.*?)</summary>\s*<div>(.*?)</div>\s*</details>',body,re.S)
    if faqs:
        strip=lambda t: re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',t))).strip()
        lds.append(json.dumps({'@context':'https://schema.org','@type':'FAQPage','mainEntity':[{'@type':'Question','name':strip(q),'acceptedAnswer':{'@type':'Answer','text':strip(a)}} for q,a in faqs]}))
    ld=''.join('<script type="application/ld+json">%s</script>\n'%x for x in lds)
    page='''<title>%s</title>
<meta name="description" content="%s">
<meta name="author" content="Martyn Cohen">
<link rel="canonical" href="%s">
<meta property="og:type" content="%s">
<meta property="og:site_name" content="MC Growth Consultancy">
<meta property="og:title" content="%s">
<meta property="og:description" content="%s">
<meta property="og:url" content="%s">
<meta property="og:image" content="%s/assets/img/%s">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="%sassets/img/mc-logo.png">
<link rel="alternate" type="application/rss+xml" title="MC Growth Consultancy insights" href="%srss.xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@600;700&display=swap">
<link rel="stylesheet" href="%sassets/css/site.css">
%s''' % (esc(title),esc(meta['description']),canon,meta.get('ogtype','website'),esc(title),esc(meta['description']),canon,CFG['url'],meta.get('ogimage','share.png'),root,root,root,
         ld)
    inner='''%s
<div id="app">
%s

<main id="%s">
%s
</main>

%s

<a class="fab" href="%scontact.html"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-msg"/></svg>Get In Touch</a>%s

<div class="cookie" id="cookie" hidden role="region" aria-label="Cookie choice">
  <p>I'd like to use Google Analytics to see which pages are useful. It sets cookies, so it only runs if you say yes. <a href="%sprivacy.html#cookies">More detail</a>.</p>
  <div><button class="btn sm" type="button" data-cookie="yes">Yes, that's fine</button><button class="btn line sm" type="button" data-cookie="no">No thanks</button></div>
</div>
</div>
<script>window.SITE=%s;</script>
<script src="%sassets/js/site.js"></script>
%s''' % (rd('sprite.svg').strip(),header(meta.get('nav',''),root),meta.get('main','main'),body.strip(),footer(root),root,extra,root,json.dumps(site_cfg),root,scripts)
    if preview=='fragment': return page+inner          # the preview's first page is wrapped by its host
    return '<!doctype html>\n<html lang="en-GB">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'+page+'</head>\n<body>\n'+inner+'</body>\n</html>\n'

def front(text):
    m=re.match(r'<!--\n(.*?)\n-->\n',text,re.S); assert m,'page needs a front matter comment'
    meta=dict(l.split(': ',1) for l in m.group(1).split('\n') if ': ' in l)
    return meta,text[m.end():]

def build(out,preview=False):
    if os.path.exists(out): shutil.rmtree(out)
    os.makedirs(os.path.join(out,'assets'))
    for d in ('css','js','img'): shutil.copytree(os.path.join(SRC,d),os.path.join(out,'assets',d))
    if preview:   # nothing is sent from the preview
        p=os.path.join(out,'assets','js','listings-data.js'); s=open(p,encoding='utf-8').read().replace('mode: "live"','mode: "preview"').replace(''' formAttrs: ' data-netlify="true" netlify-honeypot="bot-field"',\n''','')
        open(p,'w',encoding='utf-8').write(s)
    pages=[]
    for f in sorted(os.listdir(os.path.join(SRC,'pages'))):
        meta,body=front(rd('pages',f)); path=f
        if f=='index.html': meta['jsonld']=json.dumps(schema_home())
        pages.append((path,meta,body))
    pages.append(('blog/index.html',*front(rd('blog','_index.html'))))
    for p in POSTS:
        body=rd('blog',p['slug']+'.html'); hero=('<figure class="post-hero"><img src="{{root}}assets/img/%s" alt="" fetchpriority="high"></figure>'%p['image']) if p.get('image') else ''
        tags=('<ul class="tags">'+''.join('<li class="pill">%s</li>'%esc(t) for t in p.get('tags',[]))+'</ul>') if p.get('tags') else ''
        meta={'title':p['title'],'description':p['summary'],'nav':'insights','ogtype':'article','ogimage':p['image'] if p.get('image') and not p['image'].endswith('.svg') else 'share.png',
              'jsonld':json.dumps({'@context':'https://schema.org','@type':'BlogPosting','headline':p['title'],'description':p['summary'],'datePublished':p['date'],
                                   'author':{'@type':'Person','name':'Martyn Cohen','url':CFG['url']+'/about'},'publisher':{'@type':'Organization','name':'MC Growth Consultancy','logo':{'@type':'ImageObject','url':CFG['url']+'/assets/img/mc-logo-512.png'}},
                                   'mainEntityOfPage':CFG['url']+'/blog/'+p['slug']})}
        related=[x for x in POSTS if x['category']==p['category'] and x['slug']!=p['slug']][:3]
        if len(related)<3: related+=[x for x in POSTS if x['slug']!=p['slug'] and x not in related][:3-len(related)]
        closing=('' if p.get('ownCta') else """
    <div class="band mt narrow">
      <h2>Want to talk it through?</h2>
      <p>If this is close to something you're dealing with, a 30 minute call costs nothing and commits you to nothing.</p>
      <div class="cta"><a class="btn" href="{{root}}contact.html#book">Book a Call</a><a class="btn line" href="{{root}}contact.html">Send a Message</a></div>
    </div>""")
        page='''<div class="hero page"><div class="wrap"><div class="copy post-head">
  <p class="crumb"><a href="{{root}}blog/index.html">Insights</a> / %s</p>
  <h1>%s</h1>
  <p class="meta">%s · %d min read · Martyn Cohen</p>
</div></div></div>
<section class="alt" style="padding-top:8px">
  <div class="wrap">%s
    <div class="prose" style="margin-top:36px">
%s
    </div>%s
    <div class="post-foot">
      <img src="{{root}}assets/img/martyn-cohen.webp" alt="" width="64" height="64" loading="lazy">
      <div><strong>Martyn Cohen</strong><span>Founder of MC Growth Consultancy. I work only with UK flooring businesses, on recruitment, growth, systems and business sales. <a href="{{root}}about.html">More about me</a>.</span></div>
    </div>%s
  </div>
</section>
<section>
  <div class="wrap">
    <div class="sec-head"><h2>Keep Reading</h2></div>
    <div class="posts">%s</div>
    <div class="also"><a class="btn line" href="{{root}}blog/index.html">All Insights</a></div>
  </div>
</section>'''%(esc(p['category']),esc(p['title']),nice_date(p['date']),p.get('mins',3),hero,body,tags,closing,''.join(post_card(x,'{{root}}') for x in related))
        pages.append(('blog/%s.html'%p['slug'],meta,page))
    for path,meta,body in pages:
        full=os.path.join(out,path); os.makedirs(os.path.dirname(full),exist_ok=True)
        mode=('fragment' if path=='index.html' else True) if preview else False
        s=layout(meta,body,path,mode); assert '\u2014' not in s and '\u2013' not in s, 'dash in '+path
        open(full,'w',encoding='utf-8').write(s)
    if not preview:
        urls=[re.sub(r'\.html$','',re.sub(r'(^|/)index\.html$',r'\1',p)) for p,_,_ in pages if p!='404.html']
        open(os.path.join(out,'sitemap.xml'),'w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join('  <url><loc>%s/%s</loc></url>\n'%(CFG['url'],u) for u in urls)+'</urlset>\n')
        open(os.path.join(out,'robots.txt'),'w').write('User-agent: *\nAllow: /\n\nSitemap: %s/sitemap.xml\n'%CFG['url'])
        items=''.join('  <item><title>%s</title><link>%s/blog/%s</link><guid>%s/blog/%s</guid><pubDate>%s</pubDate><description>%s</description></item>\n'%(esc(p['title']),CFG['url'],p['slug'],CFG['url'],p['slug'],datetime.date.fromisoformat(p['date']).strftime('%a, %d %b %Y 09:00:00 GMT'),esc(p['summary'])) for p in POSTS)
        open(os.path.join(out,'rss.xml'),'w',encoding='utf-8').write('<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel>\n  <title>MC Growth Consultancy insights</title>\n  <link>%s/blog</link>\n  <description>Practical thinking for UK flooring business owners, from Martyn Cohen.</description>\n%s</channel></rss>\n'%(CFG['url'],items))
        # old addresses keep working
        open(os.path.join(out,'_redirects'),'w').write('/blog/rss.xml  /rss.xml  301\n/services  /#help  301\n/testimonials  /about#recommendations  301\n/faq  /#faq  301\n')
    return len(pages)

def schema_home():
    c=CFG
    return {'@context':'https://schema.org','@type':'ProfessionalService','name':c['name'],'url':c['url'],'logo':c['url']+'/assets/img/mc-logo-512.png','image':c['url']+'/assets/img/share.png',
            'description':'Growth, recruitment and business sale support for UK flooring retailers, contractors and distributors.','telephone':c['phoneIntl'],'email':c['email'],'areaServed':'GB',
            'founder':{'@type':'Person','name':c['owner'],'jobTitle':'Founder','sameAs':[c['linkedin']]},'sameAs':[c['linkedinCompany'],c['facebook'],c['instagram']],
            'knowsAbout':['Flooring industry','Flooring recruitment','Selling a flooring business','Business growth','Business systems']}

if __name__=='__main__':
    n=build(os.path.join(ROOT,'site')); print('site: %d pages, %d posts'%(n,len(POSTS)))
    if '--preview' in sys.argv:
        n=build(os.path.join(ROOT,'preview'),preview=True); print('preview: %d pages'%n)
