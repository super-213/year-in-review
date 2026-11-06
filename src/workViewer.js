// Exported pages have their own viewport layout, independent of the editor's phone mockup.
export const viewerStyles = `
html,body{width:100%;height:100%;margin:0;overflow:hidden}
html{font-size:clamp(14px,4.5vw,20px)}
body{background:#0f172a;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
.work-viewer,.work-frame{position:relative;width:100%;max-width:none;height:100%;height:100dvh;margin:0;padding:0;border:0;border-radius:0;box-shadow:none;overflow:hidden}
.work-frame{display:flex;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;overscroll-behavior-x:contain;scrollbar-width:none;-webkit-overflow-scrolling:touch;touch-action:auto}
.work-frame::-webkit-scrollbar{display:none}
.work-slide{position:relative;flex:0 0 100%;width:100%;min-width:0;height:100%;overflow:hidden;color:#1e293b;scroll-snap-align:start;scroll-snap-stop:always}
.work-slide *{border-width:0!important;box-shadow:none!important}
.work-slide>div{position:relative;box-sizing:border-box;width:100%;height:100%;padding-top:max(2rem,calc(env(safe-area-inset-top) + 24px));padding-bottom:max(4rem,calc(env(safe-area-inset-bottom) + 56px));padding-left:max(1.5rem,env(safe-area-inset-left));padding-right:max(1.5rem,env(safe-area-inset-right))}
.work-slide [class~="pointer-events-none"][class~="absolute"][class*="bottom-"]{bottom:calc(env(safe-area-inset-bottom) + 12px);white-space:nowrap}
.work-slide[data-page-type="summary"]>div{padding-inline:clamp(1.5rem,12vw,12rem)}
.work-slide[data-page-type="summary"] p{max-width:40ch}
.work-progress{position:fixed;top:calc(env(safe-area-inset-top) + 10px);left:max(16px,env(safe-area-inset-left));right:max(16px,env(safe-area-inset-right));display:flex;gap:5px;z-index:50;pointer-events:none}
.work-progress span{height:3px;flex:1;border-radius:3px;background:#8886;box-shadow:0 0 1px #0008}
.work-progress span[data-active="true"]{background:white;box-shadow:0 0 2px #0008}
.work-nav{position:fixed;bottom:calc(env(safe-area-inset-bottom) + 22px);left:50%;transform:translateX(-50%);z-index:50;display:flex;align-items:center;gap:12px;color:white;font:12px/1.2 system-ui,sans-serif}
.work-nav button{width:44px;height:44px;border:1px solid #ffffff40;border-radius:50%;background:#0f172ab3;color:white;backdrop-filter:blur(12px);cursor:pointer;transition:background .15s,transform .15s;font-size:20px}
.work-nav button:hover{background:#0f172ae6;transform:scale(1.06)}
.work-nav button:active{transform:scale(.94)}
.work-nav button:focus-visible{outline:3px solid #818cf8;outline-offset:3px}
#page{padding:6px 10px;border-radius:20px;background:#0f172ab3;backdrop-filter:blur(12px);white-space:nowrap}
@media(min-aspect-ratio:1/1){
 html{font-size:clamp(12px,min(2vw,3.1dvh),26px)}
 .work-slide>div{padding-inline:clamp(2rem,8vw,10rem)}
 .work-slide[data-page-type="cover"]>div>div:not(.absolute){max-width:1100px;width:100%;margin-inline:auto}
 .work-slide[data-page-type="cover"] [class*="aspect-"]{aspect-ratio:auto;min-height:0}
 .work-slide[data-page-type="stats"] .grid{grid-template-columns:repeat(var(--stat-columns),minmax(0,1fr));grid-auto-rows:minmax(min-content,1fr);align-content:stretch;flex:1;min-height:0;overflow:auto}
 .work-slide[data-page-type="stats"] .grid>div{aspect-ratio:auto;min-width:0}
 .work-slide[data-page-type="highlights"] [class*="space-y-"]{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;align-content:center;overflow:auto}
 .work-slide[data-page-type="highlights"] [class*="space-y-"]>div{margin-top:0;margin-bottom:0;min-width:0}
 .work-slide[data-page-type="photos"] .grid{grid-template-columns:repeat(var(--photo-columns),minmax(0,1fr));grid-template-rows:repeat(var(--photo-rows),minmax(0,1fr))}
 .work-slide[data-page-type="photos"] .grid>div{grid-row:auto;min-height:0}
 .work-nav{left:0;right:0;top:50%;bottom:auto;transform:translateY(-50%);justify-content:space-between;padding:0 12px;pointer-events:none}
 .work-nav button{pointer-events:auto}
 #page{position:fixed;left:50%;top:calc(50dvh - 50px - env(safe-area-inset-bottom));transform:translateX(-50%)}
}
@media(any-pointer:coarse),(max-width:767px){
 .work-nav button{display:none}
 .work-nav{pointer-events:none}
}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}
`;

export const viewerScript = `(()=>{
 const frame=document.querySelector('.work-frame');
 const slides=[...document.querySelectorAll('.work-slide')];
 const progress=[...document.querySelectorAll('.work-progress span')];
 let current=0;
 let last=-1;
 const assets=JSON.parse(document.getElementById('year-in-review-work')?.textContent||'{}').assets||{};
 const loadImages=()=>{
   slides.forEach((slide,i)=>{
     if(Math.abs(i-current)>1)return;
     slide.querySelectorAll('img[data-work-image]').forEach(img=>{
       if(!img.hasAttribute('src')&&assets[img.dataset.workImage]){
         img.decoding='async';img.src=assets[img.dataset.workImage];
       }
     });
   });
 };
 const update=()=>{
   if(!frame.clientWidth)return;
   current=Math.max(0,Math.min(slides.length-1,Math.round(frame.scrollLeft/frame.clientWidth)));
   if(current===last)return;
   last=current;loadImages();
   document.getElementById('page').textContent=(current+1)+' / '+slides.length;
   progress.forEach((bar,i)=>bar.dataset.active=String(i<=current));
 };
 const show=n=>{
   const next=(n+slides.length)%slides.length;
   frame.scrollTo({left:next*frame.clientWidth,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
 };
 frame.addEventListener('scroll',update,{passive:true});
 document.getElementById('previous').onclick=()=>show(current-1);
 document.getElementById('next').onclick=()=>show(current+1);
 document.addEventListener('keydown',e=>{
   if(e.key==='ArrowRight'||e.key==='ArrowLeft'){
     e.preventDefault();show(current+(e.key==='ArrowRight'?1:-1));
   }
 });
 let width=frame.clientWidth;
 const resize=()=>{
   if(frame.clientWidth===width)return;
   width=frame.clientWidth;
   frame.scrollTo({left:current*width,behavior:'instant'});
 };
 if(typeof ResizeObserver!=='undefined')new ResizeObserver(resize).observe(frame);
 else window.addEventListener('resize',resize);
 update();
})();`;
