(() => {
  "use strict";
  const places = {
    jeju: {
      name: "제주", country: "대한민국", alias: ["제주도", "제주", "jeju"], lead: "오름 산책과 바닷가 마을에서의 쉼", transport: "국내선 항공 · 버스", ride: "항공 약 1시간", fare: [10, 16], daily: [6, 10], min: 2, best: [4, 5, 6, 9, 10],
      purposes: ["자연", "휴식", "액티비티"], styles: ["여유롭게", "활동적으로"], care: "바람이 강하면 야외 산책과 배편 이용에 영향을 받을 수 있어요.",
      manners: "올레길이 마을이나 목장을 지날 때는 주민의 생활 공간을 존중하고 지정된 길로 걸어 주세요.", rules: "출입이 제한된 오름이 있어요. 탐방 전 해당 오름의 출입 공지를 확인하세요.", safety: "한라산 탐방로는 코스와 계절에 따라 입산·하산 시간이 달라요. 출발 전에 마감 시간을 살펴보세요.",
      url: "https://www.visitjeju.net/kr/", source: "제주관광공사"
    },
    kyoto: {
      name: "교토", country: "일본", alias: ["교토", "일본 교토", "kyoto"], lead: "사찰과 오래된 골목을 따라 걷는 여행", transport: "국제선 항공 · 철도", ride: "간사이공항에서 철도 약 1시간 20분", fare: [24, 42], daily: [9, 15], min: 3, best: [3, 4, 5, 10, 11],
      purposes: ["관광", "미식"], styles: ["여유롭게", "편안하게"], care: "벚꽃과 단풍 시즌에는 유명 사찰 주변이 혼잡해요.",
      manners: "기온에서는 마이코나 주민을 촬영하기 전에 허락을 구하고 통행로를 비워 주세요.", rules: "사유지 무단출입과 문화재 훼손은 처벌 대상이 될 수 있어요. 촬영·출입 안내를 확인하세요.", safety: "사찰 사이 도보 이동이 많은 편이에요. 편한 신발을 준비하고 더운 날엔 쉬어갈 곳을 정해 두세요.",
      url: "https://www.japan.travel/en/ca/news/city-of-kyoto-introduces-tips-for-manner-minded-tourists/", source: "일본정부관광국"
    },
    danang: {
      name: "다낭", country: "베트남", alias: ["다낭", "베트남 다낭", "danang", "da nang"], lead: "미케 해변과 현지 시장에서 즐기는 휴양", transport: "국제선 항공 · 택시", ride: "직항 약 5시간", fare: [30, 49], daily: [5, 9], min: 3, best: [2, 3, 4, 5, 6, 7, 8],
      purposes: ["휴식", "미식", "액티비티"], styles: ["가성비", "편안하게"], care: "비가 잦은 시기에는 해변 일정에 여유를 두세요.",
      manners: "사원에서는 어깨와 무릎을 가리고, 신발을 벗으라는 안내를 따라 주세요.", rules: "확인된 현지 법규 요약이 없어요. 출발 전 외교부의 베트남 국가 정보를 참고하세요.", safety: "해변에서는 현장의 입수 안내를 따르고, 야외 활동에는 모기 기피제를 준비하세요.",
      url: "https://vietnam.travel/faqs/", source: "베트남 관광청"
    }
  };
  const variants = [
    { name: "알뜰 여행", factor: 0.78, style: "가성비", feature: "대중교통과 실속 숙소를 중심으로 경비를 아껴요." },
    { name: "느긋한 산책", factor: 1, style: "여유롭게", feature: "한 지역에 머물며 도보로 주변을 천천히 둘러봐요." },
    { name: "편안한 휴식", factor: 1.3, style: "편안하게", feature: "숙소와 이동 편의에 여유를 두고 쉬어가요." }
  ];
  const purposeOptions = ["휴식", "관광", "미식", "자연", "액티비티"];
  const styleOptions = ["가성비", "편안하게", "활동적으로", "여유롭게"];
  const defaults = { region: "", purpose: "", budget: "", days: "", month: "", style: "", origin: "서울" };
  const keys = ["jeju", "kyoto", "danang"];
  const memory = {};
  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem("eodi.travel." + key)) ?? memory[key] ?? fallback; } catch { return memory[key] ?? fallback; }
  }
  function write(key, value) {
    memory[key] = value;
    try { localStorage.setItem("eodi.travel." + key, JSON.stringify(value)); } catch { /* Keep this session usable if storage is unavailable. */ }
  }
  const escape = value => String(value ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
  const months = () => Array.from({length:12}, (_, i) => {
    const now = new Date(), date = new Date(now.getFullYear(), now.getMonth()+i, 1);
    return date.getFullYear() + "-" + String(date.getMonth()+1).padStart(2, "0");
  });
  const fmtMonth = value => value ? value.replace("-", "년 ") + "월" : "시기 미정";
  function regionId(value) {
    const normalized = String(value).trim().toLowerCase();
    if (!normalized || normalized === "미정") return null;
    return keys.find(id => places[id].alias.includes(normalized)) || "unknown";
  }
  function plan(id, variant, conditions) {
    const p = places[id], v = variants[variant], days = Number(conditions.days) || (id === "jeju" ? 3 : 4);
    const month = Number(String(conditions.month).slice(-2)), factor = v?.factor || 1;
    const season = p.best.includes(month), title = v?.name || p.lead;
    const originExtra = conditions.origin === "기타" ? 4 : conditions.origin === "부산" && id !== "jeju" ? 2 : 0;
    const costs = p.daily.map((daily, i) => Math.ceil(p.fare[i] + originExtra + daily * days * factor));
    let score = (p.purposes.includes(conditions.purpose) ? 4 : 0) + (p.styles.includes(conditions.style) ? 2 : 0) + (season ? 2 : 0);
    if (v?.style === conditions.style) score += 5;
    if (costs[1] <= Number(conditions.budget)) score += 1;
    return { id, variant, title, days, costs, score, month:conditions.month, origin:conditions.origin || "서울" };
  }
  function rank(conditions) {
    const region = regionId(conditions.region);
    if (region === "unknown") return [];
    const plans = region ? variants.map((_, i) => plan(region, i, conditions)) : keys.map(id => plan(id, -1, conditions));
    return plans.filter(item => item.days >= places[item.id].min && item.costs[0] <= Number(conditions.budget))
      .sort((a,b) => b.score-a.score || a.costs[0]-b.costs[0]).slice(0,3);
  }
  function saved() { const stored = read("saved", []); return Array.isArray(stored) ? stored.filter(id => keys.includes(id)) : []; }
  window.isSaved = id => saved().includes(id);
  window.toggleSave = id => {
    if (!keys.includes(id)) return false;
    const current = saved(), next = current.includes(id) ? current.filter(entry => entry !== id) : [...current,id];
    write("saved", next);
    return next.includes(id);
  };
  const target = () => document.getElementById("app");
  const href = (hash, label, secondary = false) => '<a class="fx-button ' + (secondary ? 'fx-outline secondary' : 'fx-primary primary') + '" href="#' + hash + '">' + label + '</a>';
  const head = (small, title, sub = "") => '<header class="fx-head"><p class="eyebrow">' + small + '</p><h1>' + title + '</h1>' + (sub ? '<p>'+sub+'</p>' : '') + '</header>';
  const frame = inside => '<div class="fx-wrap">' + inside + '</div>';
  function choice(name, label, values, selected) {
    return '<fieldset><legend>'+label+'</legend><div class="fx-options">'+values.map(value => '<label><input type="radio" name="'+name+'" value="'+value+'" '+(value===selected?'checked ':'')+'required><span>'+value+'</span></label>').join("")+'</div></fieldset>';
  }
  function filters() {
    const f = {...defaults,...read("draft",{})};
    target().innerHTML = frame(head("TRAVEL PREFERENCES","어떤 여행을 꿈꾸세요?","예산과 취향을 알려주시면 어울리는 여행 후보를 찾아드려요.")+
      '<form class="panel fx-form" novalidate><label class="fx-label">희망 여행지 <small>선택</small><input type="text" name="region" value="'+escape(f.region)+'" placeholder="미정" list="fx-places" maxlength="30"></label><datalist id="fx-places"><option>제주</option><option>교토</option><option>다낭</option></datalist><p class="fx-help">제주 · 교토 · 다낭 중 선택하거나 미정으로 두세요.</p>'+
      choice("purpose","여행 목적",purposeOptions,f.purpose)+
      '<div class="fx-inputs"><label class="fx-label">1인 예산 (만 원)<input name="budget" type="number" placeholder="10 ~ 500" min="10" max="500" step="0.01" required value="'+escape(f.budget)+'"></label><label class="fx-label">여행 기간 (일)<input name="days" type="number" placeholder="2 ~ 14" min="2" max="14" required value="'+escape(f.days)+'"></label></div>'+
      '<label class="fx-label">여행 가능 시기<select required name="month"><option value="">여행할 달 선택</option>'+months().map(m=>'<option value="'+m+'" '+(m===f.month?'selected':'')+'>'+fmtMonth(m)+'</option>').join('')+'</select></label>'+
      choice("style","선호 스타일",styleOptions,f.style)+choice("origin","출발 지역",["서울","부산","기타"],f.origin)+
      '<p class="fx-error" role="alert"></p><button class="fx-button fx-primary primary" type="submit">여행 후보 추천받기</button></form>');
    const form = target().querySelector("form"), error = form.querySelector(".fx-error");
    const values = () => ({...defaults,...Object.fromEntries(new FormData(form))});
    form.addEventListener("input",()=>{write("draft",values());error.textContent="";});
    form.addEventListener("submit",event=>{
      event.preventDefault();
      const f = values(); write("draft", f);
      const unsupported = regionId(f.region) === "unknown";
      if (unsupported || !form.checkValidity() || !months().includes(f.month)) {
        error.textContent = unsupported ? "현재 제주, 교토, 다낭을 지원해요. 여행지를 다시 입력하거나 미정으로 두세요." : "필수 여행 조건을 입력해 주세요. 예산은 10~500만 원, 기간은 2~14일이에요.";
        (unsupported ? form.elements.region : form.querySelector(":invalid"))?.focus(); return;
      }
      write("conditions",f);location.hash="compare";
    });
  }
  const cost = p => p.costs.join(" ~ ") + "만 원";
  const code = p => p.id+(p.variant>=0?"~"+p.variant:"");
  const legal = "예상 비용은 참고용이며 실제 예약 시점에 따라 달라질 수 있습니다.";
  function stats(p) {
    const d = places[p.id];
    return '<dl class="fx-stats"><div><dt>여행 시기 · 기간</dt><dd>'+(p.month ? fmtMonth(p.month) : d.best[0]+'월 추천')+' · '+p.days+'일</dd></div><div><dt>1인 예상 경비</dt><dd>'+cost(p)+'</dd></div><div><dt>이동 방법</dt><dd>'+d.transport+'</dd></div></dl>';
  }
  function card(p) {
    const d = places[p.id], variant = variants[p.variant];
    return '<article class="fx-card card"><img alt="'+d.name+' 풍경" src="assets/'+p.id+'.jpg"><div><p class="fx-meta">'+d.country+'</p><h2>'+d.name+'</h2><p>'+p.title+'</p>'+stats(p)+'<p class="fx-reason"><strong>여행 포인트</strong>'+(variant?.feature || d.lead)+'</p><p class="fx-caution"><strong>미리 챙겨볼 점</strong>'+d.care+'</p>'+href("detail/"+code(p),"여행 정보 보기")+'</div></article>';
  }
  function compare() {
    const f = read("conditions",null), matches = f ? rank(f) : [];
    const intro = head("TRIP COMPARISON","여행 후보 비교",f ? "입력하신 조건을 바탕으로 여행 후보를 찾아봤어요." : "여행 조건을 입력해 나에게 맞는 후보를 비교해 보세요.");
    target().innerHTML = frame(intro+(matches.length ? '<div class="fx-toolbar"><span>'+escape(fmtMonth(f.month))+' · '+escape(f.days)+'일 · 1인 '+escape(f.budget)+'만 원 이내</span>'+href("filters","조건 수정하기",true)+'</div><div class="fx-grid">'+matches.map(card).join("")+'</div><p class="fx-note">'+legal+' 예산은 예상 범위의 하한을 기준으로 비교해요.</p>' :
      '<section class="panel fx-empty"><h2>'+(f?'조건에 맞는 후보가 없어요':'아직 비교할 여행 후보가 없어요')+'</h2><p>'+(f?'현재 조건에 맞는 여행 후보가 부족해요. 예산이나 여행 기간을 조정해 보세요.':'여행지 미정으로도 추천받을 수 있어요.')+'</p>'+href("filters",f?"조건 수정하기":"여행 조건 설정")+'</section>'));
  }
  function getPlan(token) {
    const [id, v] = String(token).split("~");
    if (!keys.includes(id)) return null;
    const f = read("conditions",null);
    if (f) {
      const match = rank(f).find(p => code(p)===token);
      if (match) return match;
    }
    return plan(id, /^[012]$/.test(v) ? Number(v) : -1, defaults);
  }
  function detail(token) {
    const p = getPlan(token);
    if (!p) {target().innerHTML=frame(head("TRAVEL GUIDE","여행지를 찾을 수 없어요")+href("filters","여행 조건 설정"));return;}
    const d=places[p.id];
    const guidance = [["문화와 기본 예절",d.manners],["현지 법규와 출입 안내",d.rules],["안전과 계절 유의사항",d.safety]];
    target().innerHTML=frame('<a class="fx-back" href="#compare">‹ 후보 비교</a><div class="fx-detail panel"><img class="fx-cover" src="assets/'+p.id+'.jpg" alt="'+d.name+' 풍경"><div class="fx-inner">'+head(d.country,d.name,p.title)+stats(p)+'<p class="fx-help">'+legal+'</p><h2>여행 전 알아두기</h2>'+guidance.map(([name,body],i)=>'<details '+(!i?'open':'')+'><summary>'+name+'</summary><p>'+body+'</p></details>').join("")+'<p class="fx-caution">법규 및 입국 관련 정보는 출발 전 공식 기관에서 다시 확인해 주세요.<br><a href="'+d.url+'" target="_blank" rel="noopener">'+d.source+'</a>'+ (p.id!=="jeju"?' · <a href="https://www.0404.go.kr/" target="_blank" rel="noopener">외교부 해외안전여행</a>':'')+'</p><div class="fx-actions"><button class="fx-button fx-primary primary" data-select>이 여행 선택하기</button><button class="fx-button fx-outline secondary" data-save aria-pressed="'+window.isSaved(p.id)+'">'+(window.isSaved(p.id)?"보관 해제":"보관함에 담기")+'</button></div><div class="fx-links">'+href("compare","다른 후보 비교하기",true)+href("filters","조건 수정하기",true)+'</div></div></div>');
    target().querySelector("[data-select]").onclick=()=>{write("selected",p);location.hash="summary";};
    target().querySelector("[data-save]").onclick=event=>{const on=window.toggleSave(p.id);event.currentTarget.textContent=on?"보관 해제":"보관함에 담기";event.currentTarget.setAttribute("aria-pressed",on);};
  }
  function library() {
    const ids = saved(), selected = read("selected",null);
    target().innerHTML = frame(head("SAVED TRIPS","내 여행 보관함","마음에 담아 둔 여행지와 최종 선택을 다시 만나보세요.")+
      (selected && keys.includes(selected.id)?'<div class="fx-toolbar"><span>나의 선택 · '+places[selected.id].name+'</span>'+href("summary","선택 요약 보기",true)+'</div>':'')+
      (ids.length?'<div class="fx-grid">'+ids.map(id=>'<article class="fx-card card"><img src="assets/'+id+'.jpg" alt="'+places[id].name+' 풍경"><div><p class="fx-meta">'+places[id].country+'</p><h2>'+places[id].name+'</h2><p>'+places[id].lead+'</p><div class="fx-actions">'+href("detail/"+id,"여행 정보 보기")+'<button type="button" class="fx-button fx-outline secondary" data-remove="'+id+'">보관 해제</button></div></div></article>').join("")+'</div>':'<section class="panel fx-empty"><h2>아직 보관한 여행지가 없어요</h2><p>탐색 화면이나 여행 정보에서 마음에 드는 여행지를 담아보세요.</p>'+href("home","여행지 탐색")+'</section>'));
    target().querySelectorAll("[data-remove]").forEach(button=>button.onclick=()=>{window.toggleSave(button.dataset.remove);library();});
  }
  function summary() {
    const p=read("selected",null);
    if (!p || !keys.includes(p.id)) {target().innerHTML=frame(head("YOUR TRIP","선택한 여행이 없어요")+href("compare","후보 비교하기"));return;}
    const d=places[p.id];
    target().innerHTML=frame(head("YOUR TRIP","여행을 선택했어요","이번 여행의 방향을 한눈에 확인하세요.")+'<article class="panel fx-detail"><img class="fx-cover" alt="'+d.name+' 풍경" src="assets/'+p.id+'.jpg"><div class="fx-inner"><p class="fx-meta">'+d.country+' · '+escape(p.origin)+' 출발</p><h2>'+d.name+'</h2><p>'+escape(p.title)+'</p>'+stats(p)+'<p class="fx-help">'+legal+'</p><div class="fx-actions">'+href("saved","내 보관함 보기")+href("compare","다른 후보 비교하기",true)+'</div></div></article>');
  }
  window.flow = (page,id) => {const views={filters,compare,detail,saved:library,summary}; if (!views[page]) return false;views[page](id);return true;};
})();
(() => {
  const style = document.createElement("style");
  style.textContent = `
.fx-wrap{max-width:1180px;margin:auto;padding:40px clamp(18px,4vw,60px) 90px;color:#192f3e;line-height:1.6}
.fx-wrap *{box-sizing:border-box}.fx-head{margin:0 0 26px;background:transparent;border:0}.fx-head .eyebrow,.fx-meta{color:#087a79;font-weight:700;letter-spacing:.12em;font-size:.78rem;margin:0 0 .5rem}.fx-head h1{font-size:clamp(1.8rem,4vw,2.65rem);line-height:1.18;letter-spacing:-.065em;margin:.25em 0}.fx-head>p:last-child,.fx-wrap .fx-help,.fx-note{color:#526774}.fx-head>p:last-child{margin:.6em 0}.fx-form,.fx-empty,.fx-detail,.fx-card{background:white;border:1px solid #dce6e9;border-radius:20px;box-shadow:0 7px 23px #2a54550b}.fx-form{max-width:790px;padding:clamp(20px,4vw,40px);display:grid;gap:22px}.fx-form fieldset{padding:0;border:0;min-width:0;margin:0}.fx-form legend,.fx-label{font-size:.98rem;font-weight:700}.fx-form legend{margin:0 0 8px}.fx-label{display:block}.fx-label small{font-weight:400;color:#667}.fx-label input,.fx-label select{display:block;margin-top:8px;width:100%;border:1px solid #c6d6dc;border-radius:10px;padding:12px;background:#f8fbfc;color:#182f3a;font:inherit;font-weight:500}.fx-options,.fx-actions,.fx-links{display:flex;flex-wrap:wrap;gap:9px}.fx-options label{position:relative;cursor:pointer}.fx-options input{position:absolute;opacity:0;width:1px;height:1px}.fx-options span{display:block;border:1px solid #ccdade;border-radius:30px;padding:7px 15px;line-height:1.5;font-size:.92rem}.fx-options input:checked+span{background:#eaf3ff;border-color:#1974cb;color:#0753a6;font-weight:700}.fx-options input:focus-visible+span{outline:3px solid #0265dc;outline-offset:2px}.fx-inputs{display:grid;grid-template-columns:1fr 1fr;gap:15px}.fx-form>.fx-help{margin:-16px 0 0;font-size:.85rem}.fx-error{color:#af2e26;margin:0}.fx-error:empty{display:none}.fx-wrap .fx-button{display:inline-flex;align-items:center;justify-content:center;min-height:42px;text-decoration:none;font:inherit;font-size:.94rem;font-weight:700;padding:9px 19px;border-radius:24px;cursor:pointer;white-space:normal}.fx-wrap .fx-primary{color:white;background:#0265dc;border:1px solid #0265dc}.fx-wrap .fx-outline{border:1px solid #c5d3db;background:white;color:#244757}.fx-button:hover{filter:brightness(.96)}.fx-toolbar{padding:12px 17px;margin:0 0 20px;display:flex;align-items:center;justify-content:space-between;gap:8px;background:#ecf5f8;border-radius:14px}.fx-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr));gap:19px}.fx-card{overflow:hidden;display:flex;flex-flow:column}.fx-card>img{width:100%;height:180px;object-fit:cover}.fx-card>div{padding:20px;display:flex;flex-direction:column;align-items:stretch;flex:1}.fx-card h2,.fx-inner h2{margin:.2em 0;font-size:1.45rem;letter-spacing:-.04em}.fx-card p{margin:5px 0 10px}.fx-card>div>.fx-button{margin-top:auto}.fx-wrap .fx-stats{display:grid;gap:9px;margin:15px 0;padding:15px 0;border-top:1px solid #deeaec;border-bottom:1px solid #deeaec}.fx-stats div{display:flex;justify-content:space-between;gap:.5em;line-height:1.4}.fx-stats dt{color:#526674;font-size:.88rem}.fx-stats dd{margin:0;text-align:right;font-size:.92rem;font-weight:600}.fx-reason,.fx-caution{border-radius:12px;padding:12px 14px;font-size:.91rem}.fx-reason{background:#e9f8ed;color:#255842}.fx-caution{background:#fff4d4;color:#674d23}.fx-reason strong,.fx-caution strong{display:block;margin-bottom:3px}.fx-caution a{color:inherit;text-decoration:underline}.fx-note,.fx-help{font-size:.86rem}.fx-empty{padding:40px;text-align:center}.fx-empty h2{font-size:1.25rem}.fx-detail{max-width:790px;overflow:hidden;padding:0}.fx-cover{width:100%;display:block;height:clamp(160px,28vw,290px);object-fit:cover}.fx-back{display:inline-block;margin:0 0 15px;color:#2c586b;text-decoration:none}.fx-inner{padding:clamp(20px,4vw,36px)}.fx-inner details{border-bottom:1px solid #dae5e8;padding:13px 0}.fx-inner summary{font-weight:700;cursor:pointer}.fx-inner details p{margin:7px 0;color:#425762}.fx-links{margin-top:13px}.fx-links .fx-outline{border:0;text-decoration:underline;padding:4px 0;margin-right:8px}.fx-inner .fx-actions{margin-top:18px}
@media(max-width:580px){.fx-wrap{padding:23px 16px 100px}.fx-grid{grid-template-columns:1fr}.fx-toolbar{align-items:flex-start;flex-direction:column}.fx-empty{padding:27px 18px}.fx-inputs{gap:10px}.fx-form{gap:18px}}
`;
  document.head.appendChild(style);
})();
