import {authorized,json} from "../../../lib/supabase";
import {companies} from "../../../lib/market";
export async function POST(request:Request){
  const user=await authorized(request);if(!user)return json({error:"Sign in required"},401);
  const body=await request.json().catch(()=>({}));const symbol=String(body.symbol||"").toUpperCase().trim();
  let company:[string,string]|undefined;
  try{company=(await companies()).find(([s])=>s===symbol)}catch{return json({error:"Company catalog temporarily unavailable"},503)}
  if(!company)return json({error:"Choose a company from the NSE catalog"},400);
  const {error}=await user.client.from("sd_watchlist").insert({symbol,name:company[1]});
  if(error&&error.code!=="23505")return json({error:error.message},400);
  return json({ok:true});
}
export async function DELETE(request:Request){
  const user=await authorized(request);if(!user)return json({error:"Sign in required"},401);
  const symbol=new URL(request.url).searchParams.get("symbol")||"";
  if(!/^[A-Z0-9&.-]{1,30}$/.test(symbol))return json({error:"Invalid symbol"},400);
  const {error}=await user.client.from("sd_watchlist").delete().eq("symbol",symbol);
  return error?json({error:error.message},400):json({ok:true});
}
