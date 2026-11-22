const items = [{"image": "images/noodles.jpg", "name": "Salmon ramen", "price": "12", "description": "Salmon, noodles, soft egg, and greens in a savory broth.", "alt": "A salmon noodle bowl with egg and vegetables", "category": "entrees", "id": "0"}, {"image": "images/dumplings.jpg", "name": "Pork dumplings", "price": "10", "description": "Steamed pork dumplings with soy and ginger dipping sauce.", "alt": "Dumplings arranged on a serving plate", "category": "starters", "id": "1"}, {"image": "images/rice.jpg", "name": "Egg fried rice", "price": "13", "description": "Wok tossed rice with egg, vegetables, and scallions.", "alt": "Fried rice with vegetables", "category": "entrees", "id": "2"}, {"image": "images/salad.jpg", "name": "Sesame garden salad", "price": "8", "description": "Mixed vegetables with our sesame dressing.", "alt": "A colorful bowl of mixed vegetables and greens", "category": "starters", "id": "3"}, {"image": "images/tea.jpg", "name": "Lime iced tea", "price": "4", "description": "Iced tea with fresh lime.", "alt": "Iced tea with lime in a glass", "category": "drinks", "id": "4"}, {"image": "images/cake.jpg", "name": "Chocolate cake", "price": "7", "description": "Chocolate cake with a rich chocolate frosting.", "alt": "Chocolate cake with chocolate frosting", "category": "desserts", "id": "5"}, {"image": "images/sushi.jpg", "name": "Salmon maki", "price": "14", "description": "Salmon rolls with rice, nori, and pickled ginger.", "alt": "Fresh sushi rolls arranged on a platter", "category": "entrees", "id": "6"}];

