import $ from 'jquery';
import { calculatePriceBreakdown, calculateSpineThickness } from './lib/calculations';
import { INITIAL_STATE, DEFAULT_PRICE_CONFIG, SIZES, COVER_PAPERS, COVER_PAPER_WEIGHTS, INNER_PAPERS, BINDING_TYPES, COATING_TYPES, PRINTING_TYPES, ENDPAPER_TYPES, FOIL_TYPES } from './constants';

// --- Utilities ---
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// --- State ---
let user = null;

let currentView = 'landing';
let studioMode = 'spec';
let form = deepClone(INITIAL_STATE);
let orders = [];
let isAdminMode = false;
let galleryItems = [
  { id: 1, title: '수학의 정석: 미분과 적분', category: '수학', img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800' },
  { id: 2, title: 'Global English Reader', category: '영어', img: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800' },
  { id: 3, title: '창의 과학 실험 노트', category: '과학', img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800' },
  { id: 4, title: 'K-Language Final', category: '국어', img: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=800' }
];
let priceConfig = deepClone(DEFAULT_PRICE_CONFIG);
let noticeItems = [
  { 
    id: 1,
    type: 'Event', 
    title: '신규 가입 고객 첫 주문 10% 자동 할인 리워드', 
    date: '2024.04.01 - 04.30', 
    status: 'Ongoing',
    content: '프린탑 클라우드의 시작을 함께해주시는 파트너분들을 위해 첫 주문 시 10% 특별 할인 혜택을 드립니다.',
    color: 'text-brand-blue bg-soft-lavender'
  },
  { 
    id: 2,
    type: 'Notice', 
    title: '출판단지 물류 마감 시간 및 배송 일정 안내', 
    date: '2024.03.15', 
    status: 'Fixed',
    content: '고품질 인쇄를 위한 생산 일정 최적화에 따라 매일 오후 2시 주문 건까지 당일 생산 공정에 포함됩니다.',
    color: 'text-slate-600 bg-slate-50'
  }
];

// --- Persistence ---
function saveToStorage() {
  localStorage.setItem('print_quote_form', JSON.stringify(form));
  localStorage.setItem('print_quote_orders', JSON.stringify(orders));
  localStorage.setItem('print_quote_user', JSON.stringify(user));
  localStorage.setItem('print_quote_gallery', JSON.stringify(galleryItems));
  localStorage.setItem('print_quote_notices', JSON.stringify(noticeItems));
  localStorage.setItem('print_quote_prices', JSON.stringify(priceConfig));
}

function loadFromStorage() {
  const savedForm = localStorage.getItem('print_quote_form');
  if (savedForm) form = { ...deepClone(INITIAL_STATE), ...JSON.parse(savedForm) };

  const savedOrders = localStorage.getItem('print_quote_orders');
  if (savedOrders) {
    orders = JSON.parse(savedOrders);
  }

  const savedUser = localStorage.getItem('print_quote_user');
  if (savedUser) user = JSON.parse(savedUser);

  const savedGallery = localStorage.getItem('print_quote_gallery');
  if (savedGallery) galleryItems = JSON.parse(savedGallery);

  const savedNotices = localStorage.getItem('print_quote_notices');
  if (savedNotices) noticeItems = JSON.parse(savedNotices);

  const savedPrices = localStorage.getItem('print_quote_prices');
  if (savedPrices) priceConfig = JSON.parse(savedPrices);
}

// --- Views Rendering ---
const Views = {
  landing: () => `
    <div class="bg-apple-bg min-h-screen pb-20 animate-in fade-in duration-1000">
      <!-- Hero Section -->
      <section class="pt-32 pb-48 px-6 relative overflow-hidden bg-white">
        <div class="max-w-[1440px] mx-auto text-center space-y-12 relative z-10">
          <div class="inline-flex items-center gap-2 sticker-badge text-brand-blue border-brand-blue/30 bg-brand-blue/5 whitespace-nowrap">
            <span class="flex h-2 w-2 rounded-full bg-brand-blue animate-pulse"></span>
            <span>프린탑: 대한민국 No.1 교재 제작 솔루션</span>
          </div>
          
          <div class="space-y-8">
            <h1 class="text-4xl md:text-5xl font-black text-[#0F172A] tracking-[-0.04em] leading-[1.1] max-w-none mx-auto whitespace-nowrap">
              복잡한 교재 제작, <span class="text-brand-blue italic">이제껏 없던</span> 단순함으로.
            </h1>
            <p class="text-lg md:text-xl text-slate-400 max-w-none mx-auto font-medium leading-relaxed tracking-tight whitespace-nowrap">
              견적부터 디자인, 배송까지 인쇄의 전 과정을 프린탑 클라우드에서 한 번에 해결하세요.
            </p>
          </div>

          <div class="flex flex-col sm:flex-row justify-center gap-6 pt-10">
            <button id="btn-start-studio" class="px-12 py-6 bg-brand-blue text-white rounded-full font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_rgba(0,102,255,0.3)] cursor-pointer">
              무료 견적 시작하기
            </button>
            <button id="btn-goto-gallery" class="px-12 py-6 bg-white text-slate-900 border-2 border-slate-100 rounded-full font-black text-xl hover:bg-slate-50 transition-all cursor-pointer">
              제작 사례 보기
            </button>
          </div>
        </div>

        <!-- Floating Elements (Image Reference Style) -->
        <div class="absolute top-20 left-[10%] w-32 h-32 bg-soft-lavender rounded-[40px] rotate-12 opacity-50 blur-2xl hidden xl:block"></div>
        <div class="absolute bottom-20 right-[15%] w-48 h-48 bg-soft-pink rounded-full opacity-50 blur-3xl hidden xl:block"></div>
      </section>

      <!-- Main Bento Grid Content -->
      <div class="max-w-[1440px] mx-auto px-6 lg:px-8 -mt-24 space-y-24 relative z-20">
        <div class="bento-grid">
          <!-- 1초 견적 (Instant Quote) Calculator Card -->
          <div id="calculator-card" class="bento-card col-span-12 lg:col-span-9 p-10 md:p-14 flex flex-col md:flex-row gap-12 md:gap-16 bg-[#0F172A] text-white border border-white/5 shadow-2xl relative overflow-hidden group">
            <!-- Decorative Glow -->
            <div class="absolute -top-24 -left-24 w-64 h-64 bg-brand-blue/20 rounded-full blur-[100px] group-hover:bg-brand-blue/30 transition-all duration-700"></div>
            
            <div class="md:w-1/2 space-y-10 relative z-10">
              <div class="space-y-6">
                <div class="flex items-center gap-3">
                   <div class="w-10 h-10 rounded-2xl bg-brand-blue flex items-center justify-center text-white shadow-lg shadow-brand-blue/20">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 2v10l9 2-9 2v10l-9-2 9-2z"/></svg>
                   </div>
                   <span class="text-[13px] font-black text-brand-blue uppercase tracking-[0.2em]">1초 견적</span>
                </div>
                <h2 class="text-2xl md:text-3xl font-black tracking-tight leading-[1.2] whitespace-nowrap">비용 고민은 단 <span class="text-brand-blue">1초</span>면 충분합니다.</h2>
                <p class="text-slate-400 font-medium text-base leading-relaxed tracking-tight whitespace-nowrap">페이지 수와 부수만 입력하면 인쇄 견적이 즉시 계산됩니다.</p>
              </div>
              
              <div class="space-y-6">
                <div class="space-y-2">
                  <label class="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-[0.15em] whitespace-nowrap">내지 총 페이지 수</label>
                  <div class="relative group">
                    <input type="number" id="landing-pages" value="200" class="w-full h-16 px-6 rounded-2xl bg-slate-800/40 border border-white/10 focus:bg-white focus:text-slate-900 outline-none text-2xl font-black transition-all text-white placeholder:text-white/20" />
                    <span class="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-500 group-focus-within:text-slate-400 text-xs tracking-widest pointer-events-none">PAGES</span>
                  </div>
                </div>
                <div class="space-y-2">
                  <label class="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-[0.15em]">주문 부수</label>
                  <div class="relative group">
                    <input type="number" id="landing-qty" value="100" class="w-full h-16 px-6 rounded-2xl bg-slate-800/40 border border-white/10 focus:bg-white focus:text-slate-900 outline-none text-2xl font-black transition-all text-white placeholder:text-white/20" />
                    <span class="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-500 group-focus-within:text-slate-400 text-xs tracking-widest pointer-events-none">부</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="md:w-1/2 bg-white rounded-[2.5rem] p-10 md:p-12 flex flex-col justify-between shadow-2xl relative z-10 border border-slate-100">
              <div class="space-y-10 text-slate-900">
                <div class="flex justify-between items-start">
                  <div class="space-y-2">
                    <span class="sticker-badge text-brand-blue border-brand-blue/20 bg-brand-blue/5">인쇄 모드</span>
                    <h3 class="text-3xl font-black text-slate-900 tracking-tight">컬러 인쇄</h3>
                    <p id="landing-color-unit" class="text-sm font-bold text-slate-400">권당 0원</p>
                  </div>
                  <div id="landing-color-price" class="text-4xl font-black tracking-[-0.04em] text-slate-900">0<span class="text-lg font-bold ml-1 text-slate-300">원</span></div>
                </div>
                
                <div class="h-px bg-slate-100/80"></div>

                <div class="flex justify-between items-start">
                  <div class="space-y-1">
                    <h3 class="text-2xl font-bold text-slate-300 tracking-tight">흑백 인쇄</h3>
                    <p id="landing-mono-unit" class="text-xs font-bold text-slate-300">권당 0원</p>
                  </div>
                  <div id="landing-mono-price" class="text-3xl font-black text-slate-200 tracking-[-0.04em]">0<span class="text-sm font-bold ml-1 text-slate-300">원</span></div>
                </div>
              </div>

              <div class="mt-14 space-y-4">
                <button id="btn-goto-studio" class="w-full py-6 bg-brand-blue text-white rounded-[1.5rem] font-black text-xl hover:shadow-[0_20px_40px_rgba(0,102,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 group">
                  지금 바로 주문하기
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="group-hover:translate-x-1 transition-transform"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
                <p class="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">표준 견적 / 최종 금액은 변동될 수 있습니다</p>
              </div>
            </div>
          </div>

          <!-- Feature Card 1 -->
          <div class="bento-card col-span-12 lg:col-span-3 p-12 flex flex-col justify-between bg-soft-lavender border-none group">
            <div class="space-y-8">
              <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-brand-blue"><path d="M12 2v10l9 2-9 2v10l-9-2 9-2z"/></svg>
              </div>
              <div class="space-y-4">
              <h2 class="text-4xl font-black tracking-tight leading-[1.1] text-slate-900">원스톱 주문</h2>
                <p class="text-slate-500 font-medium">편집기부터 자동 견적까지,<br/>모두 한 곳에서 처리하세요.</p>
              </div>
            </div>
            <div class="mt-8">
               <span class="text-[11px] font-black text-brand-blue uppercase tracking-widest underline decoration-2 underline-offset-4 cursor-pointer">자세히 보기</span>
            </div>
          </div>
        </div>

        <div class="bento-grid">
           <!-- Feature Card 2 -->
           <div class="bento-card col-span-12 md:col-span-6 lg:col-span-4 p-12 bg-white flex flex-col gap-8">
              <div class="w-16 h-16 bg-soft-mint rounded-2xl flex items-center justify-center">
                 <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2D7B6D" stroke-width="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              </div>
              <div class="space-y-2">
                 <h3 class="text-2xl font-black text-slate-900">고성능 인쇄 시스템</h3>
                 <p class="text-slate-500 font-medium">파주 출판단지 전문 공정을 통해 <br/> 압도적인 퀄리티를 보장합니다.</p>
              </div>
           </div>

           <!-- Feature Card 3 -->
           <div class="bento-card col-span-12 md:col-span-6 lg:col-span-8 p-12 bg-soft-pink border-none relative overflow-hidden group">
              <div class="max-w-md space-y-6 relative z-10">
                 <h3 class="text-4xl font-black text-slate-900 tracking-tight leading-none">학원 교재 제작의 <br/> <span class="text-brand-orange">뉴 스탠다드.</span></h3>
                 <p class="text-slate-600 font-medium text-lg">이미 2,500개 이상의 학원들이 프린탑의 <br/> 스마트 공정을 통해 교재를 생산하고 있습니다.</p>
                 <div class="flex gap-4 pt-4">
                    <div class="bg-white/50 backdrop-blur px-6 py-3 rounded-2xl border border-white">
                       <span class="block text-2xl font-black text-slate-900">98%</span>
                       <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">만족도</span>
                    </div>
                    <div class="bg-white/50 backdrop-blur px-6 py-3 rounded-2xl border border-white">
                       <span class="block text-2xl font-black text-slate-900">50K+</span>
                       <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">누적 프로젝트</span>
                    </div>
                 </div>
              </div>
              <!-- Decorative Circle -->
              <div class="absolute -right-20 -bottom-20 w-80 h-80 bg-brand-orange/10 rounded-full blur-3xl group-hover:scale-110 transition-transform"></div>
           </div>
        </div>
      </div>
    </div>
  `,
  gallery: () => `
    <div class="bg-white min-h-screen pb-32 animate-in fade-in duration-700">
      <div class="max-w-[1440px] mx-auto px-6 pt-32 space-y-16">
        <div class="space-y-4">
          <div class="sticker-badge text-brand-blue border-brand-blue/20 bg-brand-blue/5">작업 사례</div>
          <h1 class="text-3xl md:text-4xl font-black tracking-tighter text-slate-900 leading-none">우리의 작업물</h1>
          <p class="text-xl text-slate-400 font-medium max-w-2xl">프린탑의 기술력으로 탄생한 프리미엄 학원 교재들입니다.</p>
        </div>

        <div class="flex flex-wrap gap-3">
          <button class="px-6 py-2 bg-brand-blue text-white rounded-full font-black text-xs uppercase tracking-widest shadow-xl">전체 보기</button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          ${galleryItems.map(item => `
            <div class="group cursor-pointer space-y-6">
              <div class="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-slate-100 relative shadow-2xl transition-transform duration-700 group-hover:-translate-y-2">
                 <img src="${item.img}" class="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
                 <div class="absolute top-6 left-6">
                    <span class="sticker-badge bg-white/90 backdrop-blur-md border-none text-slate-900">${item.category}</span>
                 </div>
              </div>
              <div class="px-2 space-y-1">
                <h3 class="font-black text-2xl text-slate-900 group-hover:text-brand-blue transition-colors">${item.title}</h3>
                <p class="text-slate-400 font-bold text-sm tracking-tight">Premium Matte Coat / Snow 250g</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `,
  studio: () => {
    if (studioMode === 'spec') {
      const isSimple = form.studioSubMode === 'simple';
      
      return `
        <div class="bg-[#F4F7FA] min-h-screen pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div class="max-w-[1000px] mx-auto px-6 pt-32 space-y-10 focus-mode-container">
            
            <!-- Studio Header & Subview Selector -->
            <div class="flex flex-col md:flex-row items-center justify-between gap-6 mb-4">
               <div class="space-y-1">
                  <h1 class="text-3xl font-black text-slate-900 tracking-tight">인쇄 주문하기</h1>
                  <p class="text-sm font-medium text-slate-400">원하시는 사양을 선택하여 실시간 견적을 확인하세요.</p>
               </div>
               <div class="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
                  <button id="btn-studio-tab-simple" class="px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${isSimple ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'text-slate-400 hover:bg-slate-50'}">간편주문</button>
                  <button id="btn-studio-tab-detailed" class="px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${!isSimple ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'text-slate-400 hover:bg-slate-50'}">상세주문</button>
               </div>
            </div>

            ${isSimple ? `
               <!-- Simple Mode View -->
               <div class="bg-white rounded-[2.5rem] p-12 shadow-sm border border-slate-100 space-y-12 animate-in fade-in slide-in-from-top-2 duration-500">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
                     <div class="space-y-4">
                        <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">주문 도서 제목</label>
                        <input type="text" id="order-name-simple" value="${form.orderName}" placeholder="도서 제목을 입력해주세요" class="w-full h-16 px-8 rounded-2xl bg-slate-50 border-none transition-all font-bold text-lg" />
                     </div>
                     <div class="space-y-4">
                        <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">제작 부수</label>
                        <div class="relative">
                           <input type="number" id="order-qty-simple" value="${form.quantity}" class="w-full h-16 px-8 rounded-2xl bg-slate-50 border-none font-black text-3xl" />
                           <span class="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 font-bold">부</span>
                        </div>
                     </div>
                     <div class="space-y-4">
                        <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">내지 총 페이지</label>
                        <div class="relative">
                           <input type="number" id="order-pages-simple" value="${form.innerSections[0].pages}" class="w-full h-16 px-8 rounded-2xl bg-slate-50 border-none font-black text-3xl" />
                           <span class="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 font-bold">P</span>
                        </div>
                     </div>
                     <div class="space-y-4">
                        <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">판형 (규격)</label>
                        <select id="order-size-simple" class="w-full h-16 px-8 rounded-2xl bg-slate-50 border-none font-bold text-lg cursor-pointer">
                           ${SIZES.map(s => `<option value="${s}" ${form.size === s ? 'selected' : ''}>${s}</option>`).join('')}
                        </select>
                     </div>
                  </div>

                  <!-- File Upload (Simple Mode) -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                     <div class="space-y-4">
                        <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">표지 데이터 업로드</label>
                        <div class="flex items-center gap-4">
                           <label class="flex-1">
                              <div class="w-full h-16 px-8 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 hover:border-brand-blue hover:bg-brand-blue/5 transition-all flex items-center justify-center gap-3 cursor-pointer group">
                                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-slate-300 group-hover:text-brand-blue"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                 <span class="font-bold text-slate-400 group-hover:text-brand-blue">${form.files.cover || '파일 선택 혹은 드래그'}</span>
                                 <input type="file" id="upload-cover-simple" class="hidden" accept=".pdf,.ai,.zip,.hwp" />
                              </div>
                           </label>
                        </div>
                     </div>
                     <div class="space-y-4">
                        <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">본문 데이터 업로드</label>
                        <div class="flex items-center gap-4">
                           <label class="flex-1">
                              <div class="w-full h-16 px-8 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 hover:border-brand-blue hover:bg-brand-blue/5 transition-all flex items-center justify-center gap-3 cursor-pointer group">
                                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-slate-300 group-hover:text-brand-blue"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                 <span class="font-bold text-slate-400 group-hover:text-brand-blue">${form.files.body || '파일 선택 혹은 드래그'}</span>
                                 <input type="file" id="upload-body-simple" class="hidden" accept=".pdf,.ai,.zip,.hwp" />
                              </div>
                           </label>
                        </div>
                     </div>
                  </div>
                  
                  <div class="p-8 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between gap-8">
                     <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-blue shadow-sm">
                           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </div>
                        <div class="space-y-1">
                           <h4 class="font-black text-slate-900 leading-tight">빠르고 쉬운 표지 디자인</h4>
                           <p class="text-[12px] font-medium text-slate-400 leading-tight">편집기를 통해 전문가 스타일의 표지를 직접 만들어보세요.</p>
                        </div>
                     </div>
                     <button onclick="switchStudioMode('editor')" class="px-8 py-4 bg-white text-slate-900 rounded-xl font-black text-sm border border-slate-100 shadow-sm hover:bg-slate-100 transition-all">에디터 실행</button>
                  </div>

                  <!-- Client Info Section (Simple Mode) -->
                  <div class="space-y-8 pt-4">
                     <div class="flex items-center gap-3 text-brand-blue">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        <h3 class="text-xl font-black tracking-tight">주문자 및 배송 정보</h3>
                     </div>
                     <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="space-y-3">
                           <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest">주문자명</label>
                           <input type="text" id="client-name-simple" value="${form.clientInfo.name}" class="w-full h-14 px-6 rounded-xl bg-slate-50 border-none font-bold" />
                        </div>
                        <div class="space-y-3">
                           <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest">연락처</label>
                           <input type="text" id="client-phone-simple" value="${form.clientInfo.phone}" class="w-full h-14 px-6 rounded-xl bg-slate-50 border-none font-bold" />
                        </div>
                        <div class="md:col-span-2 space-y-3">
                           <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest">배송지 주소</label>
                           <input type="text" id="delivery-address-simple" value="${form.deliveryInfo.address}" class="w-full h-14 px-6 rounded-xl bg-slate-50 border-none font-bold" />
                        </div>
                        <div class="md:col-span-2 space-y-3">
                           <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest">배송 방법</label>
                           <div class="flex gap-3">
                              ${['택배', '퀵서비스', '방문수령'].map(m => `
                                 <button class="delivery-method-btn flex-1 py-3.5 rounded-xl border-2 font-bold transition-all ${form.deliveryInfo.method === m ? 'border-brand-blue bg-brand-blue/5 text-brand-blue' : 'border-slate-50 text-slate-300'}" data-val="${m}">${m}</button>
                              `).join('')}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            ` : `
               <!-- Detailed Mode View -->
               <div class="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <!-- 1. 기본 정보 Section -->
                  <div class="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 space-y-8" id="section-basic">
                     <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3 text-brand-blue">
                           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                           <h3 class="text-xl font-black tracking-tight">기본 정보</h3>
                        </div>
                        <button onclick="switchStudioMode('editor')" class="px-6 py-2.5 bg-slate-50 text-brand-blue rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all flex items-center gap-2">
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                           에디터로 이동하기
                        </button>
                     </div>
                     
                     <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="space-y-3">
                           <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">주문명 (도서 제목)</label>
                           <input type="text" id="order-name" value="${form.orderName}" placeholder="도서 제목을 입력하세요" class="w-full h-14 px-6 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-brand-blue transition-all font-bold" />
                        </div>
                        <div class="space-y-3">
                           <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">규격 (판형)</label>
                           <select id="order-size" class="w-full h-14 px-6 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-brand-blue font-bold cursor-pointer">
                              ${SIZES.map(s => `<option value="${s}" ${form.size === s ? 'selected' : ''}>${s}</option>`).join('')}
                           </select>
                        </div>
                        <div class="space-y-3">
                           <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">제작 부수</label>
                           <div class="relative">
                              <input type="number" id="order-qty" value="${form.quantity}" class="w-full h-14 px-6 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-brand-blue font-black text-xl" />
                              <span class="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-bold">부</span>
                           </div>
                        </div>
                        <div class="space-y-3">
                           <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">제본 유형</label>
                           <select id="order-binding" class="w-full h-14 px-6 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-brand-blue font-bold cursor-pointer">
                              ${BINDING_TYPES.map(b => `<option value="${b}" ${form.binding === b ? 'selected' : ''}>${b}</option>`).join('')}
                           </select>
                        </div>
                     </div>
                  </div>

                  <!-- 2. 표지 사양 Section -->
                  <div class="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 space-y-8" id="section-cover">
                     <div class="flex items-center gap-3 text-brand-blue">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/></svg>
                        <h3 class="text-xl font-black tracking-tight">표지 사양</h3>
                     </div>
                     
                     <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="space-y-3">
                           <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest">용지명</label>
                           <select id="cover-paper" class="w-full h-14 px-6 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-brand-blue font-bold">
                              ${COVER_PAPERS.map(p => `<option value="${p}" ${form.cover.paper === p ? 'selected' : ''}>${p}</option>`).join('')}
                           </select>
                        </div>
                        <div class="space-y-3">
                           <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest">인쇄도수</label>
                           <select id="cover-printing" class="w-full h-14 px-6 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-brand-blue font-bold">
                              <option value="단면 4도">단면 4도</option>
                              <option value="양면 4도">양면 4도</option>
                              <option value="단면 1도">단면 1도</option>
                           </select>
                        </div>
                        <div class="space-y-3">
                           <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest">코팅</label>
                           <select id="cover-coating" class="w-full h-14 px-6 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-brand-blue font-bold">
                              ${COATING_TYPES.map(c => `<option value="${c}" ${form.cover.coating === c ? 'selected' : ''}>${c}</option>`).join('')}
                           </select>
                        </div>
                     </div>
                  </div>

                  <!-- 3. 내지 사양 Section -->
                  <div class="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 space-y-8" id="section-inner">
                     <div class="flex items-center gap-3 text-brand-blue">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a4 4 0 0 0-4-4H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a4 4 0 0 1 4-4h6z"/></svg>
                        <h3 class="text-xl font-black tracking-tight">내지 사양</h3>
                     </div>
                     
                     ${form.innerSections.map((s, i) => `
                        <div class="p-8 bg-slate-50/50 rounded-2xl border border-slate-50 grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                           <div class="space-y-2">
                              <label class="text-[10px] font-black text-slate-400 uppercase">용지</label>
                              <select class="inner-paper h-12 w-full px-4 rounded-lg bg-white border-none font-bold text-sm" data-index="${i}">
                                 ${INNER_PAPERS.map(p => `<option value="${p}" ${s.paper === p ? 'selected' : ''}>${p}</option>`).join('')}
                              </select>
                           </div>
                           <div class="space-y-2">
                              <label class="text-[10px] font-black text-slate-400 uppercase">도수</label>
                              <select class="inner-printing h-12 w-full px-4 rounded-lg bg-white border-none font-bold text-sm" data-index="${i}">
                                 ${PRINTING_TYPES.map(p => `<option value="${p}" ${s.printing === p ? 'selected' : ''}>${p}</option>`).join('')}
                              </select>
                           </div>
                           <div class="space-y-2">
                              <label class="text-[10px] font-black text-slate-400 uppercase">페이지</label>
                              <input type="number" class="inner-pages h-12 w-full px-4 rounded-lg bg-white border-none font-black text-lg" data-index="${i}" value="${s.pages}" />
                           </div>
                        </div>
                     `).join('')}
                  </div>

                  <!-- 4. 추가 가공 Section -->
                  <div class="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 space-y-8" id="section-extra">
                     <div class="flex items-center gap-3 text-brand-blue">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                        <h3 class="text-xl font-black tracking-tight">추가 가공</h3>
                     </div>
                     <div class="flex flex-wrap gap-4">
                        <button class="opt-btn px-8 py-4 rounded-2xl border-2 border-slate-100 font-bold transition-all ${form.cover.hasFlaps ? 'active border-brand-blue bg-brand-blue/5 text-brand-blue' : 'text-slate-300'}" data-opt="flaps">표지 날개</button>
                        <button class="opt-btn px-8 py-4 rounded-2xl border-2 border-slate-100 font-bold transition-all ${form.postProcessing.epoxy ? 'active border-brand-blue bg-brand-blue/5 text-brand-blue' : 'text-slate-300'}" data-opt="epoxy">부분 에폭시</button>
                     </div>
                  </div>

                  <!-- 5. 주문자 정보 Section -->
                  <div class="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 space-y-8" id="section-client">
                     <div class="flex items-center gap-3 text-brand-blue">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        <h3 class="text-xl font-black tracking-tight">주문자 정보</h3>
                     </div>
                     <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="space-y-3">
                           <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest">주문자명</label>
                           <input type="text" id="client-name" value="${form.clientInfo.name}" class="w-full h-14 px-6 rounded-xl bg-slate-50 border-none font-bold" />
                        </div>
                        <div class="space-y-3">
                           <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest">연락처</label>
                           <input type="text" id="client-phone" value="${form.clientInfo.phone}" class="w-full h-14 px-6 rounded-xl bg-slate-50 border-none font-bold" />
                        </div>
                     </div>
                  </div>

                  <!-- 6. 배송 정보 Section -->
                  <div class="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 space-y-8" id="section-delivery">
                     <div class="flex items-center gap-3 text-brand-blue">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                        <h3 class="text-xl font-black tracking-tight">배송 정보</h3>
                     </div>
                     <div class="space-y-8">
                        <div class="flex gap-4">
                           ${['택배', '퀵서비스', '방문수령'].map(m => `
                              <button class="delivery-method-btn flex-1 py-4 rounded-xl border-2 font-bold transition-all ${form.deliveryInfo.method === m ? 'border-brand-blue bg-brand-blue/5 text-brand-blue' : 'border-slate-50 text-slate-300'}" data-val="${m}">${m}</button>
                           `).join('')}
                        </div>
                        <div class="space-y-3">
                           <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest">배송지 주소</label>
                           <input type="text" id="delivery-address" value="${form.deliveryInfo.address}" class="w-full h-14 px-6 rounded-xl bg-slate-50 border-none font-bold" />
                        </div>
                     </div>
                  </div>

                  <!-- 7. 데이터 업로드 Section -->
                  <div class="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 space-y-8" id="section-upload">
                     <div class="flex items-center gap-3 text-brand-blue">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        <h3 class="text-xl font-black tracking-tight">데이터 업로드</h3>
                     </div>
                     <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="space-y-4">
                           <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest">표지 데이터</label>
                           <label class="block">
                              <div class="w-full h-32 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 hover:border-brand-blue hover:bg-brand-blue/5 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group">
                                 <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-slate-300 group-hover:text-brand-blue"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                 <span class="font-bold text-slate-400 group-hover:text-brand-blue text-sm">${form.files.cover || '표지 파일을 업로드 하세요'}</span>
                                 <input type="file" id="upload-cover-detailed" class="hidden" accept=".pdf,.ai,.zip,.hwp" />
                              </div>
                           </label>
                        </div>
                        <div class="space-y-4">
                           <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest">본문 데이터</label>
                           <label class="block">
                              <div class="w-full h-32 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 hover:border-brand-blue hover:bg-brand-blue/5 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group">
                                 <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-slate-300 group-hover:text-brand-blue"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                 <span class="font-bold text-slate-400 group-hover:text-brand-blue text-sm">${form.files.body || '본문 파일을 업로드 하세요'}</span>
                                 <input type="file" id="upload-body-detailed" class="hidden" accept=".pdf,.ai,.zip,.hwp" />
                              </div>
                           </label>
                        </div>
                     </div>
                  </div>
               </div>
            `}

            <!-- Price Summary Floating Footer -->
            <div class="sticky bottom-8 left-0 right-0 z-30">
               <div class="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 text-white">
                  <div class="flex items-center gap-10">
                     <div class="space-y-1">
                        <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">총 예상 견적</span>
                        <div id="quote-total-price" class="text-3xl font-black tracking-tighter">0<span class="text-sm font-bold ml-1 text-slate-500">원</span></div>
                     </div>
                     <div class="h-10 w-px bg-white/10 hidden md:block"></div>
                     <div class="space-y-1">
                        <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">배송비 (예상)</span>
                        <div id="quote-shipping-price" class="text-xl font-black">0원</div>
                     </div>
                     <div class="h-10 w-px bg-white/10 hidden md:block"></div>
                     <div class="space-y-1">
                        <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">권당 단가</span>
                        <div id="quote-unit-price" class="text-xl font-black">0원</div>
                     </div>
                  </div>
                  <button id="btn-submit-order" class="px-12 py-5 bg-brand-blue text-white rounded-2xl font-black text-lg hover:scale-105 active:scale-95 transition-all w-full md:w-auto shadow-[0_10px_30px_rgba(0,102,255,0.3)] font-black">주문 완료하기</button>
               </div>
            </div>

          </div>
        </div>
      `;
    } else {
      return `
        <div class="fixed inset-0 top-[72px] bg-[#222] z-40 flex flex-col items-center justify-center text-white">
           <h2 class="text-4xl font-black mb-4">Cloud Editor</h2>
           <p class="text-white/40 mb-8">디자인 편집기 로딩 중...</p>
           <button onclick="switchStudioMode('spec')" class="px-8 py-4 bg-white/10 rounded-xl font-bold">편집 종료</button>
        </div>
      `;
    }
  },
  admin: () => `
    <div class="bg-[#F8F9FB] min-h-screen flex animate-in fade-in duration-500">
      <!-- Admin Sidebar -->
      <aside class="w-72 bg-white border-r border-slate-100 flex flex-col py-10 px-6 fixed h-full">
         <div class="space-y-2 mb-12 px-4">
            <div class="sticker-badge text-brand-orange border-brand-orange/20 bg-brand-orange/5">관리자 대시보드</div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">Printop Admin</h1>
         </div>
         
         <nav class="space-y-2">
            ${[
              { id: 'orders', label: '주문관리', icon: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' },
              { id: 'shipping', label: '출고관리', icon: 'M5 11l7 7 7-7' },
              { id: 'sales', label: '매출관리', icon: 'M12 2v20M5 12h14' },
              { id: 'clients', label: '거래처관리', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' },
              { id: 'prices', label: '단가 관리', icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' }
            ].map(item => `
               <button class="admin-nav-btn w-full p-4 rounded-xl flex items-center gap-4 font-black text-xs uppercase tracking-widest transition-all ${item.id === 'orders' ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'text-slate-400 hover:bg-slate-50'}" data-tab="${item.id}">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="${item.icon}"/></svg>
                  ${item.label}
               </button>
            `).join('')}
         </nav>
         
         <div class="h-px bg-slate-100 my-8"></div>
         <div class="px-4 mb-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">콘텐츠 관리</div>
         <nav class="space-y-2">
            <button class="admin-nav-btn w-full p-4 rounded-xl flex items-center gap-4 font-black text-xs uppercase tracking-widest transition-all text-slate-400 hover:bg-slate-50" data-tab="manage-gallery">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
               작업 사례 관리
            </button>
            <button class="admin-nav-btn w-full p-4 rounded-xl flex items-center gap-4 font-black text-xs uppercase tracking-widest transition-all text-slate-400 hover:bg-slate-50" data-tab="manage-notices">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
               공지사항 관리
            </button>
         </nav>
      </aside>

      <!-- Admin Main Content -->
      <main class="ml-72 flex-1 p-16">
         <div id="admin-view-container" class="space-y-12">
            <!-- Default Content (Orders) -->
            <div class="space-y-8">
               <div class="flex items-center justify-between">
                  <h2 class="text-4xl font-black text-slate-900 tracking-tight">전체 주문 현황</h2>
               </div>
               
               <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                  <table class="w-full text-left">
                     <thead class="bg-slate-50 border-b border-slate-100">
                        <tr>
                           <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">주문번호</th>
                           <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">도서명</th>
                           <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">수량</th>
                           <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">상태</th>
                        </tr>
                     </thead>
                     <tbody class="divide-y divide-slate-50">
                        ${orders.length > 0 ? orders.map(o => `
                           <tr class="hover:bg-slate-50/50 transition-all">
                              <td class="px-8 py-6 font-bold text-slate-400 text-xs">${o.id.slice(0, 8)}</td>
                              <td class="px-8 py-6 font-black text-slate-900">${o.orderName}</td>
                              <td class="px-8 py-6 font-black text-slate-900">${o.quantity}부</td>
                              <td class="px-8 py-6">
                                 <span class="px-3 py-1 rounded-full bg-blue-50 text-brand-blue text-[10px] font-black uppercase">${o.status}</span>
                              </td>
                           </tr>
                        `).join('') : `
                           <tr>
                              <td colspan="4" class="px-8 py-20 text-center text-slate-300 font-bold italic">등록된 주문이 없습니다.</td>
                           </tr>
                        `}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>
      </main>
    </div>
  `,
  auth: () => `
    <div class="max-w-[1240px] mx-auto px-6 py-32 flex items-center justify-center animate-in fade-in zoom-in-95 duration-500">
      <div class="w-full max-w-md space-y-12 text-center">
        <div class="space-y-4">
          <div class="sticker-badge text-brand-blue border-brand-blue/20 bg-brand-blue/5 mx-auto">Login</div>
          <h1 class="text-5xl font-black tracking-tighter text-slate-900">반가워요!</h1>
          <p class="text-slate-400 font-medium italic">당신의 인쇄 경험을 혁신할 시간입니다.</p>
        </div>

        <div class="bg-white rounded-[2.5rem] p-12 space-y-8 shadow-2xl border border-slate-50">
          <div class="space-y-4">
             <button id="btn-google-login" class="w-full py-5 bg-[#111] text-white rounded-2xl font-black text-lg flex items-center justify-center gap-4 hover:bg-black transition-all cursor-pointer shadow-xl">
                <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                구글로 로그인
             </button>
             <button class="w-full py-5 bg-[#FEE500] text-[#3c1e1e] rounded-2xl font-black text-lg flex items-center justify-center gap-4 hover:opacity-90 transition-all cursor-pointer">
                카카오로 시작하기
             </button>
          </div>
          
          <div class="relative py-2">
             <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-50"></div></div>
             <div class="relative flex justify-center text-[10px] uppercase tracking-widest font-black"><span class="bg-white px-4 text-slate-300">또는 이메일로 로그인</span></div>
          </div>

          <div class="space-y-4">
              <input type="email" placeholder="이메일 주소" class="w-full h-14 px-6 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-brand-blue outline-none font-bold text-center" />
              <button class="w-full py-5 bg-white text-slate-900 border-2 border-slate-100 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all">계속하기</button>
          </div>
        </div>

        <p class="text-slate-400 text-[11px] font-bold">
          프린탑 가입은 <a href="#" class="underline text-slate-600">개인정보처리방침</a> 및 <a href="#" class="underline text-slate-600">이용약관</a> 동의를 의미합니다.
        </p>
      </div>
    </div>
  `,
  notice: () => `
    <div class="bg-white min-h-screen pb-32 animate-in fade-in duration-700">
      <div class="max-w-[1200px] mx-auto px-6 pt-32 space-y-16">
        <div class="space-y-6">
          <div class="sticker-badge text-brand-orange border-brand-orange/20 bg-brand-orange/5">공지 및 소식</div>
          <h1 class="text-6xl font-black tracking-tighter text-slate-900 uppercase leading-none">Journal</h1>
          <p class="text-2xl text-slate-400 font-medium max-w-2xl">프린탑의 새로운 소식과 진행 중인 이벤트를 만나보세요.</p>
        </div>

        <div class="grid grid-cols-1 gap-12">
          ${noticeItems.map(item => `
            <div class="group cursor-pointer border-b border-slate-100 pb-12 transition-all">
              <div class="flex flex-col md:flex-row md:items-start justify-between gap-8">
                <div class="space-y-6">
                  <div class="flex items-center gap-4">
                    <span class="sticker-badge ${item.color} border-none font-bold">${item.type}</span>
                    <span class="text-xs text-slate-300 font-black tracking-widest">${item.date}</span>
                  </div>
                  <h3 class="text-4xl font-black text-slate-900 group-hover:text-brand-blue transition-colors leading-tight">${item.title}</h3>
                  <p class="text-slate-500 font-medium text-lg leading-relaxed max-w-2xl">${item.content}</p>
                </div>
                <div class="shrink-0 flex items-center gap-4">
                   <span class="text-[10px] font-black uppercase tracking-[0.2em] ${item.status === 'Ongoing' ? 'text-brand-orange' : 'text-slate-300'}">${item.status}</span>
                   <div class="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
                   </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `,
  orderLookup: () => `
    <div class="max-w-[1440px] mx-auto px-6 py-32 animate-in fade-in duration-700">
      <div class="space-y-16">
        <div class="space-y-6">
           <div class="sticker-badge text-brand-blue border-brand-blue/20 bg-brand-blue/5">대시보드</div>
           <h1 class="text-6xl font-black tracking-tighter text-slate-900 leading-none">주문 내역</h1>
           <p class="text-2xl text-slate-400 font-medium">제작 진행 상황을 실시간으로 확인하세요.</p>
        </div>

        <div class="grid grid-cols-1 gap-8" id="order-list">
           ${orders.length === 0 ? `
             <div class="bg-white rounded-[3rem] p-24 text-center space-y-8 shadow-xl border border-slate-50">
                <div class="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                   <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M8 7h6"/><path d="M8 11h8"/><path d="M8 15h6"/></svg>
                </div>
                <div class="space-y-2">
                   <h3 class="text-3xl font-black text-slate-900">아직 주문이 없네요!</h3>
                   <p class="text-slate-400 font-medium text-lg">첫 번째 프로젝트를 지금 바로 시작해보세요.</p>
                </div>
                <button onclick="setView('studio')" class="px-10 py-5 bg-brand-blue text-white rounded-full font-black text-lg hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-xl shadow-brand-blue/20">주문 시작하기</button>
             </div>
           ` : orders.map(o => `
             <div class="bg-white rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-10 group hover:shadow-2xl transition-all border border-slate-50 relative overflow-hidden">
                <div class="w-20 h-20 bg-soft-lavender rounded-3xl flex items-center justify-center text-brand-blue shrink-0 group-hover:rotate-6 transition-transform">
                   <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M8 7h6"/><path d="M8 11h8"/><path d="M8 15h6"/></svg>
                </div>
                <div class="flex-1 space-y-2">
                   <div class="flex items-center gap-4">
                      <span class="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">${o.orderDate}</span>
                      <span class="sticker-badge text-brand-blue border-brand-blue/20 bg-brand-blue/5">${o.status}</span>
                   </div>
                   <h3 class="text-3xl font-black text-slate-900 group-hover:text-brand-blue transition-colors leading-tight">${o.orderName}</h3>
                   <p class="text-slate-400 font-bold text-sm uppercase tracking-widest">${o.size} / ${o.quantity} 부 / ${o.binding}</p>
                </div>
                <div class="text-right">
                   <span class="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1">결제 금액</span>
                   <span class="text-3xl font-black text-slate-900">${(o.totalPrice || 0).toLocaleString()}원</span>
                </div>
                <div class="flex gap-3">
                   <button class="w-12 h-12 bg-slate-50 text-slate-300 rounded-2xl hover:bg-soft-pink hover:text-brand-orange transition-all cursor-pointer flex items-center justify-center" onclick="deleteOrder('${o.id}')">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                   </button>
                </div>
             </div>
           `).join('')}
        </div>
      </div>
    </div>
  `,

};

// --- View Switching ---
function updateUserInfo() {
  if (user) {
    $('#auth-nav-container').html(`
       <div class="flex items-center gap-4">
          <div class="flex items-center gap-3 bg-slate-50 py-2 pl-2 pr-4 rounded-full group cursor-pointer hover:bg-slate-100 transition-all">
             <div class="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-white text-xs font-black">
                ${user.name.charAt(0)}
             </div>
             <span class="text-xs font-black text-slate-900 uppercase tracking-tight">${user.name}</span>
          </div>
          <button id="btn-logout" class="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-brand-blue transition-colors">Sign Out</button>
       </div>
    `);
  } else {
    $('#auth-nav-container').html(`
      <button onclick="setView('auth')" class="px-8 py-3 bg-slate-900 text-white rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/10">Sign In</button>
    `);
  }
}

window['switchStudioMode'] = (mode) => {
  studioMode = mode;
  setView('studio');
};

window['showEditorConfirm'] = () => {
  $('body').append(`
    <div id="editor-confirm-overlay" class="fixed inset-0 z-[100] flex items-center justify-center bg-[#111]/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div class="bg-white rounded-[3rem] p-16 max-w-2xl w-full shadow-2xl space-y-12 animate-in zoom-in-95 duration-300 text-slate-900">
         <div class="space-y-4">
            <div class="sticker-badge text-brand-orange border-brand-orange/20 bg-brand-orange/5">검토</div>
            <h3 class="text-5xl font-black tracking-tighter">최종 체크리스트</h3>
            <p class="text-slate-400 font-medium">제작 전 아래 사항을 꼭 확인해주세요.</p>
         </div>
         
         <div class="space-y-8 font-bold leading-relaxed text-lg">
            <div class="flex gap-6 items-start">
               <span class="shrink-0 w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center text-xs font-black">01</span>
               <p>이미지 해상도와 오타를 꼼꼼히 확인하셨나요? 인쇄가 진행된 후에는 수정이 불가능합니다.</p>
            </div>
            <div class="flex gap-6 items-start">
               <span class="shrink-0 w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center text-xs font-black">02</span>
               <p>모니터 색상(RGB)과 실제 인쇄물(CMYK)은 약간의 차이가 발생할 수 있습니다.</p>
            </div>
         </div>

         <label class="flex items-center gap-4 cursor-pointer group p-6 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-slate-100">
            <input type="checkbox" id="chk-editor-confirm" class="w-6 h-6 rounded-lg border-2 border-slate-300 text-brand-blue focus:ring-brand-blue" />
            <span class="text-slate-900 font-black group-hover:text-brand-blue transition-colors">위 내용을 모두 확인하였습니다.</span>
         </label>

          <div class="grid grid-cols-2 gap-4">
            <button onclick="$('#editor-confirm-overlay').remove()" class="py-5 bg-white text-slate-400 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all">취소</button>
            <button id="btn-editor-final-confirm" class="py-5 bg-brand-blue text-white rounded-2xl font-black text-lg hover:shadow-xl transition-all opacity-50 cursor-not-allowed" disabled>확인 및 완료</button>
         </div>
      </div>
    </div>
  `);
};

$(document).on('change', '#chk-editor-confirm', function() {
  const isChecked = this.checked;
  $('#btn-editor-final-confirm').prop('disabled', !isChecked).toggleClass('opacity-50 cursor-not-allowed', !isChecked);
});

$(document).on('click', '#btn-editor-final-confirm', () => {
  $('#editor-confirm-overlay').remove();
  window['switchStudioMode']('spec');
  setTimeout(() => {
    alert('디자인이 저장되었습니다. 견적 내용을 최종 확인 후 주문해 주세요.');
  }, 300);
});

function setView(viewName) {
  if (viewName === 'studio' && currentView !== 'studio') {
    studioMode = 'spec';
  }
  currentView = viewName;
  const content = Views[viewName]();
  $('#main-content').html(content);
  window.scrollTo(0, 0);
  
  updateUserInfo();

  // Highlight active nav
  $('.nav-link').removeClass('text-brand-blue border-b-2 border-brand-blue text-slate-900 font-black');
  $(`.nav-link[data-view="${viewName}"]`).addClass('text-brand-blue font-black');

  // Trigger updates
  if (viewName === 'studio' || viewName === 'landing') {
    updateQuoteResult();
  }
}

// --- Logic ---
function updateQuoteResult() {
  if (currentView !== 'studio' && currentView !== 'landing') return;

  const qStr = String($('#landing-qty').val());
  const pStr = String($('#landing-pages').val());
  
  const q = currentView === 'landing' ? (parseInt(qStr) || 0) : form.quantity;
  const p = currentView === 'landing' ? (parseInt(pStr) || 1) : form.innerSections.reduce((s, n) => s + n.pages, 0);

  // Quick calc for landing
  if (currentView === 'landing') {
    const tempForm = { 
      ...deepClone(INITIAL_STATE), 
      quantity: Math.max(1, q), 
      innerSections: [{ ...deepClone(INITIAL_STATE.innerSections[0]), pages: p, printing: '4도' }] 
    };
    const breakdownColor = calculatePriceBreakdown(tempForm, priceConfig);
    $('#landing-color-price').html(`${breakdownColor.total.toLocaleString()}<span class="text-sm font-medium ml-1">원</span>`);
    $('#landing-color-unit').text(`권당 ${q > 0 ? Math.round(breakdownColor.total / q).toLocaleString() : 0}원`);

    const tempFormMono = { 
      ...deepClone(INITIAL_STATE), 
      quantity: Math.max(1, q), 
      innerSections: [{ ...deepClone(INITIAL_STATE.innerSections[0]), pages: p, printing: '1도' }] 
    };
    const breakdownMono = calculatePriceBreakdown(tempFormMono, priceConfig);
    $('#landing-mono-price').html(`${breakdownMono.total.toLocaleString()}<span class="text-sm font-medium ml-1">원</span>`);
    $('#landing-mono-unit').text(`권당 ${q > 0 ? Math.round(breakdownMono.total / q).toLocaleString() : 0}원`);
    return;
  }

  // Full calc for studio view
  const breakdown = calculatePriceBreakdown(form, priceConfig);
  const totalPages = form.innerSections.reduce((s, n) => s + n.pages, 0);

  $('#quote-total-price').html(`${breakdown.total.toLocaleString()}<span class="text-sm font-bold ml-1 text-slate-500">원</span>`);
  $('#quote-shipping-price').html(`${breakdown.shipping.cost.toLocaleString()}<span class="text-[10px] font-bold ml-1 text-slate-500">원 (${breakdown.shipping.boxCount}박스)</span>`);
  
  if (form.quantity > 0) {
    $('#quote-unit-price').text(`${Math.round(breakdown.total / form.quantity).toLocaleString()}원`);
  } else {
    $('#quote-unit-price').text('0원');
  }
}

// --- Global Functions (exposed for onclick) ---
window['setView'] = setView;

window['deleteGalleryItem'] = (id) => {
  if (confirm('사례를 삭제하시겠습니까?')) {
    galleryItems = galleryItems.filter(i => i.id !== id);
    saveToStorage();
    $('.admin-nav-btn[data-tab="manage-gallery"]').trigger('click');
  }
};

window['deleteNoticeItem'] = (id) => {
  if (confirm('공지사항을 삭제하시겠습니까?')) {
    noticeItems = noticeItems.filter(i => i.id !== id);
    saveToStorage();
    $('.admin-nav-btn[data-tab="manage-notices"]').trigger('click');
  }
};

window['deleteOrder'] = (id) => {
  if (confirm('정말 삭제하시겠습니까?')) {
    orders = orders.filter(o => o.id !== id);
    saveToStorage();
    setView('orderLookup');
  }
};

// --- Initialization ---
$(() => {
  loadFromStorage();
  setView('landing');

  // Event Listeners
  $(document).on('click', '.nav-link', function() {
    const view = $(this).attr('data-view');
    if (view) setView(view);
  });

  $(document).on('click', '#nav-logo', () => setView('landing'));
  $(document).on('click', '#btn-start-studio, #btn-cta-start, #btn-start-quote', () => {
    form.studioSubMode = 'detailed';
    setView('studio');
  });
  $(document).on('click', '#btn-goto-studio', () => {
    form.studioSubMode = 'simple';
    setView('studio');
  });
  $(document).on('click', '#btn-goto-gallery', () => setView('gallery'));
  $(document).on('click', '#btn-scroll-samples', () => setView('gallery'));

  // Landing Page inputs
  $(document).on('input', '#landing-pages, #landing-qty', () => updateQuoteResult());

  // Quote Builder inputs
  $(document).on('input change', '#order-name', (e) => {
    form.orderName = $(e.target).val();
    updateQuoteResult();
  });

  $(document).on('input change', '#order-qty', (e) => {
    form.quantity = parseInt($(e.target).val()) || 100;
    updateQuoteResult();
  });

  $(document).on('change', '#order-size', (e) => {
    form.size = $(e.target).val();
    updateQuoteResult();
  });

  $(document).on('change', '#order-binding', (e) => {
    form.binding = $(e.target).val();
    updateQuoteResult();
  });

  $(document).on('change', '#cover-paper', (e) => {
    form.cover.paper = $(e.target).val();
    const weights = COVER_PAPER_WEIGHTS[form.cover.paper] || ['250'];
    $('#cover-weight').html(weights.map(w => `<option value="${w}">${w}g</option>`).join(''));
    form.cover.weight = weights[0];
    updateQuoteResult();
  });

  $(document).on('change', '#cover-weight', (e) => {
    form.cover.weight = $(e.target).val();
    updateQuoteResult();
  });

  $(document).on('change', '#cover-printing', (e) => {
    form.cover.printing = $(e.target).val();
    updateQuoteResult();
  });

  $(document).on('change', '#cover-coating', (e) => {
    form.cover.coating = $(e.target).val();
    updateQuoteResult();
  });

  $(document).on('change', '#cover-flaps', (e) => {
    form.cover.hasFlaps = e.target.checked;
    updateQuoteResult();
  });

  $(document).on('change', '#post-epoxy', (e) => {
    form.postProcessing.epoxy = e.target.checked;
    updateQuoteResult();
  });

  $(document).on('input', '.inner-pages', function() {
    const idx = $(this).data('index');
    form.innerSections[idx].pages = parseInt($(this).val()) || 0;
    updateQuoteResult();
  });

  $(document).on('change', '.inner-weight, .inner-paper, .inner-printing', function() {
    const idx = $(this).data('index');
    const val = $(this).val();
    if ($(this).hasClass('inner-weight')) form.innerSections[idx].weight = val;
    if ($(this).hasClass('inner-paper')) form.innerSections[idx].paper = val;
    if ($(this).hasClass('inner-printing')) form.innerSections[idx].printing = val;
    updateQuoteResult();
  });

  $(document).on('click', '#btn-google-login', () => {
    // Simulated Login
    user = {
      id: 'google_user_123',
      email: 'user@gmail.com',
      name: '김인쇄',
      role: 'b2b',
      points: 1000,
      isFirstOrder: false
    };
    saveToStorage();
    setView('landing');
  });

  $(document).on('click', '#btn-rhwp-connect', function() {
    const btn = $(this);
    btn.addClass('animate-pulse').find('span').removeClass('bg-slate-300').addClass('bg-emerald-500');
    
    setTimeout(() => {
      alert('rhwp 확장기능과 연결을 시도합니다.\n확장기능이 설치되어 있다면 한글 원고 선택 창이 나타납니다.');
      btn.removeClass('animate-pulse');
    }, 800);
  });

  $(document).on('click', '#btn-logout', () => {
    user = null;
    saveToStorage();
    setView('landing');
  });

  $(document).on('click', '#btn-save-price-config', () => {
    $('.price-input').each(function() {
      const rangeId = $(this).data('id');
      const cat = $(this).data('cat'); // 'inner', 'cover', 'extra'
      const key = $(this).data('key'); // e.g., '1도-general'
      const val = parseInt($(this).val());

      const rangeConfig = priceConfig.pricesByRange[rangeId];
      if (rangeConfig) {
        if (cat === 'inner') {
          const [print, mode] = key.split('-');
          if (rangeConfig.innerPrices['신국판'][print]) {
            rangeConfig.innerPrices['신국판'][print][mode] = val;
          }
        } else if (cat === 'cover') {
          rangeConfig.standardCoverPrice[key] = val;
        } else if (cat === 'extra') {
          if (rangeConfig.extraCharges[key]) {
            rangeConfig.extraCharges[key].general = val;
            rangeConfig.extraCharges[key].special = Math.round(val * 0.9);
          }
        }
      }
    });

    // Global settings simulation (if I decide to use them in calculations)
    // For now we just alert success as the core prices are updated.
    
    saveToStorage();
    alert('단가 설정이 성공적으로 저장되었습니다.');
  });
  $(document).on('click', '#btn-add-client', () => {
    $('body').append(`
      <div id="admin-modal-overlay" class="fixed inset-0 z-[100] flex items-center justify-center bg-[#111]/80 backdrop-blur-md animate-in fade-in duration-300">
         <div class="bg-white rounded-[2rem] p-12 max-w-lg w-full shadow-2xl space-y-8 animate-in slide-in-from-bottom-4">
            <h3 class="text-2xl font-black text-slate-900">새 거래처 등록</h3>
            <div class="space-y-4">
               <div class="space-y-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">거래처명</label>
                  <input type="text" id="modal-client-name" class="w-full h-12 px-4 rounded-xl bg-slate-50 border-none font-bold" />
               </div>
               <div class="space-y-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">거래처 코드</label>
                  <input type="text" id="modal-client-code" class="w-full h-12 px-4 rounded-xl bg-slate-50 border-none font-bold" placeholder="예: H001" />
               </div>
               <div class="space-y-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">단가 적용 방식</label>
                  <select id="modal-client-mode" class="w-full h-12 px-4 rounded-xl bg-slate-50 border-none font-bold">
                     <option value="special">특별 단가 적용</option>
                     <option value="separate">별도 단가 적용</option>
                     <option value="general">일반 단가 적용</option>
                  </select>
               </div>
            </div>
            <div class="flex gap-4 pt-4">
               <button class="btn-close-modal flex-1 py-4 bg-slate-50 text-slate-400 rounded-xl font-black text-sm uppercase">취소</button>
               <button id="btn-save-new-client" class="flex-1 py-4 bg-brand-blue text-white rounded-xl font-black text-sm uppercase shadow-lg shadow-brand-blue/20">등록하기</button>
            </div>
         </div>
      </div>
    `);
  });

  $(document).on('click', '#btn-save-new-client', () => {
    const name = $('#modal-client-name').val();
    const code = $('#modal-client-code').val();
    const priceMode = $('#modal-client-mode').val();

    if (!name || !code) {
       alert('정보를 입력해 주세요.');
       return;
    }

    priceConfig.separateCompanies.push({
       id: `c-${Date.now()}`,
       name,
       code,
       priceMode,
       manager: user?.name || 'Admin'
    });
    
    saveToStorage();
    $('#admin-modal-overlay').remove();
    renderAdminTab('clients');
  });

  $(document).on('click', '.admin-nav-btn', function() {
    const tabId = $(this).data('tab');
    renderAdminTab(tabId);
  });

  function renderAdminTab(tabId) {
    $('.admin-nav-btn').removeClass('bg-brand-blue text-white shadow-lg shadow-brand-blue/20').addClass('text-slate-400 hover:bg-slate-50');
    $(`.admin-nav-btn[data-tab="${tabId}"]`).removeClass('text-slate-400 hover:bg-slate-50').addClass('bg-brand-blue text-white shadow-lg shadow-brand-blue/20');
    
    let content = '';
    switch(tabId) {
       case 'orders':
          content = `
             <div class="space-y-8 animate-in fade-in duration-500">
                <div class="flex items-center justify-between">
                   <h2 class="text-4xl font-black text-slate-900 tracking-tight">전체 주문 현황</h2>
                </div>
                
                <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                   <table class="w-full text-left">
                      <thead class="bg-slate-50 border-b border-slate-100">
                         <tr>
                            <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">주문번호</th>
                            <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">도서명</th>
                            <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">수량</th>
                            <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">상태</th>
                         </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-50">
                         ${orders.length > 0 ? orders.map(o => `
                            <tr class="hover:bg-slate-50/50 transition-all">
                               <td class="px-8 py-6 font-bold text-slate-400 text-xs">${o.id.slice(0, 8)}</td>
                               <td class="px-8 py-6 font-black text-slate-900">${o.orderName}</td>
                               <td class="px-8 py-6 font-black text-slate-900">${o.quantity}부</td>
                               <td class="px-8 py-6">
                                  <span class="px-3 py-1 rounded-full bg-blue-50 text-brand-blue text-[10px] font-black uppercase">${o.status}</span>
                               </td>
                            </tr>
                         `).join('') : `
                            <tr>
                               <td colspan="4" class="px-8 py-20 text-center text-slate-300 font-bold italic">등록된 주문이 없습니다.</td>
                            </tr>
                         `}
                      </tbody>
                   </table>
                </div>
             </div>
          `;
          break;
       case 'shipping':
          content = `
             <div class="space-y-8 animate-in fade-in duration-500">
                <div class="flex items-center justify-between">
                   <h2 class="text-4xl font-black text-slate-900 tracking-tight">출고 및 배송 관리</h2>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div class="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-2">
                      <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">대기 중</span>
                      <div class="text-3xl font-black text-brand-blue">12<span class="text-sm font-bold ml-1 text-slate-300">건</span></div>
                   </div>
                   <div class="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-2">
                      <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">배송 중</span>
                      <div class="text-3xl font-black text-brand-orange">45<span class="text-sm font-bold ml-1 text-slate-300">건</span></div>
                   </div>
                   <div class="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-2">
                      <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">배송 완료</span>
                      <div class="text-3xl font-black text-slate-900">1,204<span class="text-sm font-bold ml-1 text-slate-300">건</span></div>
                   </div>
                </div>

                <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                   <table class="w-full text-left">
                      <thead class="bg-slate-50 border-b border-slate-100">
                         <tr>
                            <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">도서명</th>
                            <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">배송지</th>
                            <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">방법</th>
                            <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">상태</th>
                         </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-50">
                         ${orders.map(o => `
                            <tr>
                               <td class="px-8 py-5 font-black text-slate-900">${o.orderName}</td>
                               <td class="px-8 py-5 font-bold text-slate-400 text-xs">${o.deliveryInfo.address || '-'}</td>
                               <td class="px-8 py-5 font-black text-slate-900 text-xs">${o.deliveryInfo.method}</td>
                               <td class="px-8 py-5">
                                  <span class="px-3 py-1 rounded-full bg-slate-50 text-slate-400 text-[10px] font-black uppercase">배송대기</span>
                               </td>
                            </tr>
                         `).join('')}
                      </tbody>
                   </table>
                </div>
             </div>
          `;
          break;
       case 'sales':
          content = `
             <div class="space-y-8 animate-in fade-in duration-500">
                <div class="flex items-center justify-between">
                   <h2 class="text-4xl font-black text-slate-900 tracking-tight">매출 통계</h2>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div class="p-10 bg-slate-900 rounded-[2.5rem] text-white space-y-6">
                      <span class="sticker-badge bg-white/10 border-white/20 text-white">이번 달 매출</span>
                      <div class="text-5xl font-black tracking-tighter">₩45,280,000</div>
                      <div class="flex items-center gap-2 text-soft-mint text-sm font-bold">
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                         지난달 대비 12% 상승
                      </div>
                   </div>
                   <div class="p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                      <span class="sticker-badge bg-brand-blue/5 border-brand-blue/20 text-brand-blue">누적 매출</span>
                      <div class="text-5xl font-black tracking-tighter text-slate-900">₩1.2B</div>
                      <p class="text-slate-400 font-medium">2024년 1월 1일 기준</p>
                   </div>
                </div>

                <div class="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm">
                   <h4 class="text-xl font-black text-slate-900 mb-8">최근 결제 내역</h4>
                   <div class="space-y-4">
                      ${orders.map(o => `
                         <div class="flex items-center justify-between p-6 bg-slate-50 rounded-2xl">
                            <div class="flex items-center gap-4">
                               <div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-brand-blue shadow-sm">
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                               </div>
                               <div class="space-y-1">
                                  <p class="font-black text-slate-900">${o.orderName}</p>
                                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${o.orderDate}</p>
                               </div>
                            </div>
                            <div class="text-right">
                               <p class="font-black text-slate-900">${(o.totalPrice || 0).toLocaleString()}원</p>
                               <p class="text-[10px] font-bold text-soft-mint uppercase tracking-widest">결제완료</p>
                            </div>
                         </div>
                      `).join('')}
                   </div>
                </div>
             </div>
          `;
          break;
       case 'clients':
          content = `
             <div class="space-y-8 animate-in fade-in duration-500">
                <div class="flex items-center justify-between">
                   <h2 class="text-4xl font-black text-slate-900 tracking-tight">거래처 관리</h2>
                   <button id="btn-add-client" class="px-6 py-3 bg-brand-blue text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-blue/20 flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      거래처 등록
                   </button>
                </div>
                
                <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                   <table class="w-full text-left">
                      <thead class="bg-slate-50 border-b border-slate-100">
                         <tr>
                            <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">코드</th>
                            <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">거래처명</th>
                            <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">관리자</th>
                            <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">방식</th>
                         </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-50">
                         ${priceConfig.separateCompanies.map(c => `
                            <tr>
                               <td class="px-8 py-5 font-bold text-slate-400 text-xs">${c.code}</td>
                               <td class="px-8 py-5 font-black text-slate-900">${c.name}</td>
                               <td class="px-8 py-5 font-black text-slate-900">${c.manager || '-'}</td>
                               <td class="px-8 py-5 font-black text-brand-blue text-xs uppercase">${c.priceMode || 'Special'}</td>
                            </tr>
                         `).join('')}
                         ${priceConfig.separateCompanies.length === 0 ? '<tr><td colspan="4" class="px-8 py-10 text-center text-slate-300 font-bold italic">등록된 거래처가 없습니다.</td></tr>' : ''}
                      </tbody>
                   </table>
                </div>
             </div>
          `;
          break;
       case 'prices':
          content = `
             <div class="space-y-12 animate-in fade-in duration-500 pb-20">
                <div class="flex items-center justify-between">
                   <div class="space-y-1">
                      <h2 class="text-4xl font-black text-slate-900 tracking-tight">단가 관리</h2>
                      <p class="text-sm font-medium text-slate-400">인쇄 견적 계산에 사용되는 기본 단가와 할증료를 설정합니다.</p>
                   </div>
                   <button id="btn-save-price-config" class="px-10 py-4 bg-brand-blue text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-brand-blue/20">설정 저장하기</button>
                </div>

                <!-- Range Settings -->
                <div class="space-y-6">
                   <h3 class="text-xl font-black text-slate-900 flex items-center gap-3">
                      <span class="w-8 h-8 rounded-lg bg-soft-lavender flex items-center justify-center text-brand-blue text-sm">1</span>
                      수량 구간 및 기본 단가
                   </h3>
                   <div class="grid grid-cols-1 gap-8">
                      ${priceConfig.ranges.map(range => {
                         const rangeData = priceConfig.pricesByRange[range.id];
                         return `
                            <div class="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 space-y-8">
                               <div class="flex items-center justify-between">
                                  <div class="flex items-center gap-4">
                                     <span class="sticker-badge text-brand-blue border-brand-blue/20 bg-brand-blue/5">${range.label} (${range.min} ~ ${range.max || '∞'})</span>
                                  </div>
                               </div>
                               
                               <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
                                  <!-- Inner Prices -->
                                  <div class="space-y-6">
                                     <h4 class="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">내지 단가 (페이지당)</h4>
                                     <div class="space-y-4">
                                        <div class="grid grid-cols-2 gap-4">
                                           <div class="space-y-2">
                                              <label class="text-[10px] font-bold text-slate-300 uppercase pl-1">1도 일반</label>
                                              <input type="number" class="price-input w-full h-12 px-4 rounded-xl bg-slate-50 border-none font-bold" data-id="${range.id}" data-cat="inner" data-key="1도-general" value="${rangeData.innerPrices['신국판']['1도'].general}" />
                                           </div>
                                           <div class="space-y-2">
                                              <label class="text-[10px] font-bold text-slate-300 uppercase pl-1">1도 특별</label>
                                              <input type="number" class="price-input w-full h-12 px-4 rounded-xl bg-slate-50 border-none font-bold" data-id="${range.id}" data-cat="inner" data-key="1도-special" value="${rangeData.innerPrices['신국판']['1도'].special}" />
                                           </div>
                                        </div>
                                        <div class="grid grid-cols-2 gap-4">
                                           <div class="space-y-2">
                                              <label class="text-[10px] font-bold text-slate-300 uppercase pl-1">4도 일반</label>
                                              <input type="number" class="price-input w-full h-12 px-4 rounded-xl bg-slate-50 border-none font-bold" data-id="${range.id}" data-cat="inner" data-key="4도-general" value="${rangeData.innerPrices['신국판']['4도'].general}" />
                                           </div>
                                           <div class="space-y-2">
                                              <label class="text-[10px] font-bold text-slate-300 uppercase pl-1">4도 특별</label>
                                              <input type="number" class="price-input w-full h-12 px-4 rounded-xl bg-slate-50 border-none font-bold" data-id="${range.id}" data-cat="inner" data-key="4도-special" value="${rangeData.innerPrices['신국판']['4도'].special}" />
                                           </div>
                                        </div>
                                     </div>
                                  </div>

                                  <!-- Cover Prices -->
                                  <div class="space-y-6">
                                     <h4 class="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">표지 기본 단가 (권당)</h4>
                                     <div class="grid grid-cols-2 gap-4">
                                        <div class="space-y-2">
                                           <label class="text-[10px] font-bold text-slate-300 uppercase pl-1">일반</label>
                                           <input type="number" class="price-input w-full h-12 px-4 rounded-xl bg-slate-50 border-none font-bold" data-id="${range.id}" data-cat="cover" data-key="general" value="${rangeData.standardCoverPrice.general}" />
                                        </div>
                                        <div class="space-y-2">
                                           <label class="text-[10px] font-bold text-slate-300 uppercase pl-1">특별</label>
                                           <input type="number" class="price-input w-full h-12 px-4 rounded-xl bg-slate-50 border-none font-bold" data-id="${range.id}" data-cat="cover" data-key="special" value="${rangeData.standardCoverPrice.special}" />
                                        </div>
                                     </div>

                                     <h4 class="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 mt-8">할증료 설정 (권당)</h4>
                                     <div class="grid grid-cols-2 gap-4">
                                        <div class="space-y-2">
                                           <label class="text-[10px] font-bold text-slate-300 uppercase pl-1">날개</label>
                                           <input type="number" class="price-input w-full h-12 px-4 rounded-xl bg-slate-50 border-none font-bold" data-id="${range.id}" data-cat="extra" data-key="flaps" value="${rangeData.extraCharges.flaps.general}" />
                                        </div>
                                        <div class="space-y-2">
                                           <label class="text-[10px] font-bold text-slate-300 uppercase pl-1">코팅</label>
                                           <input type="number" class="price-input w-full h-12 px-4 rounded-xl bg-slate-50 border-none font-bold" data-id="${range.id}" data-cat="extra" data-key="coating" value="${rangeData.extraCharges.coating.general}" />
                                        </div>
                                     </div>
                                  </div>
                               </div>
                            </div>
                         `;
                      }).join('')}
                   </div>
                </div>

                <!-- Global Constants -->
                <div class="space-y-6">
                   <h3 class="text-xl font-black text-slate-900 flex items-center gap-3">
                      <span class="w-8 h-8 rounded-lg bg-soft-lavender flex items-center justify-center text-brand-blue text-sm">2</span>
                      부대 비용 및 물류비
                   </h3>
                   <div class="bg-white rounded-3xl p-10 shadow-sm border border-slate-100">
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
                         <div class="space-y-4">
                            <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">택배 박스당 배송비</label>
                            <div class="relative">
                               <input type="number" id="global-shipping-cost" value="${priceConfig.globalShippingCost || 5000}" class="w-full h-14 px-6 rounded-xl bg-slate-50 border-none font-black text-xl" />
                               <span class="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-bold">원</span>
                            </div>
                         </div>
                         <div class="space-y-4">
                            <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">할인 적용률 (특별 코드)</label>
                            <div class="relative">
                               <input type="number" id="global-discount-rate" value="${priceConfig.globalDiscountRate || 5}" class="w-full h-14 px-6 rounded-xl bg-slate-50 border-none font-black text-xl" />
                               <span class="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-bold">%</span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          `;
          break;
       case 'manage-gallery':
          content = `
             <div class="space-y-8 animate-in fade-in duration-500">
                <div class="flex items-center justify-between">
                   <h2 class="text-4xl font-black text-slate-900 tracking-tight">작업 사례 관리</h2>
                   <button id="btn-open-gallery-modal" class="px-6 py-3 bg-brand-blue text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-blue/20 flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      새 사례 추가
                   </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   ${galleryItems.map(item => `
                      <div class="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm group">
                         <div class="aspect-video bg-slate-100 relative">
                            <img src="${item.img}" class="w-full h-full object-cover" />
                            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                               <button onclick="deleteGalleryItem(${item.id})" class="p-3 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-soft-pink hover:text-brand-orange transition-all">
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                               </button>
                            </div>
                         </div>
                         <div class="p-6 space-y-2">
                            <span class="text-[10px] font-black text-brand-blue uppercase tracking-widest">${item.category}</span>
                            <h4 class="font-black text-slate-900">${item.title}</h4>
                         </div>
                      </div>
                   `).join('')}
                </div>
             </div>
          `;
          break;
       case 'manage-notices':
          content = `
             <div class="space-y-8 animate-in fade-in duration-500">
                <div class="flex items-center justify-between">
                   <h2 class="text-4xl font-black text-slate-900 tracking-tight">공지사항 관리</h2>
                   <button id="btn-open-notice-modal" class="px-6 py-3 bg-brand-blue text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-blue/20 flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      새 공지 등록
                   </button>
                </div>

                <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden text-sm">
                   <table class="w-full text-left">
                      <thead class="bg-slate-50 border-b border-slate-100">
                         <tr>
                            <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">일자</th>
                            <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">분류</th>
                            <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">제목</th>
                            <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">관리</th>
                         </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-50">
                         ${noticeItems.map(item => `
                            <tr>
                               <td class="px-8 py-5 font-bold text-slate-400 text-xs">${item.date}</td>
                               <td class="px-8 py-5">
                                  <span class="px-3 py-1 rounded-full ${item.color} text-[10px] font-black uppercase text-xs">${item.type}</span>
                               </td>
                               <td class="px-8 py-5 font-black text-slate-900">${item.title}</td>
                               <td class="px-8 py-5 flex items-center gap-3">
                                  <button onclick="openEditNoticeModal(${item.id})" class="text-slate-300 hover:text-brand-blue transition-colors">
                                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                                  </button>
                                  <button onclick="deleteNoticeItem(${item.id})" class="text-slate-300 hover:text-brand-orange transition-colors">
                                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                  </button>
                               </td>
                            </tr>
                         `).join('')}
                      </tbody>
                   </table>
                </div>
             </div>
          `;
          break;
    }
    $('#admin-view-container').html(content);
  }

  $(document).on('click', '#btn-open-gallery-modal', () => {
    $('body').append(`
      <div id="admin-modal-overlay" class="fixed inset-0 z-[100] flex items-center justify-center bg-[#111]/80 backdrop-blur-md animate-in fade-in duration-300">
         <div class="bg-white rounded-[2rem] p-12 max-w-lg w-full shadow-2xl space-y-8 animate-in slide-in-from-bottom-4">
            <h3 class="text-2xl font-black text-slate-900">새 작업 사례 추가</h3>
            <div class="space-y-4">
               <div class="space-y-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">사례 제목</label>
                  <input type="text" id="modal-gallery-title" class="w-full h-12 px-4 rounded-xl bg-slate-50 border-none font-bold" placeholder="예: 수학의 정석 미분편" />
               </div>
               <div class="space-y-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">카테고리</label>
                  <input type="text" id="modal-gallery-category" class="w-full h-12 px-4 rounded-xl bg-slate-50 border-none font-bold" placeholder="예: 수학" />
               </div>
               <div class="space-y-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">이미지 업로드</label>
                  <div id="gallery-upload-preview" class="w-full aspect-video rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                     <span class="text-slate-300 font-bold text-xs uppercase tracking-widest">이미지를 선택하세요</span>
                  </div>
                  <input type="file" id="modal-gallery-file" class="hidden" accept="image/*" />
                  <button id="btn-trigger-gallery-upload" class="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs">파일 선택하기</button>
                  <input type="hidden" id="modal-gallery-img-data" value="" />
               </div>
            </div>
            <div class="flex gap-4 border-t border-slate-50 pt-8 mt-4">
               <button class="btn-close-modal flex-1 py-4 bg-slate-50 text-slate-400 rounded-xl font-black text-sm uppercase">취소</button>
               <button id="btn-save-gallery-item" class="flex-1 py-4 bg-brand-blue text-white rounded-xl font-black text-sm uppercase shadow-lg shadow-brand-blue/20">추가하기</button>
            </div>
         </div>
      </div>
    `);
  });

  $(document).on('click', '.btn-close-modal', () => {
    $('#admin-modal-overlay').remove();
  });

  $(document).on('click', '#btn-trigger-gallery-upload', () => {
    $('#modal-gallery-file').click();
  });

  $(document).on('change', '#modal-gallery-file', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        $('#gallery-upload-preview').html(`<img src="${evt.target.result}" class="w-full h-full object-cover" />`);
        $('#modal-gallery-img-data').val(evt.target.result);
      };
      reader.readAsDataURL(file);
    }
  });

  $(document).on('click', '#btn-save-gallery-item', () => {
    const title = $('#modal-gallery-title').val();
    const category = $('#modal-gallery-category').val();
    const imgData = $('#modal-gallery-img-data').val();

    if (!title || !category || !imgData) {
       alert('모든 정보를 입력하고 이미지를 업로드해 주세요.');
       return;
    }

    galleryItems.unshift({
       id: Date.now(),
       title,
       category,
       img: imgData
    });
    saveToStorage();
    $('#admin-modal-overlay').remove();
    renderAdminTab('manage-gallery');
  });

  $(document).on('click', '#btn-open-notice-modal', () => {
    openNoticeModal();
  });

  window['openEditNoticeModal'] = (id) => {
    const notice = noticeItems.find(n => n.id === id);
    if (notice) openNoticeModal(notice);
  };

  function openNoticeModal(editItem = null) {
    const isEdit = !!editItem;
    $('body').append(`
      <div id="admin-modal-overlay" class="fixed inset-0 z-[100] flex items-center justify-center bg-[#111]/80 backdrop-blur-md animate-in fade-in duration-300">
         <div class="bg-white rounded-[2rem] p-12 max-w-lg w-full shadow-2xl space-y-8 animate-in slide-in-from-bottom-4">
            <div class="flex items-center justify-between">
               <h3 class="text-2xl font-black text-slate-900">${isEdit ? '공지사항 수정' : '새 공지 등록'}</h3>
               ${isEdit ? `<span class="text-[10px] font-black text-slate-300 uppercase tracking-widest">ID: ${editItem.id}</span>` : ''}
            </div>
            <div class="space-y-4">
               <div class="space-y-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">공지 제목</label>
                  <input type="text" id="modal-notice-title" class="w-full h-12 px-4 rounded-xl bg-slate-50 border-none font-bold" value="${isEdit ? editItem.title : ''}" />
               </div>
               <div class="space-y-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">분류</label>
                  <select id="modal-notice-type" class="w-full h-12 px-4 rounded-xl bg-slate-50 border-none font-bold">
                     <option value="Notice" ${isEdit && editItem.type === 'Notice' ? 'selected' : ''}>Notice</option>
                     <option value="Event" ${isEdit && editItem.type === 'Event' ? 'selected' : ''}>Event</option>
                     <option value="Update" ${isEdit && editItem.type === 'Update' ? 'selected' : ''}>Update</option>
                  </select>
               </div>
               <div class="space-y-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">내용</label>
                  <textarea id="modal-notice-content" class="w-full h-48 p-6 rounded-xl bg-slate-50 border-none font-bold resize-none">${isEdit ? editItem.content : ''}</textarea>
               </div>
            </div>
            <div class="flex gap-4">
               <button class="btn-close-modal flex-1 py-4 bg-slate-50 text-slate-400 rounded-xl font-black text-sm uppercase">취소</button>
               <button id="btn-save-notice-item" class="flex-1 py-4 bg-brand-blue text-white rounded-xl font-black text-sm uppercase shadow-lg shadow-brand-blue/20" data-edit-id="${isEdit ? editItem.id : ''}">${isEdit ? '수정 완료' : '등록하기'}</button>
            </div>
         </div>
      </div>
    `);
  }

  $(document).on('click', '#btn-save-notice-item', function() {
    const editId = $(this).data('edit-id');
    const title = $('#modal-notice-title').val();
    const type = $('#modal-notice-type').val();
    const content = $('#modal-notice-content').val();

    if (!title || !content) {
       alert('모든 정보를 입력해 주세요.');
       return;
    }

    const now = new Date();
    const dateStr = `${now.getFullYear()}.${(now.getMonth()+1).toString().padStart(2,'0')}.${now.getDate().toString().padStart(2,'0')}`;
    
    let color = 'text-slate-600 bg-slate-50';
    if (type === 'Event') color = 'text-brand-blue bg-soft-lavender';
    if (type === 'Update') color = 'text-brand-orange bg-brand-orange/5';

    if (editId) {
      const idx = noticeItems.findIndex(n => n.id === editId);
      if (idx !== -1) {
        noticeItems[idx] = {
          ...noticeItems[idx],
          type,
          title,
          content,
          color
        };
      }
    } else {
      noticeItems.unshift({
        id: Date.now(),
        type,
        title,
        content,
        date: dateStr,
        status: type === 'Event' ? 'Ongoing' : 'Fixed',
        color
      });
    }
    saveToStorage();
    $('#admin-modal-overlay').remove();
    renderAdminTab('manage-notices');
  });

  $(document).on('click', '.opt-btn', function() {
    const opt = $(this).data('opt');
    const isActive = $(this).hasClass('active');
    
    if (opt === 'flaps') form.cover.hasFlaps = !isActive;
    if (opt === 'epoxy') form.postProcessing.epoxy = !isActive;
    
    $(this).toggleClass('active border-slate-100 border-brand-blue bg-white bg-brand-blue/5 text-slate-300 text-brand-blue shadow-lg shadow-brand-blue/10');
    updateQuoteResult();
  });

  $(document).on('click', '.weight-chip', function() {
    const val = $(this).data('val');
    $('.weight-chip').removeClass('active bg-brand-blue text-white').addClass('bg-slate-50 text-slate-400');
    $(this).addClass('active bg-brand-blue text-white').removeClass('bg-slate-50 text-slate-400');
    form.cover.weight = val;
    updateQuoteResult();
  });

  $(document).on('input change', '#client-name, #client-phone, #client-email, #delivery-address, #client-name-simple, #client-phone-simple, #delivery-address-simple', function() {
    const id = $(this).attr('id');
    const val = $(this).val();
    if (id === 'client-name' || id === 'client-name-simple') form.clientInfo.name = val;
    if (id === 'client-phone' || id === 'client-phone-simple') form.clientInfo.phone = val;
    if (id === 'delivery-address' || id === 'delivery-address-simple') form.deliveryInfo.address = val;
    saveToStorage();
  });

  $(document).on('click', '.delivery-method-btn', function() {
    const val = $(this).data('val');
    $('.delivery-method-btn').removeClass('border-brand-blue bg-brand-blue/5 text-brand-blue shadow-lg shadow-brand-blue/10').addClass('border-slate-50 text-slate-300');
    $(this).addClass('border-brand-blue bg-brand-blue/5 text-brand-blue shadow-lg shadow-brand-blue/10').removeClass('border-slate-50 text-slate-300');
    form.deliveryInfo.method = val;
    saveToStorage();
  });

  $(document).on('click', '#btn-studio-tab-simple', () => {
    form.studioSubMode = 'simple';
    setView('studio');
  });

  $(document).on('click', '#btn-studio-tab-detailed', () => {
    form.studioSubMode = 'detailed';
    setView('studio');
  });

  $(document).on('input change', '#order-name-simple', (e) => {
    form.orderName = $(e.target).val();
    updateQuoteResult();
  });

  $(document).on('input change', '#order-qty-simple', (e) => {
    form.quantity = parseInt($(e.target).val()) || 1;
    updateQuoteResult();
  });

  $(document).on('input change', '#order-pages-simple', (e) => {
    const pages = parseInt($(e.target).val()) || 1;
    form.innerSections[0].pages = pages;
    updateQuoteResult();
  });

  $(document).on('change', '#order-size-simple', (e) => {
    form.size = $(e.target).val();
    updateQuoteResult();
  });

  $(document).on('change', '#upload-cover-simple, #upload-cover-detailed', function(e) {
    const file = e.target.files[0];
    if (file) {
      form.files.cover = file.name;
      saveToStorage();
      setView('studio');
    }
  });

  $(document).on('change', '#upload-body-simple, #upload-body-detailed', function(e) {
    const file = e.target.files[0];
    if (file) {
      form.files.body = file.name;
      saveToStorage();
      setView('studio');
    }
  });

  // Submit Order
  $(document).on('click', '#btn-submit-order', () => {
    if (!user) {
      alert('로그인이 필요한 서비스입니다.');
      setView('auth');
      return;
    }

    if (!form.orderName) {
      alert('도서 제목을 입력해 주세요.');
      $('#order-name').focus();
      return;
    }

    const breakdown = calculatePriceBreakdown(form, priceConfig);
    
    // Show Payment Modal
    $('#app').append(`
      <div id="payment-overlay" class="fixed inset-0 z-50 flex items-center justify-center bg-[#111]/80 backdrop-blur-xl animate-in fade-in duration-300">
        <div class="bg-white rounded-[3rem] p-16 max-w-xl w-full shadow-2xl space-y-12 animate-in zoom-in-95 duration-300">
           <div class="text-center space-y-4">
              <div class="sticker-badge text-brand-blue border-brand-blue/20 bg-brand-blue/5 mx-auto">결제</div>
              <h3 class="text-4xl font-black tracking-tighter">최종 결제 확인</h3>
              <p class="text-slate-400 font-medium">주문 내용을 확인하고 결제를 진행해 주세요.</p>
           </div>
           
           <div class="space-y-6 bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
              <div class="flex justify-between items-center">
                 <span class="text-[10px] font-black uppercase tracking-widest text-slate-300">도서 제목</span>
                 <span class="font-black text-slate-900">${form.orderName}</span>
              </div>
              <div class="flex justify-between items-center">
                 <span class="text-[10px] font-black uppercase tracking-widest text-slate-300">주문제작 사양</span>
                 <span class="font-black text-slate-900">${form.size} / ${form.binding}</span>
              </div>
              <div class="flex justify-between items-center">
                 <span class="text-[10px] font-black uppercase tracking-widest text-slate-300">주문 부수</span>
                 <span class="font-black text-slate-900">${form.quantity}부</span>
              </div>
              <div class="flex justify-between items-center">
                 <span class="text-[10px] font-black uppercase tracking-widest text-slate-300">업로드 파일</span>
                 <div class="text-right">
                    <div class="text-[11px] font-black ${form.files.cover ? 'text-brand-blue' : 'text-slate-300'}">표지: ${form.files.cover || '미첨부'}</div>
                    <div class="text-[11px] font-black ${form.files.body ? 'text-brand-blue' : 'text-slate-300'}">본문: ${form.files.body || '미첨부'}</div>
                 </div>
              </div>
              <div class="h-px bg-slate-200 mt-2"></div>
              <div class="flex justify-between items-center pt-2">
                 <span class="text-slate-900 font-black">총 결제 금액</span>
                 <span class="text-4xl font-black text-brand-blue">${breakdown.total.toLocaleString()}원</span>
              </div>
           </div>

           <div class="grid grid-cols-2 gap-4">
              <button id="btn-cancel-payment" class="py-5 bg-white text-slate-400 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all cursor-pointer text-center">취소</button>
              <button id="btn-confirm-payment" class="py-5 bg-brand-blue text-white rounded-2xl font-black text-lg hover:shadow-xl transition-all cursor-pointer text-center">주문하기</button>
           </div>
        </div>
      </div>
    `);
  });

  $(document).on('click', '#btn-cancel-payment', () => {
    $('#payment-overlay').fadeOut(200, function() { $(this).remove(); });
  });

  $(document).on('click', '#btn-confirm-payment', () => {
    $('#btn-confirm-payment').prop('disabled', true).text('처리 중...');
    
    // Simulate Network Latency
    setTimeout(() => {
      const breakdown = calculatePriceBreakdown(form, priceConfig);
      const now = new Date();
      const orderId = `ORD-${now.getTime()}`;
      const dateStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')}`;
      
      const newOrder = {
        ...form,
        id: orderId,
        orderDate: dateStr,
        totalPrice: breakdown.total,
        status: '결제완료'
      };

      orders.unshift(newOrder);
      saveToStorage();
      
      $('#payment-overlay').remove();
      alert('주문 및 결제가 성공적으로 완료되었습니다!');
      setView('orderLookup');
    }, 1500);
  });

  // Global styles for scrolling
  $('html, body').css('scroll-behavior', 'smooth');
});
