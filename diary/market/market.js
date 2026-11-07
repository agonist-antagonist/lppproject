(() => {
  'use strict';
  const D = window.PC32_DATA;
  const overlay = document.querySelector('#system-overlay');
  const $ = (selector, root = document) => root.querySelector(selector);
  const esc = window.LPPP.esc;
  const returnToSurface = () => { location.href = window.LPPP.localURL('diary/index.html'); };
  function infectedMarket(variant){
    const threshold=3+Math.floor(Math.random()*3);
    let cartCount=0,translated=false,exiting=false;
    const localized={
      arabic:["دخول خاص","الشحن بلا سجل","فتح السلعة المشفرة"],
      russian:["ЧАСТНЫЙ ДОСТУП","ДОСТАВКА БЕЗ ЗАПИСИ","ОТКРЫТЬ ЗАШИФРОВАННЫЙ ЛОТ"],
      hebrew:["גישה פרטית","משלוח ללא רישום","פתח פריט מוצפן"],
      chinese:["私人访问","无记录配送","打开加密商品"]
    }[variant.id];
    const categories=[...new Set(D.marketProducts.map(x=>x.category))];
    const cards=D.marketProducts.map((x,i)=>{
      const image=x.image?`<img src="${esc(x.image)}" alt="">`:`<span class="market-mosaic mosaic-${i%5}" aria-hidden="true"></span>`;
      const btc=x.btc||`0.00${String((i+17)*37).padStart(3,"0")}`;
      const vendor=x.vendor||["hidden_clerk","room_no_32","blank_record","southern_node"][i%4];
      const rating=x.rating||`${90+(i%9)}.${i%10}`;
      const origin=x.origin||["HK","DE","RU","NL","CN"][i%5];
      return `<article class="market-item" data-product="${esc(x.id)}"><button class="market-open" aria-label="${esc(x.title)}">${image}<span class="market-category">${esc(x.category)} / ${esc(x.id)}</span><b data-translation="${esc(x.translated)}">${esc(x.title)}</b><span class="market-vendor">vendor: <u>${esc(vendor)}</u> ★ ${esc(rating)}%</span><em>฿ ${esc(btc)} <small>(${esc(variant.currency)} ${esc(x.price)})</small></em><span class="market-route">ships from ${esc(origin)} / escrow available</span><small class="market-view">${esc(localized[2])}</small></button></article>`;
    }).join("");
    overlay.innerHTML=`<section class="infected-market silk-market palette-${esc(variant.palette)} bg-${esc(variant.background)}" lang="${esc(variant.lang)}" dir="ltr">
      <header class="silk-header"><div class="silk-brand"><i>PC32</i><span>THE UNLISTED ROAD<small>anonymous exchange archive</small></span></div><div class="silk-account"><span>welcome, visitor_820824</span><a>messages (0)</a><a>orders (0)</a><b>balance ฿ 0.000000</b></div></header>
      <nav class="silk-nav"><a>home</a><a>market</a><a>messages</a><a>orders</a><a>account</a><form><input aria-label="Search market" placeholder="Search listings"><button>Search</button></form></nav>
      <div class="silk-shell"><aside class="silk-sidebar"><h2>Categories</h2><button class="active" data-market-category="ALL">All items <span>${D.marketProducts.length}</span></button>${categories.map(c=>`<button data-market-category="${esc(c)}">${esc(c)} <span>${D.marketProducts.filter(x=>x.category===c).length}</span></button>`).join("")}<h2>Market information</h2><p>฿1 BTC = 88,912.40</p><p>Escrow is recommended.</p><p class="silk-warning">Always verify your personal phrase before continuing.</p></aside>
      <main class="silk-content"><div class="silk-breadcrumb">Home › Market › Featured listings</div><section class="silk-welcome"><h1>${esc(variant.title)}</h1><p>${esc(localized[0])} / ${esc(localized[1])}</p></section><div class="market-status">NODE ${esc(variant.id.toUpperCase())} / ${D.marketProducts.length} RESULTS / TRANSLATION PENDING</div><div class="black-market-grid">${cards}</div></main></div>
      <div class="scan-line"><i>OPTICAL TRANSLATION / ANALYSING TEXT</i></div><div class="market-detail" hidden></div><div class="damage-feed" aria-live="assertive"></div><div class="market-cart"><span>CART / <b>0</b> / ${threshold}</span><i>EMPTY MEMORY</i></div><div class="bottom-ad">NO PRESCRIPTION / NO BORDER / SAME-DAY SIGNAL</div></section>`;
    const market=$(".infected-market",overlay),detail=$(".market-detail",overlay),cart=$(".market-cart",overlay);
    const applyMarketFilter=(category="ALL",query="")=>{
      overlay.querySelectorAll("[data-product]").forEach(card=>{
        const product=D.marketProducts.find(x=>x.id===card.dataset.product);
        const categoryMatch=category==="ALL"||product.category===category;
        const queryMatch=!query||`${product.id} ${product.title} ${product.category} ${product.vendor||""}`.toLowerCase().includes(query.toLowerCase());
        card.hidden=!(categoryMatch&&queryMatch);
      });
      overlay.querySelectorAll("[data-market-category]").forEach(b=>b.classList.toggle("active",b.dataset.marketCategory===category));
    };
    overlay.querySelectorAll("[data-market-category]").forEach(b=>b.onclick=()=>applyMarketFilter(b.dataset.marketCategory,$(".silk-nav input",overlay).value.trim()));
    $(".silk-nav form",overlay).onsubmit=e=>{e.preventDefault();applyMarketFilter("ALL",$(".silk-nav input",overlay).value.trim())};
    function addDamage(product,source){
      cartCount++;
      market.classList.add(`damage-${Math.min(cartCount,5)}`);
      $("b",cart).textContent=cartCount;$("i",cart).textContent=`${product.id} / OBJECT RETAINED`;
      const flyer=source.cloneNode(true),r=source.getBoundingClientRect();
      flyer.className="cart-fly";flyer.style.left=`${r.left}px`;flyer.style.top=`${r.top}px`;flyer.style.width=`${r.width}px`;document.body.append(flyer);
      setTimeout(()=>flyer.remove(),900);
      const warnings=["Ваше устройство повреждено","جهازك تالف","המכשיר שלך ניזוק","您的设备已损坏","お使いのデバイスが破損しています"];
      const warning=document.createElement("div");warning.className="damage-warning";warning.textContent=warnings[(cartCount-1)%warnings.length];$(".damage-feed",overlay).append(warning);
      setTimeout(()=>warning.remove(),2400);
      if(cartCount>=threshold&&!exiting){exiting=true;setTimeout(collisionAsciiExit,650)}
    }
    overlay.querySelectorAll("[data-product]").forEach(card=>{
      card.querySelector("button").onclick=()=>{
        if(exiting)return;
        const product=D.marketProducts.find(x=>x.id===card.dataset.product);
        detail.hidden=false;
        detail.innerHTML=`<span>LOT ${esc(product.id)} / ${esc(product.category)}</span><b>${esc(translated?product.translated:product.title)}</b><p>${esc(product.detail)}</p><small>AUTOMATIC ACQUISITION IN 1.0 SEC</small>`;
        setTimeout(()=>{if(!detail.isConnected)return;detail.hidden=true;addDamage(product,card)},1000);
      };
    });
    setTimeout(()=>{
      const scan=$(".scan-line",overlay);if(!scan)return;
      scan.classList.add("active");
      setTimeout(()=>{
        if(!market.isConnected)return;
        translated=true;market.classList.add("translated");
        overlay.querySelectorAll("[data-translation]").forEach((x,i)=>{
          x.textContent=x.dataset.translation;
          x.style.fontSize=`${11+(i%5)*1.7}px`;x.style.letterSpacing=`${(-.4+(i%4)*.25)}px`;x.style.transform=`translate(${i%3-1}px,${i%2}px)`;
        });
        $(".market-status",overlay).textContent="光学翻訳が終了しました / 文脈の保証はありません";
        $(".bottom-ad",overlay).textContent="国境はありません・処方箋は不要・信号を本日中に発送します";
      },3000);
    },6000);
  }
  function collisionAsciiExit(){
    overlay.hidden=false;
    overlay.innerHTML=`<section class="ascii-collision"><video autoplay muted playsinline src="../../assets/loops/ascii-failure.mp4"></video><div class="collision-copy">COLLISION<small>CONNECTION CORRUPTED</small></div></section>`;
    const v=$("video",overlay),copy=$(".collision-copy",overlay);let flashes=0;
    const t=setInterval(()=>{copy.style.visibility=copy.style.visibility==="hidden"?"visible":"hidden";if(++flashes>=18){clearInterval(t);copy.remove()}},170);
    v.onended=returnToSurface;v.onerror=returnToSurface;
  }

  infectedMarket(D.infectionVariants[Math.floor(Math.random() * D.infectionVariants.length)]);
  window.addEventListener('pagehide', () => overlay.querySelectorAll('video').forEach(video => video.pause()));
})();