const popup = document.querySelector('#item-dialog');
const hours = document.querySelector('#hours-dialog');
document.querySelectorAll('[data-item]').forEach(button => button.addEventListener('click', () => {
 const item = items[Number(button.dataset.item)];
 document.querySelector('#detail-image').src=item.image;
 document.querySelector('#detail-image').alt=item.alt;
 document.querySelector('#detail-title').textContent=item.name;
 document.querySelector('#detail-description').textContent=item.description;
 document.querySelector('#detail-price').textContent='$'+item.price+'.00';
 popup.showModal();
}));
const hoursButton = document.querySelector('#open-hours');
function positionHours() {
 if (!hours?.open) return;
 const anchor = hoursButton.getBoundingClientRect();
 hours.style.left = Math.max(16, Math.min(innerWidth - hours.offsetWidth - 16, anchor.left + anchor.width / 2 - hours.offsetWidth / 2)) + 'px';
 hours.style.top = Math.max(20, Math.min(innerHeight - hours.offsetHeight - 20, anchor.bottom + 30)) + 'px';
}
hoursButton?.addEventListener('click', () => {
 if (hours.open) { hours.close(); return; }
 hours.show(); positionHours(); hoursButton.setAttribute('aria-expanded', 'true');
});
hours?.addEventListener('close', () => { hoursButton.setAttribute('aria-expanded', 'false'); hoursButton.focus(); });
document.addEventListener('click', event => { if(hours?.open && !hours.contains(event.target) && !hoursButton.contains(event.target)) hours.close(); });
document.addEventListener('keydown', event => { if(event.key === 'Escape' && hours?.open) hours.close(); });
window.addEventListener('resize', positionHours);
window.addEventListener('scroll', positionHours, {passive:true});
document.querySelectorAll('dialog').forEach(dialog => {
 dialog.querySelector('.close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{const r=dialog.getBoundingClientRect();if(event.target===dialog&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))dialog.close();});
});

if (document.querySelector('.order-page')) {
 const panel=document.querySelector('#cart-panel');
 let fulfillment = 'pickup';
 try { fulfillment = sessionStorage.getItem('wu-fulfillment') === 'delivery' ? 'delivery' : 'pickup'; } catch {}
 function setFulfillment(value) {
  fulfillment = value;
  document.querySelectorAll('[data-fulfillment]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.fulfillment === value)));
  document.querySelector('#fulfillment-label').textContent = value === 'delivery' ? 'Delivery' : 'Pickup';
  document.querySelector('#fulfillment-detail').textContent = value === 'delivery' ? 'Delivery' : 'a secret location';
  try { sessionStorage.setItem('wu-fulfillment', value); } catch {}
 }
 document.querySelectorAll('[data-fulfillment]').forEach(button => button.addEventListener('click', () => setFulfillment(button.dataset.fulfillment)));
 setFulfillment(fulfillment);
 let cart={};try {cart=JSON.parse(sessionStorage.getItem('wu-cart')||'{}');if(!cart||typeof cart!=='object'||Array.isArray(cart))cart={};}catch{cart={};}
 for(const key of Object.keys(cart))if(!items[key]||!Number.isInteger(cart[key])||cart[key]<1)delete cart[key];
 function money(n){return '$'+n.toFixed(2);}
 function openCart(){panel.inert=false;document.body.classList.add('cart-open');}
 function closeCart(){document.body.classList.remove('cart-open');panel.inert=true;document.querySelector('#open-cart').focus();}
 function renderCart(){
  const list=document.querySelector('#cart-items');list.replaceChildren();let total=0,count=0;
  for(const [id,qty] of Object.entries(cart)){
   const item=items[id];count+=qty;total+=Number(item.price)*qty;
   const row=document.createElement('div');row.className='cart-row';
   row.innerHTML='<img src="'+item.image+'" alt=""><div><h3>'+item.name+'</h3><span class="item-price">'+money(Number(item.price)*qty)+'</span><div class="quantity"><button data-change="-1" data-id="'+id+'" aria-label="Remove one '+item.name+'">−</button><span>'+qty+'</span><button data-change="1" data-id="'+id+'" aria-label="Add one '+item.name+'">+</button></div></div>';
   list.append(row);
  }
  if(!count)list.innerHTML='<p class="empty-cart">Your order is empty.<br>Add a dish from the menu to get started.</p>';
  document.querySelector('#subtotal').textContent=money(total);document.querySelector('#cart-count').textContent=count;document.querySelector('#review-order').disabled=!count;
  try{sessionStorage.setItem('wu-cart',JSON.stringify(cart));}catch{}
 }
 document.querySelectorAll('[data-add]').forEach(button=>button.addEventListener('click',()=>{const id=button.dataset.add;cart[id]=(cart[id]||0)+1;renderCart();openCart();document.querySelector('#cart-status').textContent=items[id].name+' added to your order.';}));
 document.querySelector('#cart-items').addEventListener('click',event=>{const b=event.target.closest('[data-change]');if(!b)return;const id=b.dataset.id;cart[id]+=Number(b.dataset.change);if(cart[id]<=0)delete cart[id];renderCart();document.querySelector('#cart-status').textContent='Order updated.';});
 document.querySelector('#open-cart').addEventListener('click',openCart);document.querySelector('#close-cart').addEventListener('click',closeCart);
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.body.classList.contains('cart-open')&&!document.querySelector('dialog[open]'))closeCart();});
 const tabs=[...document.querySelectorAll('[role="tab"]')];
 function select(tab){tabs.forEach(t=>{t.setAttribute('aria-selected',String(t===tab));t.tabIndex=t===tab?0:-1;});document.querySelectorAll('.order-dish').forEach(d=>d.hidden=tab.dataset.filter!=='all'&&d.dataset.category!==tab.dataset.filter);document.querySelector('#menu-panel').setAttribute('aria-labelledby',tab.id);const i=tabs.indexOf(tab);document.querySelector('#menu-prev').disabled=i===0;document.querySelector('#menu-next').disabled=i===tabs.length-1;tab.scrollIntoView({block:'nearest',inline:'nearest'});}
 tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>select(tab));tab.addEventListener('keydown',e=>{let j;if(e.key==='ArrowRight')j=(i+1)%tabs.length;if(e.key==='ArrowLeft')j=(i+tabs.length-1)%tabs.length;if(e.key==='Home')j=0;if(e.key==='End')j=tabs.length-1;if(j!==undefined){e.preventDefault();tabs[j].focus();select(tabs[j]);}});});
 for(const [selector,step] of [['#menu-prev',-1],['#menu-next',1]])document.querySelector(selector).addEventListener('click',()=>{const i=tabs.findIndex(t=>t.getAttribute('aria-selected')==='true');select(tabs[Math.max(0,Math.min(tabs.length-1,i+step))]);});
 renderCart();
}
window.addEventListener('resize',()=>{if(window.innerWidth<=600)document.querySelectorAll('dialog[open]').forEach(d=>d.close());});
