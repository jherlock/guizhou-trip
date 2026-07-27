const STORAGE_KEY="guizhou-trip-checklist-v1";
const checkboxes=Array.from(document.querySelectorAll('.checklist-item input[type="checkbox"]'));
const dayCards=Array.from(document.querySelectorAll('.day-card'));
const searchInput=document.getElementById('searchInput');
const progressText=document.getElementById('progressText');
const progressBar=document.getElementById('progressBar');
const resetButton=document.getElementById('resetButton');
const printButton=document.getElementById('printButton');
const filterButtons=Array.from(document.querySelectorAll('.filter-chip'));
let activeFilter='all';
function loadSavedState(){let saved={};try{saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')}catch{saved={}}checkboxes.forEach(checkbox=>{checkbox.checked=Boolean(saved[checkbox.dataset.id]);syncItemState(checkbox)})}
function saveState(){const state={};checkboxes.forEach(checkbox=>{state[checkbox.dataset.id]=checkbox.checked});localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
function syncItemState(checkbox){checkbox.closest('.checklist-item').classList.toggle('is-complete',checkbox.checked)}
function updateProgress(){const completed=checkboxes.filter(checkbox=>checkbox.checked).length;const total=checkboxes.length;const percentage=total===0?0:completed/total*100;progressText.textContent=`${completed} / ${total}`;progressBar.style.width=`${percentage}%`}
function itemMatchesFilter(item){const checkbox=item.querySelector('input[type="checkbox"]');switch(activeFilter){case'must':return item.classList.contains('category-must');case'check':return item.classList.contains('category-check');case'free':return item.classList.contains('category-free');case'todo':return!checkbox.checked;default:return true}}
function applyFilters(){const query=searchInput.value.trim().toLowerCase();dayCards.forEach(card=>{const cardSearchText=(card.dataset.search||'').toLowerCase();const items=Array.from(card.querySelectorAll('.checklist-item'));let visibleCount=0;items.forEach(item=>{const itemText=item.textContent.toLowerCase();const matchesText=query===''||itemText.includes(query)||cardSearchText.includes(query);const visible=matchesText&&itemMatchesFilter(item);item.classList.toggle('is-hidden',!visible);if(visible)visibleCount+=1});card.classList.toggle('is-hidden',visibleCount===0)})}
checkboxes.forEach(checkbox=>{checkbox.addEventListener('change',()=>{syncItemState(checkbox);saveState();updateProgress();applyFilters()})});
filterButtons.forEach(button=>{button.addEventListener('click',()=>{activeFilter=button.dataset.filter;filterButtons.forEach(candidate=>candidate.classList.toggle('is-active',candidate===button));applyFilters()})});
searchInput.addEventListener('input',applyFilters);
resetButton.addEventListener('click',()=>{if(!window.confirm('确定清空所有勾选状态吗？'))return;checkboxes.forEach(checkbox=>{checkbox.checked=false;syncItemState(checkbox)});localStorage.removeItem(STORAGE_KEY);updateProgress();applyFilters()});
printButton.addEventListener('click',()=>window.print());
loadSavedState();updateProgress();applyFilters();
