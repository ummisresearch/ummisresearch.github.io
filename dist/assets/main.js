/* Progressive enhancement: all navigation and content work without JavaScript. */
const menu=document.querySelector('.menu-button');
const navigation=document.querySelector('#navigation');
menu.hidden=false;
document.documentElement.classList.add('js');
const closeMenu=()=>{menu.setAttribute('aria-expanded','false');navigation.classList.remove('open');};
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));navigation.classList.toggle('open',open);});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
navigation.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
const search=document.querySelector('#publication-search');
if(search){
  document.querySelector('.publication-tools').hidden=false;
  const year=document.querySelector('#publication-year');
  const records=[...document.querySelectorAll('[data-publication]')];
  const texts=records.map(el=>el.textContent.toLocaleLowerCase());
  function filter(){
    const words=search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    let visible=0;
    records.forEach((el,i)=>{const match=(!year.value||el.dataset.year===year.value)&&words.every(word=>texts[i].includes(word));el.hidden=!match;if(match)visible++;});
    document.querySelector('#publication-count').textContent=`${visible} of ${records.length} publications`;
    document.querySelector('#no-results').hidden=visible!==0;
  }
  search.addEventListener('input',filter);year.addEventListener('change',filter);
  document.querySelector('#reset-filters').addEventListener('click',()=>{search.value='';year.value='';filter();search.focus();});
}
