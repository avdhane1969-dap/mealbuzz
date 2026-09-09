export const ENDPOINT='https://iinvhwsbnvmcujyrzlxe.supabase.co';
export const PUBLIC_KEY='sb_publishable_fwhxfVqWpDrro8hkQbQQRA_1crMexZv';
export const PUBLIC_COLUMNS='id,created_at,name,location,price,menu,contact,latitude,longitude,image_url,nonveg_image_url,morning_menu,dinner_menu,menu_date,veg_image_url,lunch_menu,updated_at,today_price,status,type,today_menu';
export function escapeHTML(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
export function foodType(value){const v=String(value||'').toLowerCase().replace(/[^a-z]/g,'');return v==='vegetarian'?'veg':['veg','nonveg','both'].includes(v)?v:'unknown';}
export function menuText(row){return row.today_menu||row.lunch_menu||row.menu||row.dinner_menu||row.morning_menu||'';}
export function isOpen(row){return /^(open|limited meals|limited)$/i.test(String(row.status||'').trim());}
export function numericPrice(row){const s=String(row.today_price||row.price||'').trim();if(/month|monthly|महिना|माह/i.test(s))return null;const m=s.match(/(?:₹\s*)?(\d+(?:\.\d+)?)/);return m?Number(m[1]):null;}
export function displayPrice(row){const s=String(row.today_price||row.price||'').trim();if(!s)return '';const n=numericPrice(row);if(n!==null && /^\s*(₹\s*)?\d+(\.\d+)?\s*(rs\.?|rupees|रु\.?|रुपये)?\s*$/i.test(s))return '₹'+n;return s.startsWith('₹')?s:'₹'+s;}
export function coords(row){if(row.latitude===null||row.longitude===null||row.latitude===undefined||row.longitude===undefined||row.latitude===''||row.longitude==='')return null;const lat=Number(row.latitude),lon=Number(row.longitude);return Number.isFinite(lat)&&Number.isFinite(lon)&&Math.abs(lat)<=90&&Math.abs(lon)<=180?{lat,lon}:null;}
export function distance(a,b){const rad=x=>x*Math.PI/180;const dLat=rad(b.lat-a.lat),dLon=rad(b.lon-a.lon);const v=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLon/2)**2;return 6371*2*Math.asin(Math.sqrt(Math.min(1,v)));}
export function phoneLink(value){const digits=String(value||'').replace(/\D/g,'');const p=digits.length===12&&digits.startsWith('91')?digits.slice(2):digits;return /^[6-9]\d{9}$/.test(p)?'tel:+91'+p:null;}
export function mapQuery(row){const c=coords(row);if(c)return c.lat+','+c.lon;return row.location?String(row.name||'')+', '+row.location:null;}
export function mapLink(row){const q=mapQuery(row);return q?'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q):null;}
export function imageURL(row){const candidates=[row.image_url,foodType(row.type)==='nonveg'?row.nonveg_image_url:row.veg_image_url];for(const raw of candidates){if(!raw)continue;try{const u=new URL(raw);if(u.protocol==='https:')return u.href;}catch{}}return 'assets/thali-hero.jpg';}
export function filterRows(rows,state){const query=(state.query||'').trim().toLocaleLowerCase();const area=(state.area||'').toLocaleLowerCase();let result=rows.filter(row=>{
  const type=foodType(row.type);if(state.openOnly&&!isOpen(row))return false;
  if(state.diet==='veg'&&type!=='veg'&&type!=='both')return false;
  if(state.diet==='nonveg'&&type!=='nonveg'&&type!=='both')return false;
  if(area&&String(row.location||'').toLocaleLowerCase()!==area)return false;
  if(query&&!([row.name,row.location,menuText(row),row.morning_menu,row.dinner_menu,row.type].filter(Boolean).join(' ').toLocaleLowerCase().includes(query)))return false;
  if(['100','150'].includes(state.price)){const p=numericPrice(row);if(p===null||p>Number(state.price))return false;}
  if(state.coords&&['2','5','10'].includes(state.distance)){const c=coords(row);if(!c||distance(state.coords,c)>Number(state.distance))return false;}
  return true;
});
if(state.price==='low')result.sort((a,b)=>(numericPrice(a)??Infinity)-(numericPrice(b)??Infinity));
else if(state.coords&&state.distance!=='any')result.sort((a,b)=>{const ca=coords(a),cb=coords(b);return (ca?distance(state.coords,ca):Infinity)-(cb?distance(state.coords,cb):Infinity);});
return result;}
export async function loadRows(id){const query=new URLSearchParams({select:PUBLIC_COLUMNS});if(id!==undefined)query.set('id','eq.'+id);else query.set('order','updated_at.desc.nullslast');const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),12000);try{const res=await fetch(ENDPOINT+'/rest/v1/mess?'+query,{headers:{apikey:PUBLIC_KEY},signal:controller.signal,cache:'no-store'});if(!res.ok)throw new Error('Could not load menus ('+res.status+')');const data=await res.json();if(!Array.isArray(data))throw new Error('Unexpected menu response');return data;}finally{clearTimeout(timeout);}}
