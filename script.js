const toggle=document.getElementById('toggle'),links=document.getElementById('links');toggle.addEventListener('click',()=>links.classList.toggle('open'));links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>links.classList.remove('open')));document.getElementById('year').textContent=new Date().getFullYear();const topBtn=document.getElementById('top');window.addEventListener('scroll',()=>topBtn.classList.toggle('show',scrollY>400));topBtn.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));fetch('screenshots/images.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(items=>{if(!Array.isArray(items)||!items.length)return;const g=document.getElementById('gallery');g.innerHTML='';items.forEach((x,i)=>{const f=document.createElement('figure');f.className='gallery-item';const im=document.createElement('img');im.src='screenshots/'+encodeURIComponent(x.file);im.alt=x.alt||'تصویر نرم‌افزار Luno';im.loading='lazy';const c=document.createElement('figcaption');c.textContent=x.title||'نمای برنامه';f.append(im,c);g.append(f)})}).catch(()=>{});

// دریافت خودکار نسخه‌ها از GitHub Releases مخزن رسمی Luno
(async function loadLunoReleases(){
  const latestBox=document.getElementById('latest-download');
  const listBox=document.getElementById('release-list');
  if(!latestBox||!listBox)return;
  const releasesUrl='https://api.github.com/repos/EHSBIZ/Luno-Updates/releases?per_page=30';
  const releasesPage='https://github.com/EHSBIZ/Luno-Updates/releases';
  const formatDate=value=>{if(!value)return '';try{return new Intl.DateTimeFormat('fa-IR',{year:'numeric',month:'long',day:'numeric'}).format(new Date(value))}catch{return ''}};
  const getInstaller=release=>{
    const assets=Array.isArray(release.assets)?release.assets:[];
    return assets.find(a=>a.name.toLowerCase()==='lunosetup.exe')||assets.find(a=>a.name.toLowerCase().endsWith('.exe'))||null;
  };
  const makeLink=(url,label,cls='release-download')=>{const a=document.createElement('a');a.href=url;a.className=cls;a.textContent=label;a.target='_blank';a.rel='noopener';return a};
  const makeReleaseCard=(release,isLatest=false)=>{
    const card=document.createElement('article');card.className='release-card';
    const info=document.createElement('div');info.className='release-info';
    const title=document.createElement('strong');title.textContent=release.name||release.tag_name||'نسخه بدون نام';
    const meta=document.createElement('small');meta.textContent=[formatDate(release.published_at),release.prerelease?'پیش‌انتشار':'نسخه پایدار'].filter(Boolean).join(' · ');
    info.append(title,meta);
    const actions=document.createElement('div');actions.className='release-actions';
    const installer=getInstaller(release);
    if(installer){actions.append(makeLink(installer.browser_download_url,'دانلود EXE ⬇'));const size=document.createElement('small');size.textContent=(installer.size/1024/1024).toFixed(1)+' MB';actions.append(size)}
    else actions.append(makeLink(release.html_url||releasesPage,'جزئیات نسخه ↗'));
    card.append(info,actions);return card;
  };
  try{
    const response=await fetch(releasesUrl,{headers:{Accept:'application/vnd.github+json'}});
    if(!response.ok)throw new Error('GitHub API '+response.status);
    const releases=await response.json();
    if(!Array.isArray(releases))throw new Error('Invalid releases response');
    const stable=releases.filter(r=>!r.draft&&!r.prerelease);
    const latest=stable[0]||releases.find(r=>!r.draft)||null;
    latestBox.replaceChildren();
    if(latest){
      const panel=document.createElement('div');panel.className='latest-panel';
      const copy=document.createElement('div');copy.className='latest-copy';
      const tag=document.createElement('span');tag.className='latest-tag';tag.textContent='آخرین نسخه';
      const heading=document.createElement('h3');heading.textContent=latest.name||latest.tag_name;
      const date=document.createElement('p');date.textContent='منتشرشده در '+formatDate(latest.published_at);
      const description=document.createElement('p');description.className='latest-description';description.textContent=(latest.body||'نسخه آزمایشی نرم‌افزار Luno').replace(/\r/g,'').slice(0,240);
      copy.append(tag,heading,date,description);
      const installer=getInstaller(latest);
      const action=document.createElement('div');action.className='latest-action';
      if(installer){action.append(makeLink(installer.browser_download_url,'دانلود رایگان نسخه آزمایشی','btn download-main'));const size=document.createElement('small');size.textContent='Windows Installer · '+(installer.size/1024/1024).toFixed(1)+' MB';action.append(size)}
      else action.append(makeLink(latest.html_url||releasesPage,'مشاهده و دریافت نسخه','btn download-main'));
      panel.append(copy,action);latestBox.append(panel);
    }else{latestBox.textContent='هنوز نسخه‌ای برای دانلود منتشر نشده است.'}
    listBox.replaceChildren();
    const older=releases.filter(r=>!r.draft&&(!latest||r.id!==latest.id)).slice(0,12);
    if(older.length){older.forEach(r=>listBox.append(makeReleaseCard(r)))}
    else{const empty=document.createElement('p');empty.className='download-loading';empty.textContent='فعلاً نسخه قدیمی‌تری ثبت نشده است.';listBox.append(empty)}
  }catch(error){
    latestBox.textContent='دریافت خودکار نسخه‌ها در حال حاضر ممکن نیست. از لینک رسمی زیر استفاده کنید.';
    latestBox.append(makeLink('https://github.com/EHSBIZ/Luno-Updates/releases/latest/download/LunoSetup.exe','دانلود آخرین نسخه Luno','btn download-main'));
    listBox.replaceChildren(makeLink(releasesPage,'مشاهده تمام نسخه‌ها در GitHub ↗'));
  }
})();
