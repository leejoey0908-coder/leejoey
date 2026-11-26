const paths={compass:'<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5Z"/>',filter:'<path d="M4 7h7m4 0h5M4 17h3m4 0h9"/><circle cx="13" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',compare:'<rect x="3" y="5" width="7" height="14" rx="2"/><rect x="14" y="5" width="7" height="14" rx="2"/>',saved:'<path d="M6 4h12v17l-6-4-6 4Z"/>',pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',heart:'<path d="M20.8 5.6a5.3 5.3 0 0 0-7.5 0L12 7l-1.3-1.4a5.3 5.3 0 0 0-7.5 7.5L12 22l8.8-8.9a5.3 5.3 0 0 0 0-7.5Z"/>'};
const icon=n=>'<svg viewBox="0 0 24 24" aria-hidden="true">'+paths[n]+'</svg>';
const places=[
['jeju','대한민국','JEJU ISLAND','제주도','오름과 바다 사이, 느긋하게 걷는 섬 여행','자연 · 휴식','국내','2박 3일'],
['kyoto','일본','KYOTO','교토','고즈넉한 골목에서 만나는 일본의 옛 풍경','문화 · 산책','해외','3박 4일'],
['danang','베트남','DA NANG','다낭','따뜻한 바다와 로컬 미식을 즐기는 휴양지','해변 · 미식','해외','3박 4일']];
let category='전체';
function renderHome(){
 const cards=places.filter(p=>category==='전체'||category===p[6]).map(([id,n,en,title,desc,tag,_,days])=>`<article class="card"><div class="photo"><a href="#detail/${id}" aria-label="${title} 여행 정보"><img src="assets/${id}.jpg" alt="${title} 여행 풍경"></a><span class="tag">${tag}</span><button class="heart" data-save="${id}" aria-label="${title} 보관" aria-pressed="${isSaved(id)}">${icon('heart')}</button></div><a class="desc" href="#detail/${id}"><span class="country">${n} &nbsp; / &nbsp; ${en}</span><h3>${title}</h3><p>${desc}</p><div class="meta">${icon('clock')} ${days}</div></a></article>`).join('');
 app.innerHTML=`<div class="home"><section class="hero"><div><div class="kicker">TRAVEL EXPLORER</div><h1>어디로 떠날지<br>고민된다면?</h1><p>나에게 맞는 여행을 가볍게 찾아보세요!</p><a href="#filters" class="primary">${icon('compass')} 여행 후보 찾기</a></div><span class="coord">${icon('pin')} 알프스의 호수</span></section><section><div class="sectionhead"><div><div class="eyebrow">DESTINATION PICKS</div><h2>여행지 둘러보기</h2></div><div class="chips">${['전체','국내','해외'].map(c=>`<button class="chip ${c===category?'on':''}" data-cat="${c}" aria-pressed="${c===category}">${c}</button>`).join('')}</div></div><div class="grid">${cards}</div></section></div>`;
}
const app=document.querySelector('#app');
document.querySelector('#brandicon').innerHTML=icon('compass');
function route(){
 const [page='home',id]=location.hash.slice(1).split('/');const active=page||'home';
 document.querySelector('#nav').innerHTML=[['home','compass','탐색'],['filters','filter','조건설정'],['compare','compare','후보비교'],['saved','saved','보관함']].map(([p,i,t])=>`<a href="#${p}" class="${active===p?'active':''}">${icon(i)} ${t}</a>`).join('');
 if(!page||page==='home')renderHome();else flow(page,id);
 window.scrollTo(0,0);
}
app.addEventListener('click',e=>{const cat=e.target.closest('[data-cat]'),save=e.target.closest('.home [data-save]');if(cat){category=cat.dataset.cat;renderHome()}if(save){toggleSave(save.dataset.save);save.setAttribute('aria-pressed',String(isSaved(save.dataset.save)))}});
window.addEventListener('hashchange',route);route();
